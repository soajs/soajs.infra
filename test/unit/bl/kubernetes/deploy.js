"use strict";

const helper = require("../../../helper.js");
const BL = helper.requireModule('bl/kubernetes/deploy.js');
const assert = require('assert');


describe("Unit test for: BL - kubernetes deploy ...", () => {
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
	
	
	it("Deploy vanilla", function (done) {
		function DRIVER() {
			console.log("Kubernetes driver");
		}
		
		DRIVER.create = {
			deployment: (client, options, cb) => {
				if (options && options.body && options.body.name === "error") {
					let error = new Error("DRIVER error ...");
					return cb(error, null);
				} else {
					return cb(null, options);
				}
			},
			service: (client, options, cb) => {
				if (options && options.body && options.body.name === "error") {
					let error = new Error("DRIVER error ...");
					return cb(error, null);
				} else {
					return cb(null, options);
				}
			}
		};
		BL.driver = DRIVER;
		
		BL.vanilla(soajs, null, null, (error) => {
			assert.ok(error);
			assert.deepEqual(error.code, 400);
			
			BL.vanilla(soajs, {"configuration": {}}, null, (error) => {
				assert.ok(error);
				assert.deepEqual(error.code, 702);
				
				BL.vanilla(soajs, {
					"configuration": {
						"type": "secret",
						"namespace": "soajs",
						"url": "https://kubernetes.docker.internal:6443",
						"token": "TOKEN"
					}, "deployment": {"kind": "XXX"}
				}, null, (error) => {
					assert.ok(error);
					assert.deepEqual(error.code, 504);
					BL.vanilla(soajs, {
						"configuration": {
							"type": "secret",
							"namespace": "soajs",
							"url": "https://kubernetes.docker.internal:6443",
							"token": "TOKEN"
						}, "deployment": {"kind": "Deployment", "name": "error"}
					}, null, (error) => {
						assert.ok(error);
						assert.deepEqual(error.code, 702);
						
						BL.vanilla(soajs, {
							"configuration": {
								"type": "secret",
								"namespace": "soajs",
								"url": "https://kubernetes.docker.internal:6443",
								"token": "TOKEN"
							}, "deployment": {"kind": "Deployment", "name": "any"}
						}, null, (error, response) => {
							assert.ok(response);
							assert.deepEqual(response, {created: true});
							
							BL.vanilla(soajs, {
								"configuration": {
									"type": "secret",
									"namespace": "soajs",
									"url": "https://kubernetes.docker.internal:6443",
									"token": "TOKEN"
								},
								"deployment": {"kind": "Deployment", "name": "any"},
								"service": {"kind": "Service", "name": "error"}
							}, null, (error) => {
								assert.ok(error);
								assert.deepEqual(error.code, 702);
								
								BL.vanilla(soajs, {
									"configuration": {
										"type": "secret",
										"namespace": "soajs",
										"url": "https://kubernetes.docker.internal:6443",
										"token": "TOKEN"
									},
									"deployment": {"kind": "Deployment", "name": "any"},
									"service": {"kind": "Service", "name": "any"}
								}, null, (error, response) => {
									assert.ok(response);
									assert.deepEqual(response, {created: true});
									done();
								});
							});
						});
					});
				});
			});
		});
	});
});