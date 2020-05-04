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
		if (!options || !options.name || !options.body) {
			return cb(new Error("node update: options is required with {name, and body}"));
		}
		
	},
	"delete": (client, options, cb) => {
		if (!options || !options.name) {
			return cb(new Error("node delete: options is required with {name}"));
		}
		wrapper.node.get(client, {name: options.name}, (error, item) => {
			if (error) {
				return cb(error);
			}
			if (!item) {
				return cb(new Error("Unable to find the node [" + options.name + "] to delete."));
			}
			wrapper.node.delete(client, {name: options.name || null}, (error, item) => {
				return cb(error, item);
			});
		});
	},
	"getOne": (client, options, cb) => {
		if (!options || !options.name) {
			return cb(new Error("node getOne: options is required with {name}"));
		}
		wrapper.node.get(client, {name: options.name}, (error, item) => {
			return cb(error, item);
		});
	},
	"get": (client, options, cb) => {
		wrapper.node.get(client, {qs: options.filter || null}, (error, list) => {
			return cb(error, list);
		});
	}
};
module.exports = bl;