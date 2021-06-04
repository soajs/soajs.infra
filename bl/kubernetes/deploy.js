'use strict';

/**
 * @license
 * Copyright SOAJS All Rights Reserved.
 *
 * Use of this source code is governed by an Apache license that can be
 * found in the LICENSE file at the root of this repository
 */

const soajsCoreLibs = require("soajs.core.libs");

const lib = require("./lib.js");

function buildLabels(config) {
	let sanytized_version = soajsCoreLibs.version.sanitize(config.item.version);
	let label = config.item.env + "-" + config.item.name + "-v" + config.item.version;
	let label_sanytized = config.item.env + "-" + config.item.name + "-v" + sanytized_version;
	
	if (!config.labels) {
		config.labels = {};
	}
	config.labels["service.image.ts"] = new Date().getTime().toString();
	config.labels["soajs.content"] = "true";
	config.labels["soajs.env.code"] = config.item.env.toLowerCase();
	config.labels["soajs.service.name"] = config.item.name;
	config.labels["soajs.service.group"] = config.item.group;
	config.labels["soajs.service.type"] = config.item.type;
	config.labels["soajs.service.subtype"] = config.item.subtype || "";
	config.labels["soajs.service.version"] = config.item.version;
	config.labels["soajs.service.label"] = label;
	config.labels["soajs.service.mode"] = config.mode.toLowerCase();
	
	if (config.catalog) {
		config.labels["soajs.catalog.id"] = config.catalog.id;
		config.labels["soajs.catalog.v"] = config.catalog.version;
		if (config.catalog.shell) {
			config.labels["soajs.shell"] = lib.cleanLabel(config.catalog.shell);
		}
	}
	if (config.src) {
		config.labels["service.owner"] = config.src.owner;
		config.labels["service.repo"] = config.src.repo;
		if (config.src.from) {
			if (config.src.from.branch) {
				config.labels["service.branch"] = config.src.from.branch;
				config.labels["service.commit"] = config.src.from.commit;
			} else {
				config.labels["service.tag"] = config.src.from.tag;
			}
		}
	}
	return ({label, label_sanytized});
}

function buildService(config, labels) {
	let service = null;
	if (config.service && config.service.ports) {
		service = {
			"apiVersion": "v1",
			"kind": "Service",
			"metadata": {
				"name": labels.label_sanytized + "-service",
				"labels": config.labels
			},
			"spec": {
				"selector": {
					"soajs.service.label": labels.label
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
	return service;
}

function buildDeployment(config, labels) {
	let deployment = {
		"apiVersion": "apps/v1",
		"kind": config.mode,
		"metadata": {
			"name": labels.label_sanytized,
			"labels": config.labels
		},
		"spec": {
			"revisionHistoryLimit": config.revisionHistoryLimit,
			"replicas": config.replicas,
			"selector": {
				"matchLabels": {
					"soajs.service.label": labels.label
				}
			},
			"updateStrategy": {
				"type": "RollingUpdate"
			},
			"template": {
				"metadata": {
					"name": labels.label_sanytized,
					"labels": config.labels
				},
				"spec": {
					"containers": [
						{
							"name": labels.label_sanytized,
							"image": config.image.name,
							"imagePullPolicy": config.image.imagePullPolicy,
							"readinessProbe": config.readinessProbe
						}
					]
				}
			}
		}
	};
	if (config.image.secret) {
		deployment.spec.template.spec.containers[0].imagePullSecrets = [{
			"name": config.image.secret
		}];
	}
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
		let args = [];
		if (config.args[0] && config.args[0].trim() === '-c') {
			args.push("-c");
			config.args.shift();
		}
		for (let i = 0; i < config.args.length - 1; i++) {
			config.args[i] = config.args[i].trim();
		}
		args.push(config.args.join(" && "));
		deployment.spec.template.spec.containers[0].args = args;
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
	if (config.catalog.restartPolicy) {
		deployment.spec.template.spec.restartPolicy = config.catalog.restartPolicy;
	}
	if (config.securityContext) {
		if (config.securityContext.pod) {
			deployment.spec.template.spec.securityContext = config.securityContext.pod;
		}
		if (config.securityContext.container) {
			deployment.spec.template.spec.containers[0].securityContext = config.securityContext.container;
		}
	}
	return deployment;
}

function buildConjob(config, labels) {
	let deployment = {
		"apiVersion": "batch/v1beta1",
		"kind": config.mode,
		"metadata": {
			"name": labels.label_sanytized,
			"labels": config.labels
		},
		"spec": {
			"schedule": config.catalog.schedule, //minute - hour -- day of month - month (1-12) - day of week
			"jobTemplate": {
				"spec": {
					"revisionHistoryLimit": config.revisionHistoryLimit,
					"replicas": config.replicas,
					// "selector": {
					// 	"matchLabels": {
					// 		"soajs.service.label": labels.label
					// 	}
					// },
					"updateStrategy": {
						"type": "RollingUpdate"
					},
					"template": {
						"metadata": {
							"name": labels.label_sanytized,
							"labels": config.labels
						},
						"spec": {
							"containers": [
								{
									"name": labels.label_sanytized,
									"image": config.image.name,
									"imagePullPolicy": config.image.imagePullPolicy,
									"readinessProbe": config.readinessProbe
								}
							]
						}
					}
				}
			}
		}
	};
	if (config.image.secret) {
		deployment.spec.jobTemplate.spec.template.spec.containers[0].imagePullSecrets = [{
			"name": config.image.secret
		}];
	}
	if (config.catalog.concurrencyPolicy) {
		deployment.spec.concurrencyPolicy = config.catalog.concurrencyPolicy;
	}
	if (config.volume) {
		if (config.volume.volumeMounts) {
			deployment.spec.jobTemplate.spec.template.spec.containers[0].volumeMounts = config.volume.volumeMounts;
		}
		if (config.volume.volumes) {
			deployment.spec.jobTemplate.spec.template.spec.volumes = config.volume.volumes;
		}
	}
	if (config.workingDir) {
		deployment.spec.jobTemplate.spec.template.spec.containers[0].workingDir = config.workingDir;
	}
	if (config.command) {
		deployment.spec.jobTemplate.spec.template.spec.containers[0].command = config.command;
	}
	if (config.args) {
		let args = [];
		if (config.args[0] && config.args[0].trim() === '-c') {
			args.push("-c");
			config.args.shift();
		}
		for (let i = 0; i < config.args.length - 1; i++) {
			config.args[i] = config.args[i].trim();
		}
		args.push(config.args.join(" && "));
		deployment.spec.jobTemplate.spec.template.spec.containers[0].args = args;
	}
	
	if (config.ports) {
		deployment.spec.jobTemplate.spec.template.spec.containers[0].ports = config.ports;
	}
	if (config.env) {
		deployment.spec.jobTemplate.spec.template.spec.containers[0].env = config.env;
	}
	if (config.livenessProbe) {
		deployment.spec.jobTemplate.spec.template.spec.containers[0].livenessProbe = config.livenessProbe;
	}
	if (config.catalog.restartPolicy) {
		deployment.spec.jobTemplate.spec.template.spec.restartPolicy = config.catalog.restartPolicy;
	}
	if (config.securityContext) {
		if (config.securityContext.pod) {
			deployment.spec.jobTemplate.spec.template.spec.securityContext = config.securityContext.pod;
		}
		if (config.securityContext.container) {
			deployment.spec.jobTemplate.spec.template.spec.containers[0].securityContext = config.securityContext.container;
		}
	}
	return deployment;
}

let bl = {
	"localConfig": null,
	"handleError": null,
	"handleConnect": null,
	"driver": null,
	
	"item_soajs_conjob": (soajs, inputmaskData, options, cb) => {
		if (!inputmaskData || !inputmaskData.recipe) {
			return cb(bl.handleError(soajs, 400, null));
		}
		let config = inputmaskData.recipe;
		if (!config.labels) {
			config.labels = {};
		}
		let labels = buildLabels(config);
		let service = buildService(config, labels);
		let deployment = buildConjob(config, labels);
		
		bl.vanilla(soajs, {
			"configuration": inputmaskData.configuration,
			"deployment": deployment,
			"service": service
		}, options, cb);
	},
	"item_native_cronjob": (soajs, inputmaskData, options, cb) => {
		if (!inputmaskData || !inputmaskData.deployment || !inputmaskData.item) {
			return cb(bl.handleError(soajs, 400, null));
		}
		
		let config = {
			"catalog": inputmaskData.catalog || null,
			"item": inputmaskData.item,
			"labels": {},
			"mode": inputmaskData.deployment.kind
		};
		
		let labels = buildLabels(config);
		
		let service = inputmaskData.service || null;
		let deployment = inputmaskData.deployment;
		
		if (!deployment.metadata.labels) {
			deployment.metadata.labels = {};
		}
		if (!deployment.spec.jobTemplate.spec.template.metadata.labels) {
			deployment.spec.jobTemplate.spec.template.metadata.labels = {};
		}
		if (service) {
			if (!service.metadata.labels) {
				service.metadata.labels = {};
			}
		}
		for (let l in config.labels) {
			if (config.labels.hasOwnProperty(l)) {
				deployment.metadata.labels[l] = config.labels[l];
				deployment.spec.jobTemplate.spec.template.metadata.labels[l] = config.labels[l];
				if (service) {
					service.metadata.labels[l] = config.labels[l];
					service.metadata.name = labels.label_sanytized + "-service";
				}
			}
		}
		
		bl.vanilla(soajs, {
			"configuration": inputmaskData.configuration,
			"deployment": deployment,
			"service": service
		}, options, cb);
	},
	"item_soajs_deployment_or_daemonset": (soajs, inputmaskData, options, cb) => {
		if (!inputmaskData || !inputmaskData.recipe) {
			return cb(bl.handleError(soajs, 400, null));
		}
		let config = inputmaskData.recipe;
		if (!config.labels) {
			config.labels = {};
		}
		let labels = buildLabels(config);
		let service = buildService(config, labels);
		let deployment = buildDeployment(config, labels);
		
		bl.vanilla(soajs, {
			"configuration": inputmaskData.configuration,
			"deployment": deployment,
			"service": service
		}, options, cb);
	},
	"item_native_deployment_or_daemonset": (soajs, inputmaskData, options, cb) => {
		if (!inputmaskData || !inputmaskData.deployment || !inputmaskData.item) {
			return cb(bl.handleError(soajs, 400, null));
		}
		
		let config = {
			"catalog": inputmaskData.catalog || null,
			"item": inputmaskData.item,
			"labels": {},
			"mode": inputmaskData.deployment.kind
		};
		
		let labels = buildLabels(config);
		
		let service = inputmaskData.service || null;
		let deployment = inputmaskData.deployment;
		
		if (!deployment.metadata.labels) {
			deployment.metadata.labels = {};
		}
		if (!deployment.spec.template.metadata.labels) {
			deployment.spec.template.metadata.labels = {};
		}
		if (service) {
			if (!service.metadata.labels) {
				service.metadata.labels = {};
			}
		}
		for (let l in config.labels) {
			if (config.labels.hasOwnProperty(l)) {
				deployment.metadata.labels[l] = config.labels[l];
				deployment.spec.template.metadata.labels[l] = config.labels[l];
				if (service) {
					service.metadata.labels[l] = config.labels[l];
					service.metadata.name = labels.label_sanytized + "-service";
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
		bl.handleConnect(soajs, inputmaskData.configuration, (error, client, config) => {
			if (error) {
				return cb(bl.handleError(soajs, 702, error));
			}
			
			let kind = inputmaskData.deployment.kind.toLowerCase();
			if (!bl.driver.create[kind]) {
				return cb(bl.handleError(soajs, 504, null));
			}
			
			let continue_service = () => {
				if (inputmaskData.service) {
					bl.driver.get.one.service(client, {
						"name": inputmaskData.service.metadata.name,
						"namespace": config.namespace
					}, (error, serviceRec) => {
						if (!serviceRec) {
							bl.driver.create.service(client, {
								"body": inputmaskData.service,
								"namespace": config.namespace
							}, (error) => {
								if (error) {
									return cb(bl.handleError(soajs, 702, error));
								}
								return cb(null, {"deployed": true});
							});
						} else {
							inputmaskData.service.metadata.resourceVersion = serviceRec.metadata.resourceVersion;
							if (!inputmaskData.service.spec.clusterIP && serviceRec.spec && serviceRec.spec.clusterIP) {
								inputmaskData.service.spec.clusterIP = serviceRec.spec.clusterIP;
							}
							if (serviceRec.spec && serviceRec.spec.healthCheckNodePort) {
								inputmaskData.service.spec.healthCheckNodePort = serviceRec.spec.healthCheckNodePort;
							}
							bl.driver.update.service(client, {
								"name": inputmaskData.service.metadata.name,
								"body": inputmaskData.service,
								"namespace": config.namespace
							}, (error) => {
								if (error) {
									return cb(bl.handleError(soajs, 702, error));
								}
								return cb(null, {"deployed": true});
							});
						}
					});
				} else {
					return cb(null, {"deployed": true});
				}
			};
			
			bl.driver.get.one[kind](client, {
				"name": inputmaskData.deployment.metadata.name,
				"namespace": config.namespace
			}, (error, deploymentRec) => {
				if (!deploymentRec) {
					bl.driver.create[kind](client, {
						"body": inputmaskData.deployment,
						"namespace": config.namespace
					}, (error) => {
						if (error) {
							return cb(bl.handleError(soajs, 702, error));
						}
						continue_service();
					});
				} else {
					inputmaskData.deployment.metadata.resourceVersion = deploymentRec.metadata.resourceVersion;
					if (!inputmaskData.deployment.spec.replicas && deploymentRec.spec && deploymentRec.spec.replicas) {
						inputmaskData.deployment.spec.replicas = deploymentRec.spec.replicas;
					}
					bl.driver.update[kind](client, {
						"name": inputmaskData.deployment.metadata.name,
						"body": inputmaskData.deployment,
						"namespace": config.namespace
					}, (error) => {
						if (error) {
							return cb(bl.handleError(soajs, 702, error));
						}
						continue_service();
					});
				}
			});
		});
	}
};

module.exports = bl;