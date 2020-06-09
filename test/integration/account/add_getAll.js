/**
 * @license
 * Copyright SOAJS All Rights Reserved.
 *
 * Use of this source code is governed by an Apache license that can be
 * found in the LICENSE file at the root of this repository
 */

"use strict";

const assert = require('assert');
const requester = require('../requester.js');


describe("Testing add, and getAll account", () => {
	
	
	it("Success - add getAll", (done) => {
		let params = {
			body: {
				"label": "hage",
				"description": "this is a description for hage",
				"configuration": {
					"type": "secret",
					"namespace": "soajs",
					"url": "https://kubernetes.docker.internal",
					"port": 443,
					"token": "weewew"
				}
			}
		};
		requester('/account/kubernetes', 'post', params, (error, body) => {
			assert.ifError(error);
			assert.ok(body);
			assert.ok(body.data);
			assert.ok(body.data[0].hasOwnProperty('type'));
			
			let params = {
				body: {
					"label": "hage2",
					"description": "this is a description for hage2",
					"configuration": {
						"type": "secret",
						"namespace": "soajs",
						"url": "https://kubernetes.docker.internal",
						"port": 443,
						"token": "weewsdsdsdsdsdsdsdsew"
					}
				}
			};
			requester('/account/kubernetes', 'post', params, (error, body) => {
				assert.ifError(error);
				assert.ok(body);
				assert.ok(body.data);
				assert.ok(body.data[0].hasOwnProperty('type'));
				
				let params = {};
				requester('/account/kubernetes', 'get', params, (error, body) => {
					assert.ifError(error);
					assert.ok(body);
					assert.ok(body.data);
					let valid = !!body.data[0].configuration.token;
					assert.deepEqual(valid, false);
					let validate = (body.data.length >= 2);
					assert.deepEqual(validate, true);
					done();
				});
			});
		});
	});
	
});