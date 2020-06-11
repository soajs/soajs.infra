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
	"patch": (client, options, cb) => {
		if (!options || !options.name || !options.body || !options.namespace) {
			return cb(new Error("deployment patch: options is required with {name, body, and namespace}"));
		}
		return wrapper.deployment.patch(client, {
			name: options.name,
			namespace: options.namespace,
			body: options.body
		}, cb);
	},
	"update": (client, options, cb) => {
		if (!options || !options.name || !options.body || !options.namespace) {
			return cb(new Error("deployment update: options is required with {name, body, and namespace}"));
		}
		wrapper.deployment.put(client, {
			namespace: options.namespace,
			body: options.body,
			name: options.name
		}, (error, item) => {
			if (error) {
				return cb(error);
			}
			return cb(null, item);
		});
	},
	"create": (client, options, cb) => {
		if (!options || !options.body || !options.namespace) {
			return cb(new Error("deployment create: options is required with {body, and namespace}"));
		}
		return wrapper.deployment.post(client, {namespace: options.namespace, body: options.body}, cb);
	},
	"delete": (client, options, cb) => {
		if (!options || !options.name) {
			return cb(new Error("deployment delete: options is required with {namespace, and name}"));
		}
		wrapper.deployment.get(client, {namespace: options.namespace, name: options.name}, (error, deployment) => {
			if (error) {
				return cb(error);
			}
			if (!deployment) {
				return cb(new Error("Unable to find the deployment [" + options.name + "] to delete."));
			}
			if (options.cleanup) {
				deployment.spec.replicas = 0;
				wrapper.deployment.put(client, {
					namespace: options.namespace,
					name: options.name,
					body: deployment
				}, (error) => {
					if (error) {
						return cb(error);
					}
					wrapper.deployment.delete(client, {name: options.name, namespace: options.namespace}, (error) => {
						if (error) {
							return cb(error);
						}
						wrapper.autoscale.get(client, {
							name: options.name,
							namespace: options.namespace
						}, (error, hpa) => {
							// No autoscale found
							if (error && error.code === 404) {
								return cb(null, deployment);
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
									return cb(null, deployment);
								});
							} else {
								return cb(null, deployment);
							}
						});
					});
				});
			} else {
				wrapper.deployment.delete(client, {namespace: options.namespace, name: options.name}, (error) => {
					if (error) {
						return cb(error);
					}
					return cb(null, deployment);
				});
			}
		});
	},
	"getOne": (client, options, cb) => {
		if (!options || !options.name || !options.namespace) {
			return cb(new Error("deployment getOne: options is required with {name, and namespace}"));
		}
		wrapper.deployment.get(client, {namespace: options.namespace, name: options.name}, (error, item) => {
			return cb(error, item);
		});
	},
	"get": (client, options, cb) => {
		if (!options || !options.namespace) {
			return cb(new Error("deployment get: options is required with {namespace}"));
		}
		wrapper.deployment.get(client, {
			namespace: options.namespace,
			qs: options.filter || null
		}, (error, items) => {
			return cb(error, items);
		});
	}
};
module.exports = bl;