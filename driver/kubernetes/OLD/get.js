/**
 * @license
 * Copyright SOAJS All Rights Reserved.
 *
 * Use of this source code is governed by an Apache license that can be
 * found in the LICENSE file at the root of this repository
 */

'use strict';

const wrapper = require('./wrapper.js');

let bl = {
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
	
	"service": (client, options, cb) => {
		if (!options || !options.namespace || !options.name) {
			return cb(new Error("get services options is required with {namespace, name}"));
		}
		wrapper.service.get(client, {namespace: options.namespace, name: options.name || null}, (error, list) => {
			return cb(error, list);
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
};
module.exports = bl;