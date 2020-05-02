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
	
	
	"getOne": (client, options, cb) => {
		if (!options || !options.name || !options.namespace) {
			return cb(new Error("getOne pod options is required with {name, namespace}"));
		}
		wrapper.pod.get(client, {namespace: options.namespace, name: options.name}, (error, item) => {
			return cb(error, item);
		});
	},
	"get": (client, options, cb) => {
		if (!options || !options.namespace) {
			return cb(new Error("get pods options is required with {namespace}"));
		}
		wrapper.pod.get(client, {namespace: options.namespace, qs: options.filter || null}, (error, items) => {
			return cb(error, items);
		});
	},
	
	"getIps": (client, options, cb) => {
		if (!options || !options.namespace) {
			return cb(new Error("getIps pods options is required with {namespace}"));
		}
		let ips = [];
		if (!options.filter) {
			return cb(null, ips);
		}
		wrapper.pod.get(client, {namespace: options.namespace, qs: options.filter}, (error, podList) => {
			if (error) {
				return cb(error);
			}
			if (podList && podList.items && Array.isArray(podList.items)) {
				podList.items.forEach((onePod) => {
					if (onePod.status.phase === 'Running' && onePod.metadata.namespace === options.namespace && onePod.status.conditions && Array.isArray(onePod.status.conditions)) {
						if (options.onlyReady) {
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
						} else {
							ips.push({
								name: onePod.metadata.name,
								ip: onePod.status.podIP
							});
						}
					}
				});
			}
			return cb(null, ips);
		});
	}
};
module.exports = bl;