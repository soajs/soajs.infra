/**
 * @license
 * Copyright SOAJS All Rights Reserved.
 *
 * Use of this source code is governed by an Apache license that can be
 * found in the LICENSE file at the root of this repository
 */

'use strict';


const persistentvolume = {
	
	post(deployer, opts, cb) {
		async function main() {
			return await deployer.api.v1.persistentvolumes.post({body: opts.body});
		}
		
		main().then((result) => {
			return cb(null, result.body);
		}).catch((err) => {
			return cb(err);
		});
	},
	
	put(deployer, opts, cb) {
		async function main() {
			return await deployer.api.v1.persistentvolumes(opts.name).put({body: opts.body});
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
				return await deployer.api.v1.persistentvolumes(opts.name).get({qs: opts.qs});
			} else {
				return await deployer.api.v1.persistentvolumes.get({qs: opts.qs});
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
			return await deployer.api.v1.persistentvolumes(opts.name).delete({qs: opts.qs});
		}
		
		main().then((result) => {
			return cb(null, result.body);
		}).catch((err) => {
			return cb(err);
		});
	}
};

module.exports = persistentvolume;