/**
 * @license
 * Copyright SOAJS All Rights Reserved.
 *
 * Use of this source code is governed by an Apache license that can be
 * found in the LICENSE file at the root of this repository
 */

"use strict";

const helper = require("../../../helper.js");
const BL = helper.requireModule('bl/kubernetes/exec.js');
const assert = require('assert');


describe("Unit test for: BL - kubernetes exec ...", () => {
	let soajs = {
		"log": {
			"error": (msg) => {
				console.log(msg);
			},
			"debug": (msg) => {
				console.log(msg);
			}
		}
	};
	
	before((done) => {
		
		let localConfig = helper.requireModule("config.js");
		let kube = helper.requireModule("./bl/kubernetes.js");
		kube.localConfig = localConfig;
		kube.driver = {
			connect: (config, cb) => {
				return cb(null, {});
			}
		};
		BL.localConfig = localConfig;
		BL.handleError = kube.handleError;
		BL.handleConnect = kube.handleConnect;
		done();
	});
	
	it("Exec maintenance", function (done) {
		function DRIVER() {
			console.log("Kubernetes driver");
		}
		
		DRIVER.pod = {
			exec: (client, options, cb) => {
				if (options && options.filter && options.filter.labelSelector === 'soajs.service.label=error') {
					let error = new Error("DRIVER error ...");
					return cb(error, null);
				} else {
					return cb(null, options);
				}
			}
		};
		BL.driver = DRIVER;
		
		BL.maintenance(soajs, null, null, (error) => {
			assert.ok(error);
			assert.deepEqual(error.code, 400);
			
			BL.maintenance(soajs, {"configuration": {}, "operation": {"route": "/loadRegistry"}}, null, (error) => {
				assert.ok(error);
				assert.deepEqual(error.code, 702);
				
				BL.maintenance(soajs, {
					"configuration": {
						"type": "secret",
						"namespace": "soajs",
						"url": "https://kubernetes.docker.internal:6443",
						"token": "TOKEN"
					}, "name": "error", "operation": {"route": "/loadRegistry"}
				}, null, (error) => {
					assert.ok(error);
					assert.deepEqual(error.code, 702);
					
					BL.maintenance(soajs, {
						"configuration": {
							"type": "secret",
							"namespace": "soajs",
							"url": "https://kubernetes.docker.internal:6443",
							"token": "TOKEN"
						}, "name": "anyname", "operation": {"route": "/loadRegistry"}
					}, null, (error, response) => {
						assert.ok(response);
						done();
					});
				});
			});
			
		});
	});
	
	it("Exec custom", function (done) {
		function DRIVER() {
			console.log("Kubernetes driver");
		}
		
		DRIVER.pod = {
			exec: (client, options, cb) => {
				if (options && options.name && options.name === "error") {
					let error = new Error("DRIVER error ...");
					return cb(error, null);
				} else {
					return cb(null, options);
				}
			}
		};
		BL.driver = DRIVER;
		
		BL.custom(soajs, null, null, (error) => {
			assert.ok(error);
			assert.deepEqual(error.code, 400);
			
			BL.custom(soajs, {"configuration": {}}, null, (error) => {
				assert.ok(error);
				assert.deepEqual(error.code, 702);
				
				BL.custom(soajs, {
					"configuration": {
						"type": "secret",
						"namespace": "soajs",
						"url": "https://kubernetes.docker.internal:6443",
						"token": "TOKEN"
					}, "name": "error"
				}, null, (error) => {
					assert.ok(error);
					assert.deepEqual(error.code, 702);
					
					BL.custom(soajs, {
						"configuration": {
							"type": "secret",
							"namespace": "soajs",
							"url": "https://kubernetes.docker.internal:6443",
							"token": "TOKEN"
						}, "name": "anyname"
					}, null, (error, response) => {
						assert.ok(response);
						done();
					});
				});
			});
			
		});
	});
});