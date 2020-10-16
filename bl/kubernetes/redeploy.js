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
	config.labels["service.image.ts"] = new Date().getTime().toString();
	if (config.src && config.src.from) {
		if (config.src.from.branch) {
			config.labels["service.branch"] = lib.cleanLabel(config.src.from.branch);
			config.labels["service.commit"] = lib.cleanLabel(config.src.from.commit);
		} else {
			config.labels["service.tag"] = lib.cleanLabel(config.src.from.tag);
		}
	}
}

let bl = {
	"localConfig": null,
	"handleError": null,
	"handleConnect": null,
	"driver": null,
	
	"item": (soajs, inputmaskData, options, cb) => {
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
			
			let metaname = inputmaskData.name.metaname;
			if (inputmaskData.name.item) {
				let sanytized_version = soajsCoreLibs.version.sanitize(inputmaskData.name.item.version);
				metaname = inputmaskData.name.item.env + "-" + inputmaskData.name.item.name + "-v" + sanytized_version;
			}
			
			bl.driver.get.one[mode](client, {
				"namespace": kubeConfig.namespace,
				"name": metaname
			}, (error, item) => {
				if (error) {
					return cb(bl.handleError(soajs, 702, error));
				}
				if (!item) {
					return cb(bl.handleError(soajs, 501, null));
				}
				if (inputmaskData.image) {
					let currentImage = item.spec.template.spec.containers[0].image;
					currentImage = currentImage.substr(0, currentImage.lastIndexOf(":"));
					currentImage = currentImage + ":" + inputmaskData.image.tag;
					inputmaskData.image.name = currentImage;
				}
				let config = {"labels": {}, "src": inputmaskData.src || null, "image": inputmaskData.image || null};
				buildLabels(config);
				
				if (item.metadata) {
					if (!item.metadata.labels) {
						item.metadata.labels = {};
					}
					for (let l in config.labels) {
						if (config.labels.hasOwnProperty(l)) {
							item.metadata.labels[l] = config.labels[l];
						}
					}
				}
				//check if deployment or daemonset and set labels
				if (item.spec && item.spec.template && item.spec.template.metadata) {
					if (!item.spec.template.metadata.labels) {
						item.spec.template.metadata.labels = {};
					}
					for (let l in config.labels) {
						if (config.labels.hasOwnProperty(l)) {
							item.spec.template.metadata.labels[l] = config.labels[l];
						}
					}
					for (let i = 0; i < item.spec.template.spec.containers[0].env.length; i++) {
						let oneEnv = item.spec.template.spec.containers[0].env[i];
						if (config.src && config.src.from.branch) {
							if (oneEnv.name === "SOAJS_GIT_BRANCH") {
								item.spec.template.spec.containers[0].env[i].value = config.src.from.branch;
							}
							if (oneEnv.name === "SOAJS_GIT_COMMIT") {
								item.spec.template.spec.containers[0].env[i].value = config.src.from.commit;
							}
						} else {
							if (oneEnv.name === "SOAJS_GIT_BRANCH") {
								item.spec.template.spec.containers[0].env[i].value = config.src.from.tag;
							}
						}
					}
				}
				//check if cronjob and set labels
				if (item.spec && item.spec.jobTemplate && item.spec.jobTemplate.spec.template && item.spec.jobTemplate.spec.template.metadata) {
					if (!item.spec.jobTemplate.spec.template.metadata.labels) {
						item.spec.jobTemplate.spec.template.metadata.labels = {};
					}
					for (let l in config.labels) {
						if (config.labels.hasOwnProperty(l)) {
							item.spec.jobTemplate.spec.template.metadata.labels[l] = config.labels[l];
						}
					}
					for (let i = 0; i < item.spec.jobTemplate.spec.template.spec.containers[0].env.length; i++) {
						let oneEnv = item.spec.jobTemplate.spec.template.spec.containers[0].env[i];
						if (config.src && config.src.from.branch) {
							if (oneEnv.name === "SOAJS_GIT_BRANCH") {
								item.spec.jobTemplate.spec.template.spec.containers[0].env[i].value = config.src.from.branch;
							}
							if (oneEnv.name === "SOAJS_GIT_COMMIT") {
								item.spec.jobTemplate.spec.template.spec.containers[0].env[i].value = config.src.from.commit;
							}
						} else {
							if (oneEnv.name === "SOAJS_GIT_BRANCH") {
								item.spec.jobTemplate.spec.template.spec.containers[0].env[i].value = config.src.from.tag;
							}
						}
					}
				}
				if (config.image && config.image.name) {
					//check if deployment or daemonset and set image
					if (item.spec && item.spec.template && item.spec.template.spec && item.spec.template.spec.containers) {
						if (Array.isArray(item.spec.template.spec.containers) && item.spec.template.spec.containers.length > 0) {
							item.spec.template.spec.containers[0].image = config.image.name;
						}
					}
					//check if cronjob and set image
					if (item.spec && item.spec.jobTemplate && item.spec.jobTemplate.spec.template && item.spec.jobTemplate.spec.template.spec && item.spec.jobTemplate.spec.template.spec.containers) {
						if (Array.isArray(item.spec.jobTemplate.spec.template.spec.containers) && item.spec.jobTemplate.spec.template.spec.containers.length > 0) {
							item.spec.jobTemplate.spec.template.spec.containers[0].image = config.image.name;
						}
					}
				}
				if (!bl.driver.update[mode]) {
					return cb(bl.handleError(soajs, 504, null));
				}
				bl.driver.update[mode](client, {
					"namespace": kubeConfig.namespace,
					"name": metaname,
					"body": item
				}, (error) => {
					if (error) {
						return cb(bl.handleError(soajs, 702, error));
					}
					let serviceName = metaname + "-service";
					if (inputmaskData.serviceName) {
						serviceName = inputmaskData.serviceName;
					}
					bl.driver.get.one.service(client, {
						"namespace": kubeConfig.namespace,
						"name": serviceName
					}, (error, item) => {
						if (error && error.code === 404) {
							return cb(null, {"redeploy": true});
						}
						if (error) {
							return cb(bl.handleError(soajs, 702, error));
						}
						if (item.metadata) {
							if (!item.metadata.labels) {
								item.metadata.labels = {};
							}
							for (let l in config.labels) {
								if (config.labels.hasOwnProperty(l)) {
									item.metadata.labels[l] = config.labels[l];
								}
							}
						}
						bl.driver.update.service(client, {
							"namespace": kubeConfig.namespace,
							"name": serviceName,
							"body": item
						}, (error) => {
							if (error) {
								return cb(bl.handleError(soajs, 702, error));
							}
							return cb(null, {"redeploy": true});
						});
					});
				});
			});
		});
	}
};
module.exports = bl;