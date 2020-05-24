"use strict";

const helper = require("../../helper.js");
const BL = helper.requireModule('bl/delete.js');
const assert = require('assert');


describe("Unit test for: BL - kubernetes delete ...", () => {
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
	
	it("Delete namespace", function (done) {
		function DRIVER() {
			console.log("Kubernetes driver");
		}
		
		DRIVER.delete = {
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
						assert.deepEqual(response, {deleted: true});
						done();
					});
				});
			});
			
		});
	});
	
	it("Delete HPA", function (done) {
		function DRIVER() {
			console.log("Kubernetes driver");
		}
		
		DRIVER.delete = {
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
					}, "name": "error"
				}, null, (error) => {
					assert.ok(error);
					assert.deepEqual(error.code, 702);
					
					BL.hpa(soajs, {
						"configuration": {
							"type": "secret",
							"namespace": "soajs",
							"url": "https://kubernetes.docker.internal:6443",
							"token": "TOKEN"
						}, "name": "anyname"
					}, null, (error, response) => {
						assert.ok(response);
						assert.deepEqual(response, {deleted: true});
						done();
					});
				});
			});
			
		});
	});
	
	it("Delete secret", function (done) {
		function DRIVER() {
			console.log("Kubernetes driver");
		}
		
		DRIVER.delete = {
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
					}, "name": "error"
				}, {type: "dockercfg"}, (error) => {
					assert.ok(error);
					assert.deepEqual(error.code, 702);
					
					BL.secret(soajs, {
						"configuration": {
							"type": "secret",
							"namespace": "soajs",
							"url": "https://kubernetes.docker.internal:6443",
							"token": "TOKEN"
						}, "name": "anyname"
					}, {type: "dockercfg"}, (error, response) => {
						assert.ok(response);
						assert.deepEqual(response, {deleted: true});
						done();
					});
				});
			});
			
		});
	});
	
	it("Delete PVC", function (done) {
		function DRIVER() {
			console.log("Kubernetes driver");
		}
		
		DRIVER.delete = {
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
					}, "name": "error"
				}, null, (error) => {
					assert.ok(error);
					assert.deepEqual(error.code, 702);
					
					BL.pvc(soajs, {
						"configuration": {
							"type": "secret",
							"namespace": "soajs",
							"url": "https://kubernetes.docker.internal:6443",
							"token": "TOKEN"
						}, "name": "anyname"
					}, null, (error, response) => {
						assert.ok(response);
						assert.deepEqual(response, {deleted: true});
						done();
					});
				});
			});
			
		});
	});
	
	it("Delete item", function (done) {
		function DRIVER() {
			console.log("Kubernetes driver");
		}
		
		DRIVER.delete = {
			deployment: (client, options, cb) => {
				if (options && options.name === "error") {
					let error = new Error("DRIVER error ...");
					return cb(error, null);
				} else if (options && options.name === "notfound") {
					return cb(null, null);
				} else {
					return cb(null, options);
				}
			},
			service: (client, options, cb) => {
				if (options && options.name === "errordelete") {
					let error = new Error("DRIVER error ...");
					return cb(error, null);
				} else {
					return cb(null, options);
				}
			}
		};
		DRIVER.get = {
			one: {
				service: (client, options, cb) => {
					if (options && options.name === "error") {
						let error = new Error("DRIVER error ...");
						return cb(error, null);
					} else if (options && options.name === "notfound") {
						let error = new Error("Not found");
						error.code = 404;
						return cb(error, null);
					} else {
						return cb(null, options);
					}
				}
			}
		};
		BL.driver = DRIVER;
		
		BL.item(soajs, null, null, (error) => {
			assert.ok(error);
			assert.deepEqual(error.code, 400);
			
			BL.item(soajs, {"configuration": {}, "name": "anyname"}, null, (error) => {
				assert.ok(error);
				assert.deepEqual(error.code, 702);
				
				BL.item(soajs, {
					"configuration": {
						"type": "secret",
						"namespace": "soajs",
						"url": "https://kubernetes.docker.internal:6443",
						"token": "TOKEN"
					}, "name": "error", "mode": "XXX"
				}, null, (error) => {
					assert.ok(error);
					assert.deepEqual(error.code, 504);
					BL.item(soajs, {
						"configuration": {
							"type": "secret",
							"namespace": "soajs",
							"url": "https://kubernetes.docker.internal:6443",
							"token": "TOKEN"
						}, "name": "error", "mode": "Deployment"
					}, null, (error) => {
						assert.ok(error);
						assert.deepEqual(error.code, 702);
						
						BL.item(soajs, {
							"configuration": {
								"type": "secret",
								"namespace": "soajs",
								"url": "https://kubernetes.docker.internal:6443",
								"token": "TOKEN"
							}, "name": "notfound", "mode": "Deployment"
						}, null, (error) => {
							assert.ok(error);
							assert.deepEqual(error.code, 501);
							
							BL.item(soajs, {
								"configuration": {
									"type": "secret",
									"namespace": "soajs",
									"url": "https://kubernetes.docker.internal:6443",
									"token": "TOKEN"
								}, "name": "anyname", "mode": "Deployment", "serviceName": "notfound"
							}, null, (error, response) => {
								assert.ok(response);
								assert.deepEqual(response, {deleted: true});
								BL.item(soajs, {
									"configuration": {
										"type": "secret",
										"namespace": "soajs",
										"url": "https://kubernetes.docker.internal:6443",
										"token": "TOKEN"
									}, "name": "anyname", "mode": "Deployment", "serviceName": "error"
								}, null, (error) => {
									assert.ok(error);
									assert.deepEqual(error.code, 702);
									
									BL.item(soajs, {
										"configuration": {
											"type": "secret",
											"namespace": "soajs",
											"url": "https://kubernetes.docker.internal:6443",
											"token": "TOKEN"
										}, "name": "anyname", "mode": "Deployment", "serviceName": "errordelete"
									}, null, (error) => {
										assert.ok(error);
										assert.deepEqual(error.code, 702);
										
										BL.item(soajs, {
											"configuration": {
												"type": "secret",
												"namespace": "soajs",
												"url": "https://kubernetes.docker.internal:6443",
												"token": "TOKEN"
											}, "name": "anyname", "mode": "Deployment", "serviceName": "anyname"
										}, null, (error, response) => {
											assert.ok(response);
											assert.deepEqual(response, {deleted: true});
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
	});
	
	it("Delete pods", function (done) {
		function DRIVER() {
			console.log("Kubernetes driver");
		}
		
		DRIVER.delete = {
			pods: (client, options, cb) => {
				if (options && options.filter && options.filter === "error") {
					let error = new Error("DRIVER error ...");
					return cb(error, null);
				} else {
					return cb(null, options);
				}
			}
		};
		BL.driver = DRIVER;
		
		BL.pods(soajs, null, null, (error) => {
			assert.ok(error);
			assert.deepEqual(error.code, 400);
			
			BL.pods(soajs, {"configuration": {}}, null, (error) => {
				assert.ok(error);
				assert.deepEqual(error.code, 702);
				
				BL.pods(soajs, {
					"configuration": {
						"type": "secret",
						"namespace": "soajs",
						"url": "https://kubernetes.docker.internal:6443",
						"token": "TOKEN"
					}, "filter": "error"
				}, null, (error) => {
					assert.ok(error);
					assert.deepEqual(error.code, 702);
					
					BL.pods(soajs, {
						"configuration": {
							"type": "secret",
							"namespace": "soajs",
							"url": "https://kubernetes.docker.internal:6443",
							"token": "TOKEN"
						}, "filter": "anyname"
					}, null, (error, response) => {
						assert.ok(response);
						assert.deepEqual(response, {deleted: true});
						done();
					});
				});
			});
			
		});
	});
	
	it("Delete resopurce", function (done) {
		function DRIVER() {
			console.log("Kubernetes driver");
		}
		
		DRIVER.delete = {
			deployment: (client, options, cb) => {
				if (options && options.name && options.name === "error") {
					let error = new Error("DRIVER error ...");
					return cb(error, null);
				} else {
					return cb(null, options);
				}
			}
		};
		BL.driver = DRIVER;
		
		BL.resource(soajs, null, null, (error) => {
			assert.ok(error);
			assert.deepEqual(error.code, 400);
			
			BL.resource(soajs, {"configuration": {}}, null, (error) => {
				assert.ok(error);
				assert.deepEqual(error.code, 702);
				
				BL.resource(soajs, {
					"configuration": {
						"type": "secret",
						"namespace": "soajs",
						"url": "https://kubernetes.docker.internal:6443",
						"token": "TOKEN"
					}, "name": "error", "mode": "XXX"
				}, null, (error) => {
					assert.ok(error);
					assert.deepEqual(error.code, 504);
					BL.resource(soajs, {
						"configuration": {
							"type": "secret",
							"namespace": "soajs",
							"url": "https://kubernetes.docker.internal:6443",
							"token": "TOKEN"
						}, "name": "error", "mode": "Deployment"
					}, null, (error) => {
						assert.ok(error);
						assert.deepEqual(error.code, 702);
						
						BL.resource(soajs, {
							"configuration": {
								"type": "secret",
								"namespace": "soajs",
								"url": "https://kubernetes.docker.internal:6443",
								"token": "TOKEN"
							}, "name": "anyname", "mode": "Deployment"
						}, null, (error, response) => {
							assert.ok(response);
							assert.deepEqual(response, {deleted: true});
							done();
						});
					});
				});
			});
		});
	});
});