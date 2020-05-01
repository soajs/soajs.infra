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
	"update": (client, options, cb) => {
		if (!options || !options.name || !options.body || !options.namespace) {
			return cb(new Error("update cronjob options is required with {name, body, and namespace}"));
		}
		
	},
	"create": (client, options, cb) => {
		if (!options || !options.body || !options.namespace) {
			return cb(new Error("create cronjob options is required with {body, and namespace}"));
		}
		return wrapper.cronjob.post(client, {namespace: options.namespace, body: options.body}, cb);
	},
	"delete": (client, options, cb) => {
		if (!options || !options.name) {
			return cb(new Error("delete deployment options is required with {namespace, name}"));
		}
		wrapper.cronjob.get(client, {namespace: options.namespace, name: options.name}, (error, cronjob) => {
			if (error) {
				return cb(error);
			}
			if (!cronjob) {
				return cb(new Error("Unable to find the cronjob [" + options.name + "] to delete."));
			}
			if (options.cleanup) {
				cronjob.spec.replicas = 0;
				wrapper.cronjob.put(client, {
					namespace: options.namespace,
					name: options.name,
					body: cronjob
				}, (error) => {
					if (error) {
						return cb(error);
					}
					wrapper.cronjob.delete(client, {name: options.name, namespace: options.namespace}, (error) => {
						if (error) {
							return cb(error);
						}
						wrapper.autoscale.get(client, {
							name: options.name,
							namespace: options.namespace
						}, (error, hpa) => {
							// No autoscale found
							if (error && error.code === 404) {
								return cb(null, cronjob);
							}
							if (error) {
								return cb(error);
							}
							if (hpa && Object.keys(hpa).length !== 0) {
								wrapper.autoscale.delete(client, {
									name: options.name,
									namespace: options.namespace
								}, (error) => {
									if (error) {
										return cb(error);
									}
									return cb(null, cronjob);
								});
							} else {
								return cb(null, cronjob);
							}
						});
					});
				});
			} else {
				wrapper.cronjob.delete(client, {namespace: options.namespace, name: options.name}, (error) => {
					if (error) {
						return cb(error);
					}
					return cb(null, cronjob);
				});
			}
		});
	},
	"getOne": (client, options, cb) => {
		if (!options || !options.name || !options.namespace) {
			return cb(new Error("getOne cronjob options is required with {name, namespace}"));
		}
		wrapper.cronjob.get(client, {namespace: options.namespace, name: options.name}, (error, item) => {
			return cb(error, item);
		});
	},
	"get": (client, options, cb) => {
		if (!options || !options.namespace) {
			return cb(new Error("get cronjobs options is required with {namespace}"));
		}
		wrapper.cronjob.get(client, {namespace: options.namespace, qs: options.filter || null}, (error, items) => {
			return cb(error, items);
		});
	}
};
module.exports = bl;