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

const _secret_opaque = require("./secret_opaque.js");
const _secret = require("./secret.js");
const _autoscale = require("./autoscale.js");
const _namespace = require("./namespace.js");
const _service = require("./service.js");
const _deployment = require("./deployment.js");
const _daemonset = require("./daemonset.js");
const _cronjob = require("./cronjob.js");
const _node = require("./node.js");

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
	
	"update": {
		"autoscale": _autoscale.update,
		"namespace": _namespace.update,
		"service": _service.update,
		"deployment": _deployment.update,
		"daemonset": _daemonset.update,
		"cronjob": _cronjob.update
	},
	
	"delete": {
		"autoscale": _autoscale.delete,
		"namespace": _namespace.delete,
		"service": _service.delete,
		"deployment": _deployment.delete,
		"daemonset": _daemonset.delete,
		"cronjob": _cronjob.delete,
		"secret": _secret.delete
	},
	
	"create": {
		"autoscale": _autoscale.create,
		"namespace": _namespace.create,
		"service": _service.create,
		"deployment": _deployment.create,
		"daemonset": _daemonset.create,
		"cronjob": _cronjob.create,
		"secret_opaque": _secret_opaque.create
	},
	
	"get": {
		"autoscales": _autoscale.get,
		"namespaces": _namespace.get,
		"services": _service.get,
		"deployments": _deployment.get,
		"daemonsets": _daemonset.get,
		"cronjobs": _cronjob.get,
		"secrets": _secret.get,
		"nodes": _node.get,
		
		"autoscale": _autoscale.getOne,
		"namespace": _namespace.getOne,
		"service": _service.getOne,
		"deployment": _deployment.getOne,
		"daemonset": _daemonset.getOne,
		"cronjob": _cronjob.getOne,
		"secret": _secret.getOne,
		
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
		}
	}
};

module.exports = driver;