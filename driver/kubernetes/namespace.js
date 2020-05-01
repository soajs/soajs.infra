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
	"create": (client, options, cb) => {
		if (!options || !options.name) {
			return cb(new Error("create namespace options is required with {name}"));
		}
		let recipe = {
			kind: 'Namespace',
			apiVersion: 'v1',
			metadata: {
				name: options.name,
				labels: {
					'soajs.content': 'true'
				}
			}
		};
		wrapper.namespace.post(client, {body: recipe}, cb);
	},
	"delete": (client, options, cb) => {
		if (!options || !options.name) {
			return cb(new Error("delete namespace options is required with {name}"));
		}
		wrapper.namespace.delete(client, {name: options.name}, cb);
	},
	"getOne": (client, options, cb) => {
		if (!options || !options.name) {
			return cb(new Error("getOne namespace options is required with {name}"));
		}
		wrapper.namespace.get(client, {name: options.name}, (error, item) => {
			return cb(error, item);
		});
	},
	"get": (client, options, cb) => {
		wrapper.namespace.get(client, {qs: options.filter || null}, (error, items) => {
			return cb(error, items);
		});
	}
};
module.exports = bl;