'use strict';

/**
 * @license
 * Copyright SOAJS All Rights Reserved.
 *
 * Use of this source code is governed by an Apache license that can be
 * found in the LICENSE file at the root of this repository
 */

// const soajsCore = require('soajs');
const i_sdk = require('../../lib/sdk.js');
const get = (p, o) => p.reduce((xs, x) => (xs && xs[x]) ? xs[x] : null, o);

let lib = {
	"getDriverConfiguration": (soajs, configuration, sdk, cb) => {
		if (!configuration) {
			return cb(new Error("Problem with the provided kubernetes configuration"));
		}
		if (configuration.id) {
			sdk.account.get(soajs, {
				"id": configuration.id,
				"type": "kubernetes",
				"keepToken": true
			}, null, (error, infra) => {
				if (error || !infra || !infra.configuration) {
					return cb(new Error("Unable to find healthy configuration in infra"));
				}
				let protocol = infra.configuration.protocol || "https";
				let port = infra.configuration.port ? ":" + infra.configuration.port : "";
				let config = {
					"namespace": configuration.namespace,
					"token": infra.configuration.token,
					"url": protocol + "://" + infra.configuration.url + port,
					"ca": infra.configuration.ca || null
				};
				return cb(null, config);
			});
		} else if (configuration.env) {
			i_sdk.get_env_registry(soajs, {env: configuration.env}, (err, registry) => {
				if (err) {
					soajs.log.error(err.message);
					return cb(new Error("loadByEnv error. Unable to find healthy configuration in registry"));
				}
				if (!registry) {
					return cb(new Error("loadByEnv empty. Unable to find healthy configuration in registry"));
				}
				let depType = get(["deployer", "type"], registry);
				let regConf = null;
				if (depType === "container") {
					let depSeleted = get(["deployer", "selected"], registry);
					if (depSeleted && depSeleted.includes("kubernetes")) {
						regConf = get(["deployer"].concat(depSeleted.split(".")), registry);
					}
				}
				if (regConf && regConf.id) {
					sdk.account.get(soajs, {
						"id": regConf.id,
						"type": "kubernetes",
						"keepToken": true
					}, null, (error, infra) => {
						if (error || !infra || !infra.configuration) {
							return cb(new Error("Unable to find healthy configuration in infra or you do nto have access to the infra"));
						}
						let protocol = infra.configuration.protocol || "https";
						let port = infra.configuration.port ? ":" + infra.configuration.port : "";
						let config = {
							"namespace": regConf.namespace,
							"token": infra.configuration.token,
							"url": protocol + "://" + infra.configuration.url + port,
							"ca": infra.configuration.ca || null
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
					"url": configuration.url,
					"ca": configuration.ca || null
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