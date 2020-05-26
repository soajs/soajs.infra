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


describe("Testing add & delete cdtoken", () => {
	
	
	it("Success - add delete", (done) => {
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
					"token": body.data[0].token
				}
			};
			requester('/cd/token', 'delete', params, (error, body) => {
				assert.ifError(error);
				assert.ok(body);
				assert.ok(body.data);
				assert.deepEqual(body.data, {n: 1, ok: 1, deletedCount: 1});
				done();
			});
		});
	});
	
});