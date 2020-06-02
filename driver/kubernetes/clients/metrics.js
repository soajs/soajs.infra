/**
 * @license
 * Copyright SOAJS All Rights Reserved.
 *
 * Use of this source code is governed by an Apache license that can be
 * found in the LICENSE file at the root of this repository
 */

'use strict';


const metrics = {
	/**
	 * metrics Wrapper
	 */
	pods(deployer, opts, cb) {
		async function main() {
			if (opts.namespace && opts.name) {
				return await deployer.apis["metrics.k8s.io"].v1beta1.namespaces(opts.namespace).pods(opts.name).get({qs: opts.qs});
			} else if (opts.namespace) {
				return await deployer.apis["metrics.k8s.io"].v1beta1.namespaces(opts.namespace).pods.get({qs: opts.qs});
			} else {
				return await deployer.apis["metrics.k8s.io"].v1beta1.pods.get({qs: opts.qs});
			}
		}
		
		main().then((result) => {
			return cb(null, result.body);
		}).catch((err) => {
			return cb(err);
		});
	},
	nodes(deployer, opts, cb) {
		async function main() {
			if (opts.name) {
				return await deployer.apis["metrics.k8s.io"].v1beta1.nodes(opts.name).get({qs: opts.qs});
			} else {
				return await deployer.apis["metrics.k8s.io"].v1beta1.nodes.get({qs: opts.qs});
			}
		}
		
		main().then((result) => {
			return cb(null, result.body);
		}).catch((err) => {
			return cb(err);
		});
	}
};

//http://127.0.0.1:8001/apis/metrics.k8s.io/v1beta1/nodes
// http://127.0.0.1:8001/apis/metrics.k8s.io/v1beta1/nodes/<node-name>
// http://127.0.0.1:8001/apis/metrics.k8s.io/v1beta1/pods
// http://127.0.0.1:8001/apis/metrics.k8s.io/v1beta1/namespace/<namespace-name>/pods/<pod-name>

module.exports = metrics;
