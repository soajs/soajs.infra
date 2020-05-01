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
	"autoscale": (client, options, cb) => {
		if (!options || !options.name) {
			return cb(new Error("delete autoscale options is required with {namespace, name}"));
		}
		wrapper.autoscale.get(client, {namespace: options.namespace, name: options.name}, (error, service) => {
			if (error) {
				return cb(error);
			}
			if (!service) {
				return cb(new Error("Unable to find the autoscale [" + options.name + "] to delete."));
			}
			wrapper.autoscale.delete(client, {namespace: options.namespace, name: options.name}, (error) => {
				if (error) {
					return cb(error);
				}
				return cb(null, service);
			});
		});
	},
	"namespace": (client, options, cb) => {
		if (!options || !options.name) {
			return cb(new Error("delete namespace options is required with {name}"));
		}
		wrapper.namespace.delete(client, {name: options.name}, cb);
	},
	"service": (client, options, cb) => {
		if (!options || !options.name) {
			return cb(new Error("delete service options is required with {namespace, name}"));
		}
		wrapper.service.get(client, {namespace: options.namespace, name: options.name}, (error, service) => {
			if (error) {
				return cb(error);
			}
			if (!service) {
				return cb(new Error("Unable to find the service [" + options.name + "] to delete."));
			}
			wrapper.service.delete(client, {namespace: options.namespace, name: options.name}, (error) => {
				if (error) {
					return cb(error);
				}
				return cb(null, service);
			});
		});
	},
	"daemonset": (client, options, cb) => {
		if (!options || !options.name) {
			return cb(new Error("delete daemonset options is required with {namespace, name}"));
		}
		wrapper.daemonset.get(client, {namespace: options.namespace, name: options.name}, (error, daemonset) => {
			if (error) {
				return cb(error);
			}
			if (!daemonset) {
				return cb(new Error("Unable to find the daemonset [" + options.name + "] to delete."));
			}
			wrapper.daemonset.delete(client, {namespace: options.namespace, name: options.name}, (error) => {
				if (error) {
					return cb(error);
				}
				return cb(null, daemonset);
			});
		});
	},
	"deployment": (client, options, cb) => {
		if (!options || !options.name) {
			return cb(new Error("delete deployment options is required with {namespace, name}"));
		}
		wrapper.deployment.get(client, {namespace: options.namespace, name: options.name}, (error, deployment) => {
			if (error) {
				return cb(error);
			}
			if (!deployment) {
				return cb(new Error("Unable to find the deployment [" + options.name + "] to delete."));
			}
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
		});
	},
	"secret_opaque": (client, options, cb) => {
		if (!options || !options.name || !options.namespace) {
			return cb(new Error("delete secret_opaque options is required with {name, and namespace}"));
		}
		wrapper.secret.get(client, {namespace: options.namespace, name: options.name}, (error, secret) => {
			if (error) {
				return cb(error);
			}
			if (!service) {
				return cb(new Error("Unable to find the secret [" + options.name + "] to delete."));
			}
			wrapper.secret.delete(client, {namespace: options.namespace, name: options.name}, (error) => {
				if (error) {
					return cb(error);
				}
				return cb(null, secret);
			});
		});
	}
};
module.exports = bl;