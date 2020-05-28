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
			return cb(new Error("PV delete: options is required with {name}"));
		}
		wrapper.pv.get(client, {name: options.name}, (error, item) => {
			if (error) {
				return cb(error);
			}
			if (!item) {
				return cb(new Error("Unable to find the PV [" + options.name + "] to delete."));
			}
			wrapper.pv.delete(client, {name: options.name}, (error) => {
				if (error) {
					return cb(error);
				}
				return cb(null, item);
			});
		});
	},
	"getOne": (client, options, cb) => {
		if (!options || !options.name) {
			return cb(new Error("PV getOne: options is required with {name}"));
		}
		wrapper.pv.get(client, {name: options.name}, (error, item) => {
			return cb(error, item);
		});
	},
	"get": (client, options, cb) => {
		wrapper.pv.get(client, {qs: options.filter || null}, (error, items) => {
			return cb(error, items);
		});
	},
	"update": (client, options, cb) => {
		if (!options || !options.name || !options.body) {
			return cb(new Error("PV update: options is required with {name, body}"));
		}
		wrapper.pv.put(client, {body: options.body, name: options.name}, (error, item) => {
			if (error) {
				return cb(error);
			}
			return cb(null, item);
		});
	},
	"apply": (client, options, cb) => {
		if (!options || !options.body) {
			return cb(new Error("PV apply: options is required with {body}"));
		}
		return wrapper.pv.post(client, {body: options.body}, cb);
	}
};
module.exports = bl;