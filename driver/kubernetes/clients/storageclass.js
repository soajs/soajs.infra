/**
 * @license
 * Copyright SOAJS All Rights Reserved.
 *
 * Use of this source code is governed by an Apache license that can be
 * found in the LICENSE file at the root of this repository
 */

'use strict';


const storageclass = {
	
	post(deployer, opts, cb) {
		async function main() {
			return await deployer.apis["storage.k8s.io"].v1beta1.storageclasses.post({body: opts.body});
		}
		
		main().then((result) => {
			return cb(null, result.body);
		}).catch((err) => {
			return cb(err);
		});
	},
	
	put(deployer, opts, cb) {
		async function main() {
			return await deployer.apis["storage.k8s.io"].v1beta1.storageclasses(opts.name).put({body: opts.body});
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
				return await deployer.apis["storage.k8s.io"].v1beta1.storageclasses(opts.name).get({qs: opts.qs});
			} else {
				return await deployer.apis["storage.k8s.io"].v1beta1.storageclasses.get({qs: opts.qs});
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
			return await deployer.apis["storage.k8s.io"].v1beta1.storageclasses(opts.name).delete({qs: opts.qs});
		}
		
		main().then((result) => {
			return cb(null, result.body);
		}).catch((err) => {
			return cb(err);
		});
	}
};

module.exports = storageclass;