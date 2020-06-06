'use strict';

/**
 * @license
 * Copyright SOAJS All Rights Reserved.
 *
 * Use of this source code is governed by an Apache license that can be
 * found in the LICENSE file at the root of this repository
 */

const soajs = require('soajs');

let config = require('./config.js');
config.packagejson = require("./package.json");

const bl = require("./bl/index.js");
const sdk = require("./lib/sdk.js");

const service = new soajs.server.service(config);

function run(serviceStartCb) {
	service.init(() => {
		bl.init(service, config, (error) => {
			if (error) {
				throw new Error('Failed starting service');
			}
			
			//DELETE methods
			service.delete("/cd/token", function (req, res) {
				bl.cdtoken.delete_token(req.soajs, req.soajs.inputmaskData, null, (error, data) => {
					return res.json(req.soajs.buildResponse(error, data));
				});
			});
			
			service.delete("/kubernetes/plugin", function (req, res) {
				bl.kubernetes.bundle.delete(req.soajs, req.soajs.inputmaskData, null, (error, data) => {
					let response = req.soajs.buildResponse(error, data);
					res.json(response);
					let doc = {
						"type": "Deployment",
						"section": "Kubernetes",
						"locator": ["Plugin", req.soajs.inputmaskData.plugin],
						"action": "deleted"
					};
					sdk.ledger(req.soajs, doc, response, () => {
					});
				});
			});
			service.delete("/kubernetes/bundle", function (req, res) {
				bl.kubernetes.bundle.delete(req.soajs, req.soajs.inputmaskData, null, (error, data) => {
					let response = req.soajs.buildResponse(error, data);
					res.json(response);
					let doc = {
						"type": "Deployment",
						"section": "Kubernetes",
						"locator": ["Bundle"],
						"action": "deleted"
					};
					sdk.ledger(req.soajs, doc, response, () => {
					});
				});
			});
			
			service.delete("/kubernetes/workload/:mode", function (req, res) {
				bl.kubernetes.delete.resource(req.soajs, req.soajs.inputmaskData, null, (error, data) => {
					let response = req.soajs.buildResponse(error, data);
					res.json(response);
					let doc = {
						"type": "Deployment",
						"section": "Kubernetes",
						"locator": ["workload", req.soajs.inputmaskData.mode],
						"action": "deleted"
					};
					sdk.ledger(req.soajs, doc, response, () => {
					});
				});
			});
			service.delete("/kubernetes/service/:mode", function (req, res) {
				bl.kubernetes.delete.resource(req.soajs, req.soajs.inputmaskData, null, (error, data) => {
					let response = req.soajs.buildResponse(error, data);
					res.json(response);
					let doc = {
						"type": "Deployment",
						"section": "Kubernetes",
						"locator": ["service", req.soajs.inputmaskData.mode],
						"action": "deleted"
					};
					sdk.ledger(req.soajs, doc, response, () => {
					});
				});
			});
			service.delete("/kubernetes/storage/:mode", function (req, res) {
				bl.kubernetes.delete.resource(req.soajs, req.soajs.inputmaskData, null, (error, data) => {
					let response = req.soajs.buildResponse(error, data);
					res.json(response);
					let doc = {
						"type": "Deployment",
						"section": "Kubernetes",
						"locator": ["storage", req.soajs.inputmaskData.mode],
						"action": "deleted"
					};
					sdk.ledger(req.soajs, doc, response, () => {
					});
				});
			});
			service.delete("/kubernetes/configuration/:mode", function (req, res) {
				bl.kubernetes.delete.resource(req.soajs, req.soajs.inputmaskData, null, (error, data) => {
					let response = req.soajs.buildResponse(error, data);
					res.json(response);
					let doc = {
						"type": "Deployment",
						"section": "Kubernetes",
						"locator": ["configuration", req.soajs.inputmaskData.mode],
						"action": "deleted"
					};
					sdk.ledger(req.soajs, doc, response, () => {
					});
				});
			});
			service.delete("/kubernetes/rbac/:mode", function (req, res) {
				bl.kubernetes.delete.resource(req.soajs, req.soajs.inputmaskData, null, (error, data) => {
					let response = req.soajs.buildResponse(error, data);
					res.json(response);
					let doc = {
						"type": "Deployment",
						"section": "Kubernetes",
						"locator": ["RBAC", req.soajs.inputmaskData.mode],
						"action": "deleted"
					};
					sdk.ledger(req.soajs, doc, response, () => {
					});
				});
			});
			
			service.delete("/kubernetes/pods", function (req, res) {
				bl.kubernetes.delete.pods(req.soajs, req.soajs.inputmaskData, null, (error, data) => {
					let response = req.soajs.buildResponse(error, data);
					res.json(response);
					let doc = {
						"type": "Deployment",
						"section": "Kubernetes",
						"locator": ["pods"],
						"action": "deleted"
					};
					sdk.ledger(req.soajs, doc, response, () => {
					});
				});
			});
			service.delete("/kubernetes/namespace", function (req, res) {
				bl.kubernetes.delete.namespace(req.soajs, req.soajs.inputmaskData, null, (error, data) => {
					let response = req.soajs.buildResponse(error, data);
					res.json(response);
					let doc = {
						"type": "Deployment",
						"section": "Kubernetes",
						"locator": ["namespace"],
						"action": "deleted"
					};
					sdk.ledger(req.soajs, doc, response, () => {
					});
				});
			});
			service.delete("/kubernetes/item", function (req, res) {
				bl.kubernetes.delete.item(req.soajs, req.soajs.inputmaskData, null, (error, data) => {
					let response = req.soajs.buildResponse(error, data);
					res.json(response);
					let doc = {
						"type": "Deployment",
						"section": "Kubernetes",
						"locator": ["item"],
						"action": "deleted"
					};
					sdk.ledger(req.soajs, doc, response, () => {
					});
				});
			});
			
			
			//PUT methods
			service.put("/cd/token/status", function (req, res) {
				bl.cdtoken.update_token_status(req.soajs, req.soajs.inputmaskData, null, (error, data) => {
					return res.json(req.soajs.buildResponse(error, data));
				});
			});
			
			service.put("/kubernetes/deployment/scale", function (req, res) {
				bl.kubernetes.scale(req.soajs, req.soajs.inputmaskData, null, (error, data) => {
					let response = req.soajs.buildResponse(error, data);
					res.json(response);
					let doc = {
						"type": "Deployment",
						"section": "Kubernetes",
						"locator": ["scale", req.soajs.inputmaskData.name],
						"action": "updated"
					};
					sdk.ledger(req.soajs, doc, response, () => {
					});
				});
			});
			service.put("/kubernetes/item/redeploy", function (req, res) {
				bl.kubernetes.redeploy.item(req.soajs, req.soajs.inputmaskData, null, (error, data) => {
					let response = req.soajs.buildResponse(error, data);
					res.json(response);
					let doc = {
						"type": "Deployment",
						"section": "Kubernetes",
						"locator": ["redeploy", req.soajs.inputmaskData.name],
						"action": "updated"
					};
					sdk.ledger(req.soajs, doc, response, () => {
					});
				});
			});
			service.put("/kubernetes/resource/restart", function (req, res) {
				bl.kubernetes.resource_restart(req.soajs, req.soajs.inputmaskData, null, (error, data) => {
					let response = req.soajs.buildResponse(error, data);
					res.json(response);
					let doc = {
						"type": "Deployment",
						"section": "Kubernetes",
						"locator": ["restart", req.soajs.inputmaskData.name],
						"action": "updated"
					};
					sdk.ledger(req.soajs, doc, response, () => {
					});
				});
			});
			service.put("/kubernetes/item/maintenance", function (req, res) {
				bl.kubernetes.exec.maintenance(req.soajs, req.soajs.inputmaskData, null, (error, data) => {
					let response = req.soajs.buildResponse(error, data);
					res.json(response);
					let doc = {
						"type": "Deployment",
						"section": "Kubernetes",
						"locator": ["maintenance", req.soajs.inputmaskData.name],
						"action": "updated"
					};
					sdk.ledger(req.soajs, doc, response, () => {
					});
				});
			});
			service.put("/kubernetes/pods/exec", function (req, res) {
				bl.kubernetes.exec.custom(req.soajs, req.soajs.inputmaskData, null, (error, data) => {
					let response = req.soajs.buildResponse(error, data);
					res.json(response);
					let doc = {
						"type": "Deployment",
						"section": "Kubernetes",
						"locator": ["pods", "exec"],
						"action": "updated"
					};
					sdk.ledger(req.soajs, doc, response, () => {
					});
				});
			});
			service.put("/kubernetes/pod/exec", function (req, res) {
				bl.kubernetes.exec.custom(req.soajs, req.soajs.inputmaskData, null, (error, data) => {
					let response = req.soajs.buildResponse(error, data);
					res.json(response);
					let doc = {
						"type": "Deployment",
						"section": "Kubernetes",
						"locator": ["pod", "exec", req.soajs.inputmaskData.name],
						"action": "updated"
					};
					sdk.ledger(req.soajs, doc, response, () => {
					});
				});
			});
			
			service.put("/kubernetes/workload/:mode", function (req, res) {
				bl.kubernetes.resource_update(req.soajs, req.soajs.inputmaskData, null, (error, data) => {
					let response = req.soajs.buildResponse(error, data);
					res.json(response);
					let doc = {
						"type": "Deployment",
						"section": "Kubernetes",
						"locator": ["workload", req.soajs.inputmaskData.mode],
						"action": "updated"
					};
					sdk.ledger(req.soajs, doc, response, () => {
					});
				});
			});
			service.put("/kubernetes/service/:mode", function (req, res) {
				bl.kubernetes.resource_update(req.soajs, req.soajs.inputmaskData, null, (error, data) => {
					let response = req.soajs.buildResponse(error, data);
					res.json(response);
					let doc = {
						"type": "Deployment",
						"section": "Kubernetes",
						"locator": ["service", req.soajs.inputmaskData.mode],
						"action": "updated"
					};
					sdk.ledger(req.soajs, doc, response, () => {
					});
				});
			});
			service.put("/kubernetes/storage/:mode", function (req, res) {
				bl.kubernetes.resource_update(req.soajs, req.soajs.inputmaskData, null, (error, data) => {
					let response = req.soajs.buildResponse(error, data);
					res.json(response);
					let doc = {
						"type": "Deployment",
						"section": "Kubernetes",
						"locator": ["storage", req.soajs.inputmaskData.mode],
						"action": "updated"
					};
					sdk.ledger(req.soajs, doc, response, () => {
					});
				});
			});
			
			
			//GET methods
			service.get("/cd/token", function (req, res) {
				bl.cdtoken.get_token(req.soajs, req.soajs.inputmaskData, null, (error, data) => {
					return res.json(req.soajs.buildResponse(error, data));
				});
			});
			service.get("/cd/tokens", function (req, res) {
				bl.cdtoken.get_tokens(req.soajs, req.soajs.inputmaskData, null, (error, data) => {
					return res.json(req.soajs.buildResponse(error, data));
				});
			});
			
			service.get("/kubernetes/plugin", function (req, res) {
				bl.kubernetes.bundle.get(req.soajs, req.soajs.inputmaskData, null, (error, data) => {
					return res.json(req.soajs.buildResponse(error, data));
				});
			});
			service.get("/kubernetes/bundle", function (req, res) {
				bl.kubernetes.bundle.get(req.soajs, req.soajs.inputmaskData, null, (error, data) => {
					return res.json(req.soajs.buildResponse(error, data));
				});
			});
			
			service.get("/kubernetes/cluster/:mode", function (req, res) {
				bl.kubernetes.get.one(req.soajs, req.soajs.inputmaskData, null, (error, data) => {
					return res.json(req.soajs.buildResponse(error, data));
				});
			});
			service.get("/kubernetes/workload/:mode", function (req, res) {
				bl.kubernetes.get.one(req.soajs, req.soajs.inputmaskData, null, (error, data) => {
					return res.json(req.soajs.buildResponse(error, data));
				});
			});
			service.get("/kubernetes/service/:mode", function (req, res) {
				bl.kubernetes.get.one(req.soajs, req.soajs.inputmaskData, null, (error, data) => {
					return res.json(req.soajs.buildResponse(error, data));
				});
			});
			service.get("/kubernetes/storage/:mode", function (req, res) {
				bl.kubernetes.get.one(req.soajs, req.soajs.inputmaskData, null, (error, data) => {
					return res.json(req.soajs.buildResponse(error, data));
				});
			});
			service.get("/kubernetes/configuration/:mode", function (req, res) {
				bl.kubernetes.get.one(req.soajs, req.soajs.inputmaskData, null, (error, data) => {
					return res.json(req.soajs.buildResponse(error, data));
				});
			});
			service.get("/kubernetes/rbac/:mode", function (req, res) {
				bl.kubernetes.get.one(req.soajs, req.soajs.inputmaskData, null, (error, data) => {
					return res.json(req.soajs.buildResponse(error, data));
				});
			});
			
			service.get("/kubernetes/clusters/:mode", function (req, res) {
				bl.kubernetes.get.all(req.soajs, req.soajs.inputmaskData, null, (error, data) => {
					return res.json(req.soajs.buildResponse(error, data));
				});
			});
			service.get("/kubernetes/workloads/:mode", function (req, res) {
				bl.kubernetes.get.all(req.soajs, req.soajs.inputmaskData, null, (error, data) => {
					return res.json(req.soajs.buildResponse(error, data));
				});
			});
			service.get("/kubernetes/services/:mode", function (req, res) {
				bl.kubernetes.get.all(req.soajs, req.soajs.inputmaskData, null, (error, data) => {
					return res.json(req.soajs.buildResponse(error, data));
				});
			});
			service.get("/kubernetes/storages/:mode", function (req, res) {
				bl.kubernetes.get.all(req.soajs, req.soajs.inputmaskData, null, (error, data) => {
					return res.json(req.soajs.buildResponse(error, data));
				});
			});
			service.get("/kubernetes/configurations/:mode", function (req, res) {
				bl.kubernetes.get.all(req.soajs, req.soajs.inputmaskData, null, (error, data) => {
					return res.json(req.soajs.buildResponse(error, data));
				});
			});
			service.get("/kubernetes/rbacs/:mode", function (req, res) {
				bl.kubernetes.get.all(req.soajs, req.soajs.inputmaskData, null, (error, data) => {
					return res.json(req.soajs.buildResponse(error, data));
				});
			});
			
			service.get("/kubernetes/item/latestVersion", function (req, res) {
				bl.kubernetes.get.item_latestVersion(req.soajs, req.soajs.inputmaskData, null, (error, data) => {
					return res.json(req.soajs.buildResponse(error, data));
				});
			});
			service.get("/kubernetes/pod/log", function (req, res) {
				bl.kubernetes.get.log(req.soajs, req.soajs.inputmaskData, null, (error, data) => {
					if (error) {
						return res.json(req.soajs.buildResponse(error, null));
					} else {
						if (req.soajs.inputmaskData.follow) {
							let headObj = {
								"connection": "keep-alive",
								"cache-control": "no-cache",
								"Content-Type": "text/event-stream",
								"X-Accel-Buffering": "no"
							};
							if (!res.headersSent) {
								res.writeHead(200, headObj);
							}
							let keepConnectionAlive = true;
							res.write("event: open\n");
							res.write(`id: ${new Date().getTime()}\n`);
							res.write("data: ---- Log tail about to start ...\n\n");
							
							data.on("data", (chunk) => {
								//keep on witting to the response
								res.write("event: message\n");
								res.write(`id: ${new Date().getTime()}\n`);
								res.write(`data: ${chunk}\n\n`);
							});
							data.on("error", (error) => {
								req.soajs.log.error(error);
								keepConnectionAlive = false;
								
								res.write("event: error\n");
								res.write(`id: ${new Date().getTime()}\n`);
								res.end("data: ---- Connection terminated!\n\n");
							});
							data.on("end", () => {
								keepConnectionAlive = false;
								
								res.write("event: end\n");
								res.write(`id: ${new Date().getTime()}\n`);
								res.end("data: ---- Connection ended, no more logs!\n\n");
							});
							
							req.on("error", (error) => {
								req.soajs.log.error(error);
								keepConnectionAlive = false;
							});
							req.on("timeout", () => {
								keepConnectionAlive = false;
							});
							res.on("error", (error) => {
								req.soajs.log.error(error);
								keepConnectionAlive = false;
							});
							res.on("close", () => {
								keepConnectionAlive = false;
							});
							res.on("finish", () => {
								keepConnectionAlive = false;
							});
							
							let keepAlive = () => {
								
								res.write('event: keepalive\n');
								res.write("id: " + new Date().getTime() + "\n");
								res.write('data: Heartbeat to stay alive\n\n');
								
								if (keepConnectionAlive) {
									setTimeout(keepAlive, 30000);
								} else {
									data.destroy();
									req.soajs.log.debug("LOG keepAlive done, log stream destroyed successfully");
								}
							};
							if (keepConnectionAlive) {
								setTimeout(keepAlive, 30000);
							}
						} else {
							return res.json(req.soajs.buildResponse(error, data));
						}
					}
				});
			});
			service.get("/kubernetes/item/inspect", function (req, res) {
				bl.kubernetes.item_inspect(req.soajs, req.soajs.inputmaskData, null, (error, data) => {
					return res.json(req.soajs.buildResponse(error, data));
				});
			});
			
			service.get("/kubernetes/item/metrics", function (req, res) {
				bl.kubernetes.metrics.item(req.soajs, req.soajs.inputmaskData, null, (error, data) => {
					return res.json(req.soajs.buildResponse(error, data));
				});
			});
			service.get("/kubernetes/pods/metrics", function (req, res) {
				bl.kubernetes.metrics.pods(req.soajs, req.soajs.inputmaskData, null, (error, data) => {
					return res.json(req.soajs.buildResponse(error, data));
				});
			});
			service.get("/kubernetes/nodes/metrics", function (req, res) {
				bl.kubernetes.metrics.nodes(req.soajs, req.soajs.inputmaskData, null, (error, data) => {
					return res.json(req.soajs.buildResponse(error, data));
				});
			});
			
			//POST methods
			service.post("/cd/token", function (req, res) {
				bl.cdtoken.add_token(req.soajs, req.soajs.inputmaskData, null, (error, data) => {
					return res.json(req.soajs.buildResponse(error, data));
				});
			});
			
			service.post("/kubernetes/plugin", function (req, res) {
				bl.kubernetes.bundle.deploy(req.soajs, req.soajs.inputmaskData, null, (error, data) => {
					let response = req.soajs.buildResponse(error, data);
					res.json(response);
					let doc = {
						"type": "Deployment",
						"section": "Kubernetes",
						"locator": ["Plugin", req.soajs.inputmaskData.plugin],
						"action": "added"
					};
					sdk.ledger(req.soajs, doc, response, () => {
					});
				});
			});
			service.post("/kubernetes/bundle", function (req, res) {
				bl.kubernetes.bundle.deploy(req.soajs, req.soajs.inputmaskData, null, (error, data) => {
					let response = req.soajs.buildResponse(error, data);
					res.json(response);
					let doc = {
						"type": "Deployment",
						"section": "Kubernetes",
						"locator": ["Bundle"],
						"action": "added"
					};
					sdk.ledger(req.soajs, doc, response, () => {
					});
				});
			});
			
			service.post("/kubernetes/workload/:mode", function (req, res) {
				bl.kubernetes.apply(req.soajs, req.soajs.inputmaskData, null, (error, data) => {
					let response = req.soajs.buildResponse(error, data);
					res.json(response);
					let doc = {
						"type": "Deployment",
						"section": "Kubernetes",
						"locator": ["workload", req.soajs.inputmaskData.mode],
						"action": "added"
					};
					sdk.ledger(req.soajs, doc, response, () => {
					});
				});
			});
			service.post("/kubernetes/service/:mode", function (req, res) {
				bl.kubernetes.apply(req.soajs, req.soajs.inputmaskData, null, (error, data) => {
					let response = req.soajs.buildResponse(error, data);
					res.json(response);
					let doc = {
						"type": "Deployment",
						"section": "Kubernetes",
						"locator": ["service", req.soajs.inputmaskData.mode],
						"action": "added"
					};
					sdk.ledger(req.soajs, doc, response, () => {
					});
				});
			});
			service.post("/kubernetes/storage/:mode", function (req, res) {
				bl.kubernetes.apply(req.soajs, req.soajs.inputmaskData, null, (error, data) => {
					let response = req.soajs.buildResponse(error, data);
					res.json(response);
					let doc = {
						"type": "Deployment",
						"section": "Kubernetes",
						"locator": ["storage", req.soajs.inputmaskData.mode],
						"action": "added"
					};
					sdk.ledger(req.soajs, doc, response, () => {
					});
				});
			});
			service.post("/kubernetes/configuration/:mode", function (req, res) {
				bl.kubernetes.apply(req.soajs, req.soajs.inputmaskData, null, (error, data) => {
					let response = req.soajs.buildResponse(error, data);
					res.json(response);
					let doc = {
						"type": "Deployment",
						"section": "Kubernetes",
						"locator": ["configuration", req.soajs.inputmaskData.mode],
						"action": "added"
					};
					sdk.ledger(req.soajs, doc, response, () => {
					});
				});
			});
			service.post("/kubernetes/rbac/:mode", function (req, res) {
				bl.kubernetes.apply(req.soajs, req.soajs.inputmaskData, null, (error, data) => {
					let response = req.soajs.buildResponse(error, data);
					res.json(response);
					let doc = {
						"type": "Deployment",
						"section": "Kubernetes",
						"locator": ["rbac", req.soajs.inputmaskData.mode],
						"action": "added"
					};
					sdk.ledger(req.soajs, doc, response, () => {
					});
				});
			});
			
			service.post("/kubernetes/namespace", function (req, res) {
				bl.kubernetes.create.namespace(req.soajs, req.soajs.inputmaskData, null, (error, data) => {
					return res.json(req.soajs.buildResponse(error, data));
				});
			});
			service.post("/kubernetes/item/hpa", function (req, res) {
				bl.kubernetes.create.hpa(req.soajs, req.soajs.inputmaskData, null, (error, data) => {
					return res.json(req.soajs.buildResponse(error, data));
				});
			});
			service.post("/kubernetes/secret", function (req, res) {
				bl.kubernetes.create.secret(req.soajs, req.soajs.inputmaskData, null, (error, data) => {
					return res.json(req.soajs.buildResponse(error, data));
				});
			});
			service.post("/kubernetes/secret/registry", function (req, res) {
				bl.kubernetes.create.secret(req.soajs, req.soajs.inputmaskData, {"type": "dockercfg"}, (error, data) => {
					return res.json(req.soajs.buildResponse(error, data));
				});
			});
			service.post("/kubernetes/pvc", function (req, res) {
				bl.kubernetes.create.pvc(req.soajs, req.soajs.inputmaskData, null, (error, data) => {
					return res.json(req.soajs.buildResponse(error, data));
				});
			});
			
			service.post("/kubernetes/deploy/native", function (req, res) {
				bl.kubernetes.deploy.native(req.soajs, req.soajs.inputmaskData, null, (error, data) => {
					let response = req.soajs.buildResponse(error, data);
					res.json(response);
					let doc = {
						"type": "Deployment",
						"section": "Kubernetes",
						"locator": ["deploy", "native"],
						"action": "added"
					};
					sdk.ledger(req.soajs, doc, response, () => {
					});
				});
			});
			service.post("/kubernetes/item/deploy/soajs", function (req, res) {
				bl.kubernetes.deploy.item_soajs_deployment_or_daemonset(req.soajs, req.soajs.inputmaskData, null, (error, data) => {
					let response = req.soajs.buildResponse(error, data);
					res.json(response);
					let doc = {
						"type": "Deployment",
						"section": "Kubernetes",
						"locator": ["item", "deploy", "soajs recipe"],
						"action": "added"
					};
					sdk.ledger(req.soajs, doc, response, () => {
					});
				});
			});
			service.post("/kubernetes/item/deploy/native", function (req, res) {
				bl.kubernetes.deploy.item_native_deployment_or_daemonset(req.soajs, req.soajs.inputmaskData, null, (error, data) => {
					let response = req.soajs.buildResponse(error, data);
					res.json(response);
					let doc = {
						"type": "Deployment",
						"section": "Kubernetes",
						"locator": ["item", "deploy", "native recipe"],
						"action": "added"
					};
					sdk.ledger(req.soajs, doc, response, () => {
					});
				});
			});
			service.post("/kubernetes/item/deploy/soajs/cronjob", function (req, res) {
				bl.kubernetes.deploy.item_soajs_conjob(req.soajs, req.soajs.inputmaskData, null, (error, data) => {
					let response = req.soajs.buildResponse(error, data);
					res.json(response);
					let doc = {
						"type": "Deployment",
						"section": "Kubernetes",
						"locator": ["item", "deploy", "soajs recipe", "cronjob"],
						"action": "added"
					};
					sdk.ledger(req.soajs, doc, response, () => {
					});
				});
			});
			service.post("/kubernetes/item/deploy/native/cronjob", function (req, res) {
				bl.kubernetes.deploy.item_native_cronjob(req.soajs, req.soajs.inputmaskData, null, (error, data) => {
					let response = req.soajs.buildResponse(error, data);
					res.json(response);
					let doc = {
						"type": "Deployment",
						"section": "Kubernetes",
						"locator": ["item", "deploy", "native recipe", "cronjob"],
						"action": "added"
					};
					sdk.ledger(req.soajs, doc, response, () => {
					});
				});
			});
			
			service.start(serviceStartCb);
		});
	});
}

function stop(serviceStopCb) {
	service.stop(serviceStopCb);
}

module.exports = {
	"runService": (serviceStartCb) => {
		if (serviceStartCb && typeof serviceStartCb === "function") {
			run(serviceStartCb);
		} else {
			run(null);
		}
	},
	"stopService": (serviceStopCb) => {
		if (serviceStopCb && typeof serviceStopCb === "function") {
			stop(serviceStopCb);
		} else {
			stop(null);
		}
	}
};