/**
 * @license
 * Copyright SOAJS All Rights Reserved.
 *
 * Use of this source code is governed by an Apache license that can be
 * found in the LICENSE file at the root of this repository
 */

'use strict';

const Client = require('kubernetes-client').Client;
const Request = require('kubernetes-client/backends/request');
const swagger = require('./swagger/swagger.json');

const _secret_opaque = require("./secret_opaque.js");
const _secret_dockercfg = require("./secret_dockercfg.js");
const _secret = require("./secret.js");
const _autoscale = require("./autoscale.js");
const _namespace = require("./namespace.js");
const _service = require("./service.js");
const _deployment = require("./deployment.js");
const _daemonset = require("./daemonset.js");
const _cronjob = require("./cronjob.js");
const _node = require("./node.js");
const _pod = require("./pod.js");

let driver = {
	"connect": (config, cb) => {
		if (!config.token) {
			return cb(new Error('Connect error: No valid access token found for the kubernetes cluster'));
		}
		if (!config.url) {
			return cb(new Error('Connect error: No valid url found for the kubernetes cluster'));
		}
		try {
			let client = new Client({
				"backend": new Request({
					"url": config.url,
					"auth": {
						"bearer": config.token
					},
					"insecureSkipTlsVerify": true
				}),
				"spec": swagger
			});
			return cb(null, client);
		} catch (e) {
			return cb(e);
		}
	},
	
	"update": {
		"autoscale": _autoscale.update,
		
		"service": _service.update,
		"deployment": _deployment.update,
		"daemonset": _daemonset.update,
		"cronjob": _cronjob.update
	},
	
	"delete": {
		"autoscale": _autoscale.delete,
		"namespace": _namespace.delete,
		"secret": _secret.delete,
		
		"service": _service.delete,
		"deployment": _deployment.delete,
		"daemonset": _daemonset.delete,
		"cronjob": _cronjob.delete,
		
		"pods": _pod.delete
	},
	
	"create": {
		"autoscale": _autoscale.create,
		"namespace": _namespace.create,
		"service": _service.create,
		"deployment": _deployment.create,
		"daemonset": _daemonset.create,
		"cronjob": _cronjob.create,
		"secret_opaque": _secret_opaque.create,
		"secret_dockercfg": _secret_dockercfg.create
	},
	
	"get": {
		"autoscales": _autoscale.get,
		"namespaces": _namespace.get,
		"services": _service.get,
		"deployments": _deployment.get,
		"daemonsets": _daemonset.get,
		"cronjobs": _cronjob.get,
		"secrets": _secret.get,
		"nodes": _node.get,
		"pods": _pod.get,
		
		"autoscale": _autoscale.getOne,
		"namespace": _namespace.getOne,
		"service": _service.getOne,
		"deployment": _deployment.getOne,
		"daemonset": _daemonset.getOne,
		"cronjob": _cronjob.getOne,
		"secret": _secret.getOne,
		"pod": _pod.get,
		
		"serviceIps": _service.getIps,
		"podIps": _pod.getIps
		
	},
	
	"pod": {
		"exec": _pod.exec,
		"log": _pod.getLog
	},
	
	"deployment": {
		"patch": _deployment.patch
	}
};

module.exports = driver;