'use strict';

/**
 * @license
 * Copyright SOAJS All Rights Reserved.
 *
 * Use of this source code is governed by an Apache license that can be
 * found in the LICENSE file at the root of this repository
 */


const driver = require("../driver/kubernetes/index.js");

let bl = {
	"localConfig": null,
	"handleError": null,
	"handleConnect": null,
	
	"namespace": (soajs, inputmaskData, options, cb) => {
		if (!inputmaskData) {
			return cb(bl.handleError(soajs, 400, null));
		}
		bl.handleConnect(soajs, inputmaskData.configuration, (error, client) => {
			if (error) {
				return cb(bl.handleError(soajs, 702, error));
			}
			driver.create.namespace(client, {"name": inputmaskData.name}, (error) => {
				if (error) {
					return cb(bl.handleError(soajs, 702, error));
				}
				return cb(null, {"created": true});
			});
		});
	},
	"hpa": (soajs, inputmaskData, options, cb) => {
		if (!inputmaskData) {
			return cb(bl.handleError(soajs, 400, null));
		}
		bl.handleConnect(soajs, inputmaskData.configuration, (error, client, config) => {
			if (error) {
				return cb(bl.handleError(soajs, 702, error));
			}
			driver.create.hpa(client, {
				"namespace": config.namespace,
				"name": inputmaskData.name,
				"replica": inputmaskData.replica,
				"metrics": inputmaskData.metrics
			}, (error) => {
				if (error) {
					return cb(bl.handleError(soajs, 702, error));
				}
				return cb(null, {"created": true});
			});
		});
	},
	"secret": (soajs, inputmaskData, options, cb) => {
		if (!inputmaskData) {
			return cb(bl.handleError(soajs, 400, null));
		}
		bl.handleConnect(soajs, inputmaskData.configuration, (error, client, config) => {
			if (error) {
				return cb(bl.handleError(soajs, 702, error));
			}
			if (options.type === "dockercfg") {
				driver.create.secret_dockercfg(client, {
					"namespace": config.namespace,
					"name": inputmaskData.name,
					"content": inputmaskData.content
				}, (error) => {
					if (error) {
						return cb(bl.handleError(soajs, 702, error));
					}
					return cb(null, {"created": true});
				});
			} else {
				driver.create.secret_opaque(client, {
					"namespace": config.namespace,
					"name": inputmaskData.name,
					"content": inputmaskData.content
				}, (error) => {
					if (error) {
						return cb(bl.handleError(soajs, 702, error));
					}
					return cb(null, {"created": true});
				});
			}
		});
	},
	"pvc": (soajs, inputmaskData, options, cb) => {
		if (!inputmaskData) {
			return cb(bl.handleError(soajs, 400, null));
		}
		bl.handleConnect(soajs, inputmaskData.configuration, (error, client, config) => {
			if (error) {
				return cb(bl.handleError(soajs, 702, error));
			}
			driver.create.pvc(client, {
				"namespace": config.namespace,
				"name": inputmaskData.name,
				"accessModes": inputmaskData.accessModes,
				"storage": inputmaskData.storage,
				"storageClassName": inputmaskData.storageClassName || null,
				"volumeMode": inputmaskData.volumeMode || null
			}, (error) => {
				if (error) {
					return cb(bl.handleError(soajs, 702, error));
				}
				return cb(null, {"created": true});
			});
		});
	}
};
module.exports = bl;