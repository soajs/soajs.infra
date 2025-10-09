/**
 * @license
 * Copyright SOAJS All Rights Reserved.
 *
 * Use of this source code is governed by an Apache license that can be
 * found in the LICENSE file at the root of this repository
 */

"use strict";

const axios = require("axios");
const commonResponse = require("./commonResponse.js");

let sdk = {
	"ledger": (soajs, doc, response, cb) => {
		if (!doc) {
			return cb();
		}
		if (response) {
			let status = "failed";
			if (response.result) {
				status = "succeeded";
			} else {
				status = "failed";
			}
			doc.status = status;
			doc.input = soajs.inputmaskData;
			doc.output = response;
		}
		soajs.awareness.connect("console", "1", (response) => {
			if (response && response.host) {
				axios.post('http://' + response.host + "/ledger", { doc }, { headers: response.headers })
					.then((result) => {
						return commonResponse(soajs, result.data, null, () => {
							return cb();
						});
					})
					.catch((error) => {
						return commonResponse(soajs, null, error, () => {
							return cb();
						});
					});
			} else {
				return cb();
			}
		});
	},
	"get_env_registry": (soajs, data, cb) => {
		if (!data.env) {
			return cb(null, null);
		}
		soajs.awareness.connect("console", "1", (response) => {
			if (response && response.host) {
				axios.get('http://' + response.host + "/registry", {
					headers: response.headers,
					params: { "env": data.env }
				})
					.then((result) => {
						return commonResponse(soajs, result.data, null, (error, data) => {
							return cb(null, data);
						});
					})
					.catch((error) => {
						return commonResponse(soajs, null, error, () => {
							return cb(null, null);
						});
					});
			} else {
				return cb(null, null);
			}
		});
	}
};

module.exports = sdk;