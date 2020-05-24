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
	
	it("item_soajs_deployment_or_daemonset", function (done) {
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
		
		BL.item_soajs_deployment_or_daemonset(soajs, null, null, (error) => {
			assert.ok(error);
			assert.deepEqual(error.code, 400);
			
			BL.item_soajs_deployment_or_daemonset(soajs, {
				"configuration": {
					"type": "secret",
					"namespace": "soajs",
					"url": "https://kubernetes.docker.internal:6443",
					"token": "TOKEN"
				},
				"recipe": {
					"mode": "Deployment",
					"catalog": {
						"id": "5df3ec10fa3912534948f00c",
						"version": "1",
						"shell": "shell/bin/bash"
					},
					"item": {
						"env": "dev",
						"name": "urac",
						"group": "testing",
						"type": "service",
						"subtype": "ecom",
						"version": "3"
					},
					"image": {
						"name": "soajsorg/urac:3.x",
						"imagePullPolicy": "Always"
					},
					"src": {
						"from": {
							"branch": "feature_v3.2",
							"commit": "94c585b5804892eb346aea996156db48afc78edd"
						},
						"repo": "soajs.dashboard",
						"owner": "soajsorg"
					},
					"ports": [
						{
							"name": "service",
							"containerPort": 8001
						},
						{
							"name": "maintenance",
							"containerPort": 9001
						}
					],
					"workingDir": "/opt/soajs/soajs.urac/",
					"command": [
						"bash"
					],
					"args": [
						"-c",
						"node ."
					],
					"readinessProbe": {
						"httpGet": {
							"path": "/heartbeat",
							"port": "maintenance"
						},
						"initialDelaySeconds": 5,
						"timeoutSeconds": 2,
						"periodSeconds": 5,
						"successThreshold": 1,
						"failureThreshold": 3
					},
					"env": [
						{
							"name": "SOAJS_ENV",
							"value": "dev"
						},
						{
							"name": "SOAJS_SOLO",
							"value": "true"
						}
					],
					"service": {
						"ports": [
							{
								"name": "service-port",
								"protocol": "TCP",
								"port": 8001,
								"targetPort": 8001
							},
							{
								"name": "maintenance-port",
								"protocol": "TCP",
								"port": 9001,
								"targetPort": 9001
							}
						]
					}
				}
			}, null, (error, response) => {
				assert.ok(response);
				assert.deepEqual(response, {created: true});
				done();
			});
		});
	});
	
	it("Deploy native", function (done) {
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
		
		BL.native(soajs, null, null, (error) => {
			assert.ok(error);
			assert.deepEqual(error.code, 400);
			
			BL.native(soajs, {
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