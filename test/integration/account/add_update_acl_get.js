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
				"label": "mathieu",
				"description": "this is a description for mathieu",
				"configuration": {
					"type": "secret",
					"namespace": "soajs",
					"url": "https://kubernetes.docker.internal",
					"port": 6443,
					"token": "wdhguywsbcewwewewewewewhasbvchjsavbhdxvashdgcxuasgdchsagb"
				}
			}
		};
		requester('/account/kubernetes/', 'post', params, (error, body) => {
			assert.ifError(error);
			assert.ok(body);
			assert.ok(body.data);
			assert.ok(body.data[0].hasOwnProperty('type'));
			let params = {
				body: {
					"id": body.data[0]._id,
					"type": "blacklist",
					"groups": ["owner"]
				}
			};
			requester('/account/kubernetes/acl', 'put', params, (error, body2) => {
				assert.ifError(error);
				assert.ok(body2);
				assert.ok(body2.data);
				assert.deepEqual(body2.data, 1);
				
				let params = {
					qs: {
						"id": body.data[0]._id
					}
				};
				requester('/account/kubernetes', 'get', params, (error, body) => {
					console.log(body)
					assert.ifError(error);
					assert.ok(body);
					assert.deepEqual(body.data, null);
					done();
				});
			});
		});
	});
	
});