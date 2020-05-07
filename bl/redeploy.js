'use strict';

/**
 * @license
 * Copyright SOAJS All Rights Reserved.
 *
 * Use of this source code is governed by an Apache license that can be
 * found in the LICENSE file at the root of this repository
 */

const driver = require("../driver/kubernetes/index.js");

function buildLabels(config) {
	config.labels["service.image.ts"] = new Date().getTime().toString();
	if (config.src && config.src.from) {
		if (config.src.from.branch) {
			config.labels["service.branch"] = config.src.from.branch;
			config.labels["service.commit"] = config.src.from.commit;
		} else {
			config.labels["service.tag"] = config.src.from.tag;
		}
	}
}

let bl = {
	"localConfig": null,
	"handleError": null,
	"handleConnect": null,
	
	"item": (soajs, inputmaskData, options, cb) => {
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
					let serviceName = inputmaskData.name + "-service";
					if (inputmaskData.serviceName) {
						serviceName = inputmaskData.serviceName;
					}
					driver.get.service(client, {
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
						driver.update.service(client, {
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