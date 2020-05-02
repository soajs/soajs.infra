/**
 * @license
 * Copyright SOAJS All Rights Reserved.
 *
 * Use of this source code is governed by an Apache license that can be
 * found in the LICENSE file at the root of this repository
 */

'use strict';

const async = require("async");
const driver = require("../driver/kubernetes/index.js");
const lib = require("./lib.js");

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
	
	"handleConnect": (soajs, configuration, cb) => {
		lib.getDriverConfiguration(soajs, configuration, (error, config) => {
			if (error) {
				return cb(error);
			} else {
				driver.connect(config, (error, client) => {
					return cb(error, client, config);
				});
			}
		});
	},
	
	"create": {},
	
	"delete": {},
	
	"deploy": {},
	
	"exec": {
		"maintenance": (soajs, inputmaskData, options, cb) => {
			if (!inputmaskData || !inputmaskData.item || !inputmaskData.operation) {
				return cb(bl.handleError(soajs, 400, null));
			}
			let label = inputmaskData.item.env + "-" + inputmaskData.item.name + "-v" + inputmaskData.item.version;
			let filter = {
				labelSelector: 'soajs.service.label=' + label
			};
			bl.handleConnect(soajs, inputmaskData.configuration, (error, client, config) => {
				if (error) {
					return cb(bl.handleError(soajs, 702, error));
				}
				//remove all / from the beginning of a string
				while (inputmaskData.operation.route.charAt(0) === '/') {
					inputmaskData.operation = options.operation.route.substr(1);
				}
				let commands = [`curl -s -X GET http://localhost:${inputmaskData.item.maintenancePort}/${inputmaskData.operation.route}`];
				driver.exec.pod(client, {
					"namespace": config.namespace,
					"filter": filter,
					"commands": commands
				}, (error, response) => {
					if (error) {
						return cb(bl.handleError(soajs, 702, error));
					}
					return cb(null, response);
				});
			});
		},
		"custom": (soajs, inputmaskData, options, cb) => {
			if (!inputmaskData) {
				return cb(bl.handleError(soajs, 400, null));
			}
			bl.handleConnect(soajs, inputmaskData.configuration, (error, client, config) => {
				if (error) {
					return cb(bl.handleError(soajs, 702, error));
				}
				driver.exec.pod(client, {
					"namespace": config.namespace,
					"filter": inputmaskData.filter,
					"commands": inputmaskData.commands
				}, (error, response) => {
					if (error) {
						return cb(bl.handleError(soajs, 702, error));
					}
					return cb(null, response);
				});
			});
		}
	},
	
	"getResources_catalogItems": (soajs, inputmaskData, options, cb) => {
		options = {
			"services": {"labelSelector": "soajs.content=true"},
			"deployments": {"labelSelector": "soajs.content=true"},
			"daemonsets": {"labelSelector": "soajs.content=true"},
			"cronjobs": {"labelSelector": "soajs.content=true"}
		};
		bl.getResources_all(soajs, inputmaskData, options, cb);
	},
	
	"getResources_other": (soajs, inputmaskData, options, cb) => {
		options = {
			"services": {"labelSelector": "soajs.content!=true"},
			"deployments": {"labelSelector": "soajs.content!=true"},
			"daemonsets": {"labelSelector": "soajs.content!=true"},
			"cronjobs": {"labelSelector": "soajs.content!=true"}
		};
		bl.getResources_all(soajs, inputmaskData, options, cb);
	},
	
	"getResources_all": (soajs, inputmaskData, options, cb) => {
		if (!inputmaskData) {
			return cb(bl.handleError(soajs, 400, null));
		}
		bl.handleConnect(soajs, inputmaskData.configuration, (error, client, config) => {
			if (error) {
				return cb(bl.handleError(soajs, 702, error));
			}
			if (!options) {
				options = {};
			}
			async.parallel({
				services: function (callback) {
					driver.get.services(client, {
						"namespace": config.namespace,
						"filter": options.services || null
					}, (error, list) => {
						if (error) {
							callback(null, error.message);
						} else {
							callback(null, list);
						}
					});
				},
				deployments: function (callback) {
					driver.get.deployments(client, {
						"namespace": config.namespace,
						"filter": options.deployments || null
					}, (error, list) => {
						if (error) {
							callback(null, error.message);
						} else {
							callback(null, list);
						}
					});
				},
				daemonsets: function (callback) {
					driver.get.daemonsets(client, {
						"namespace": config.namespace,
						"filter": options.daemonsets || null
					}, (error, list) => {
						if (error) {
							callback(null, error.message);
						} else {
							callback(null, list);
						}
					});
				},
				cronjobs: function (callback) {
					driver.get.cronjobs(client, {
						"namespace": config.namespace,
						"filter": options.cronjobs || null
					}, (error, list) => {
						if (error) {
							callback(null, error.message);
						} else {
							callback(null, list);
						}
					});
				},
				nodes: function (callback) {
					driver.get.nodes(client, {"filter": null}, (error, list) => {
						if (error) {
							callback(null, error.message);
						} else {
							callback(null, list);
						}
					});
				}
			}, function (error, results) {
				if (error) {
					return cb(bl.handleError(soajs, 702, error));
				} else {
					return cb(null, results);
				}
			});
		});
	}
};

module.exports = bl;