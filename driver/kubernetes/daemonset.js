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
			return cb(new Error("daemonset update: options is required with {name, body, and namespace}"));
		}
		wrapper.daemonset.put(client, {
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
			return cb(new Error("daemonset create: options is required with {body, and namespace}"));
		}
		return wrapper.daemonset.post(client, {namespace: options.namespace, body: options.body}, cb);
	},
	"delete": (client, options, cb) => {
		if (!options || !options.name) {
			return cb(new Error("daemonset delete: options is required with {namespace, and name}"));
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
	"getOne": (client, options, cb) => {
		if (!options || !options.name || !options.namespace) {
			return cb(new Error("daemonset getOne: options is required with {name, and namespace}"));
		}
		wrapper.daemonset.get(client, {namespace: options.namespace, name: options.name}, (error, item) => {
			return cb(error, item);
		});
	},
	"get": (client, options, cb) => {
		if (!options || !options.namespace) {
			return cb(new Error("daemonset get: options is required with {namespace}"));
		}
		wrapper.daemonset.get(client, {namespace: options.namespace, qs: options.filter || null}, (error, items) => {
			return cb(error, items);
		});
	}
};
module.exports = bl;