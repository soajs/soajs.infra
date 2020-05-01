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
			return cb(new Error("delete secret options is required with {name, and namespace}"));
		}
		wrapper.secret.get(client, {namespace: options.namespace, name: options.name}, (error, secret) => {
			if (error) {
				return cb(error);
			}
			if (!secret) {
				return cb(new Error("Unable to find the secret [" + options.name + "] to delete."));
			}
			wrapper.secret.delete(client, {namespace: options.namespace, name: options.name}, (error) => {
				if (error) {
					return cb(error);
				}
				return cb(null, secret);
			});
		});
	},
	"getOne": (client, options, cb) => {
		if (!options || !options.name || !options.namespace) {
			return cb(new Error("getOne secret options is required with {name, namespace}"));
		}
		wrapper.secret.get(client, {namespace: options.namespace, name: options.name}, (error, item) => {
			return cb(error, item);
		});
	},
	"get": (client, options, cb) => {
		if (!options || !options.namespace) {
			return cb(new Error("get secrets options is required with {namespace}"));
		}
		wrapper.secret.get(client, {namespace: options.namespace, qs: options.filter || null}, (error, items) => {
			return cb(error, items);
		});
	}
};
module.exports = bl;