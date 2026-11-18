/**
 * @license
 * Copyright SOAJS All Rights Reserved.
 *
 * Use of this source code is governed by an Apache license that can be
 * found in the LICENSE file at the root of this repository
 */

'use strict';

const {request, segment} = require('./request.js');

const base = () => "/apis/rbac.authorization.k8s.io/v1/clusterrolebindings";

const clusterrolebindings = {
	post(deployer, opts, cb) {
		request(deployer, "POST", base(opts), {"body": opts.body}, cb);
	},
	get(deployer, opts, cb) {
		request(deployer, "GET", opts.name ? base(opts) + "/" + segment(opts.name) : base(opts), {"qs": opts.qs}, cb);
	},
	delete(deployer, opts, cb) {
		request(deployer, "DELETE", base(opts) + "/" + segment(opts.name), {}, cb);
	}
};

module.exports = clusterrolebindings;
