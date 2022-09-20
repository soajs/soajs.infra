/**
 * @license
 * Copyright SOAJS All Rights Reserved.
 *
 * Use of this source code is governed by an Apache license that can be
 * found in the LICENSE file at the root of this repository
 */

'use strict';


const scale = {
	/**
	 * autoscale Wrapper
	 */
	put(deployer, opts, cb) {
		async function main() {
			return await deployer.apis.apps.v1.namespaces(opts.namespace).deployments(opts.name).scale.put(opts.body);
		}
		
		main().then((result) => {
			return cb(null, result.body);
		}).catch((err) => {
			return cb(err);
		});
	}
};

module.exports = scale;
