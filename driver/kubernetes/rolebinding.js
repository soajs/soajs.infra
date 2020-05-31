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
	"delete": (client, options, cb) => {
		if (!options || !options.name || !options.namespace) {
			return cb(new Error("roleBinding delete: options is required with {name, and namespace}"));
		}
		wrapper.roleBinding.get(client, {namespace: options.namespace, name: options.name}, (error, item) => {
			if (error) {
				return cb(error);
			}
			if (!item) {
				return cb(new Error("Unable to find the roleBinding [" + options.name + "] to delete."));
			}
			wrapper.roleBinding.delete(client, {
				namespace: options.namespace,
				name: options.name
			}, (error) => {
				if (error) {
					return cb(error);
				}
				return cb(null, item);
			});
		});
	},
	"getOne": (client, options, cb) => {
		if (!options || !options.name || !options.namespace) {
			return cb(new Error("roleBinding getOne: options is required with {name, and namespace}"));
		}
		wrapper.roleBinding.get(client, {namespace: options.namespace, name: options.name}, (error, item) => {
			return cb(error, item);
		});
	},
	"get": (client, options, cb) => {
		if (!options || !options.namespace) {
			return cb(new Error("roleBinding get: options is required with {namespace}"));
		}
		wrapper.roleBinding.get(client, {
			namespace: options.namespace,
			qs: options.filter || null
		}, (error, items) => {
			return cb(error, items);
		});
	},
	"apply": (client, options, cb) => {
		if (!options || !options.body || !options.namespace) {
			return cb(new Error("roleBinding apply: options is required with {body, and namespace}"));
		}
		return wrapper.roleBinding.post(client, {namespace: options.namespace, body: options.body}, cb);
	}
};
module.exports = bl;