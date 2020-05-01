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
	"autoscale": (client, options, cb) => {
		if (!options || !options.autoscale || !options.namespace) {
			return cb(new Error("create autoscale options is required with {autoscale, and namespace}"));
		}
		return wrapper.autoscale.post(client, {body: options.autoscale, namespace: options.namespace}, cb);
	},
	"namespace": (client, options, cb) => {
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
	"service": (client, options, cb) => {
		if (!options || !options.service || !options.namespace) {
			return cb(new Error("create service options is required with {service, and namespace}"));
		}
		return wrapper.service.post(client, {namespace: options.namespace, body: options.service}, cb);
	},
	"deployment": (client, options, cb) => {
		if (!options || !options.deployment || !options.namespace) {
			return cb(new Error("create deployment options is required with {deployment, and namespace}"));
		}
		let deploytype = null;
		if (options.deployment.kind === "DaemonSet") {
			deploytype = "daemonset";
		} else if (options.deployment.kind === "Deployment") {
			deploytype = "deployment";
		} else if (options.deployment.kind === "CronJob") {
			deploytype = "cronjob";
		}
		if (!deploytype) {
			return cb(new Error("Unsupported deployment kind [" + deploytype + "]"));
		}
		return wrapper[deploytype].post(client, {namespace: options.namespace, body: options.deployment}, cb);
	},
	"secret_opaque": (client, options, cb) => {
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