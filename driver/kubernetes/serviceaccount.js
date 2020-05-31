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
			return cb(new Error("serviceaccount delete: options is required with {name, and namespace}"));
		}
		wrapper.serviceaccount.get(client, {namespace: options.namespace, name: options.name}, (error, item) => {
			if (error) {
				return cb(error);
			}
			if (!item) {
				return cb(new Error("Unable to find the serviceaccount [" + options.name + "] to delete."));
			}
			wrapper.serviceaccount.delete(client, {
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
			return cb(new Error("serviceaccount getOne: options is required with {name, and namespace}"));
		}
		wrapper.serviceaccount.get(client, {namespace: options.namespace, name: options.name}, (error, item) => {
			return cb(error, item);
		});
	},
	"get": (client, options, cb) => {
		if (!options || !options.namespace) {
			return cb(new Error("serviceaccount get: options is required with {namespace}"));
		}
		wrapper.serviceaccount.get(client, {
			namespace: options.namespace,
			qs: options.filter || null
		}, (error, items) => {
			return cb(error, items);
		});
	},
	"apply": (client, options, cb) => {
		if (!options || !options.body || !options.namespace) {
			return cb(new Error("serviceaccount apply: options is required with {body, and namespace}"));
		}
		return wrapper.serviceaccount.post(client, {namespace: options.namespace, body: options.body}, cb);
	}
};
module.exports = bl;