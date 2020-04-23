'use strict';


const deployments = {
	/**
	 * deployment Wrapper
	 */
	get(deployer, opts, cb) {
		async function main() {
			if (opts.name) {
				return await deployer.apis.apps.v1.namespaces(opts.namespace).deployments(opts.name).get({qs: opts.qs});
			} else {
				return await deployer.apis.apps.v1.namespaces(opts.namespace).deployments.get({qs: opts.qs});
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
			return await deployer.apis.apps.v1.namespaces(opts.namespace).deployments.post({
				body: opts.body,
				qs: opts.qs
			});
		}
		
		main().then((result) => {
			return cb(null, result.body);
		}).catch((err) => {
			return cb(err);
		});
	},
	put(deployer, opts, cb) {
		async function main() {
			return await deployer.apis.apps.v1.namespaces(opts.namespace).deployments(opts.name).put({body: opts.body});
		}
		
		main().then((result) => {
			return cb(null, result.body);
		}).catch((err) => {
			return cb(err);
		});
	},
	patch(deployer, opts, cb) {
		async function main() {
			return await deployer.apis.apps.v1.namespaces(opts.namespace).deployments(opts.name).patch({body: opts.body});
		}
		
		main().then((result) => {
			return cb(null, result.body);
		}).catch((err) => {
			return cb(err);
		});
	},
	delete(deployer, opts, cb) {
		async function main() {
			return await deployer.apis.apps.v1.namespaces(opts.namespace).deployments(opts.name).delete();
		}
		
		main().then((result) => {
			return cb(null, result.body);
		}).catch((err) => {
			return cb(err);
		});
	}
};

module.exports = deployments;
