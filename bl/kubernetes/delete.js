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
	
	"pods": (soajs, inputmaskData, options, cb) => {
		if (!inputmaskData) {
			return cb(bl.handleError(soajs, 400, null));
		}
		bl.handleConnect(soajs, inputmaskData.configuration, (error, client, config) => {
			if (error) {
				return cb(bl.handleError(soajs, 702, error));
			}
			bl.driver.delete.pods(client, {
				"namespace": config.namespace,
				"filter": inputmaskData.filter
			}, (error) => {
				if (error) {
					return cb(bl.handleError(soajs, 702, error));
				}
				return cb(null, {"deleted": true});
			});
		});
	},
	"namespace": (soajs, inputmaskData, options, cb) => {
		if (!inputmaskData) {
			return cb(bl.handleError(soajs, 400, null));
		}
		bl.handleConnect(soajs, inputmaskData.configuration, (error, client) => {
			if (error) {
				return cb(bl.handleError(soajs, 702, error));
			}
			bl.driver.delete.namespace(client, {"name": inputmaskData.name}, (error) => {
				if (error) {
					return cb(bl.handleError(soajs, 702, error));
				}
				return cb(null, {"deleted": true});
			});
		});
	},
	"item": (soajs, inputmaskData, options, cb) => {
		if (!inputmaskData || !inputmaskData.name) {
			return cb(bl.handleError(soajs, 400, null));
		}
		bl.handleConnect(soajs, inputmaskData.configuration, (error, client, config) => {
			if (error) {
				return cb(bl.handleError(soajs, 702, error));
			}
			
			let mode = inputmaskData.mode.toLowerCase();
			if (!bl.driver.delete[mode]) {
				return cb(bl.handleError(soajs, 504, null));
			}
			
			bl.driver.delete[mode](client, {
				"namespace": config.namespace,
				"name": inputmaskData.name,
				"cleanup": inputmaskData.cleanup || false
			}, (error, item) => {
				if (error) {
					return cb(bl.handleError(soajs, 702, error));
				}
				if (!item) {
					return cb(bl.handleError(soajs, 501, null));
				}
				
				let serviceName = inputmaskData.name + "-service";
				if (inputmaskData.serviceName) {
					serviceName = inputmaskData.serviceName;
				}
				bl.driver.get.one.service(client, {
					"namespace": config.namespace,
					"name": serviceName
				}, (error) => {
					if (error && error.code === 404) {
						return cb(null, {"deleted": true});
					}
					if (error) {
						return cb(bl.handleError(soajs, 702, error));
					}
					bl.driver.delete.service(client, {
						"namespace": config.namespace,
						"name": serviceName
					}, (error) => {
						if (error) {
							return cb(bl.handleError(soajs, 702, error));
						}
						return cb(null, {"deleted": true});
					});
				});
			});
		});
	},
	
	"resource": (soajs, inputmaskData, options, cb) => {
		if (!inputmaskData) {
			return cb(bl.handleError(soajs, 400, null));
		}
		bl.handleConnect(soajs, inputmaskData.configuration, (error, client, config) => {
			if (error) {
				return cb(bl.handleError(soajs, 702, error));
			}
			
			let mode = inputmaskData.mode.toLowerCase();
			if (!bl.driver.delete[mode]) {
				return cb(bl.handleError(soajs, 504, null));
			}
			bl.driver.delete[mode](client, {
				"namespace": config.namespace,
				"name": inputmaskData.name
			}, (error) => {
				if (error) {
					return cb(bl.handleError(soajs, 702, error));
				}
				return cb(null, {"deleted": true});
			});
		});
	}
};
module.exports = bl;