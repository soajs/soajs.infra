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
	
	"metrics": {
		"pods": _pod.metrics,
		"nodes": _node.metrics
	},
	
	"update": {
		"service": _service.update,
		"deployment": _deployment.update,
		"daemonset": _daemonset.update,
		"cronjob": _cronjob.update,
		"hpa": _hpa.update,
		"pv": _pv.update,
		"storageclass": _storageclass.update
	},
	
	"delete": {
		"service": _service.delete,
		"deployment": _deployment.delete,
		"daemonset": _daemonset.delete,
		"cronjob": _cronjob.delete,
		"pv": _pv.delete,
		"storageclass": _storageclass.delete,
		
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
	}
};

module.exports = driver;