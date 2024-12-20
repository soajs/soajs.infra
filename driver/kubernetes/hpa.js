/**
 * @license
 * Copyright SOAJS All Rights Reserved.
 *
 * Use of this source code is governed by an Apache license that can be
 * found in the LICENSE file at the root of this repository
 */

'use strict';

const wrapper = require('./wrapper.js');

let buildMetrics = (metrics) => {
	let metricsArray = [];
	for (let i = 0; i < metrics.length; i++) {
		let m = metrics[i];
		
		if (m.type === "Resource") {
			let t = "averageUtilization";
			if (m.target === "AverageValue") {
				t = "averageValue";
			}
			let metricObj = {
				"type": "Resource",
				"resource": {
					"name": m.name,
					"target": {
						"type": m.target,
						[t]: m.percentage
					}
				}
			};
			metricsArray.push(metricObj);
		}
		
		if (m.type === "Pods") {
			let metricObj = {
				"type": "Pods",
				"pods": {
					"name": m.name,
					"target": {
						"type": m.target,
						"averageValue": m.value
					}
				}
			};
			metricsArray.push(metricObj);
		}
		
		if (m.type === "Object") {
			let t = "value";
			if (m.target === "AverageValue") {
				t = "averageValue";
			}
			let metricObj = {
				"type": "Object",
				"object": {
					"name": m.name,
					"describedObject": {
						"apiVersion": "networking.k8s.io/v1",
						"kind": "Ingress",
						"name": "main-route"
					},
					"target": {
						"type": m.target,
						[t]: m.value
					}
				}
			};
			metricsArray.push(metricObj);
		}
	}
	return metricsArray;
};

let bl = {
	"patch": (client, options, cb) => {
		if (!options || !options.name || !options.replica || !options.metrics || !options.namespace) {
			return cb(new Error("HPA patch: options is required with {name, replica, metrics(array) and namespace}"));
		}
		
		let body = {
			"spec": {
				"minReplicas": options.replica.min,
				"maxReplicas": options.replica.max,
				"metrics": []
			}
		};
		body.spec.metrics = buildMetrics(options.metrics);
		wrapper.autoscale.patch(client, {
			namespace: options.namespace,
			body: body,
			name: options.name
		}, (error, item) => {
			if (error) {
				return cb(error);
			}
			return cb(null, item);
		});
	},
	"update": (client, options, cb) => {
		if (!options || !options.name || !options.body || !options.namespace) {
			return cb(new Error("HPA update: options is required with {name, body, and namespace}"));
		}
		wrapper.autoscale.put(client, {
			namespace: options.namespace,
			body: options.body,
			name: options.name
		}, (error, item) => {
			if (error) {
				return cb(error);
			}
			return cb(null, item);
		});
	},
	"apply": (client, options, cb) => {
		if (!options || !options.body || !options.namespace) {
			return cb(new Error("HPA apply: options is required with {body, and namespace}"));
		}
		wrapper.autoscale.post(client, {namespace: options.namespace, body: options.body}, (error, item) => {
			if (error) {
				return cb(error);
			}
			return cb(null, item);
		});
	},
	"create": (client, options, cb) => {
		if (!options || !options.name || !options.replica || !options.metrics || !options.namespace) {
			return cb(new Error("HPA create: options is required with {name, replica, metrics(array) and namespace}"));
		}
		//The name of Deployment will be the same name of autoscaling
		let recipe = {
			"apiVersion": "autoscaling/v1",
			"kind": "HorizontalPodAutoscaler",
			"metadata": {
				"name": options.name,
				"labels": options.labels
			},
			"spec": {
				"minReplicas": options.replica.min,
				"maxReplicas": options.replica.max,
				"scaleTargetRef": {
					"apiVersion": "apps/v1",
					"kind": "Deployment",
					"name": options.name
				},
				"metrics": []
			}
		};
		
		recipe.spec.metrics = buildMetrics(options.metrics);
		// for (let i = 0; i < options.metrics.length; i++) {
		// 	let m = options.metrics[i];
		//
		// 	if (m.type === "Resource") {
		// 		let t = "averageUtilization";
		// 		if (m.target === "AverageValue") {
		// 			t = "averageValue";
		// 		}
		// 		let metricObj = {
		// 			"type": "Resource",
		// 			"resource": {
		// 				"name": m.name,
		// 				"target": {
		// 					"type": m.target,
		// 					[t]: m.percentage
		// 				}
		// 			}
		// 		};
		// 		recipe.spec.metrics.push(metricObj);
		// 	}
		//
		// 	if (m.type === "Pods") {
		// 		let metricObj = {
		// 			"type": "Pods",
		// 			"pods": {
		// 				"name": m.name,
		// 				"target": {
		// 					"type": m.target,
		// 					"averageValue": m.value
		// 				}
		// 			}
		// 		};
		// 		recipe.spec.metrics.push(metricObj);
		// 	}
		//
		// 	if (m.type === "Object") {
		// 		let t = "value";
		// 		if (m.target === "AverageValue") {
		// 			t = "averageValue";
		// 		}
		// 		let metricObj = {
		// 			"type": "Object",
		// 			"object": {
		// 				"name": m.name,
		// 				"describedObject": {
		// 					"apiVersion": "networking.k8s.io/v1",
		// 					"kind": "Ingress",
		// 					"name": "main-route"
		// 				},
		// 				"target": {
		// 					"type": m.target,
		// 					[t]: m.value
		// 				}
		// 			}
		// 		};
		// 		recipe.spec.metrics.push(metricObj);
		// 	}
		// }
		//console.log(JSON.stringify(recipe))
		wrapper.autoscale.post(client, {namespace: options.namespace, body: recipe}, (error, item) => {
			if (error) {
				return cb(error);
			}
			return cb(null, item);
		});
	},
	"delete": (client, options, cb) => {
		if (!options || !options.name) {
			return cb(new Error("HPA delete: options is required with {namespace, and name}"));
		}
		wrapper.autoscale.get(client, {namespace: options.namespace, name: options.name}, (error, service) => {
			if (error) {
				return cb(error);
			}
			if (!service) {
				return cb(new Error("Unable to find the HPA [" + options.name + "] to delete."));
			}
			wrapper.autoscale.delete(client, {namespace: options.namespace, name: options.name}, (error) => {
				if (error) {
					return cb(error);
				}
				return cb(null, service);
			});
		});
	},
	"getOne": (client, options, cb) => {
		if (!options || !options.name || !options.namespace) {
			return cb(new Error("HPA getOne: options is required with {name, and namespace}"));
		}
		wrapper.autoscale.get(client, {namespace: options.namespace, name: options.name}, (error, item) => {
			return cb(error, item);
		});
	},
	"get": (client, options, cb) => {
		if (!options || !options.namespace) {
			return cb(new Error("HPA get: options is required with {namespace}"));
		}
		wrapper.autoscale.get(client, {namespace: options.namespace, qs: options.filter || null}, (error, items) => {
			return cb(error, items);
		});
	}
};
module.exports = bl;
