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

const lib = require("../../bl/kubernetes/lib.js");

let bl = {

	"metrics": (client, options, cb) => {
		if (!options || !options.namespace) {
			return cb(new Error("pod metrics: options is required with {namespace}"));
		}

		let data = {
			namespace: options.namespace
		};
		if (options.filter) {
			data.qs = options.filter;
		}
		if (options.name) {
			data.name = options.name;
		}
		wrapper.metrics.pods(client, data, (error, item) => {
			return cb(error, item);
		});
	},
	"getOne": (client, options, cb) => {
		if (!options || !options.name || !options.namespace) {
			return cb(new Error("pod getOne: options is required with {name, and namespace}"));
		}
		wrapper.pod.get(client, { namespace: options.namespace, name: options.name }, (error, item) => {
			return cb(error, item);
		});
	},
	"get": (client, options, cb) => {
		if (!options || !options.namespace) {
			return cb(new Error("pod get: options is required with {namespace}"));
		}
		wrapper.pod.get(client, { namespace: options.namespace, qs: options.filter || null }, (error, items) => {
			return cb(error, items);
		});
	},
	"delete": (client, options, cb) => {
		if (!options || !options.namespace || !options.filter) {
			return cb(new Error("pod delete: options is required with {namespace, and filter}"));
		}
		wrapper.pod.get(client, { namespace: options.namespace, qs: options.filter }, (error, pods) => {
			if (error) {
				return cb(error);
			}
			if (!pods || !Array.isArray(pods.items) || pods.items.length <= 0) {
				return cb(new Error("Unable to find the any pod to delete."));
			}
			wrapper.pod.delete(client, { namespace: options.namespace, qs: options.filter }, (error) => {
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
		wrapper.pod.get(client, { namespace: options.namespace, qs: options.filter }, (error, podList) => {
			if (error) {
				return cb(error);
			}
			if (podList && podList.items && Array.isArray(podList.items)) {
				// Synchronous pod processing - no async needed
				const results = podList.items.map(onePod => {
					let podInfo = {
						name: onePod.metadata.name
					};

					if (onePod.status.phase === 'Running' &&
						onePod.metadata.namespace === options.namespace &&
						onePod.status.conditions &&
						Array.isArray(onePod.status.conditions)) {

						if (options.onlyReady) {
							const readyCondition = onePod.status.conditions.find(
								cond => cond.type === 'Ready' && cond.status === 'True'
							);
							if (readyCondition) {
								podInfo.ip = onePod.status.podIP;
							}
						} else {
							podInfo.ip = onePod.status.podIP;
						}
					}

					return podInfo;
				});

				return cb(null, results);
			} else {
				return cb(null, ips);
			}
		});
	},

	"getLog": (client, options, cb) => {
		if (!options || !options.name || !options.namespace) {
			return cb(new Error("pod getLog: options is required with {name, and namespace}"));
		}
		wrapper.pod.get(client, { namespace: options.namespace, name: options.name }, (error, item) => {
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
			return cb(new Error("pod exec: options is required with {namespace, config, (filter or name), and commands[as Array]}"));
		}
		let args = {};
		if (options.filter) {
			args = { namespace: options.namespace, qs: options.filter };
		} else {
			args = { namespace: options.namespace, name: options.name };
		}
		wrapper.pod.get(client, args, (error, podList) => {
			if (error) {
				return cb(error);
			}

			if (podList) {
				let iteratee_without_ca = (onePod, callback) => {
					let shell = '/bin/bash';
					if (onePod.metadata.labels['soajs.shell']) {
						shell = onePod.metadata.labels['soajs.shell'].substr(5);
						shell = lib.clearLabel(shell);
					}

					let operationResponse = {
						id: onePod.metadata.name,
						response: {}
					};

					let uri = "";
					if (options.config && options.config.url) {
						let parts = options.config.url.split('//');
						if (parts.length > 1) {
							uri = `wss://${parts[1]}`;
						} else {
							operationResponse.response = 'Invalid URL format: missing protocol separator';
							return callback(null, operationResponse);
						}
					}
					uri += `/api/v1/namespaces/${options.namespace}/pods/${onePod.metadata.name}/exec?`;
					uri += 'stdout=1&stdin=1&stderr=1';
					let cmd = [shell, '-c'];
					cmd = cmd.concat(options.commands);
					cmd.forEach(subCmd => uri += `&command=${encodeURIComponent(subCmd)}`);

					let wsOptions = {
						payload: 1024,
						rejectUnauthorized: false // Per-connection TLS setting when no CA provided
					};
					if (options.config && options.config.token) {
						wsOptions.headers = {
							'Authorization': `Bearer ${options.config.token}`
						};
					}
					let responseChunks = [];
					let wsError = null;
					let timeout = null;
					let maxResponseSize = 10 * 1024 * 1024; // 10MB limit
					let currentSize = 0;

					try {
						let ws = new WebSocket(uri, "base64.channel.k8s.io", wsOptions);

						// Add timeout
						timeout = setTimeout(() => {
							wsError = 'Operation timeout';
							ws.close();
						}, options.timeout || 30000); // 30 second default

						ws.on('message', (data) => {
							// 1. Channel Check (MUST be 49 or 50, which are ASCII '1' and '2')
							const channel = data[0];
							// 2. Slice the Buffer to get ONLY the Base64 payload
							const base64Data = data.slice(1);

							if (channel === 49 || channel === 50) {
								const base64String = base64Data.toString('utf-8');
								let decodedChunk = Buffer.from(base64String, 'base64').toString('utf-8');

								currentSize += decodedChunk.length;
								if (currentSize > maxResponseSize) {
									wsError = 'Response size exceeded maximum limit';
									ws.close();
									return;
								}

								responseChunks.push(decodedChunk);
							} else {
								// Log non-output channels
								try {
									const statusMessage = base64Data.toString('utf-8');
									console.log(`Received non-output message on channel ${channel}: ${statusMessage}`);
								} catch (e) {
									console.log(`Received raw non-output message on channel ${channel}`);
								}
							}
						});
						ws.on('error', (error) => {
							wsError = error.message;
							if (timeout) {
								clearTimeout(timeout);
							}
						});
						ws.on('close', () => {
							if (timeout) {
								clearTimeout(timeout);
							}
							if (wsError) {
								operationResponse.response = 'A ws error occurred: ' + wsError;
								return callback(null, operationResponse);
							}

							let response = responseChunks.join('');

							if (options.processResult && response.indexOf('{') !== -1 && response.lastIndexOf('}') !== -1) {
								response = response.substring(response.indexOf('{'), response.lastIndexOf('}') + 1);

								parse(response, maxChunkSize).then(({ val, rest }) => {
									if (rest) {
										operationResponse.response = "Maintenance operation failed.";
										return callback(null, operationResponse);
									}
									operationResponse.response = val;
									return callback(null, operationResponse);
								}).catch((e) => {
									operationResponse.response = "Maintenance operation failed. " + e.message;
									return callback(null, operationResponse);
								});
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
				let iteratee_with_ca = (onePod, callback) => {
					let shell = '/bin/bash';
					if (onePod.metadata.labels['soajs.shell']) {
						shell = onePod.metadata.labels['soajs.shell'].substr(5);
						shell = lib.clearLabel(shell);
					}
					let cmd = [shell, '-c'];
					cmd = cmd.concat(options.commands);
					let params = {
						stdout: 1,
						stdin: 1,
						stderr: 1,
						command: cmd
					};
					wrapper.pod.podExec(client, {
						qs: params,
						namespace: options.namespace,
						name: onePod.metadata.name
					}, (error, response) => {
						let operationResponse = {
							id: onePod.metadata.name,
							response: {}
						};
						if (error) {
							operationResponse.response = 'Exec error occurred: ' + error;
							return callback(null, operationResponse);
						} else {
							if (options.processResult && response.indexOf('{') !== -1 && response.lastIndexOf('}') !== -1) {
								response = response.substring(response.indexOf('{'), response.lastIndexOf('}') + 1);

								parse(response, maxChunkSize).then(({ val, rest }) => {
									if (rest) {
										operationResponse.response = "Maintenance operation failed.";
										return callback(null, operationResponse);
									}
									operationResponse.response = val;
									return callback(null, operationResponse);
								}).catch((e) => {
									operationResponse.response = "Maintenance operation failed. " + e.message;
									return callback(null, operationResponse);
								});
							} else {
								operationResponse.response = response;
								return callback(null, operationResponse);
							}
						}
					});
				};
				let iteratee = iteratee_without_ca;
				if (options.ca) {
					iteratee = iteratee_with_ca;
				}
				// Note: TLS verification is disabled per-connection in wsOptions (iteratee_without_ca)
				// when no CA is provided, rather than globally disabling for entire process
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
	},

	"apply": (client, options, cb) => {
		if (!options || !options.body || !options.namespace) {
			return cb(new Error("pod apply: options is required with {body, and namespace}"));
		}
		return wrapper.pod.post(client, { namespace: options.namespace, body: options.body }, cb);
	},
};
module.exports = bl;