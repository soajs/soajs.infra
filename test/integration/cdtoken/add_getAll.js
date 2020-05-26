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


describe("Testing add, and getAll cdtoken", () => {
	
	
	it("Success - add getAll", (done) => {
		let params = {
			body: {
				"label": "antoine"
			}
		};
		requester('/cd/token', 'post', params, (error, body) => {
			assert.ifError(error);
			assert.ok(body);
			assert.ok(body.data);
			assert.ok(body.data[0].hasOwnProperty('token'));
			
			let params = {
				body: {
					"label": "antoine"
				}
			};
			requester('/cd/token', 'post', params, (error, body) => {
				assert.ifError(error);
				assert.ok(body);
				assert.ok(body.data);
				assert.ok(body.data[0].hasOwnProperty('token'));
				
				let params = {};
				requester('/cd/tokens', 'get', params, (error, body) => {
					assert.ifError(error);
					assert.ok(body);
					assert.ok(body.data);
					let validate = (body.data.length >= 2);
					assert.deepEqual(validate, true);
					done();
				});
			});
		});
	});
	
});