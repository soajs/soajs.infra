/**
 * @license
 * Copyright SOAJS All Rights Reserved.
 *
 * Use of this source code is governed by an Apache license that can be
 * found in the LICENSE file at the root of this repository
 */

'use strict';

const {request, segment} = require('./request.js');

const base = (opts) => "/apis/batch/v1/namespaces/" + segment(opts.namespace) + "/cronjobs";

const cronJob = {
	get(deployer, opts, cb) {
		request(deployer, "GET", opts.name ? base(opts) + "/" + segment(opts.name) : base(opts), {"qs": opts.qs}, cb);
	},
	post(deployer, opts, cb) {
		request(deployer, "POST", base(opts), {"body": opts.body}, cb);
	},
	put(deployer, opts, cb) {
		request(deployer, "PUT", base(opts) + "/" + segment(opts.name), {"body": opts.body}, cb);
	},
	delete(deployer, opts, cb) {
		request(deployer, "DELETE", base(opts) + "/" + segment(opts.name), {"qs": opts.qs}, cb);
	}
};

module.exports = cronJob;
