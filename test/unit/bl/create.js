"use strict";

const helper = require("../../helper.js");
const BL = helper.requireModule('bl/create.js');
const assert = require('assert');


describe("Unit test for: BL - create ...", () => {
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
	
	it("Create namespace", function (done) {
		function DRIVER() {
			console.log("Kubernetes driver");
		}
		
		DRIVER.create = {
			namespace: (client, options, cb) => {
				if (options && options.name && options.name === "error") {
					let error = new Error("DRIVER error ...");
					return cb(error, null);
				} else {
					return cb(null, options);
				}
			}
		};
		BL.driver = DRIVER;
		
		BL.namespace(soajs, null, null, (error) => {
			assert.ok(error);
			assert.deepEqual(error.code, 400);
			
			BL.namespace(soajs, {"configuration": {}}, null, (error) => {
				assert.ok(error);
				assert.deepEqual(error.code, 702);
				
				BL.namespace(soajs, {
					"configuration": {
						"type": "secret",
						"namespace": "soajs",
						"url": "https://kubernetes.docker.internal:6443",
						"token": "TOKEN"
					}, "name": "error"
				}, null, (error) => {
					assert.ok(error);
					assert.deepEqual(error.code, 702);
					
					BL.namespace(soajs, {
						"configuration": {
							"type": "secret",
							"namespace": "soajs",
							"url": "https://kubernetes.docker.internal:6443",
							"token": "TOKEN"
						}, "name": "anyname"
					}, null, (error, record) => {
						assert.ok(record);
						done();
					});
				});
			});
			
		});
	});
	
});