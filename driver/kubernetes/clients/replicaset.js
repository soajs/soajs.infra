/**
 * @license
 * Copyright SOAJS All Rights Reserved.
 *
 * Use of this source code is governed by an Apache license that can be
 * found in the LICENSE file at the root of this repository
 */

'use strict';


const replicaset = {
	/**
	 * replicaset Wrapper
	 */
	delete(deployer, opts, cb) {
		async function main() {
			return await deployer.apis.apps.v1.namespaces(opts.namespace).replicasets.delete({qs: opts.qs});
		}
		
		main().then((result) => {
			return cb(null, result.body);
		}).catch((err) => {
			return cb(err);
		});
	}
	
};

module.exports = replicaset;
