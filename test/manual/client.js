/* eslint no-console:0 */
//
// A client of the Kubernetes driver: the cluster's url and a service account token
//
const driver = require("../../driver/kubernetes");

const config = {
	// local
	"url": "https://kubernetes.docker.internal:6443",
	"token": "<service-account-token>"
};

module.exports = {
	"driver": driver,
	"connect": (cb) => driver.connect(config, cb)
};
