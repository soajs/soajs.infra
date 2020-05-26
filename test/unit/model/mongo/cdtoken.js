/**
 * @license
 * Copyright SOAJS All Rights Reserved.
 *
 * Use of this source code is governed by an Apache license that can be
 * found in the LICENSE file at the root of this repository
 */

"use strict";

const crypto = require('crypto');
const helper = require("../../../helper.js");
const Model = helper.requireModule('./model/mongo/cdtoken.js');
const assert = require('assert');

describe("Unit test for: model - user", function () {
	let modelObj;
	let service = {
		config: {
			"errors": {},
		},
		log: {
			error: () => {
				console.log();
			},
			debug: () => {
				console.log();
			}
		},
		registry: {
			get: () => {
				return {
					coreDB: {
						provision: {
							"name": "core_provision",
							"prefix": '',
							"servers": [
								{
									"host": "127.0.0.1",
									"port": 27017
								}
							],
							"credentials": null,
							"URLParam": {
								"useUnifiedTopology": true
							}
						}
					}
				};
			}
		}
	};
	let token = crypto.randomBytes(64).toString('hex');
	
	it("Constructor - open connection", function (done) {
		modelObj = new Model(service, null, null);
		done();
	});
	
	
	it("add cdtoken", function (done) {
		let data = {
			"token": token,
			"label": "antoine",
			"status": "active",
			"urac": {
				"id": "1111111111",
				"username": "antoinehage"
			}
		};
		modelObj.add({}, (err) => {
			assert.ok(err);
			assert.deepEqual(err.message, "cdToken: token, label, urac and status are required.");
			
			modelObj.add(data, (err, response) => {
				assert.ok(response);
				assert.deepEqual(response[0].type, "cdtoken");
				done();
			});
		});
	});
	
	it("update and get cdtoken", function (done) {
		let data = {
			"token": token,
			"status": "active"
		};
		modelObj.update({}, (err) => {
			assert.ok(err);
			assert.deepEqual(err.message, "cdToken: status and token are required.");
			
			modelObj.update(data, (err, response) => {
				assert.deepEqual(response, 0);
				
				data.status = "inactive";
				modelObj.update(data, (err, response) => {
					assert.ok(response);
					assert.deepEqual(response, 1);
					
					let data = {
						"token": token
					};
					modelObj.getOne({}, (err) => {
						assert.ok(err);
						assert.deepEqual(err.message, "cdToken: token is required.");
						
						modelObj.getOne(data, (err, response) => {
							assert.ok(response);
							assert.deepEqual(response.status, "inactive");
							done();
						});
					});
				});
			});
		});
	});
	
	it("add multiple and get cdtoken", function (done) {
		
		let token1 = crypto.randomBytes(64).toString('hex');
		let token2 = crypto.randomBytes(64).toString('hex');
		let token3 = crypto.randomBytes(64).toString('hex');
		
		let data = {
			"token": token1,
			"status": "active",
			"label": "antoine",
			"urac": {
				"id": "1111111111",
				"username": "antoinehage"
			}
		};
		modelObj.add(data, (err, response) => {
			assert.ok(response);
			assert.deepEqual(response[0].type, "cdtoken");
			
			let data = {
				"token": token2,
				"status": "active",
				"label": "antoine",
				"urac": {
					"id": "2222222222",
					"username": "antoinehage"
				}
			};
			modelObj.add(data, (err, response) => {
				assert.ok(response);
				assert.deepEqual(response[0].type, "cdtoken");
				
				let data = {
					"token": token3,
					"status": "active",
					"label": "antoine",
					"urac": {
						"id": "3333333333",
						"username": "antoinehage"
					}
				};
				modelObj.add(data, (err, response) => {
					assert.ok(response);
					assert.deepEqual(response[0].type, "cdtoken");
					
					modelObj.getAll(data, (err, response) => {
						assert.ok(response);
						let validate = (response.length >= 3);
						assert.deepEqual(validate, true);
						done();
					});
				});
			});
		});
	});
	
	it("count cdtoken", function (done) {
		modelObj.count({}, (err, response) => {
			assert.ok(response);
			let validate = (response >= 3);
			assert.deepEqual(validate, true);
			done();
		});
	});
	
	it("delete cdtoken", function (done) {
		let data = {
			"token": token
		};
		modelObj.delete({}, (err) => {
			assert.ok(err);
			assert.deepEqual(err.message, "cdToken: token is required.");
			
			modelObj.delete(data, (err, response) => {
				assert.ok(response);
				assert.deepEqual(response.deletedCount, 1);
				done();
			});
		});
	});
	
	it("close connection", function (done) {
		modelObj.closeConnection();
		done();
	});
});