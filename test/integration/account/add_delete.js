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


describe("Testing add & delete account", () => {
	
	
	it("Success - add delete", (done) => {
		let params = {
			body: {
				"label": "tony",
				"description": "this is a description for tony",
				"configuration": {
					"type": "secret",
					"namespace": "soajs",
					"url": "https://kubernetes.docker.internal",
					"port": 6443,
					"token": "wdhguywsbcewwewewewewewhasbvchjsavbhdxvashdgcxuasgdchsagb"
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
					"id": body.data[0]._id
				}
			};
			requester('/account/kubernetes', 'delete', params, (error, body) => {
				assert.ifError(error);
				assert.ok(body);
				assert.ok(body.data);
				assert.deepEqual(body.data, {n: 1, ok: 1, deletedCount: 1});
				done();
			});
		});
	});
	
});