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


function setRestartEnv(envArray) {
	if (envArray && Array.isArray(envArray)) {
		let found_in_array = false;
		for (let i = 0; i < envArray.length; i++) {
			if (envArray[i].name === "soa_restart") {
				envArray[i].value = new Date().getTime().toString();
				found_in_array = true;
			}
		}
		if (!found_in_array) {
			envArray.push({"name": "soa_restart", "value": new Date().getTime().toString()});
		}
	}
	return envArray;
}

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
	
	"redeploy": {},
	
	"exec": {},
	
	"resource_update": (soajs, inputmaskData, options, cb) => {
		if (!inputmaskData) {
			return cb(bl.handleError(soajs, 400, null));
		}
		bl.handleConnect(soajs, inputmaskData.configuration, (error, client, config) => {
			if (error) {
				return cb(bl.handleError(soajs, 702, error));
			}
			
			let mode = inputmaskData.mode.toLowerCase();
			if (!driver.update[mode]) {
				return cb(bl.handleError(soajs, 504, null));
			}
			driver.update[mode](client, {
				"namespace": config.namespace,
				"name": inputmaskData.name,
				"body": inputmaskData.body
			}, (error) => {
				if (error) {
					return cb(bl.handleError(soajs, 702, error));
				}
				return cb(null, {"updated": true});
			});
		});
	},
	
	"resource_restart": (soajs, inputmaskData, options, cb) => {
		if (!inputmaskData) {
			return cb(bl.handleError(soajs, 400, null));
		}
		bl.handleConnect(soajs, inputmaskData.configuration, (error, client, kubeConfig) => {
			if (error) {
				return cb(bl.handleError(soajs, 702, error));
			}
			let mode = inputmaskData.mode.toLowerCase();
			if (!driver.delete[mode]) {
				return cb(bl.handleError(soajs, 504, null));
			}
			driver.get[mode](client, {
				"namespace": kubeConfig.namespace,
				"name": inputmaskData.name
			}, (error, item) => {
				if (error) {
					return cb(bl.handleError(soajs, 702, error));
				}
				if (!item) {
					return cb(bl.handleError(soajs, 501, null));
				}
				//check if deployment or daemonset and set restart env
				if (item.spec && item.spec.template && item.spec.template.spec && item.spec.template.spec.containers) {
					if (Array.isArray(item.spec.template.spec.containers) && item.spec.template.spec.containers.length > 0) {
						item.spec.template.spec.containers[0].env = setRestartEnv(item.spec.template.spec.containers[0].env);
					}
				}
				//check if cronjob and set restart env
				if (item.spec && item.spec.jobTemplate && item.spec.jobTemplate.spec.template && item.spec.jobTemplate.spec.template.spec && item.spec.jobTemplate.spec.template.spec.containers) {
					if (Array.isArray(item.spec.jobTemplate.spec.template.spec.containers) && item.spec.jobTemplate.spec.template.spec.containers.length > 0) {
						item.spec.jobTemplate.spec.template.spec.containers[0].env = setRestartEnv(item.spec.jobTemplate.spec.template.spec.containers[0].env);
					}
				}
				if (!driver.update[mode]) {
					return cb(bl.handleError(soajs, 504, null));
				}
				driver.update[mode](client, {
					"namespace": kubeConfig.namespace,
					"name": inputmaskData.name,
					"body": item
				}, (error) => {
					if (error) {
						return cb(bl.handleError(soajs, 702, error));
					}
					return cb(null, {"restarted": true});
				});
			});
		});
	},
	
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
	
	"getResource_latestVersion": (soajs, inputmaskData, options, cb) => {
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
	
	"resource_inspect": (soajs, inputmaskData, options, cb) => {
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
			driver.get[mode](client, {
				"namespace": config.namespace,
				"name": inputmaskData.name
			}, (error, resource) => {
				if (error) {
					return cb(bl.handleError(soajs, 702, error));
				}
				return cb(null, resource);
			});
		});
	},
	
	"item_inspect": (soajs, inputmaskData, options, cb) => {
		if (!inputmaskData || !inputmaskData.item) {
			return cb(bl.handleError(soajs, 400, null));
		}
		bl.handleConnect(soajs, inputmaskData.configuration, (error, client, config) => {
			if (error) {
				return cb(bl.handleError(soajs, 702, error));
			}
			let sanytized_version = soajsCoreLibs.version.sanitize(inputmaskData.item.version);
			let label_sanytized = inputmaskData.item.env + "-" + inputmaskData.item.name + "-v" + sanytized_version;
			let filter = {"labelSelector": "soajs.service.label=" + label_sanytized};
			
			async.parallel({
				services: function (callback) {
					driver.get.services(client, {
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
				deployments: function (callback) {
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
				daemonsets: function (callback) {
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
				cronjobs: function (callback) {
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
				},
				pods: function (callback) {
					driver.get.pods(client, {
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
				} else {
					return cb(null, results);
				}
			});
		});
	},
	"getResources_item": (soajs, inputmaskData, options, cb) => {
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
		if (inputmaskData.limit) {
			inputmaskData.filter.limit = inputmaskData.limit;
		}
		if (inputmaskData.continue) {
			inputmaskData.filter.continue = inputmaskData.continue;
		}
		bl.getResources(soajs, inputmaskData, options, cb);
	},
	
	"getResources_other": (soajs, inputmaskData, options, cb) => {
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
		if (inputmaskData.limit) {
			inputmaskData.filter.limit = inputmaskData.limit;
		}
		if (inputmaskData.continue) {
			inputmaskData.filter.continue = inputmaskData.continue;
		}
		bl.getResources(soajs, inputmaskData, options, cb);
	},
	
	"getResources": (soajs, inputmaskData, options, cb) => {
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