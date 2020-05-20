'use strict';

/**
 * @license
 * Copyright SOAJS All Rights Reserved.
 *
 * Use of this source code is governed by an Apache license that can be
 * found in the LICENSE file at the root of this repository
 */

/*
process.env.SOAJS_SOLO = true;
process.env.SOAJS_SRVIP = "localhost";
*/
process.env.SOAJS_ENV = "dashboard";
process.env.SOAJS_SRVIP = "127.0.0.1";
process.env.SOAJS_PROFILE = "/opt/demo/soajs.installer/soajs.installer.local/data/soajs_profile.js";
process.env.SOAJS_MONGO_CON_KEEPALIVE = 'true';
process.env.SOAJS_DEPLOY_MANUAL = 1;

const service = require('./_index.js');
service.runService();