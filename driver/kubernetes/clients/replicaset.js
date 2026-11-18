/**
 * @license
 * Copyright SOAJS All Rights Reserved.
 *
 * Use of this source code is governed by an Apache license that can be
 * found in the LICENSE file at the root of this repository
 */

'use strict';

const {request, segment} = require('./request.js');

const replicaset = {
	delete(deployer, opts, cb) {
		request(deployer, "DELETE", "/apis/apps/v1/namespaces/" + segment(opts.namespace) + "/replicasets", {"qs": opts.qs}, cb);
	}
};

module.exports = replicaset;
