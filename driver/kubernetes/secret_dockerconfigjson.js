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
			return cb(new Error("secret_dockerconfigjson create: options is required with {content, name, and namespace}"));
		}
		let recipe = {
			kind: 'Secret',
			apiVersion: 'v1',
			type: 'kubernetes.io/dockerconfigjson',
			metadata: {
				name: options.name,
				labels: {
					'soajs.content': 'true'
				}
			},
			data: null
		};
		let auth = new Buffer(`${options.content.username}:${options.content.password}`);
		let data = {
			"auths": {
				[options.content.server]: {
					username: options.content.username,
					password: options.content.password,
					email: options.content.email,
					auth: auth.toString("base64")
				}
			}
		};
		let buff = new Buffer(JSON.stringify(data));
		let base64data = buff.toString("base64");
		
		recipe.data = {[".dockerconfigjson"]: base64data};
		
		if (!recipe.data) {
			return cb(new Error("secret cannot be created, unable to build the needed content."));
		}
		
		wrapper.secret.post(client, {namespace: options.namespace, body: recipe}, cb);
	}
};
module.exports = bl;