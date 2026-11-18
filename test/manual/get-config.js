/**
 * @license
 * Copyright SOAJS All Rights Reserved.
 *
 * Use of this source code is governed by an Apache license that can be
 * found in the LICENSE file at the root of this repository
 */

"use strict";

/* jshint esversion: 11 */

const fs = require("fs");

// prints the "ca" object of the current kubeconfig context: the cluster's url and CA certificate
import('@kubernetes/client-node').then((k8s) => {
	const kubeconfig = new k8s.KubeConfig();
	kubeconfig.loadFromDefault();
	const cluster = kubeconfig.getCurrentCluster();
	let ca = null;
	if (cluster && cluster.caData) {
		ca = Buffer.from(cluster.caData, "base64").toString();
	} else if (cluster && cluster.caFile) {
		ca = fs.readFileSync(cluster.caFile).toString();
	}
	if (cluster && cluster.server && ca) {
		console.log("\n");
		console.log("Kubernetes: " + kubeconfig.getCurrentContext());
		console.log("\n");
		console.log(JSON.stringify({"requestOptions": {"baseUrl": cluster.server, "ca": ca}, "authProvider": {"type": null}}));
		console.log("\n");
		console.log("Copy the above JSON object");
		console.log("\n");
	} else {
		console.log("Contact soajs team. unable to fetch needed config information for kubernetes: " + kubeconfig.getCurrentContext());
	}
});
