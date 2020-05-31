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
	getPods(deployer, opts, cb) {
		async function main() {
			if (opts.name) {
				return await deployer.apis["metrics.k8s.io"].v1beta1.namespace(opts.namespace).pods(opts.name).get();
			} else {
				return await deployer.apis["metrics.k8s.io"].v1beta1.pods.get();
			}
		}
		
		main().then((result) => {
			return cb(null, result.body);
		}).catch((err) => {
			return cb(err);
		});
	},
	getNodes(deployer, opts, cb) {
		async function main() {
			if (opts.name) {
				return await deployer.apis["metrics.k8s.io"].v1beta1.nodes(opts.name).get();
			} else {
				return await deployer.apis["metrics.k8s.io"].v1beta1.nodes.get();
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
