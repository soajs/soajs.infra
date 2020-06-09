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


describe("Testing add & update acl and then get account", () => {
	
	
	it("Success - test acl behaviour", (done) => {
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
				requester('/account/kubernetes', 'get', params, (error, body3) => {
					assert.ifError(error);
					assert.ok(body3);
					assert.deepEqual(body3.data, null);
					
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
						assert.deepEqual(body2.errors,
							{
								codes: [602],
								details:
									[{
										code: 602,
										message: 'Model error: Access restricted to this record.'
									}]
							});
						done();
					});
				});
			});
		});
	});
	
});