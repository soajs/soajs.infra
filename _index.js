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

const service = new soajs.server.service(config);

function run(serviceStartCb) {
	service.init(() => {
		bl.init(service, config, (error) => {
			if (error) {
				throw new Error('Failed starting service');
			}
			
			//GET methods
			service.get("/kubernetes/pod/log", function (req, res) {
				bl.kubernetes.getLog(req.soajs, req.soajs.inputmaskData, null, (error, data) => {
					if (error) {
						return res.json(req.soajs.buildResponse(error, data));
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
			
			//DELETE methods
			
			service.delete("/kubernetes/namespace", function (req, res) {
				bl.kubernetes.delete.namespace(req.soajs, req.soajs.inputmaskData, null, (error, data) => {
					return res.json(req.soajs.buildResponse(error, data));
				});
			});
			service.delete("/kubernetes/autoscale", function (req, res) {
				bl.kubernetes.delete.autoscale(req.soajs, req.soajs.inputmaskData, null, (error, data) => {
					return res.json(req.soajs.buildResponse(error, data));
				});
			});
			service.delete("/kubernetes/secret", function (req, res) {
				bl.kubernetes.delete.secret(req.soajs, req.soajs.inputmaskData, null, (error, data) => {
					return res.json(req.soajs.buildResponse(error, data));
				});
			});
			service.delete("/kubernetes/item", function (req, res) {
				bl.kubernetes.delete.item(req.soajs, req.soajs.inputmaskData, null, (error, data) => {
					return res.json(req.soajs.buildResponse(error, data));
				});
			});
			service.delete("/kubernetes/service", function (req, res) {
				bl.kubernetes.delete.service(req.soajs, req.soajs.inputmaskData, null, (error, data) => {
					return res.json(req.soajs.buildResponse(error, data));
				});
			});
			
			
			//PUT methods
			
			
			//POST methods
			service.post("/kubernetes/item/maintenance", function (req, res) {
				bl.kubernetes.exec.maintenance(req.soajs, req.soajs.inputmaskData, null, (error, data) => {
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
			
			service.post("/kubernetes/resources/all", function (req, res) {
				bl.kubernetes.getResources_all(req.soajs, req.soajs.inputmaskData, null, (error, data) => {
					return res.json(req.soajs.buildResponse(error, data));
				});
			});
			service.post("/kubernetes/resources/catalog/items", function (req, res) {
				bl.kubernetes.getResources_catalogItems(req.soajs, req.soajs.inputmaskData, null, (error, data) => {
					return res.json(req.soajs.buildResponse(error, data));
				});
			});
			service.post("/kubernetes/resources/other", function (req, res) {
				bl.kubernetes.getResources_other(req.soajs, req.soajs.inputmaskData, null, (error, data) => {
					return res.json(req.soajs.buildResponse(error, data));
				});
			});
			
			service.post("/kubernetes/namespace", function (req, res) {
				bl.kubernetes.create.namespace(req.soajs, req.soajs.inputmaskData, null, (error, data) => {
					return res.json(req.soajs.buildResponse(error, data));
				});
			});
			
			service.post("/kubernetes/deploy/native", function (req, res) {
				bl.kubernetes.deploy.native(req.soajs, req.soajs.inputmaskData, null, (error, data) => {
					return res.json(req.soajs.buildResponse(error, data));
				});
			});
			service.post("/kubernetes/deploy/item/soajs", function (req, res) {
				bl.kubernetes.deploy.item_soajs(req.soajs, req.soajs.inputmaskData, null, (error, data) => {
					return res.json(req.soajs.buildResponse(error, data));
				});
			});
			service.post("/kubernetes/deploy/item/native", function (req, res) {
				bl.kubernetes.deploy.item_native(req.soajs, req.soajs.inputmaskData, null, (error, data) => {
					return res.json(req.soajs.buildResponse(error, data));
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