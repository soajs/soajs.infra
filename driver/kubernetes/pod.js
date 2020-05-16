/**
 * @license
 * Copyright SOAJS All Rights Reserved.
 *
 * Use of this source code is governed by an Apache license that can be
 * found in the LICENSE file at the root of this repository
 */

'use strict';

const WebSocket = require('ws');
const async = require('async');
const parse = require('parse-large-json');
const maxChunkSize = 100e3;
const wrapper = require('./wrapper.js');

const lib = require("../../bl/lib.js");

let bl = {
	
	"getOne": (client, options, cb) => {
		if (!options || !options.name || !options.namespace) {
			return cb(new Error("pod getOne: options is required with {name, and namespace}"));
		}
		wrapper.pod.get(client, {namespace: options.namespace, name: options.name}, (error, item) => {
			return cb(error, item);
		});
	},
	"get": (client, options, cb) => {
		if (!options || !options.namespace) {
			return cb(new Error("pod get: options is required with {namespace}"));
		}
		wrapper.pod.get(client, {namespace: options.namespace, qs: options.filter || null}, (error, items) => {
			return cb(error, items);
		});
	},
	"delete": (client, options, cb) => {
		if (!options || !options.filter) {
			return cb(new Error("pods delete: options is required with {namespace, and filter}"));
		}
		wrapper.pod.get(client, {namespace: options.namespace, qs: options.filter}, (error, pods) => {
			if (error) {
				return cb(error);
			}
			if (!pods || !Array.isArray(pods.items) || pods.items.length <= 0) {
				return cb(new Error("Unable to find the any pod to delete."));
			}
			wrapper.pod.delete(client, {namespace: options.namespace, qs: options.filter}, (error) => {
				if (error) {
					return cb(error);
				}
				return cb(null, pods);
			});
		});
	},
	
	"getIps": (client, options, cb) => {
		if (!options || !options.namespace || !options.filter) {
			return cb(new Error("pod getIps: options is required with {namespace, and filter}"));
		}
		let ips = [];
		wrapper.pod.get(client, {namespace: options.namespace, qs: options.filter}, (error, podList) => {
			if (error) {
				return cb(error);
			}
			if (podList && podList.items && Array.isArray(podList.items)) {
				let iteratee = (onePod, callback) => {
					let podInfo = {
						name: onePod.metadata.name
					};
					if (onePod.status.phase === 'Running' && onePod.metadata.namespace === options.namespace && onePod.status.conditions && Array.isArray(onePod.status.conditions)) {
						if (options.onlyReady) {
							for (let i = 0; i < onePod.status.conditions.length; i++) {
								let oneCond = onePod.status.conditions[i];
								if (oneCond.type === 'Ready' && oneCond.status === 'True') {
									podInfo.ip = onePod.status.podIP;
									break;
								}
							}
						} else {
							podInfo.ip = onePod.status.podIP;
						}
					}
					return callback(null, podInfo);
				};
				async.map(podList.items, iteratee, (err, results) => {
					return cb(err, results);
				});
			} else {
				return cb(null, ips);
			}
		});
	},
	
	"getLog": (client, options, cb) => {
		if (!options || !options.name || !options.namespace) {
			return cb(new Error("pod getLog: options is required with {name, and namespace}"));
		}
		wrapper.pod.get(client, {namespace: options.namespace, name: options.name}, (error, item) => {
			if (error) {
				return cb(error);
			}
			if (!item) {
				return cb(new Error("Unable to find the pod [" + options.name + "] to get the log."));
			}
			let params = {
				tailLines: options.lines || 400,
				follow: options.follow || false
			};
			wrapper.pod.getLogs(client, {
				qs: params,
				namespace: options.namespace,
				name: options.name
			}, (error, logs) => {
				return cb(error, logs);
			});
		});
	},
	
	"exec": (client, options, cb) => {
		if (!options || !options.namespace || !options.config || !(options.filter || options.name) || !options.commands || !Array.isArray(options.commands)) {
			return cb(new Error("pod getIps: options is required with {namespace, config, (filter or name), and commands[as Array]}"));
		}
		let args = {};
		if (options.filter) {
			args = {namespace: options.namespace, qs: options.filter};
		} else {
			args = {namespace: options.namespace, name: options.name};
		}
		wrapper.pod.get(client, args, (error, podList) => {
			if (error) {
				return cb(error);
			}
			
			if (podList) {
				// turn off node TLS
				process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
				let iteratee = (onePod, callback) => {
					let shell = '/bin/bash';
					if (onePod.metadata.labels['soajs.shell']) {
						shell = onePod.metadata.labels['soajs.shell'].substr(5);
						shell = lib.clearLabel(shell);
					}
					
					let uri = "";
					if (options.config && options.config.url) {
						uri = `wss://${options.config.url.split('//')[1]}`;
					}
					uri += `/api/v1/namespaces/${options.namespace}/pods/${onePod.metadata.name}/exec?`;
					uri += 'stdout=1&stdin=1&stderr=1';
					let cmd = [shell, '-c'];
					cmd = cmd.concat(options.commands);
					cmd.forEach(subCmd => uri += `&command=${encodeURIComponent(subCmd)}`);
					
					let wsOptions = {};
					wsOptions.payload = 1024;
					if (options.config && options.config.token) {
						wsOptions.headers = {
							'Authorization': `Bearer ${options.config.token}`
						};
					}
					let response = '';
					let operationResponse = {
						id: onePod.metadata.name,
						response: {}
					};
					let wsError = null;
					try {
						let ws = new WebSocket(uri, "base64.channel.k8s.io", wsOptions);
						ws.on('message', (data) => {
							if (data[0].match(/^[0-3]$/)) {
								response += Buffer.from(data.slice(1), 'base64').toString();
							}
						});
						ws.on('error', (error) => {
							wsError = error.message;
						});
						ws.on('close', () => {
							if (wsError) {
								operationResponse.response = 'A ws error occurred: ' + wsError;
								return callback(null, operationResponse);
							}
							if (response.indexOf('{') !== -1 && response.lastIndexOf('}') !== -1) {
								response = response.substring(response.indexOf('{'), response.lastIndexOf('}') + 1);
								
								try {
									parse(response.toString(), maxChunkSize).then(({val, rest}) => {
										if (rest) {
											operationResponse.response = "Maintenance operation failed.";
											return callback(null, operationResponse);
										}
										operationResponse.response = val;
										return callback(null, operationResponse);
									});
								} catch (e) {
									operationResponse.response = "Maintenance operation failed.";
									return callback(null, operationResponse);
								}
							} else {
								operationResponse.response = response;
								return callback(null, operationResponse);
							}
						});
					} catch (e) {
						operationResponse.response = 'An exec error occurred: ' + e.message;
						return callback(null, operationResponse);
					}
				};
				
				if (podList.items && Array.isArray(podList.items)) {
					async.map(podList.items, iteratee, (err, results) => {
						return cb(err, results);
					});
				} else {
					iteratee(podList, (err, results) => {
						return cb(err, results);
					});
				}
			} else {
				return cb(new Error("Unable to find any matching container to run the maintenance cmd"));
			}
		});
	}
};
module.exports = bl;