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
		if (!options || !options.name || !options.namespace) {
			return cb(new Error("pvc delete: options is required with {name, and namespace}"));
		}
		wrapper.persistentvolumeclaim.get(client, {namespace: options.namespace, name: options.name}, (error, item) => {
			if (error) {
				return cb(error);
			}
			if (!item) {
				return cb(new Error("Unable to find the pvc [" + options.name + "] to delete."));
			}
			wrapper.persistentvolumeclaim.delete(client, {
				namespace: options.namespace,
				name: options.name
			}, (error) => {
				if (error) {
					return cb(error);
				}
				return cb(null, item);
			});
		});
	},
	"getOne": (client, options, cb) => {
		if (!options || !options.name || !options.namespace) {
			return cb(new Error("pvc getOne: options is required with {name, and namespace}"));
		}
		wrapper.persistentvolumeclaim.get(client, {namespace: options.namespace, name: options.name}, (error, item) => {
			return cb(error, item);
		});
	},
	"get": (client, options, cb) => {
		if (!options || !options.namespace) {
			return cb(new Error("pvc get: options is required with {namespace}"));
		}
		wrapper.persistentvolumeclaim.get(client, {
			namespace: options.namespace,
			qs: options.filter || null
		}, (error, items) => {
			return cb(error, items);
		});
	},
	"create": (client, options, cb) => {
		if (!options || !options.accessModes || !options.name || !options.namespace) {
			return cb(new Error("pvc create: options is required with {accessModes, name, and namespace}"));
		}
		if (!Array.isArray(options.content) || options.content.length === 0) {
			return cb(new Error("pvc content must be an array with at least one item."));
		}
		let recipe = {
			"kind": 'PersistentVolumeClaim',
			"apiVersion": 'v1',
			"metadata": {
				"name": options.name,
				"labels": {
					'soajs.persistentVolumeClaim.name': options.name
				}
			},
			"spec": {
				"accessModes": options.accessModes,
				"resources": {
					"requests": {
						"storage": options.storage || '1Gi'
					}
				},
				"storageClassName": options.storageClassName || "",
				"volumeMode": options.volumeMode || "Filesystem"
			}
		};
		
		wrapper.persistentvolumeclaim.post(client, {namespace: options.namespace, body: recipe}, cb);
	}
};
module.exports = bl;