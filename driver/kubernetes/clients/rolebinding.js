/**
 * @license
 * Copyright SOAJS All Rights Reserved.
 *
 * Use of this source code is governed by an Apache license that can be
 * found in the LICENSE file at the root of this repository
 */

'use strict';


const rolebinding = {
	/**
	 * rolebinding Wrapper
	 */
	post(deployer, opts, cb) {
		async function main() {
			return await deployer.apis["rbac.authorization.k8s.io"].v1alpha1.namespaces(opts.namespace).rolebindings.post({body: opts.body});
		}
		
		main().then((result) => {
			return cb(null, result.body);
		}).catch((err) => {
			return cb(err);
		});
	},
	get(deployer, opts, cb) {
		async function main() {
			return await deployer.apis["rbac.authorization.k8s.io"].v1alpha1.namespaces(opts.namespace).rolebindings(opts.name).get({qs: opts.qs});
		}
		
		main().then((result) => {
			return cb(null, result.body);
		}).catch((err) => {
			return cb(err);
		});
	},
	delete(deployer, opts, cb) {
		async function main() {
			return await deployer.apis["rbac.authorization.k8s.io"].v1alpha1.namespaces(opts.namespace).rolebindings(opts.name).delete();
		}
		
		main().then((result) => {
			return cb(null, result.body);
		}).catch((err) => {
			return cb(err);
		});
	}
};

module.exports = rolebinding;
