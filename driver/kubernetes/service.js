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
			return cb(new Error("update service options is required with {name, body, and namespace}"));
		}
		
	},
	"create": (client, options, cb) => {
		if (!options || !options.body || !options.namespace) {
			return cb(new Error("create service options is required with {body, and namespace}"));
		}
		return wrapper.service.post(client, {namespace: options.namespace, body: options.body}, cb);
	},
	"delete": (client, options, cb) => {
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
	"getOne": (client, options, cb) => {
		if (!options || !options.namespace || !options.name) {
			return cb(new Error("getOne service options is required with {namespace, name}"));
		}
		wrapper.service.get(client, {namespace: options.namespace, name: options.name}, (error, item) => {
			return cb(error, item);
		});
	},
	
	"get": (client, options, cb) => {
		if (!options || !options.namespace) {
			return cb(new Error("get services options is required with {namespace}"));
		}
		wrapper.service.get(client, {namespace: options.namespace, qs: options.filter || null}, (error, items) => {
			return cb(error, items);
		});
	},
	"getIps": (client, options, cb) => {
		if (!options || !options.namespace || !options.name) {
			return cb(new Error("getIps service options is required with {namespace, name}"));
		}
		wrapper.service.get(client, {namespace: options.namespace, name: options.name}, (error, item) => {
			if (item && item.spec && item.spec.clusterIP) {
				let response = {
					"ip": item.spec.clusterIP,
					"ports": item.spec.ports
				};
				if (item.spec.type === "LoadBalancer") {
					response.extIp = item.status.loadBalancer.ingress[0].ip;
				}
				return cb(null, response);
				
			} else {
				return cb(error, null);
			}
		});
	}
};
module.exports = bl;