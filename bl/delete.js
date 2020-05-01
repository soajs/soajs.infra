'use strict';

/**
 * @license
 * Copyright SOAJS All Rights Reserved.
 *
 * Use of this source code is governed by an Apache license that can be
 * found in the LICENSE file at the root of this repository
 */


const driver = require("../driver/kubernetes/index.js");
const lib = require("./lib.js");

let bl = {
	"localConfig": null,
	"handleError": null,
	
	"namespace": (soajs, inputmaskData, options, cb) => {
		if (!inputmaskData) {
			return cb(bl.handleError(soajs, 400, null));
		}
		lib.getDriverConfiguration(soajs, inputmaskData.configuration, (error, config) => {
			if (error) {
				return cb(bl.handleError(soajs, 700, error));
			} else {
				driver.connect(config, (error, client) => {
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
			}
		});
	},
	"secret": (soajs, inputmaskData, options, cb) => {
		if (!inputmaskData) {
			return cb(bl.handleError(soajs, 400, null));
		}
		lib.getDriverConfiguration(soajs, inputmaskData.configuration, (error, config) => {
			if (error) {
				return cb(bl.handleError(soajs, 700, error));
			} else {
				driver.connect(config, (error, client) => {
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
			}
		});
	},
	"item": (soajs, inputmaskData, options, cb) => {
		if (!inputmaskData) {
			return cb(bl.handleError(soajs, 400, null));
		}
		lib.getDriverConfiguration(soajs, inputmaskData.configuration, (error, config) => {
			if (error) {
				return cb(bl.handleError(soajs, 700, error));
			} else {
				driver.connect(config, (error, client) => {
					if (error) {
						return cb(bl.handleError(soajs, 702, error));
					}
					let mode = inputmaskData.mode.toLowerCase();
					driver.delete[mode](client, {
						"namespace": config.namespace,
						"name": inputmaskData.name
					}, (error) => {
						if (error) {
							return cb(bl.handleError(soajs, 702, error));
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
			}
		});
	},
	
	"service": (soajs, inputmaskData, options, cb) => {
		if (!inputmaskData) {
			return cb(bl.handleError(soajs, 400, null));
		}
		lib.getDriverConfiguration(soajs, inputmaskData.configuration, (error, config) => {
			if (error) {
				return cb(bl.handleError(soajs, 700, error));
			} else {
				driver.connect(config, (error, client) => {
					if (error) {
						return cb(bl.handleError(soajs, 702, error));
					}
					driver.delete.service(client, {
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
		});
	}
};
module.exports = bl;