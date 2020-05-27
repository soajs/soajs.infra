/**
 * @license
 * Copyright SOAJS All Rights Reserved.
 *
 * Use of this source code is governed by an Apache license that can be
 * found in the LICENSE file at the root of this repository
 */

'use strict';


const pods = {
	/**
	 * pod Wrapper
	 */
	get(deployer, opts, cb) {
		async function main() {
			if (opts.name) {
				return await deployer.api.v1.namespaces(opts.namespace).pods(opts.name).get({qs: opts.qs});
			} else {
				return await deployer.api.v1.namespaces(opts.namespace).pods.get({qs: opts.qs});
			}
		}
		
		main().then((result) => {
			return cb(null, result.body);
		}).catch((err) => {
			return cb(err);
		});
	},
	getLogs(deployer, opts, cb) {
		async function main() {
			if (opts.qs && opts.qs.follow) {
				return await deployer.api.v1.namespaces(opts.namespace).pods(opts.name).log.getByteStream({qs: opts.qs});
			}
			else {
				return await deployer.api.v1.namespaces(opts.namespace).pods(opts.name).log.get({qs: opts.qs});
			}
		}
		
		main().then((result) => {
			return opts.qs && opts.qs.follow ? cb(null, result) : cb(null, result.body);
		}).catch((err) => {
			return cb(err);
		});
	},
	podExec(deployer, opts, cb) {
		async function main() {
			return await deployer.api.v1.namespaces(opts.namespace).pods(opts.name).exec.get({qs: opts.qs});
		}
		
		main().then((result) => {
			return cb(null, result.body);
		}).catch((err) => {
			return cb(err);
		});
	},
	delete(deployer, opts, cb) {
		async function main() {
			return await deployer.api.v1.namespaces(opts.namespace).pods.delete({qs: opts.qs});
		}
		
		main().then((result) => {
			return cb(null, result.body);
		}).catch((err) => {
			return cb(err);
		});
	},
};

module.exports = pods;
