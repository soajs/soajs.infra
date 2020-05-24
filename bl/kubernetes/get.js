'use strict';

/**
 * @license
 * Copyright SOAJS All Rights Reserved.
 *
 * Use of this source code is governed by an Apache license that can be
 * found in the LICENSE file at the root of this repository
 */

const async = require("async");
const soajsCoreLibs = require("soajs.core.libs");

let bl = {
	"localConfig": null,
	"handleError": null,
	"handleConnect": null,
	"driver": null,
	
	"one": (soajs, inputmaskData, options, cb) => {
		if (!inputmaskData) {
			return cb(bl.handleError(soajs, 400, null));
		}
		bl.handleConnect(soajs, inputmaskData.configuration, (error, client, config) => {
			if (error) {
				return cb(bl.handleError(soajs, 702, error));
			}
			let mode = inputmaskData.mode.toLowerCase();
			if (!bl.driver.get.one[mode]) {
				return cb(bl.handleError(soajs, 504, null));
			}
			bl.driver.get.one[mode](client, {
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
	"all": (soajs, inputmaskData, options, cb) => {
		if (!inputmaskData) {
			return cb(bl.handleError(soajs, 400, null));
		}
		bl.handleConnect(soajs, inputmaskData.configuration, (error, client, config) => {
			if (error) {
				return cb(bl.handleError(soajs, 702, error));
			}
			let mode = inputmaskData.mode.toLowerCase();
			if (!bl.driver.get.all[mode]) {
				return cb(bl.handleError(soajs, 504, null));
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
			if (inputmaskData.type === "Item") {
				if (inputmaskData.filter.labelSelector) {
					inputmaskData.filter.labelSelector += ", soajs.content=true";
				} else {
					inputmaskData.filter.labelSelector = "soajs.content=true";
				}
			} else if (inputmaskData.type === "Other") {
				if (inputmaskData.filter.labelSelector) {
					inputmaskData.filter.labelSelector += ", soajs.content!=true";
				} else {
					inputmaskData.filter.labelSelector = "soajs.content!=true";
				}
			}
			bl.driver.get.all[mode](client, {
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
	
	"log": (soajs, inputmaskData, options, cb) => {
		if (!inputmaskData) {
			return cb(bl.handleError(soajs, 400, null));
		}
		bl.handleConnect(soajs, inputmaskData.configuration, (error, client, config) => {
			if (error) {
				return cb(bl.handleError(soajs, 702, error));
			}
			bl.driver.pod.log(client, {
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
	
	"item_latestVersion": (soajs, inputmaskData, options, cb) => {
		if (!inputmaskData) {
			return cb(bl.handleError(soajs, 400, null));
		}
		bl.handleConnect(soajs, inputmaskData.configuration, (error, client, config) => {
			if (error) {
				return cb(bl.handleError(soajs, 702, error));
			}
			
			let filter = {"labelSelector": 'soajs.service.name=' + inputmaskData.itemName};
			
			async.parallel({
				deployment: function (callback) {
					bl.driver.get.all.deployment(client, {
						"namespace": config.namespace,
						"filter": filter
					}, (error, list) => {
						if (error) {
							callback(error);
						} else {
							callback(null, list);
						}
					});
				},
				daemonset: function (callback) {
					bl.driver.get.all.daemonset(client, {
						"namespace": config.namespace,
						"filter": filter
					}, (error, list) => {
						if (error) {
							callback(error);
						} else {
							callback(null, list);
						}
					});
				},
				cronjob: function (callback) {
					bl.driver.get.all.cronjob(client, {
						"namespace": config.namespace,
						"filter": filter
					}, (error, list) => {
						if (error) {
							callback(error);
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
	}
	
};
module.exports = bl;