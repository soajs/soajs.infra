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
const get = (p, o) => p.reduce((xs, x) => (xs && xs[x]) ? xs[x] : null, o);

let getDriverConfiguration = (soajs, configuration, cb) => {
	if (!configuration) {
		return cb(new Error("Problem with the provided kubernetes configuration"));
	}
	if (configuration.env) {
		//get env registry
		let registry = soajs.registry;
		let depType = get(["deployer", "type"], registry);
		if (depType === "container") {
			let depSeleted = get(["deployer", "selected"], registry);
			if (depSeleted && depSeleted.includes("kubernetes")) {
				let regConf = get(["deployer"].concat(depSeleted.split(".")), registry);
				if (regConf) {
					let protocol = regConf.apiProtocol || "https://";
					let port = regConf.apiPort ? ":" + regConf.apiPort : "";
					let config = {
						"namespace": regConf.namespace.default,
						"token": regConf.auth.token,
						"url": protocol + regConf.nodes + port
					};
					return cb(null, config);
				}
			}
		}
		return cb(new Error("Unable to find healthy configuration in registry"));
	} else {
		if (configuration.namespace && configuration.token && configuration.url) {
			let config = {
				"namespace": configuration.namespace,
				"token": configuration.token,
				"url": configuration.url
			};
			return cb(null, config);
		}
		return cb(new Error("Configuration requires namespace, token, and url"));
	}
};

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
	
	"deploy": (soajs, inputmaskData, options, cb) => {
		if (!inputmaskData) {
			return cb(bl.handleError(soajs, 400, null));
		}
		
		getDriverConfiguration(soajs, inputmaskData.configuration, (error, config) => {
			if (error) {
				return cb(bl.handleError(soajs, 700, error));
			} else {
				driver.connect(config, (error, client) => {
					if (error) {
						return cb(bl.handleError(soajs, 702, error));
					}
					driver.create.deployment(client, {
						"deployment": inputmaskData.deployment,
						"namespace": config.namespace
					}, (error) => {
						if (error) {
							return cb(bl.handleError(soajs, 702, error));
						}
						if (inputmaskData.service) {
							driver.create.service(client, {
								"service": inputmaskData.service,
								"namespace": config.namespace
							}, (error) => {
								if (error) {
									return cb(bl.handleError(soajs, 702, error));
								}
								return cb(null, {"created": true});
								
							});
						} else {
							return cb(null, {"created": true});
						}
					});
				});
			}
		});
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
		getDriverConfiguration(soajs, inputmaskData.configuration, (error, config) => {
			if (error) {
				return cb(bl.handleError(soajs, 700, error));
			} else {
				driver.connect(config, (error, client) => {
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
		});
	}
};

module.exports = bl;