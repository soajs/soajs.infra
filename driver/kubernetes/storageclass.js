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
		if (!options || !options.name) {
			return cb(new Error("storageclass delete: options is required with {name}"));
		}
		wrapper.storageclass.get(client, {name: options.name}, (error, item) => {
			if (error) {
				return cb(error);
			}
			if (!item) {
				return cb(new Error("Unable to find the storageclass [" + options.name + "] to delete."));
			}
			wrapper.storageclass.delete(client, {name: options.name}, (error) => {
				if (error) {
					return cb(error);
				}
				return cb(null, item);
			});
		});
	},
	"getOne": (client, options, cb) => {
		if (!options || !options.name) {
			return cb(new Error("storageclass getOne: options is required with {name}"));
		}
		wrapper.storageclass.get(client, {name: options.name}, (error, item) => {
			return cb(error, item);
		});
	},
	"get": (client, options, cb) => {
		wrapper.storageclass.get(client, {qs: options.filter || null}, (error, items) => {
			return cb(error, items);
		});
	},
	"update": (client, options, cb) => {
		if (!options || !options.name || !options.body) {
			return cb(new Error("storageclass update: options is required with {name, body}"));
		}
		wrapper.storageclass.put(client, {body: options.body, name: options.name}, (error, item) => {
			if (error) {
				return cb(error);
			}
			return cb(null, item);
		});
	},
	"apply": (client, options, cb) => {
		if (!options || !options.body) {
			return cb(new Error("storageclass apply: options is required with {body}"));
		}
		return wrapper.storageclass.post(client, {body: options.body}, cb);
	}
};
module.exports = bl;