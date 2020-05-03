'use strict';

/**
 * @license
 * Copyright SOAJS All Rights Reserved.
 *
 * Use of this source code is governed by an Apache license that can be
 * found in the LICENSE file at the root of this repository
 */

const get = (p, o) => p.reduce((xs, x) => (xs && xs[x]) ? xs[x] : null, o);

let lib = {
	"getDriverConfiguration": (soajs, configuration, cb) => {
		if (!configuration) {
			return cb(new Error("Problem with the provided kubernetes configuration"));
		}
		if (configuration.env) {
			//get env registry
			let registry = soajs.registry;
			let depType = get(["deployer", "type"], registry);
			if (depType === "container") {
				let depSeleted = get(["deployer", "selected"], registry);
				if (depSeleted && depSeleted.includes("kubernetes")) {
					let regConf = get(["deployer"].concat(depSeleted.split(".")), registry);
					if (regConf) {
						let protocol = regConf.apiProtocol || "https://";
						let port = regConf.apiPort ? ":" + regConf.apiPort : "";
						let config = {
							"namespace": regConf.namespace.default,
							"token": regConf.auth.token,
							"url": protocol + regConf.nodes + port
						};
						return cb(null, config);
					}
				}
			}
			return cb(new Error("Unable to find healthy configuration in registry"));
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