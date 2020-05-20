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
	temp = require("./kubernetes.js");
	temp.localConfig = localConfig;
	BL.kubernetes = temp;
	
	temp = require("./deploy.js");
	temp.localConfig = localConfig;
	temp.handleError = BL.kubernetes.handleError;
	temp.handleConnect = BL.kubernetes.handleConnect;
	BL.kubernetes.deploy = temp;
	
	temp = require("./delete.js");
	temp.localConfig = localConfig;
	temp.handleError = BL.kubernetes.handleError;
	temp.handleConnect = BL.kubernetes.handleConnect;
	BL.kubernetes.delete = temp;
	
	temp = require("./create.js");
	temp.localConfig = localConfig;
	temp.handleError = BL.kubernetes.handleError;
	temp.handleConnect = BL.kubernetes.handleConnect;
	BL.kubernetes.create = temp;
	
	temp = require("./exec.js");
	temp.localConfig = localConfig;
	temp.handleError = BL.kubernetes.handleError;
	temp.handleConnect = BL.kubernetes.handleConnect;
	BL.kubernetes.exec = temp;
	
	temp = require("./redeploy.js");
	temp.localConfig = localConfig;
	temp.handleError = BL.kubernetes.handleError;
	temp.handleConnect = BL.kubernetes.handleConnect;
	BL.kubernetes.redeploy = temp;
	
	return cb(null);
}

module.exports = BL;