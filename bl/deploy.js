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
	
	"service": (soajs, inputmaskData, options, cb) => {
		if (!inputmaskData || !inputmaskData.recipe) {
			return cb(bl.handleError(soajs, 400, null));
		}
		
		/*
		let config = {
			"labels": {},
			"catalog": {
				"id": "",
				"version": 1
			},
			"item": {
				"name": "",
				"group": "",
				"type": "",
				"subtype": "",
				"version": ""
			},
			"image": {
				"name": "",
				"imagePullPolicy": ""
			},
			"workingDir": "",
			"command": [],
			"args": [],
			"ports": [],
			"readinessProbe": {},
			"livenessProbe": {},
			"env": [],
			"volume": {
				"volumeMounts": [],
				"volumes": []
			},
			"replicas": 1,
			"revisionHistoryLimit": 2
		};
		*/
		let config = inputmaskData.recipe;
		let label = config.item.env + "-" + config.item.name + "-v" + config.item.version;
		let label_sanytized = label.split(".").join("-dot-");
		if (!config.labels) {
			config.labels = {};
		}
		config.labels["service.image.ts"] = new Date().getTime().toString();
		config.labels["soajs.service.replicas"] = config.replicas;
		config.labels["soajs.catalog.id"] = config.catalog.id;
		config.labels["soajs.catalog.v"] = config.catalog.version;
		config.labels["soajs.content"] = "true";
		config.labels["soajs.env.code"] = config.item.env;
		config.labels["soajs.service.name"] = config.item.name;
		config.labels["soajs.service.group"] = config.item.group;
		config.labels["soajs.service.type"] = config.item.type;
		config.labels["soajs.service.subtype"] = config.item.subtype;
		config.labels["soajs.service.version"] = config.item.version;
		config.labels["soajs.service.label"] = label_sanytized;
		config.labels["soajs.service.mode"] = "deployment";
		
		let service = {
			"apiVersion": "v1",
			"kind": "Service",
			"metadata": {
				"name": label_sanytized,
				"labels": config.labels
			},
			"spec": {
				"selector": {
					"soajs.service.label": label_sanytized
				}
			}
		};
		if (config.ports) {
			service.spec.ports = config.ports;
		}
		
		let deployment = {
			"apiVersion": "apps/v1",
			"kind": "Deployment",
			"metadata": {
				"name": label_sanytized,
				"labels": config.labels
			},
			"spec": {
				"revisionHistoryLimit": config.revisionHistoryLimit,
				"replicas": config.replicas,
				"selector": {
					"matchLabels": {
						"soajs.service.label": label_sanytized
					}
				},
				"template": {
					"metadata": {
						"name": label_sanytized,
						"labels": config.labels
					},
					"spec": {
						"containers": [
							{
								"name": label_sanytized,
								"image": config.image.name,
								"imagePullPolicy": config.image.imagePullPolicy,
								"readinessProbe": config.readinessProbe
							}
						]
					}
				}
			}
		};
		if (config.volume) {
			if (config.volume.volumeMounts) {
				deployment.spec.template.spec.containers[0].volumeMounts = config.volume.volumeMounts;
			}
			if (config.volume.volumes) {
				deployment.spec.template.spec.volumes = config.volume.volumes;
			}
		}
		if (config.workingDir) {
			deployment.spec.template.spec.containers[0].workingDir = config.workingDir;
		}
		if (config.command) {
			deployment.spec.template.spec.containers[0].command = config.command;
		}
		if (config.args) {
			deployment.spec.template.spec.containers[0].args = config.args;
		}
		if (config.ports) {
			deployment.spec.template.spec.containers[0].ports = config.ports;
		}
		if (config.env) {
			deployment.spec.template.spec.containers[0].env = config.env;
		}
		if (config.livenessProbe) {
			deployment.spec.template.spec.containers[0].livenessProbe = config.livenessProbe;
		}
		
		bl.vanilla(soajs, {
			"configuration": inputmaskData.configuration,
			"deployment": deployment,
			"service": service
		}, options, cb);
	},
	"daemon": (soajs, inputmaskData, options, cb) => {
		if (!inputmaskData) {
			return cb(bl.handleError(soajs, 400, null));
		}
	},
	"static": (soajs, inputmaskData, options, cb) => {
		if (!inputmaskData || !inputmaskData.recipe) {
			return cb(bl.handleError(soajs, 400, null));
		}
		
		/*
		let config = {
			"labels": {},
			"catalog": {
				"id": "",
				"version": 1
			},
			"item": {
				"name": "",
				"group": "",
				"type": "",
				"subtype": "",
				"version": ""
			},
			"image": {
				"name": "",
				"imagePullPolicy": ""
			},
			"workingDir": "",
			"command": [],
			"args": [],
			"ports": [],
			"readinessProbe": {},
			"livenessProbe": {},
			"env": [],
			"volume": {
				"volumeMounts": [],
				"volumes": []
			},
			"replicas": 1,
			"revisionHistoryLimit": 2
		};
		*/
		let config = inputmaskData.recipe;
		let label = config.item.env + "-" + config.item.name + "-v" + config.item.version;
		let label_sanytized = label.split(".").join("-dot-");
		if (!config.labels) {
			config.labels = {};
		}
		config.labels["service.image.ts"] = new Date().getTime().toString();
		config.labels["soajs.catalog.id"] = config.catalog.id;
		config.labels["soajs.catalog.v"] = config.catalog.version;
		config.labels["soajs.content"] = "true";
		config.labels["soajs.env.code"] = config.item.env;
		config.labels["soajs.service.name"] = config.item.name;
		config.labels["soajs.service.group"] = config.item.group;
		config.labels["soajs.service.type"] = config.item.type;
		config.labels["soajs.service.subtype"] = config.item.subtype;
		config.labels["soajs.service.version"] = config.item.version;
		config.labels["soajs.service.label"] = label_sanytized;
		config.labels["soajs.service.mode"] = "daemonset";
		
		let service = {
			"apiVersion": "v1",
			"kind": "Service",
			"metadata": {
				"name": label_sanytized,
				"labels": config.labels
			},
			"spec": {
				"type": "NodePort",
				"externalTrafficPolicy": "Local",
				"selector": {
					"soajs.service.label": label_sanytized
				}
			}
		};
		if (config.ports) {
			service.spec.ports = config.ports;
		}
		
		let deployment = {
			"apiVersion": "apps/v1",
			"kind": "DaemonSet",
			"metadata": {
				"name": label_sanytized,
				"labels": config.labels
			},
			"spec": {
				"revisionHistoryLimit": config.revisionHistoryLimit,
				"replicas": config.replicas,
				"selector": {
					"matchLabels": {
						"soajs.service.label": label_sanytized
					}
				},
				"updateStrategy": {
					"type": "RollingUpdate"
				},
				"template": {
					"metadata": {
						"name": label_sanytized,
						"labels": config.labels
					},
					"spec": {
						"containers": [
							{
								"name": label_sanytized,
								"image": config.image.name,
								"imagePullPolicy": config.image.imagePullPolicy,
								"readinessProbe": config.readinessProbe
							}
						]
					}
				}
			}
		};
		if (config.volume) {
			if (config.volume.volumeMounts) {
				deployment.spec.template.spec.containers[0].volumeMounts = config.volume.volumeMounts;
			}
			if (config.volume.volumes) {
				deployment.spec.template.spec.volumes = config.volume.volumes;
			}
		}
		if (config.workingDir) {
			deployment.spec.template.spec.containers[0].workingDir = config.workingDir;
		}
		if (config.command) {
			deployment.spec.template.spec.containers[0].command = config.command;
		}
		if (config.args) {
			deployment.spec.template.spec.containers[0].args = config.args;
		}
		if (config.ports) {
			deployment.spec.template.spec.containers[0].ports = config.ports;
		}
		if (config.env) {
			deployment.spec.template.spec.containers[0].env = config.env;
		}
		if (config.livenessProbe) {
			deployment.spec.template.spec.containers[0].livenessProbe = config.livenessProbe;
		}
		
		bl.vanilla(soajs, {
			"configuration": inputmaskData.configuration,
			"deployment": deployment,
			"service": service
		}, options, cb);
	},
	"custom": (soajs, inputmaskData, options, cb) => {
		if (!inputmaskData) {
			return cb(bl.handleError(soajs, 400, null));
		}
	},
	"resource": (soajs, inputmaskData, options, cb) => {
		if (!inputmaskData) {
			return cb(bl.handleError(soajs, 400, null));
		}
	},
	"vanilla": (soajs, inputmaskData, options, cb) => {
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
	}
};

module.exports = bl;