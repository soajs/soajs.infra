'use strict';

/**
 * @license
 * Copyright SOAJS All Rights Reserved.
 *
 * Use of this source code is governed by an Apache license that can be
 * found in the LICENSE file at the root of this repository
 */

process.env.SOAJS_SOLO = true;
process.env.SOAJS_SRVIP = "localhost";

const service = require('./_index.js');
service.runService();