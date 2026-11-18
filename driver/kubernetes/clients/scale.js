/**
 * @license
 * Copyright SOAJS All Rights Reserved.
 *
 * Use of this source code is governed by an Apache license that can be
 * found in the LICENSE file at the root of this repository
 */

'use strict';

const {request, segment} = require('./request.js');

const scale = {
	put(deployer, opts, cb) {
		request(deployer, "PUT", "/apis/apps/v1/namespaces/" + segment(opts.namespace) + "/deployments/" + segment(opts.name) + "/scale", {"body": opts.body}, cb);
	}
};

module.exports = scale;
