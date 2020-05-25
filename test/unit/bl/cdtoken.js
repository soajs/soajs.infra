/**
 * @license
 * Copyright SOAJS All Rights Reserved.
 *
 * Use of this source code is governed by an Apache license that can be
 * found in the LICENSE file at the root of this repository
 */

"use strict";

const helper = require("../../helper.js");
const BL = helper.requireModule('bl/cdtoken.js');
const assert = require('assert');

describe("Unit test for: BL - cdtoken", () => {
	let soajs = {
		"urac": {
			"id": "1111111111",
			"username": "antoinehage"
		},
		"tenant": {
			application: {
				product: "TPROD",
				package: "TPROD_TEST",
			}
		},
		"log": {
			error: () => {
				console.log();
			},
			debug: () => {
				console.log();
			}
		}
	};
	
	before((done) => {
		BL.localConfig = helper.requireModule("config.js");
		done();
	});
	
	afterEach((done) => {
		BL.modelObj = null;
		done();
	});
	
	it("add_token", function (done) {
		BL.modelObj = {
			count: (data, cb) => {
				if (data && data.add === "error") {
					return cb(new Error("any error"));
				}
				if (data && data.maxcount) {
					return cb(null, data.maxcount);
				}
				return cb(null, 10);
			},
			add: (data, cb) => {
				if (data && data.count === "error") {
					return cb(new Error("any error"));
				}
				return cb(null, data);
			}
		};
		BL.add_token(soajs, null, {}, (error) => {
			assert.ok(error);
			assert.deepEqual(error.code, 400);
			
			BL.add_token(soajs, {}, {}, (error, response) => {
				assert.ok(response);
				assert.ok(response.token);
				
				BL.add_token(soajs, {"add": "error"}, {}, (error) => {
					assert.ok(error);
					assert.deepEqual(error.code, 602);
					
					BL.add_token(soajs, {"count": "error"}, {}, (error) => {
						assert.ok(error);
						assert.deepEqual(error.code, 602);
						
						BL.add_token(soajs, {"maxcount": BL.localConfig.maxAllowed + 1}, {}, (error) => {
							assert.ok(error);
							assert.deepEqual(error.code, 540);
							done();
						});
					});
				});
			});
		});
	});
	
});