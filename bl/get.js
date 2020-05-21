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
					driver.get.deployments(client, {
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
					driver.get.daemonsets(client, {
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
					driver.get.cronjobs(client, {
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
	},
	
	"resources_item": (soajs, inputmaskData, options, cb) => {
		if (!inputmaskData) {
			return cb(bl.handleError(soajs, 400, null));
		}
		if (!inputmaskData.filter) {
			inputmaskData.filter = {};
		}
		if (inputmaskData.filter.labelSelector) {
			inputmaskData.filter.labelSelector += ", soajs.content=true";
		} else {
			inputmaskData.filter.labelSelector = "soajs.content=true";
		}
		bl.getResources(soajs, inputmaskData, options, cb);
	},
	
	"resources_other": (soajs, inputmaskData, options, cb) => {
		if (!inputmaskData) {
			return cb(bl.handleError(soajs, 400, null));
		}
		if (!inputmaskData.filter) {
			inputmaskData.filter = {};
		}
		if (inputmaskData.filter.labelSelector) {
			inputmaskData.filter.labelSelector += ", soajs.content!=true";
		} else {
			inputmaskData.filter.labelSelector = "soajs.content!=true";
		}
		bl.getResources(soajs, inputmaskData, options, cb);
	},
	
	"resources": (soajs, inputmaskData, options, cb) => {
		if (!inputmaskData) {
			return cb(bl.handleError(soajs, 400, null));
		}
		bl.handleConnect(soajs, inputmaskData.configuration, (error, client, config) => {
			if (error) {
				return cb(bl.handleError(soajs, 702, error));
			}
			let mode = inputmaskData.mode.toLowerCase();
			if (!driver.get[mode]) {
				return cb(bl.handleError(soajs, 504, null));
			}
			if (!inputmaskData.filter) {
				inputmaskData.filter = {};
			}
			let filter = inputmaskData.filter;
			if (inputmaskData.limit) {
				filter.limit = inputmaskData.limit;
			}
			if (inputmaskData.continue) {
				filter.continue = inputmaskData.continue;
			}
			driver.get[mode](client, {
				"namespace": config.namespace,
				"filter": filter
			}, (error, list) => {
				if (error) {
					return cb(bl.handleError(soajs, 702, error));
				} else {
					return cb(null, list);
				}
			});
		});
	},
	// Not used for noe
	"resources_all": (soajs, inputmaskData, options, cb) => {
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
							callback(error);
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
							callback(error);
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
							callback(error);
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
							callback(error);
						} else {
							callback(null, list);
						}
					});
				},
				nodes: function (callback) {
					driver.get.nodes(client, {"filter": null}, (error, list) => {
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
				} else {
					return cb(null, results);
				}
			});
		});
	}
};
module.exports = bl;