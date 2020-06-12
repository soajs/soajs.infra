'use strict';

/**
 * @license
 * Copyright SOAJS All Rights Reserved.
 *
 * Use of this source code is governed by an Apache license that can be
 * found in the LICENSE file at the root of this repository
 */

const soajsCore = require('soajs');
const get = (p, o) => p.reduce((xs, x) => (xs && xs[x]) ? xs[x] : null, o);

let lib = {
	"getDriverConfiguration": (soajs, configuration, sdk, cb) => {
		if (!configuration) {
			return cb(new Error("Problem with the provided kubernetes configuration"));
		}
		if (configuration.env) {
			//get env registry, this must loadByEnv
			soajsCore.core.registry.loadByEnv({envCode: configuration.env}, (err, envRecord) => {
				if (err) {
					soajs.log.error(err.message);
					return cb(new Error("loadByEnv error. Unable to find healthy configuration in registry"));
				}
				if (!envRecord) {
					return cb(new Error("loadByEnv empty. Unable to find healthy configuration in registry"));
				}
				let registry = envRecord;
				let depType = get(["deployer", "type"], registry);
				let regConf = null;
				if (depType === "container") {
					let depSeleted = get(["deployer", "selected"], registry);
					if (depSeleted && depSeleted.includes("kubernetes")) {
						regConf = get(["deployer"].concat(depSeleted.split(".")), registry);
					}
				}
				if (regConf) {
					sdk.account.get(soajs, {
						"id": regConf.id,
						"type": "kubernetes",
						"keepToken": true
					}, null, (error, infra) => {
						if (error) {
							return cb(new Error("Unable to find healthy configuration in infra"));
						}
						let protocol = infra.configuration.protocol || "https";
						let port = infra.configuration.port ? ":" + infra.configuration.port : "";
						let config = {
							"namespace": regConf.namespace,
							"token": infra.configuration.token,
							"url": protocol + "://" + infra.configuration.url + port
						};
						return cb(null, config);
					});
				} else {
					return cb(new Error("Unable to find healthy configuration in registry"));
				}
			});
		} else {
			if (configuration.namespace && configuration.token && configuration.url) {
				let config = {
					"namespace": configuration.namespace,
					"token": configuration.token,
					"url": configuration.url
				};
				return cb(null, config);
			}
			return cb(new Error("Configuration requires namespace, token, and url"));
		}
	},
	"cleanLabel": (label) => {
		if (!label) {
			return '';
		}
		return label.replace(/\//g, "__slash__");
	},
	"clearLabel": (label) => {
		if (!label) {
			return '';
		}
		return label.replace(/__slash__/g, "/");
	}
};

module.exports = lib;