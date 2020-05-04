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
			return cb(new Error("cronjob update: options is required with {name, body, and namespace}"));
		}
		wrapper.cronjob.put(client, {
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
			return cb(new Error("cronjob create: options is required with {body, and namespace}"));
		}
		return wrapper.cronjob.post(client, {namespace: options.namespace, body: options.body}, cb);
	},
	"delete": (client, options, cb) => {
		if (!options || !options.name) {
			return cb(new Error("cronjob delete: options is required with {namespace, and name}"));
		}
		wrapper.cronjob.get(client, {namespace: options.namespace, name: options.name}, (error, cronjob) => {
			if (error) {
				return cb(error);
			}
			if (!cronjob) {
				return cb(new Error("Unable to find the cronjob [" + options.name + "] to delete."));
			}
			wrapper.cronjob.delete(client, {namespace: options.namespace, name: options.name}, (error) => {
				if (error) {
					return cb(error);
				}
				return cb(null, cronjob);
			});
		});
	},
	"getOne": (client, options, cb) => {
		if (!options || !options.name || !options.namespace) {
			return cb(new Error("cronjob getOne: options is required with {name, and namespace}"));
		}
		wrapper.cronjob.get(client, {namespace: options.namespace, name: options.name}, (error, item) => {
			return cb(error, item);
		});
	},
	"get": (client, options, cb) => {
		if (!options || !options.namespace) {
			return cb(new Error("cronjob get: options is required with {namespace}"));
		}
		wrapper.cronjob.get(client, {namespace: options.namespace, qs: options.filter || null}, (error, items) => {
			return cb(error, items);
		});
	}
};
module.exports = bl;