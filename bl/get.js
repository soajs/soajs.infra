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
	
	"log": (soajs, inputmaskData, options, cb) => {
		if (!inputmaskData) {
			return cb(bl.handleError(soajs, 400, null));
		}
		bl.handleConnect(soajs, inputmaskData.configuration, (error, client, config) => {
			if (error) {
				return cb(bl.handleError(soajs, 702, error));
			}
			driver.pod.log(client, {
				"namespace": config.namespace,
				"name": inputmaskData.name,
				"follow": inputmaskData.follow,
				"lines": inputmaskData.lines
			}, (error, response) => {
				if (error) {
					return cb(bl.handleError(soajs, 702, error));
				}
				return cb(null, response);
			});
		});
	},
	
	"pvcOne": (soajs, inputmaskData, options, cb) => {
		if (!inputmaskData) {
			return cb(bl.handleError(soajs, 400, null));
		}
		bl.handleConnect(soajs, inputmaskData.configuration, (error, client, config) => {
			if (error) {
				return cb(bl.handleError(soajs, 702, error));
			}
			driver.get.pvc(client, {
				"namespace": config.namespace,
				"name": inputmaskData.name
			}, (error, response) => {
				if (error) {
					return cb(bl.handleError(soajs, 702, error));
				}
				return cb(null, response);
			});
		});
	},
	"pvcAll": (soajs, inputmaskData, options, cb) => {
		if (!inputmaskData) {
			return cb(bl.handleError(soajs, 400, null));
		}
		bl.handleConnect(soajs, inputmaskData.configuration, (error, client, config) => {
			if (error) {
				return cb(bl.handleError(soajs, 702, error));
			}
			if (!inputmaskData.filter) {
				inputmaskData.filter = {};
			}
			if (inputmaskData.limit) {
				inputmaskData.filter.limit = inputmaskData.limit;
			}
			if (inputmaskData.continue) {
				inputmaskData.filter.continue = inputmaskData.continue;
			}
			driver.get.pvcs(client, {
				"namespace": config.namespace,
				"filter": inputmaskData.filter
			}, (error, response) => {
				if (error) {
					return cb(bl.handleError(soajs, 702, error));
				}
				return cb(null, response);
			});
		});
	},
	
	"secretOne": (soajs, inputmaskData, options, cb) => {
		if (!inputmaskData) {
			return cb(bl.handleError(soajs, 400, null));
		}
		bl.handleConnect(soajs, inputmaskData.configuration, (error, client, config) => {
			if (error) {
				return cb(bl.handleError(soajs, 702, error));
			}
			driver.get.secret(client, {
				"namespace": config.namespace,
				"name": inputmaskData.name
			}, (error, response) => {
				if (error) {
					return cb(bl.handleError(soajs, 702, error));
				}
				return cb(null, response);
			});
		});
	},
	"secretAll": (soajs, inputmaskData, options, cb) => {
		if (!inputmaskData) {
			return cb(bl.handleError(soajs, 400, null));
		}
		bl.handleConnect(soajs, inputmaskData.configuration, (error, client, config) => {
			if (error) {
				return cb(bl.handleError(soajs, 702, error));
			}
			if (!inputmaskData.filter) {
				inputmaskData.filter = {};
			}
			if (inputmaskData.limit) {
				inputmaskData.filter.limit = inputmaskData.limit;
			}
			if (inputmaskData.continue) {
				inputmaskData.filter.continue = inputmaskData.continue;
			}
			driver.get.secrets(client, {
				"namespace": config.namespace,
				"filter": inputmaskData.filter
			}, (error, response) => {
				if (error) {
					return cb(bl.handleError(soajs, 702, error));
				}
				return cb(null, response);
			});
		});
	}
	
};
module.exports = bl;