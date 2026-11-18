/**
 * @license
 * Copyright SOAJS All Rights Reserved.
 *
 * Use of this source code is governed by an Apache license that can be
 * found in the LICENSE file at the root of this repository
 */

'use strict';

const {request, segment} = require('./request.js');

// the metrics API (metrics-server) has one version, v1beta1
const base = "/apis/metrics.k8s.io/v1beta1";

const metrics = {
	pods(deployer, opts, cb) {
		let path = base + "/pods";
		if (opts.namespace) {
			path = base + "/namespaces/" + segment(opts.namespace) + "/pods" + (opts.name ? "/" + segment(opts.name) : "");
		}
		request(deployer, "GET", path, {"qs": opts.qs}, cb);
	},
	nodes(deployer, opts, cb) {
		request(deployer, "GET", base + "/nodes" + (opts.name ? "/" + segment(opts.name) : ""), {"qs": opts.qs}, cb);
	}
};

module.exports = metrics;
