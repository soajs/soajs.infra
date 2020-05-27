'use strict';

/**
 * @license
 * Copyright SOAJS All Rights Reserved.
 *
 * Use of this source code is governed by an Apache license that can be
 * found in the LICENSE file at the root of this repository
 */

let bl = {
	"localConfig": null,
	"handleError": null,
	"handleConnect": null,
	"driver": null,
	
	"namespace": (soajs, inputmaskData, options, cb) => {
		if (!inputmaskData) {
			return cb(bl.handleError(soajs, 400, null));
		}
		bl.handleConnect(soajs, inputmaskData.configuration, (error, client) => {
			if (error) {
				return cb(bl.handleError(soajs, 702, error));
			}
			bl.driver.create.namespace(client, {"name": inputmaskData.name}, (error) => {
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
			bl.driver.create.hpa(client, {
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
			if (options && options.type === "dockercfg") {
				bl.driver.create.secret_dockercfg(client, {
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
				bl.driver.create.secret_opaque(client, {
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
			bl.driver.create.pvc(client, {
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