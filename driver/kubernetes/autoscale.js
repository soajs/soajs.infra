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
			return cb(new Error("update autoscale options is required with {name, body, and namespace}"));
		}
		
	},
	"create": (client, options, cb) => {
		if (!options || !options.body || !options.namespace) {
			return cb(new Error("create autoscale options is required with {body, and namespace}"));
		}
		return wrapper.autoscale.post(client, {body: options.body, namespace: options.namespace}, cb);
	},
	"delete": (client, options, cb) => {
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
	"getOne": (client, options, cb) => {
		if (!options || !options.name || !options.namespace) {
			return cb(new Error("getOne autoscale options is required with {name, and namespace}"));
		}
		wrapper.autoscale.get(client, {namespace: options.namespace, name: options.name}, (error, item) => {
			return cb(error, item);
		});
	},
	"get": (client, options, cb) => {
		if (!options || !options.namespace) {
			return cb(new Error("get autoscales options is required with {namespace}"));
		}
		wrapper.autoscale.get(client, {namespace: options.namespace, qs: options.filter || null}, (error, items) => {
			return cb(error, items);
		});
	},
};
module.exports = bl;