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


describe("Testing add account", () => {
	
	
	it("Success - add", (done) => {
		let params = {
			body: {
				"label": "antoine",
				"description": "this is a description for my account",
				"configuration": {
					"type": "secret",
					"url": "kubernetes.docker.internal",
					"port": 6443,
					"token": "wdhguywsbchxdsbchjsabdhbxashdbhasbdcxhasbvchjsavbhdxvashdgcxuasgdchsagb"
				}
			}
		};
		requester('/account/kubernetes', 'post', params, (error, body) => {
			assert.ifError(error);
			assert.ok(body);
			assert.ok(body.data);
			assert.ok(body.data[0].hasOwnProperty('type'));
			done();
		});
	});
	
});