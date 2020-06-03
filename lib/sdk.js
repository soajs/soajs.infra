/**
 * @license
 * Copyright SOAJS All Rights Reserved.
 *
 * Use of this source code is governed by an Apache license that can be
 * found in the LICENSE file at the root of this repository
 */

"use strict";

const request = require("request");

let sdk = {
	"ledger": (soajs, doc, cb) => {
		if (!doc) {
			return cb();
		}
		
		soajs.awareness.connect("console", "1", (response) => {
			if (response && response.host) {
				let options = {
					uri: 'http://' + response.host + "/ledger",
					headers: response.headers,
					body: {"doc": doc},
					json: true
				};
				request.post(options, function (error, response, body) {
					if (error && error.message) {
						soajs.log.error(error.message);
					} else if (body && (!body.result || body.errors)) {
						soajs.log.error(body.errors);
					}
					return cb();
				});
			} else {
				return cb();
			}
		});
	}
};

module.exports = sdk;