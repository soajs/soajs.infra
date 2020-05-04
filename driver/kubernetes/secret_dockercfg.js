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
			return cb(new Error("secret_dockercfg create: options is required with {content, name, and namespace}"));
		}
		if (!Array.isArray(options.content) || options.content.length === 0) {
			return cb(new Error("secret content must be an array with at least one item."));
		}
		let recipe = {
			kind: 'Secret',
			apiVersion: 'v1',
			type: 'kubernetes.io/dockercfg',
			metadata: {
				name: options.name,
				labels: {
					'soajs.content': 'true'
				}
			},
			stringData: null
		};
		let auth = new Buffer(`${options.content.username}:${options.content.password}`);
		let data = {
			[options.content.server]: {
				username: options.content.username,
				password: options.content.password,
				email: options.content.email,
				auth: auth.toString("base64"),
			}
		};
		recipe.stringData = {[".dockercfg"]: JSON.stringify(data)};
		
		if (!recipe.stringData) {
			return cb(new Error("secret cannot be created, unable to build the needed content."));
		}
		
		wrapper.secret.post(client, {namespace: options.namespace, body: recipe}, cb);
	}
};
module.exports = bl;