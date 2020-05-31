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
	"apply": (client, options, cb) => {
		if (!options || !options.body) {
			return cb(new Error("clusterRole create: options is required with {body}"));
		}
		wrapper.clusterRole.post(client, {body: options.body}, cb);
	},
	"delete": (client, options, cb) => {
		if (!options || !options.name) {
			return cb(new Error("clusterRole delete: options is required with {name}"));
		}
		wrapper.clusterRole.get(client, {name: options.name}, (error, item) => {
			if (error) {
				return cb(error);
			}
			if (!item) {
				return cb(new Error("Unable to find the clusterRole [" + options.name + "] to delete."));
			}
			wrapper.clusterRole.delete(client, {name: options.name}, (error) => {
				if (error) {
					return cb(error);
				}
				return cb(null, item);
			});
		});
	},
	"getOne": (client, options, cb) => {
		if (!options || !options.name) {
			return cb(new Error("clusterRole getOne: options is required with {name}"));
		}
		wrapper.clusterRole.get(client, {name: options.name}, (error, item) => {
			return cb(error, item);
		});
	},
	"get": (client, options, cb) => {
		wrapper.clusterRole.get(client, {qs: options.filter || null}, (error, items) => {
			return cb(error, items);
		});
	}
};
module.exports = bl;