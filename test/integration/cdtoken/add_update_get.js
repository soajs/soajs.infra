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


describe("Testing add, update and get cdtoken", () => {
	
	
	it("Success - add update get ", (done) => {
		let params = {
			body: {
				"label": "antoine"
			}
		};
		requester('/cd/token', 'post', params, (error, abody) => {
			assert.ifError(error);
			assert.ok(abody);
			assert.ok(abody.data);
			assert.ok(abody.data.hasOwnProperty('token'));
			
			let params = {
				body: {
					"token": abody.data.token,
					"status": "inactive"
				}
			};
			requester('/cd/token/status', 'put', params, (error, body) => {
				assert.ifError(error);
				assert.ok(body);
				assert.ok(body.data);
				assert.deepEqual(body.data, true);
				let params = {
					qs: {
						"token": abody.data.token
					}
				};
				requester('/cd/token', 'get', params, (error, body) => {
					assert.ifError(error);
					assert.ok(body);
					assert.ok(body.data);
					assert.deepEqual(body.data.status, "inactive");
					done();
				});
			});
		});
	});
	
});
