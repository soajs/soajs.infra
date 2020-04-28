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
const soajsCoreLibs = require("soajs.core.libs");

let bl = {
	"localConfig": null,
	"handleError": null,
	
	"item_soajs": (soajs, inputmaskData, options, cb) => {
		if (!inputmaskData || !inputmaskData.recipe) {
			return cb(bl.handleError(soajs, 400, null));
		}
		
		let config = inputmaskData.recipe;
		
		let sanytized_version = soajsCoreLibs.version.sanitize(config.item.version);
		let label = config.item.env + "-" + config.item.name + "-v" + config.item.version;
		let label_sanytized = config.item.env + "-" + config.item.name + "-v" + sanytized_version;
		
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
		config.labels["soajs.service.label"] = label;
		config.labels["soajs.service.mode"] = config.mode.toLowerCase();
		
		if (config.src) {
			config.labels["service.branch"] = config.src.branch;
			config.labels["service.owner"] = config.src.owner;
			config.labels["service.repo"] = config.src.repo;
			config.labels["service.commit"] = config.src.commit;
		}
		
		let service = null;
		if (config.service && config.service.ports) {
			service = {
				"apiVersion": "v1",
				"kind": "Service",
				"metadata": {
					"name": label_sanytized + "-service",
					"labels": config.labels
				},
				"spec": {
					"selector": {
						"soajs.service.label": label
					}
				}
			};
			if (config.service.type) {
				service.spec.type = config.service.type;
			}
			if (config.service.externalTrafficPolicy) {
				service.spec.externalTrafficPolicy = config.service.externalTrafficPolicy;
			}
			service.spec.ports = config.service.ports;
		}
		
		let deployment = {
			"apiVersion": "apps/v1",
			"kind": config.mode,
			"metadata": {
				"name": label_sanytized,
				"labels": config.labels
			},
			"spec": {
				"revisionHistoryLimit": config.revisionHistoryLimit,
				"replicas": config.replicas,
				"selector": {
					"matchLabels": {
						"soajs.service.label": label
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
	
	"item_native": (soajs, inputmaskData, options, cb) => {
		if (!inputmaskData || !inputmaskData.deployment || !inputmaskData.catalog || !inputmaskData.item) {
			return cb(bl.handleError(soajs, 400, null));
		}
		
		let config = {"catalog": inputmaskData.catalog, "item": inputmaskData.item};
		
		let sanytized_version = soajsCoreLibs.version.sanitize(config.item.version);
		let label = config.item.env + "-" + config.item.name + "-v" + config.item.version;
		let label_sanytized = config.item.env + "-" + config.item.name + "-v" + sanytized_version;
		
		let deployment = inputmaskData.deployment;
		let service = inputmaskData.service || null;
		
		let labels = {
			"service.image.ts": new Date().getTime().toString(),
			"soajs.catalog.id": config.catalog.id,
			"soajs.catalog.v": config.catalog.version,
			"soajs.content": "true",
			"soajs.env.code": config.item.env,
			"soajs.service.name": config.item.name,
			"soajs.service.group": config.item.group,
			"soajs.service.type": config.item.type,
			"soajs.service.subtype": config.item.subtype,
			"soajs.service.version": config.item.version,
			"soajs.service.label": label,
			"soajs.service.mode": deployment.kind.toLowerCase()
		};
		
		if (config.src) {
			labels["service.branch"] = config.src.branch;
			labels["service.owner"] = config.src.owner;
			labels["service.repo"] = config.src.repo;
			labels["service.commit"] = config.src.commit;
		}
		
		if (!deployment.metadata.labels) {
			deployment.metadata.labels = {};
		}
		if (deployment.spec.template.metadata.labels) {
			deployment.spec.template.metadata.labels = {};
		}
		if (service) {
			if (!service.metadata.labels) {
				service.metadata.labels = {};
			}
		}
		for (let l in labels) {
			if (labels.hasOwnProperty(l)) {
				deployment.metadata.labels[l] = labels[l];
				deployment.spec.template.metadata.labels[l] = labels[l];
				if (service) {
					service.metadata.labels = labels[l];
					service.metadata.name = label_sanytized + "-service";
				}
			}
		}
		
		bl.vanilla(soajs, {
			"configuration": inputmaskData.configuration,
			"deployment": deployment,
			"service": service
		}, options, cb);
	},
	
	"native": (soajs, inputmaskData, options, cb) => {
		if (!inputmaskData) {
			return cb(bl.handleError(soajs, 400, null));
		}
		
		let deployment = inputmaskData.deployment;
		let service = inputmaskData.service || null;
		
		bl.vanilla(soajs, {
			"configuration": inputmaskData.configuration,
			"deployment": deployment,
			"service": service
		}, options, cb);
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