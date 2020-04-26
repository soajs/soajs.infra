/**
 * @license
 * Copyright SOAJS All Rights Reserved.
 *
 * Use of this source code is governed by an Apache license that can be
 * found in the LICENSE file at the root of this repository
 */

'use strict';

const Client = require('kubernetes-client').Client;
const Request = require('kubernetes-client/backends/request');
const swagger = require('./swagger/swagger.json');
const wrapper = require('./wrapper.js');

let driver = {
	
	"connect": (config, cb) => {
		if (!config.token) {
			return cb(new Error('Connect error: No valid access token found for the kubernetes cluster'));
		}
		if (!config.url) {
			return cb(new Error('Connect error: No valid url found for the kubernetes cluster'));
		}
		try {
			let client = new Client({
				"backend": new Request({
					"url": config.url,
					"auth": {
						"bearer": config.token
					},
					"insecureSkipTlsVerify": true
				}),
				"spec": swagger
			});
			return cb(null, client);
		} catch (e) {
			return cb(e);
		}
	},
	"delete": {
		"namespace": (client, options, cb) => {
			if (!options || !options.namespace) {
				return cb(new Error("delete namespace options is required with {namespace}"));
			}
			wrapper.namespace.delete(client, {name: options.namespace}, cb);
		}
	},
	"create": {
		"service": (client, options, cb) => {
			if (!options || !options.service || !options.namespace) {
				return cb(new Error("create service options is required with {service, and namespace}"));
			}
			return wrapper.service.post(client, {namespace: options.namespace, body: options.service}, cb);
		},
		"deployment": (client, options, cb) => {
			if (!options || !options.deployment || !options.namespace) {
				return cb(new Error("create deployment options is required with {deployment, and namespace}"));
			}
			let deploytype = null;
			if (options.deployment.kind === "DaemonSet") {
				deploytype = "daemonset";
			}
			else if (options.deployment.kind === "Deployment") {
				deploytype = "deployment";
			}
			if (!deploytype) {
				return cb(new Error("Unsupported deployment kind [" + deploytype + "]"));
			}
			return wrapper[deploytype].post(client, {namespace: options.namespace, body: options.deployment}, cb);
		},
		"secret_opaque": (client, options, cb) => {
			if (!options || !options.content || !options.name || !options.namespace) {
				return cb(new Error("create secret_opaque options is required with {content, name, and namespace}"));
			}
			if (!Array.isArray(options.content) || options.content.length === 0) {
				return cb(new Error("secret content must be an array with at least one item."));
			}
			let recipe = {
				kind: 'Secret',
				apiVersion: 'v1',
				type: 'Opaque',
				metadata: {
					name: options.name,
					labels: {
						'soajs.content': 'true'
					}
				}
			};
			for (let i = 0; i < options.content.length; i++) {
				let c = options.content[i];
				if (c.name && c.content) {
					if (!recipe.stringData) {
						recipe.stringData = {};
					}
					recipe.stringData[c.name] = c.content;
				}
			}
			
			if (!recipe.stringData) {
				return cb(new Error("secret cannot be created, unable to find any item with name and content."));
			}
			
			wrapper.secret.post(client, {namespace: options.namespace, body: recipe}, cb);
		},
		"namespace": (client, options, cb) => {
			if (!options || !options.namespace) {
				return cb(new Error("create namespace options is required with {namespace}"));
			}
			let recipe = {
				kind: 'Namespace',
				apiVersion: 'v1',
				metadata: {
					name: options.namespace,
					labels: {
						'soajs.content': 'true'
					}
				}
			};
			wrapper.namespace.post(client, {body: recipe}, cb);
		}
	},
	"get": {
		"serviceIps": (client, options, cb) => {
			if (!options || !options.namespace || !options.serviceName) {
				return cb(new Error("get service IPs options is required with {service, and serviceName}"));
			}
			if (!options.replicaCount) {
				options.replicaCount = 1;
			}
			let getPodIps = (count, callback) => {
				let ips = [];
				if (!options.filter) {
					return callback(null, ips);
				}
				wrapper.pod.get(client, {namespace: options.namespace, qs: options.filter}, (error, podList) => {
					if (error) {
						return callback(error);
					}
					if (podList && podList.items && Array.isArray(podList.items)) {
						podList.items.forEach((onePod) => {
							if (onePod.status.phase === 'Running' && onePod.metadata.namespace === options.namespace && onePod.status.conditions && Array.isArray(onePod.status.conditions)) {
								for (let i = 0; i < onePod.status.conditions.length; i++) {
									let oneCond = onePod.status.conditions[i];
									if (oneCond.type === 'Ready' && oneCond.status === 'True') {
										ips.push({
											name: onePod.metadata.name,
											ip: onePod.status.podIP
										});
										break;
									}
								}
							}
						});
					}
					if (ips.length < options.replicaCount && count < 5) {
						//pod containers may not be ready yet
						setTimeout(() => {
							getPodIps(++count, callback);
						}, 10000);
					} else {
						return callback(null, ips);
					}
				});
			};
			
			let getServiceIps = (count, callback) => {
				wrapper.service.get(client, {
					namespace: options.namespace,
					name: options.serviceName
				}, (error, service) => {
					if (service && service.spec && service.spec.clusterIP) {
						if (service.spec.type === "LoadBalancer" && (!service.status || !service.status.loadBalancer || !service.status.loadBalancer.ingress || !Array.isArray(service.status.loadBalancer.ingress))) {
							setTimeout(() => {
								getServiceIps(++count, callback);
							}, 10000);
						} else {
							let response = {
								"ip": service.spec.clusterIP,
								"ports": service.spec.ports
							};
							if (service.spec.type === "LoadBalancer") {
								response.extIp = service.status.loadBalancer.ingress[0].ip;
							}
							return callback(null, response);
						}
					} else {
						return cb(error, null);
					}
				});
			};
			
			getPodIps(0, (error, ips) => {
				if (error) {
					return cb(error);
				} else {
					getServiceIps(0, (error, response) => {
						if (error) {
							return cb(error);
						} else {
							response.podIps = ips;
							return cb(null, response);
						}
					});
				}
			});
		},
		"services": (client, options, cb) => {
			if (!options || !options.namespace) {
				return cb(new Error("get services options is required with {namespace}"));
			}
			wrapper.service.get(client, {namespace: options.namespace, qs: options.filter || null}, (error, list) => {
				return cb(error, list);
			});
		},
		"deployments": (client, options, cb) => {
			if (!options || !options.namespace) {
				return cb(new Error("get deployments options is required with {namespace}"));
			}
			wrapper.deployment.get(client, {
				namespace: options.namespace,
				qs: options.filter || null
			}, (error, list) => {
				return cb(error, list);
			});
		},
		"daemonsets": (client, options, cb) => {
			if (!options || !options.namespace) {
				return cb(new Error("get daemonsets options is required with {namespace}"));
			}
			wrapper.daemonset.get(client, {namespace: options.namespace, qs: options.filter || null}, (error, list) => {
				return cb(error, list);
			});
		},
		"cronjobs": (client, options, cb) => {
			if (!options || !options.namespace) {
				return cb(new Error("get cronjobs options is required with {namespace}"));
			}
			wrapper.cronjob.get(client, {namespace: options.namespace, qs: options.filter || null}, (error, list) => {
				return cb(error, list);
			});
		},
		"nodes": (client, options, cb) => {
			wrapper.node.get(client, {qs: options.filter || null}, (error, list) => {
				return cb(error, list);
			});
		}
	}
	
};

module.exports = driver;