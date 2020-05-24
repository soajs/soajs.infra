/**
 * @license
 * Copyright SOAJS All Rights Reserved.
 *
 * Use of this source code is governed by an Apache license that can be
 * found in the LICENSE file at the root of this repository
 */

'use strict';

let model = process.env.SOAJS_SERVICE_MODEL || "mongo";
let BL = {
	init: init
};

function init(service, localConfig, cb) {
	
	// Load cdtoken BL
	let typeModel = __dirname + `/../model/${model}/cdtoken.js`;
	let temp = require(`./cdtoken.js`);
	temp.model = require(typeModel);
	temp.modelObj = new temp.model(service, null, null);
	temp.soajs_service = service;
	temp.localConfig = localConfig;
	BL.cdtoken = temp;
	
	
	// Load all Kubernetes BL
	const driver = require("../driver/kubernetes/index.js");
	temp = require("./kubernetes.js");
	temp.localConfig = localConfig;
	temp.driver = driver;
	BL.kubernetes = temp;
	
	temp = require("./kubernetes/deploy.js");
	temp.localConfig = localConfig;
	temp.driver = driver;
	temp.handleError = BL.kubernetes.handleError;
	temp.handleConnect = BL.kubernetes.handleConnect;
	BL.kubernetes.deploy = temp;
	
	temp = require("./kubernetes/delete.js");
	temp.localConfig = localConfig;
	temp.driver = driver;
	temp.handleError = BL.kubernetes.handleError;
	temp.handleConnect = BL.kubernetes.handleConnect;
	BL.kubernetes.delete = temp;
	
	temp = require("./kubernetes/create.js");
	temp.localConfig = localConfig;
	temp.driver = driver;
	temp.handleError = BL.kubernetes.handleError;
	temp.handleConnect = BL.kubernetes.handleConnect;
	BL.kubernetes.create = temp;
	
	temp = require("./kubernetes/exec.js");
	temp.localConfig = localConfig;
	temp.driver = driver;
	temp.handleError = BL.kubernetes.handleError;
	temp.handleConnect = BL.kubernetes.handleConnect;
	BL.kubernetes.exec = temp;
	BL.driver = driver;
	
	temp = require("./kubernetes/redeploy.js");
	temp.localConfig = localConfig;
	temp.driver = driver;
	temp.handleError = BL.kubernetes.handleError;
	temp.handleConnect = BL.kubernetes.handleConnect;
	BL.kubernetes.redeploy = temp;
	
	temp = require("./kubernetes/get.js");
	temp.localConfig = localConfig;
	temp.driver = driver;
	temp.handleError = BL.kubernetes.handleError;
	temp.handleConnect = BL.kubernetes.handleConnect;
	BL.kubernetes.get = temp;
	
	return cb(null);
}

module.exports = BL;