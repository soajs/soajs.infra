/**
 * @license
 * Copyright SOAJS All Rights Reserved.
 *
 * Use of this source code is governed by an Apache license that can be
 * found in the LICENSE file at the root of this repository
 */

'use strict';

const driver = require("../driver/kubernetes/index.js");

let bl = {
	"localConfig": null,
	
	"handleError": (soajs, errCode, err) => {
		if (err) {
			soajs.log.error(err.message);
		}
		return ({
			"code": errCode,
			"msg": bl.localConfig.errors[errCode] + ((err && errCode === 702) ? err.message : "")
		});
	},
	
	"getDriverConfiguratio": (soajs, env, cb) => {
		//get it from registry
		let config = {
			"token": null,
			"url": null
		};
		return cb(null, config);
	},
	
	"createServiceAndDeployment": (soajs, inputmaskData, options, cb) => {
		if (!inputmaskData) {
			return cb(bl.handleError(soajs, 400, null));
		}
		
		function continue_fn(config) {
			driver.connect(config, (error, client) => {
				if (error) {
					return cb(bl.handleError(soajs, 702, error));
				}
				driver.createService(client, inputmaskData.service, inputmaskData.namespace, (error) => {
					if (error) {
						return cb(bl.handleError(soajs, 702, error));
					}
					driver.createDeployment(client, inputmaskData.deployment, inputmaskData.namespace, (error) => {
						if (error) {
							return cb(bl.handleError(soajs, 702, error));
						}
						if (!inputmaskData.getIps) {
							return cb(null, {"created": true});
						} else {
							driver.getServiceIps(client, {
								"namespace": inputmaskData.namespace,
								"serviceName": inputmaskData.service.metadata.name
							}, (error, response) => {
								if (error) {
									return cb(bl.handleError(soajs, 702, error));
								}
								response.created = true;
								return cb(null, response);
							});
						}
					});
				});
				
			});
		}
		
		let driverConfig = inputmaskData.driverConfig;
		if (!driverConfig) {
			bl.getDriverConfiguratio(soajs, inputmaskData.env, (error, config) => {
				if (error) {
					return cb(bl.handleError(soajs, 700, error));
				} else {
					continue_fn(config);
				}
			});
		} else {
			continue_fn(driverConfig);
		}
	}
};

module.exports = bl;