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
const soajsCoreLibs = require("soajs.core.libs");

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
	
	"exec": {},
	
	"scale": (soajs, inputmaskData, options, cb) => {
		if (!inputmaskData) {
			return cb(bl.handleError(soajs, 400, null));
		}
		bl.handleConnect(soajs, inputmaskData.configuration, (error, client, config) => {
			if (error) {
				return cb(bl.handleError(soajs, 702, error));
			}
			driver.get.deployment(client, {
				"namespace": config.namespace,
				"name": inputmaskData.name
			}, (error, item) => {
				if (error) {
					return cb(bl.handleError(soajs, 702, error));
				}
				if (!item) {
					return cb(bl.handleError(soajs, 501, null));
				}
				driver.deployment.patch(client, {
					"namespace": config.namespace,
					"name": inputmaskData.name,
					"body": {
						spec: {
							replicas: inputmaskData.scale
						}
					}
				}, (error) => {
					if (error) {
						return cb(bl.handleError(soajs, 702, error));
					}
					return cb(null, {"scale": true});
				});
			});
		});
	},
	
	"getLog": (soajs, inputmaskData, options, cb) => {
		if (!inputmaskData) {
			return cb(bl.handleError(soajs, 400, null));
		}
		bl.handleConnect(soajs, inputmaskData.configuration, (error, client, config) => {
			if (error) {
				return cb(bl.handleError(soajs, 702, error));
			}
			driver.pod.log(client, {
				"namespace": config.namespace,
				"name": inputmaskData.podName,
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
	
	"getResource_latestVersion": (soajs, inputmaskData, options, cb) => {
		if (!inputmaskData) {
			return cb(bl.handleError(soajs, 400, null));
		}
		bl.handleConnect(soajs, inputmaskData.configuration, (error, client, config) => {
			if (error) {
				return cb(bl.handleError(soajs, 702, error));
			}
			
			let filter = {
				labelSelector: 'soajs.env.code=' + inputmaskData.env.toLowerCase() + ', soajs.service.name=' + inputmaskData.itemName
			};
			
			async.parallel({
				deployment: function (callback) {
					driver.get.deployments(client, {
						"namespace": config.namespace,
						"filter": filter
					}, (error, list) => {
						if (error) {
							callback(null, error.message);
						} else {
							callback(null, list);
						}
					});
				},
				daemonset: function (callback) {
					driver.get.daemonsets(client, {
						"namespace": config.namespace,
						"filter": filter
					}, (error, list) => {
						if (error) {
							callback(null, error.message);
						} else {
							callback(null, list);
						}
					});
				},
				cronjob: function (callback) {
					driver.get.cronjobs(client, {
						"namespace": config.namespace,
						"filter": filter
					}, (error, list) => {
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
				}
				let items = [];
				if (results.deployment && results.deployment.items) {
					items = items.concat(results.deployment.items);
				}
				if (results.daemonset && results.daemonset.items) {
					items = items.concat(results.daemonset.items);
				}
				if (results.cronjob && results.cronjob.items) {
					items = items.concat(results.cronjob.items);
				}
				
				let latestVersion = null;
				
				if (items && Array.isArray(items) && items.length > 0) {
					
					let checkVersion = (item, callback) => {
						if (item.metadata && item.metadata.labels && item.metadata.labels['soajs.service.version']) {
							let itemVersion = soajsCoreLibs.version.unsanitize(item.metadata.labels['soajs.service.version']);
							latestVersion = soajsCoreLibs.version.getLatest(itemVersion, latestVersion);
						}
						callback(null);
					};
					//async
					async.eachSeries(items, checkVersion, function (error) {
						if (error) {
							return cb(bl.handleError(soajs, 702, error));
						}
						if (latestVersion !== null) {
							return cb(null, latestVersion);
						} else {
							return cb(bl.handleError(soajs, 505, null));
						}
					});
				} else {
					return cb(bl.handleError(soajs, 501, null));
				}
			});
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