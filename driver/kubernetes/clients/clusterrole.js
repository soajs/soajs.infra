/**
 * @license
 * Copyright SOAJS All Rights Reserved.
 *
 * Use of this source code is governed by an Apache license that can be
 * found in the LICENSE file at the root of this repository
 */

'use strict';


const clusterroles = {
	/**
	 * clusterroles Wrapper
	 */
	post(deployer, opts, cb) {
		async function main() {
			return await deployer.apis["rbac.authorization.k8s.io"].v1.clusterroles.post({body: opts.body});
		}
		
		main().then((result) => {
			return cb(null, result.body);
		}).catch((err) => {
			return cb(err);
		});
	},
	get(deployer, opts, cb) {
		async function main() {
			if (opts.name) {
				return await deployer.apis["rbac.authorization.k8s.io"].v1.clusterroles(opts.name).get({qs: opts.qs});
			} else {
				return await deployer.apis["rbac.authorization.k8s.io"].v1.clusterroles.get({qs: opts.qs});
			}
		}
		
		main().then((result) => {
			return cb(null, result.body);
		}).catch((err) => {
			return cb(err);
		});
	},
	delete(deployer, opts, cb) {
		async function main() {
			return await deployer.apis["rbac.authorization.k8s.io"].v1.clusterroles(opts.name).delete();
		}
		
		main().then((result) => {
			return cb(null, result.body);
		}).catch((err) => {
			return cb(err);
		});
	}
};

module.exports = clusterroles;
