/**
 * @license
 * Copyright SOAJS All Rights Reserved.
 *
 * Use of this source code is governed by an Apache license that can be
 * found in the LICENSE file at the root of this repository
 */

'use strict';

const soajsCoreLibs = require("soajs.core.libs");

const async = require("async");
const path = require('path');
const fs = require('fs');
const lib = require("./kubernetes/lib.js");

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
	"driver": null,
	"sdk": {},
	
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
		lib.getDriverConfiguration(soajs, configuration, bl.sdk, (error, config) => {
			if (error) {
				return cb(error);
			} else {
				bl.driver.connect(config, (error, client) => {
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
	
	"get": {},
	
	"metrics": {},
	
	"bundle": {
		"deploy": (soajs, inputmaskData, options, cb) => {
			if (!options) {
				options = {};
			}
			options.action = "apply";
			bl.bundle.execute(soajs, inputmaskData, options, cb);
		},
		"delete": (soajs, inputmaskData, options, cb) => {
			if (!options) {
				options = {};
			}
			options.action = "delete";
			bl.bundle.execute(soajs, inputmaskData, options, cb);
		},
		"get": (soajs, inputmaskData, options, cb) => {
			if (!options) {
				options = {};
			}
			options.action = "get.one";
			bl.bundle.execute(soajs, inputmaskData, options, cb);
		},
		"execute": (soajs, inputmaskData, options, cb) => {
			if (!inputmaskData) {
				return cb(bl.handleError(soajs, 400, null));
			}
			
			let bundle = null;
			if (!inputmaskData.bundle && inputmaskData.plugin) {
				let resourcePath = path.join(__dirname, '../driver/kubernetes/plugins/', inputmaskData.plugin, "server.json");
				if (!fs.existsSync(resourcePath)) {
					return cb(bl.handleError(soajs, 507, null));
				}
				bundle = require(resourcePath);
			} else if (inputmaskData.bundle) {
				bundle = inputmaskData.bundle;
			}
			if (!bundle || !Array.isArray(bundle) && bundle.length < 1) {
				return cb(bl.handleError(soajs, 508, null));
			}
			
			bl.handleConnect(soajs, inputmaskData.configuration, (error, client, config) => {
				if (error) {
					return cb(bl.handleError(soajs, 702, error));
				}
				async.map(bundle, (oneResource, callback) => {
					if (oneResource) {
						let namespace = null;
						let opts = {};
						let kind = null;
						
						if (options.action === "apply") {
							opts.body = oneResource.recipe;
							if (oneResource.recipe.metadata && oneResource.recipe.metadata.namespace) {
								namespace = oneResource.recipe.metadata.namespace;
							}
							if (oneResource.recipe.metadata && oneResource.recipe.metadata.name) {
								opts.name = oneResource.recipe.metadata.name;
							}
							kind = oneResource.recipe.kind;
						} else {
							if (oneResource.metadata && oneResource.metadata.namespace) {
								namespace = oneResource.metadata.namespace;
							}
							
							if (oneResource.metadata && oneResource.metadata.name) {
								opts.name = oneResource.metadata.name;
							}
							kind = oneResource.kind;
						}
						
						if (namespace) {
							opts.namespace = namespace;
						} else {
							opts.namespace = config.namespace;
						}
						
						let mode = kind.toLowerCase();
						if (mode === "horizontalpodautoscaler") {
							mode = "hpa";
						} else if (mode === "persistentvolumeclaim") {
							mode = "pvc";
						} else if (mode === "persistentvolume") {
							mode = "pv";
						}
						let exec = bl.driver;
						let action = options.action;
						if (action === "get.one") {
							exec = bl.driver.get;
							action = "one";
						}
						if (!exec[action]) {
							return callback(new Error("action [" + options.action + "] not supported."));
						}
						if (!exec[action][mode]) {
							return callback(new Error("resource [" + mode + "] not supported."));
						}
						exec[action][mode](client, opts, (error, item) => {
							let msg = "done";
							if (error) {
								if (error.code === 404) {
									msg = "not found";
								} else if (options.action === "apply" && error.code === 409) {
									msg = "already exist";
								} else {
									soajs.log.error("Error while executing [" + options.action + "] for resource [" + kind + " - " + opts.name + "]");
									return callback(error);
								}
							}
							return callback(null, {
								"mode": mode,
								"name": opts.name,
								"action": options.action,
								"msg": msg,
								"info": item
							});
						});
					} else {
						return callback(new Error("Empty bundle resource detected."));
					}
				}, (error, results) => {
					if (error) {
						soajs.log.error(error.message);
						return cb(bl.handleError(soajs, 509, null));
					}
					return cb(null, results);
				});
			});
		}
	},
	
	"update": {
		"hpa": (soajs, inputmaskData, options, cb) => {
			if (!inputmaskData || !inputmaskData.item) {
				return cb(bl.handleError(soajs, 400, null));
			}
			bl.handleConnect(soajs, inputmaskData.configuration, (error, client, config) => {
				if (error) {
					return cb(bl.handleError(soajs, 702, error));
				}
				let sanytized_version = soajsCoreLibs.version.sanitize(inputmaskData.item.version);
				let metaname = inputmaskData.item.env + "-" + inputmaskData.item.name + "-v" + sanytized_version;
				
				bl.driver.get.one.hpa(client, {
					"namespace": config.namespace,
					"name": metaname
				}, (error, item) => {
					if (error) {
						return cb(bl.handleError(soajs, 702, error));
					}
					if (!item) {
						return cb(bl.handleError(soajs, 501, null));
					}
					bl.driver.hpa.patch(client, {
						"namespace": config.namespace,
						"name": metaname,
						"replica": inputmaskData.replica,
						"metrics": inputmaskData.metrics
					}, (error) => {
						if (error) {
							return cb(bl.handleError(soajs, 702, error));
						}
						return cb(null, {"updated": true});
					});
				});
			});
		}
	},
	
	"apply": (soajs, inputmaskData, options, cb) => {
		if (!inputmaskData) {
			return cb(bl.handleError(soajs, 400, null));
		}
		bl.handleConnect(soajs, inputmaskData.configuration, (error, client, config) => {
			if (error) {
				return cb(bl.handleError(soajs, 702, error));
			}
			let mode = inputmaskData.mode.toLowerCase();
			if (!bl.driver.apply[mode]) {
				return cb(bl.handleError(soajs, 504, null));
			}
			bl.driver.apply[mode](client, {
				"namespace": config.namespace,
				"body": inputmaskData.body
			}, (error) => {
				if (error) {
					return cb(bl.handleError(soajs, 702, error));
				}
				return cb(null, {"applied": true});
			});
		});
	},
	
	"resource_update": (soajs, inputmaskData, options, cb) => {
		if (!inputmaskData) {
			return cb(bl.handleError(soajs, 400, null));
		}
		bl.handleConnect(soajs, inputmaskData.configuration, (error, client, config) => {
			if (error) {
				return cb(bl.handleError(soajs, 702, error));
			}
			
			let mode = inputmaskData.mode.toLowerCase();
			if (!bl.driver.update[mode]) {
				return cb(bl.handleError(soajs, 504, null));
			}
			bl.driver.update[mode](client, {
				"namespace": config.namespace,
				"name": inputmaskData.body.metadata.name,
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
			if (!bl.driver.delete[mode]) {
				return cb(bl.handleError(soajs, 504, null));
			}
			bl.driver.get.one[mode](client, {
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
				if (!bl.driver.update[mode]) {
					return cb(bl.handleError(soajs, 504, null));
				}
				bl.driver.update[mode](client, {
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
			bl.driver.get.one.deployment(client, {
				"namespace": config.namespace,
				"name": inputmaskData.name
			}, (error, item) => {
				if (error) {
					return cb(bl.handleError(soajs, 702, error));
				}
				if (!item) {
					return cb(bl.handleError(soajs, 501, null));
				}
				bl.driver.deployment.patch(client, {
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
	
	"item_inspect": (soajs, inputmaskData, options, cb) => {
		if (!inputmaskData || !inputmaskData.item) {
			return cb(bl.handleError(soajs, 400, null));
		}
		bl.handleConnect(soajs, inputmaskData.configuration, (error, client, config) => {
			if (error) {
				return cb(bl.handleError(soajs, 702, error));
			}
			let label = inputmaskData.item.env + "-" + inputmaskData.item.name + "-v" + inputmaskData.item.version;
			let filter = {"labelSelector": "soajs.service.label=" + label};
			
			async.parallel({
				services: function (callback) {
					bl.driver.get.all.service(client, {
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
				hpas: function (callback) {
					bl.driver.get.all.hpa(client, {
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
				daemonsets: function (callback) {
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
				cronjobs: function (callback) {
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
				},
				pods: function (callback) {
					bl.driver.get.all.pod(client, {
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
	}
};

module.exports = bl;