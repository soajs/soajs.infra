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
			driver.delete.namespace(client, {"name": inputmaskData.name}, (error) => {
				if (error) {
					return cb(bl.handleError(soajs, 702, error));
				}
				return cb(null, {"created": true});
			});
		});
	},
	"autoscale": (soajs, inputmaskData, options, cb) => {
		if (!inputmaskData) {
			return cb(bl.handleError(soajs, 400, null));
		}
		bl.handleConnect(soajs, inputmaskData.configuration, (error, client, config) => {
			if (error) {
				return cb(bl.handleError(soajs, 702, error));
			}
			driver.delete.autoscale(client, {
				"namespace": config.namespace,
				"name": inputmaskData.name
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
			driver.delete.secret_opaque(client, {
				"namespace": config.namespace,
				"name": inputmaskData.name
			}, (error) => {
				if (error) {
					return cb(bl.handleError(soajs, 702, error));
				}
				return cb(null, {"created": true});
			});
		});
	},
	"item": (soajs, inputmaskData, options, cb) => {
		if (!inputmaskData || !inputmaskData.item) {
			return cb(bl.handleError(soajs, 400, null));
		}
		bl.handleConnect(soajs, inputmaskData.configuration, (error, client, config) => {
			if (error) {
				return cb(bl.handleError(soajs, 702, error));
			}
			
			let mode = inputmaskData.mode.toLowerCase();
			if (!driver.delete[mode]) {
				return cb(bl.handleError(soajs, 504, null));
			}
			
			driver.delete[mode](client, {
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
				driver.get.service(client, {
					"namespace": config.namespace,
					"name": serviceName
				}, (error) => {
					if (error && error.code === 404) {
						return cb(null, {"deleted": true});
					}
					if (error) {
						return cb(bl.handleError(soajs, 702, error));
					}
					driver.delete.service(client, {
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
	
	"pods": (soajs, inputmaskData, options, cb) => {
		if (!inputmaskData) {
			return cb(bl.handleError(soajs, 400, null));
		}
		bl.handleConnect(soajs, inputmaskData.configuration, (error, client, config) => {
			if (error) {
				return cb(bl.handleError(soajs, 702, error));
			}
			driver.delete.pods(client, {
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
	"resource": (soajs, inputmaskData, options, cb) => {
		if (!inputmaskData) {
			return cb(bl.handleError(soajs, 400, null));
		}
		bl.handleConnect(soajs, inputmaskData.configuration, (error, client, config) => {
			if (error) {
				return cb(bl.handleError(soajs, 702, error));
			}
			
			let mode = inputmaskData.mode.toLowerCase();
			if (!driver.delete[mode]) {
				return cb(bl.handleError(soajs, 504, null));
			}
			driver.delete[mode](client, {
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