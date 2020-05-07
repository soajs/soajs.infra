/**
 * @license
 * Copyright SOAJS All Rights Reserved.
 *
 * Use of this source code is governed by an Apache license that can be
 * found in the LICENSE file at the root of this repository
 */

'use strict';

let BL = {
	init: init
};

function init(service, localConfig, cb) {
	
	let temp = require("./kubernetes.js");
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