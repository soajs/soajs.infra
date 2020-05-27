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
			return cb(new Error("PVC delete: options is required with {name, and namespace}"));
		}
		wrapper.pvc.get(client, {namespace: options.namespace, name: options.name}, (error, item) => {
			if (error) {
				return cb(error);
			}
			if (!item) {
				return cb(new Error("Unable to find the PVC [" + options.name + "] to delete."));
			}
			wrapper.pvc.delete(client, {
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
			return cb(new Error("PVC getOne: options is required with {name, and namespace}"));
		}
		wrapper.pvc.get(client, {namespace: options.namespace, name: options.name}, (error, item) => {
			return cb(error, item);
		});
	},
	"get": (client, options, cb) => {
		if (!options || !options.namespace) {
			return cb(new Error("PVC get: options is required with {namespace}"));
		}
		wrapper.pvc.get(client, {
			namespace: options.namespace,
			qs: options.filter || null
		}, (error, items) => {
			return cb(error, items);
		});
	},
	"apply": (client, options, cb) => {
		if (!options || !options.body || !options.namespace) {
			return cb(new Error("PVC apply: options is required with {body, and namespace}"));
		}
		return wrapper.pvc.post(client, {namespace: options.namespace, body: options.body}, cb);
	},
	"create": (client, options, cb) => {
		if (!options || !options.accessModes || !options.name || !options.namespace) {
			return cb(new Error("PVC create: options is required with {accessModes, name, and namespace}"));
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
		wrapper.pvc.post(client, {namespace: options.namespace, body: recipe}, cb);
	}
};
module.exports = bl;