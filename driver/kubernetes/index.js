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
	
	"connect": (driverConfig, cb) => {
		if (!driverConfig.token) {
			return cb(new Error('No valid access token found for the kubernetes cluster'));
		}
		if (!driverConfig.url) {
			return cb(new Error('No valid url found for the kubernetes cluster'));
		}
		try {
			let client = new Client({
				"backend": new Request({
					"url": driverConfig.url,
					"auth": {
						"bearer": driverConfig.token
					},
					"insecureSkipTlsVerify": true
				}),
				"spec": swagger
			});
			return cb(client);
		} catch (e) {
			return cb(e);
		}
	},
	
	"getServiceIps": (client, options, cb) => {
		if (!options || !options.namespace || !options.serviceName) {
			return cb(new Error("options with namespace, serviceName is required!"));
		}
		if (!options.replicaCount) {
			options.replicaCount = 1;
		}
		let getPodIps = (count, callback) => {
			let ips = [];
			if (!options.podFilter) {
				return callback(null, ips);
			}
			wrapper.pod.get(client, {namespace: options.namespace, qs: options.podFilter}, (err, podList) => {
				if (err) {
					return callback(err);
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
			}, (err, service) => {
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
					return cb(err, null);
				}
			});
		};
		
		getPodIps(0, (err, ips) => {
			if (err) {
				return cb(err);
			} else {
				getServiceIps(0, (err, response) => {
					if (err) {
						return cb(err);
					} else {
						response.podIps = ips;
						return cb(null, response);
					}
				});
			}
		});
	}
	
	
};

module.exports = driver;