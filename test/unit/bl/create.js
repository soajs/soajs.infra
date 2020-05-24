"use strict";

const helper = require("../../helper.js");
const BL = helper.requireModule('bl/kubernetes/create.js');
const assert = require('assert');


describe("Unit test for: BL - kubernetes create ...", () => {
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
					}, null, (error, response) => {
						assert.ok(response);
						assert.deepEqual(response, {created: true});
						done();
					});
				});
			});
			
		});
	});
	
	it("Create HPA", function (done) {
		function DRIVER() {
			console.log("Kubernetes driver");
		}
		
		DRIVER.create = {
			hpa: (client, options, cb) => {
				if (options && options.name && options.name === "error") {
					let error = new Error("DRIVER error ...");
					return cb(error, null);
				} else {
					return cb(null, options);
				}
			}
		};
		BL.driver = DRIVER;
		
		BL.hpa(soajs, null, null, (error) => {
			assert.ok(error);
			assert.deepEqual(error.code, 400);
			
			BL.hpa(soajs, {"configuration": {}}, null, (error) => {
				assert.ok(error);
				assert.deepEqual(error.code, 702);
				
				BL.hpa(soajs, {
					"configuration": {
						"type": "secret",
						"namespace": "soajs",
						"url": "https://kubernetes.docker.internal:6443",
						"token": "TOKEN"
					}, "name": "error", "replica": 1, "metrics": {}
				}, null, (error) => {
					assert.ok(error);
					assert.deepEqual(error.code, 702);
					
					BL.hpa(soajs, {
						"configuration": {
							"type": "secret",
							"namespace": "soajs",
							"url": "https://kubernetes.docker.internal:6443",
							"token": "TOKEN"
						}, "name": "anyname", "replica": 1, "metrics": {}
					}, null, (error, response) => {
						assert.ok(response);
						assert.deepEqual(response, {created: true});
						done();
					});
				});
			});
			
		});
	});
	
	it("Create secret - dockercfg & opaque", function (done) {
		function DRIVER() {
			console.log("Kubernetes driver");
		}
		
		DRIVER.create = {
			secret_dockercfg: (client, options, cb) => {
				if (options && options.name && options.name === "error") {
					let error = new Error("DRIVER error ...");
					return cb(error, null);
				} else {
					return cb(null, options);
				}
			},
			secret_opaque: (client, options, cb) => {
				if (options && options.name && options.name === "error") {
					let error = new Error("DRIVER error ...");
					return cb(error, null);
				} else {
					return cb(null, options);
				}
			}
		};
		BL.driver = DRIVER;
		
		BL.secret(soajs, null, null, (error) => {
			assert.ok(error);
			assert.deepEqual(error.code, 400);
			
			BL.secret(soajs, {"configuration": {}}, null, (error) => {
				assert.ok(error);
				assert.deepEqual(error.code, 702);
				
				BL.secret(soajs, {
					"configuration": {
						"type": "secret",
						"namespace": "soajs",
						"url": "https://kubernetes.docker.internal:6443",
						"token": "TOKEN"
					}, "name": "error", "accessModes": "access"
				}, {type: "dockercfg"}, (error) => {
					assert.ok(error);
					assert.deepEqual(error.code, 702);
					
					BL.secret(soajs, {
						"configuration": {
							"type": "secret",
							"namespace": "soajs",
							"url": "https://kubernetes.docker.internal:6443",
							"token": "TOKEN"
						}, "name": "anyname", "accessModes": "access"
					}, {type: "dockercfg"}, (error, response) => {
						assert.ok(response);
						assert.deepEqual(response, {created: true});
						
						BL.secret(soajs, {
							"configuration": {
								"type": "secret",
								"namespace": "soajs",
								"url": "https://kubernetes.docker.internal:6443",
								"token": "TOKEN"
							}, "name": "error", "accessModes": "access"
						}, {type: "opaque"}, (error) => {
							assert.ok(error);
							assert.deepEqual(error.code, 702);
							
							BL.secret(soajs, {
								"configuration": {
									"type": "secret",
									"namespace": "soajs",
									"url": "https://kubernetes.docker.internal:6443",
									"token": "TOKEN"
								}, "name": "anyname", "accessModes": "access"
							}, {type: "opaque"}, (error, response) => {
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
	
	it("Create PVC", function (done) {
		function DRIVER() {
			console.log("Kubernetes driver");
		}
		
		DRIVER.create = {
			pvc: (client, options, cb) => {
				if (options && options.name && options.name === "error") {
					let error = new Error("DRIVER error ...");
					return cb(error, null);
				} else {
					return cb(null, options);
				}
			}
		};
		BL.driver = DRIVER;
		
		BL.pvc(soajs, null, null, (error) => {
			assert.ok(error);
			assert.deepEqual(error.code, 400);
			
			BL.pvc(soajs, {"configuration": {}}, null, (error) => {
				assert.ok(error);
				assert.deepEqual(error.code, 702);
				
				BL.pvc(soajs, {
					"configuration": {
						"type": "secret",
						"namespace": "soajs",
						"url": "https://kubernetes.docker.internal:6443",
						"token": "TOKEN"
					}, "name": "error", "accessModes": "access"
				}, null, (error) => {
					assert.ok(error);
					assert.deepEqual(error.code, 702);
					
					BL.pvc(soajs, {
						"configuration": {
							"type": "secret",
							"namespace": "soajs",
							"url": "https://kubernetes.docker.internal:6443",
							"token": "TOKEN"
						}, "name": "anyname", "accessModes": "access"
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