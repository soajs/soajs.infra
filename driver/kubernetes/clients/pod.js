/**
 * @license
 * Copyright SOAJS All Rights Reserved.
 *
 * Use of this source code is governed by an Apache license that can be
 * found in the LICENSE file at the root of this repository
 */

'use strict';

const {request, exec, segment} = require('./request.js');

const base = (opts) => "/api/v1/namespaces/" + segment(opts.namespace) + "/pods";

const pods = {
	get(deployer, opts, cb) {
		request(deployer, "GET", opts.name ? base(opts) + "/" + segment(opts.name) : base(opts), {"qs": opts.qs}, cb);
	},
	post(deployer, opts, cb) {
		request(deployer, "POST", base(opts), {"body": opts.body}, cb);
	},
	// the log as text; following it is not supported: the current log is answered
	getLogs(deployer, opts, cb) {
		let qs = opts.qs;
		if (qs && qs.follow) {
			console.warn("Kubernetes driver: following a pod's log is not supported, the current log of [" + opts.name + "] is answered");
			qs = Object.assign({}, qs, {"follow": false});
		}
		request(deployer, "GET", base(opts) + "/" + segment(opts.name) + "/log", {"qs": qs, "text": true}, cb);
	},
	podExec(deployer, opts, cb) {
		exec(deployer, base(opts) + "/" + segment(opts.name) + "/exec", opts.qs, cb);
	},
	delete(deployer, opts, cb) {
		request(deployer, "DELETE", base(opts), {"qs": opts.qs}, cb);
	}
};

module.exports = pods;
