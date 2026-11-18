/* eslint no-console:0 */
//
// A client of the Kubernetes driver with the cluster's CA: the "ca" object get-config.js prints
//
const driver = require("../../driver/kubernetes");

const config = {
	"url": "https://kubernetes.docker.internal:6443",
	"token": "<service-account-token>",
	"ca": {
		"requestOptions": {
			"baseUrl": "https://kubernetes.docker.internal:6443",
			"ca": "<cluster CA certificate>"
		},
		"authProvider": {"type": null}
	}
};

module.exports = {
	"driver": driver,
	"connect": (cb) => driver.connect(config, cb)
};
