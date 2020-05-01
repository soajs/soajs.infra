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
		if (!options || !options.content || !options.name || !options.namespace) {
			return cb(new Error("create secret_opaque options is required with {content, name, and namespace}"));
		}
		if (!Array.isArray(options.content) || options.content.length === 0) {
			return cb(new Error("secret content must be an array with at least one item."));
		}
		let recipe = {
			kind: 'Secret',
			apiVersion: 'v1',
			type: 'Opaque',
			metadata: {
				name: options.name,
				labels: {
					'soajs.content': 'true'
				}
			}
		};
		for (let i = 0; i < options.content.length; i++) {
			let c = options.content[i];
			if (c.name && c.content) {
				if (!recipe.stringData) {
					recipe.stringData = {};
				}
				recipe.stringData[c.name] = c.content;
			}
		}
		
		if (!recipe.stringData) {
			return cb(new Error("secret cannot be created, unable to find any item with name and content."));
		}
		
		wrapper.secret.post(client, {namespace: options.namespace, body: recipe}, cb);
	}
};
module.exports = bl;