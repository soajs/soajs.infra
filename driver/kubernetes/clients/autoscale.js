/**
 * @license
 * Copyright SOAJS All Rights Reserved.
 *
 * Use of this source code is governed by an Apache license that can be
 * found in the LICENSE file at the root of this repository
 */

'use strict';


const autoscale = {
	/**
	 * autoscale Wrapper
	 */
	get(deployer, opts, cb) {
		async function main() {
			if (opts.name) {
				return await deployer.apis.autoscaling.v2beta2.namespaces(opts.namespace).horizontalpodautoscalers(opts.name).get({qs: opts.qs});
			} else {
				return await deployer.apis.autoscaling.v2beta2.namespaces(opts.namespace).horizontalpodautoscalers.get({qs: opts.qs});
			}
		}
		
		main().then((result) => {
			return cb(null, result.body);
		}).catch((err) => {
			return cb(err);
		});
	},
	post(deployer, opts, cb) {
		async function main() {
			return await deployer.apis.autoscaling.v2beta2.namespaces(opts.namespace).horizontalpodautoscalers.post(opts.body);
		}
		
		main().then((result) => {
			return cb(null, result.body);
		}).catch((err) => {
			return cb(err);
		});
	},
	put(deployer, opts, cb) {
		async function main() {
			return await deployer.apis.autoscaling.v2beta2.namespaces(opts.namespace).horizontalpodautoscalers(opts.name).put(opts.body);
		}
		
		main().then((result) => {
			return cb(null, result.body);
		}).catch((err) => {
			return cb(err);
		});
	},
	delete(deployer, opts, cb) {
		async function main() {
			return await deployer.apis.autoscaling.v2beta2.namespaces(opts.namespace).horizontalpodautoscalers(opts.name).delete();
		}
		
		main().then((result) => {
			return cb(null, result.body);
		}).catch((err) => {
			return cb(err);
		});
	}
};

module.exports = autoscale;
