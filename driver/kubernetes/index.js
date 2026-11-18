/**
 * @license
 * Copyright SOAJS All Rights Reserved.
 *
 * Use of this source code is governed by an Apache license that can be
 * found in the LICENSE file at the root of this repository
 */

'use strict';

// @kubernetes/client-node is an ES module that needs Node.js 22.19 or later; it is imported on the
// first connect (clients/load.js)
const load = require("./clients/load.js");
const MIN_NODE = [22, 19];
const UNSUPPORTED = "Kubernetes driver needs Node.js " + MIN_NODE.join(".") + " or later";

function supported(version) {
	const [major, minor] = String(version).split(".").map(Number);
	return major > MIN_NODE[0] || (major === MIN_NODE[0] && minor >= MIN_NODE[1]);
}

const NAME = "soajs";

/**
 * The cluster and user of a connection, from the deployer's configuration:
 * - with config.ca (requestOptions and authProvider): the cluster at requestOptions.baseUrl with
 *   its CA, and requestOptions.auth when given, else the token;
 * - otherwise: the cluster at config.url with the token, without verifying its certificate.
 */
function clusterAndUser(config) {
	let cluster = {"name": NAME, "server": config.url, "skipTLSVerify": true};
	let user = {"name": NAME, "token": config.token};
	if (config.ca) {
		const ro = config.ca.requestOptions || {};
		cluster = {"name": NAME, "server": ro.baseUrl, "skipTLSVerify": ro.strictSSL === false || ro.rejectUnauthorized === false};
		if (ro.ca) {
			cluster.caData = Buffer.from(ro.ca).toString("base64");
		}
		if (ro.auth && ro.auth.bearer) {
			user = {"name": NAME, "token": ro.auth.bearer};
		} else if (ro.auth && (ro.auth.user || ro.auth.username)) {
			user = {"name": NAME, "username": ro.auth.user || ro.auth.username, "password": ro.auth.pass || ro.auth.password};
		}
		if (ro.cert) {
			user.certData = Buffer.from(ro.cert).toString("base64");
		}
		if (ro.key) {
			user.keyData = Buffer.from(ro.key).toString("base64");
		}
	}
	return {cluster, user};
}

const _secret_opaque = require("./secret_opaque.js");
const _secret_dockercfg = require("./secret_dockercfg.js");
const _secret_dockerconfigjson = require("./secret_dockerconfigjson.js");
const _secret = require("./secret.js");
const _hpa = require("./hpa.js");
const _namespace = require("./namespace.js");
const _service = require("./service.js");
const _deployment = require("./deployment.js");
const _daemonset = require("./daemonset.js");
const _cronjob = require("./cronjob.js");
const _node = require("./node.js");
const _pod = require("./pod.js");
const _pvc = require("./pvc.js");
const _pv = require("./pv.js");
const _storageclass = require("./storageclass.js");
const _configmap = require("./configmap.js");

const _clusterrole = require("./clusterrole.js");
const _clusterrolebinding = require("./clusterrolebinding.js");
const _rolebinding = require("./rolebinding.js");
const _apiservice = require("./apiservice.js");
const _serviceaccount = require("./serviceaccount.js");

let driver = {
	"connect": (config, cb) => {
		if (!config.token) {
			return cb(new Error('Connect error: No valid access token found for the kubernetes cluster'));
		}
		if (!config.url) {
			return cb(new Error('Connect error: No valid url found for the kubernetes cluster'));
		}
		if (!supported(process.versions.node)) {
			return cb(new Error(UNSUPPORTED));
		}
		const {cluster, user} = clusterAndUser(config);
		if (!cluster.server) {
			return cb(new Error('Connect error: No valid url found for the kubernetes cluster'));
		}
		load().then((k) => {
			const kubeconfig = new k.KubeConfig();
			kubeconfig.loadFromOptions({
				"clusters": [cluster],
				"users": [user],
				"contexts": [{"name": NAME, "cluster": NAME, "user": NAME}],
				"currentContext": NAME
			});
			return {
				"k8s": k,
				"kubeconfig": kubeconfig,
				"server": cluster.server.replace(/\/+$/, ""),
				"http": new k.IsomorphicFetchHttpLibrary()
			};
		}).then((client) => {
			// out of the promise chain: an exception in cb is not turned into a rejection
			process.nextTick(() => cb(null, client));
		}, (e) => {
			process.nextTick(() => cb(e));
		});
	},

	// for the tests
	"supported": supported,

	"metrics": {
		"pods": _pod.metrics,
		"nodes": _node.metrics
	},

	"patch": {
		"deployment": _deployment.patch,
		"daemonset": _daemonset.patch,
	},

	"update": {
		"service": _service.update,
		"deployment": _deployment.update,
		"daemonset": _daemonset.update,
		"cronjob": _cronjob.update,
		"hpa": _hpa.update,
		"pv": _pv.update,
		"pvc": _pvc.update,
		"storageclass": _storageclass.update,
		"configmap": _configmap.update
	},

	"delete": {
		"service": _service.delete,
		"deployment": _deployment.delete,
		"daemonset": _daemonset.delete,
		"cronjob": _cronjob.delete,
		"pv": _pv.delete,
		"storageclass": _storageclass.delete,
		"configmap": _configmap.delete,

		"hpa": _hpa.delete,
		"namespace": _namespace.delete,
		"secret": _secret.delete,
		"pvc": _pvc.delete,

		"pods": _pod.delete,

		"clusterrole": _clusterrole.delete,
		"clusterrolebinding": _clusterrolebinding.delete,
		"rolebinding": _rolebinding.delete,
		"apiservice": _apiservice.delete,
		"serviceaccount": _serviceaccount.delete
	},

	"apply": {
		"service": _service.create,
		"deployment": _deployment.create,
		"daemonset": _daemonset.create,
		"cronjob": _cronjob.create,
		"pod": _pod.apply,
		"hpa": _hpa.apply,
		"secret": _secret.apply,
		"pvc": _pvc.apply,
		"pv": _pv.apply,
		"storageclass": _storageclass.apply,
		"configmap": _configmap.apply,

		"clusterrole": _clusterrole.apply,
		"clusterrolebinding": _clusterrolebinding.apply,
		"rolebinding": _rolebinding.apply,
		"apiservice": _apiservice.apply,
		"serviceaccount": _serviceaccount.apply
	},

	"create": {
		"namespace": _namespace.create,
		"hpa": _hpa.create,
		"secret_opaque": _secret_opaque.create,
		"secret_dockercfg": _secret_dockercfg.create,
		"secret_dockerconfigjson": _secret_dockerconfigjson.create,
		"pvc": _pvc.create,

		"service": _service.create,
		"deployment": _deployment.create,
		"daemonset": _daemonset.create,
		"cronjob": _cronjob.create
	},

	"get": {
		"all": {
			"node": _node.get,
			"service": _service.get,
			"deployment": _deployment.get,
			"daemonset": _daemonset.get,
			"cronjob": _cronjob.get,
			"pod": _pod.get,
			"secret": _secret.get,
			"pvc": _pvc.get,
			"hpa": _hpa.get,
			"pv": _pv.get,
			"storageclass": _storageclass.get,
			"configmap": _configmap.get,

			"namespace": _namespace.get,

			"clusterrole": _clusterrole.get,
			"clusterrolebinding": _clusterrolebinding.get,
			"rolebinding": _rolebinding.get,
			"apiservice": _apiservice.get,
			"serviceaccount": _serviceaccount.get
		},
		"one": {
			"node": _node.getOne,
			"service": _service.getOne,
			"deployment": _deployment.getOne,
			"daemonset": _daemonset.getOne,
			"cronjob": _cronjob.getOne,
			"pod": _pod.getOne,
			"secret": _secret.getOne,
			"pvc": _pvc.getOne,
			"hpa": _hpa.getOne,
			"pv": _pv.getOne,
			"storageclass": _storageclass.getOne,
			"configmap": _configmap.getOne,

			"namespace": _namespace.getOne,

			"clusterrole": _clusterrole.getOne,
			"clusterrolebinding": _clusterrolebinding.getOne,
			"rolebinding": _rolebinding.getOne,
			"apiservice": _apiservice.getOne,
			"serviceaccount": _serviceaccount.getOne
		},
		"serviceIps": _service.getIps,
		"podIps": _pod.getIps
	},

	"pod": {
		"exec": _pod.exec,
		"log": _pod.getLog
	},

	"deployment": {
		"patch": _deployment.patch
	},

	"hpa": {
		"patch": _hpa.patch
	}
};

module.exports = driver;
