"use strict";

/**
 * The Kubernetes driver's scenarios, recorded on kubernetes-client 9 (kubeRecord.js) and checked
 * after the move to @kubernetes/client-node (kubernetes.js): every client method of the wrapper,
 * every function of the driver, and the connect configurations. Each scenario runs against the
 * fake API server (kubeFake.js) and gives its callback (error or result) and the requests the
 * server received.
 *
 * Every value here is a test value.
 */

const path = require("path");

const root = path.join(__dirname, "../../../driver/kubernetes");
const TOKEN = "test-token";
const OTHER_TOKEN = "other-test-token";
const NS = "ns1";
const NAME = "n1";
const QS = {"labelSelector": "app=x"};
const BODY = {"kind": "Thing", "metadata": {"name": NAME}, "spec": {"replicas": 2}};

// a pod as the API server lists it
const pod = (name, extra) => Object.assign({
	"metadata": {"name": name, "namespace": NS, "labels": {"soajs.shell": "shell-sh"}},
	"status": {"phase": "Running", "podIP": "10.0.0.1", "conditions": [{"type": "Ready", "status": "True"}]}
}, extra || {});

// the pods the API server lists and gives
function podsRespond(entry) {
	if (entry.method !== "GET" || !entry.path.startsWith("/api/v1/namespaces/" + NS + "/pods")) {
		return null;
	}
	if (entry.path === "/api/v1/namespaces/" + NS + "/pods") {
		return {"body": {"kind": "PodList", "items": [pod("p1"), pod("p2", {"status": {"phase": "Pending"}})]}};
	}
	const name = entry.path.split("/")[6];
	if (name === "missing" || entry.path.endsWith("/log") || entry.path.endsWith("/exec")) {
		return null;
	}
	return {"body": pod(name)};
}

// the client methods of the wrapper, with every option they read
function clientScenarios() {
	const wrapper = require(path.join(root, "wrapper.js"));
	const list = [];
	for (const client of Object.keys(wrapper).sort()) {
		for (const method of Object.keys(wrapper[client]).sort()) {
			const call = (opts) => (ctx, cb) => wrapper[client][method](ctx.client, opts, cb);
			const base = "client " + client + "." + method;
			if (method === "podExec") {
				list.push({"name": base, "run": call({"namespace": NS, "name": "p1", "qs": {"stdout": 1, "stdin": 1, "stderr": 1, "command": ["/bin/sh", "-c", "echo hi"]}})});
				continue;
			}
			if (method === "getLogs") {
				list.push({"name": base, "run": call({"namespace": NS, "name": "p1", "qs": {"tailLines": 400, "follow": false}})});
				list.push({"name": base + " follow", "run": call({"namespace": NS, "name": "p1", "qs": {"tailLines": 400, "follow": true}}), "follow": true});
				continue;
			}
			if (client === "metrics") {
				list.push({"name": base + " one", "run": call({"namespace": NS, "name": NAME, "qs": QS})});
				list.push({"name": base + " all", "run": call({"namespace": NS, "qs": QS})});
				list.push({"name": base + " no namespace", "run": call({"qs": QS})});
				continue;
			}
			list.push({"name": base, "run": call({"namespace": NS, "name": NAME, "qs": QS, "body": BODY})});
			if (method === "get") {
				list.push({"name": base + " all", "run": call({"namespace": NS, "qs": QS})});
				list.push({"name": base + " all without query", "run": call({"namespace": NS, "qs": null})});
				list.push({"name": base + " missing", "run": call({"namespace": NS, "name": "missing"})});
			}
		}
	}
	return list;
}

// the driver's functions, with options that fit all of them
const DRIVER_OPTIONS = {
	"namespace": NS,
	"name": NAME,
	"body": BODY,
	"filter": QS,
	"content": [{"name": "a", "content": "b"}],
	"labels": {"app": "x"},
	"replica": {"min": 1, "max": 3},
	"metrics": [{"type": "Resource", "name": "cpu", "target": "Utilization", "percentage": 80}],
	"accessModes": ["ReadWriteOnce"],
	"storage": "1Gi",
	"storageClassName": "standard",
	"volumeMode": "Filesystem"
};

function driverScenarios() {
	const driver = require(root);
	const list = [];
	const walk = (node, names) => {
		for (const key of Object.keys(node).sort()) {
			const value = node[key];
			const name = names.concat(key);
			if (name.join(".") === "connect" || name.join(".") === "supported" || name.join(".") === "pod.exec" || name.join(".") === "pod.log") {
				continue;
			}
			if (typeof value === "function") {
				list.push({
					"name": "driver " + name.join("."),
					"respond": podsRespond,
					"run": (ctx, cb) => value(ctx.client, JSON.parse(JSON.stringify(DRIVER_OPTIONS)), cb)
				});
			} else if (value && typeof value === "object") {
				walk(value, name);
			}
		}
	};
	walk(driver, []);
	const content = {"username": "u", "password": "p", "email": "e@example.invalid", "server": "registry.example.invalid"};
	list.push({"name": "driver create.secret_dockercfg with content", "run": (ctx, cb) => driver.create.secret_dockercfg(ctx.client, {"namespace": NS, "name": NAME, "content": content}, cb)});
	list.push({"name": "driver create.secret_dockerconfigjson with content", "run": (ctx, cb) => driver.create.secret_dockerconfigjson(ctx.client, {"namespace": NS, "name": NAME, "content": content}, cb)});
	list.push({"name": "driver get.podIps only ready", "respond": podsRespond, "run": (ctx, cb) => driver.get.podIps(ctx.client, {"namespace": NS, "filter": QS, "onlyReady": true}, cb)});
	list.push({"name": "driver getOne missing", "run": (ctx, cb) => driver.get.one.deployment(ctx.client, {"namespace": NS, "name": "missing"}, cb)});

	// a deployment deleted with cleanup: scaled to 0, deleted, then its autoscaler, if any
	const deploymentRespond = (hpa) => (entry) => {
		if (entry.method === "GET" && entry.path === "/apis/apps/v1/namespaces/" + NS + "/deployments/" + NAME) {
			return {"body": {"kind": "Deployment", "metadata": {"name": NAME}, "spec": {"replicas": 3}}};
		}
		if (entry.method === "GET" && entry.path.startsWith("/apis/autoscaling/v1/namespaces/" + NS + "/horizontalpodautoscalers/")) {
			return hpa ? {"body": {"kind": "HorizontalPodAutoscaler", "metadata": {"name": NAME}}} :
				{"status": 404, "body": {"kind": "Status", "status": "Failure", "message": "not found", "reason": "NotFound", "code": 404}};
		}
		return null;
	};
	list.push({"name": "driver delete.deployment cleanup without autoscaler", "respond": deploymentRespond(false), "run": (ctx, cb) => driver.delete.deployment(ctx.client, {"namespace": NS, "name": NAME, "cleanup": true}, cb)});
	list.push({"name": "driver delete.deployment cleanup with autoscaler", "respond": deploymentRespond(true), "run": (ctx, cb) => driver.delete.deployment(ctx.client, {"namespace": NS, "name": NAME, "cleanup": true}, cb)});

	// a pod's log
	list.push({"name": "driver pod.log", "respond": podsRespond, "run": (ctx, cb) => driver.pod.log(ctx.client, {"namespace": NS, "name": "p1", "lines": 10}, cb)});
	list.push({"name": "driver pod.log follow", "respond": podsRespond, "follow": true, "run": (ctx, cb) => driver.pod.log(ctx.client, {"namespace": NS, "name": "p1", "follow": true}, cb)});
	list.push({"name": "driver pod.log missing", "run": (ctx, cb) => driver.pod.log(ctx.client, {"namespace": NS, "name": "missing"}, cb)});

	// exec: without ca, the driver opens the WebSocket itself to config.url with config.token; with
	// ca, through the client
	const exec = (extra) => (ctx, cb) => driver.pod.exec(ctx.client, Object.assign({
		"namespace": NS, "config": {"url": ctx.fake.secureUrl, "token": TOKEN}, "commands": ["echo hi"]
	}, extra(ctx)), cb);
	list.push({"name": "driver pod.exec one pod", "respond": podsRespond, "run": exec(() => ({"name": "p1"}))});
	list.push({"name": "driver pod.exec by filter", "respond": podsRespond, "run": exec(() => ({"filter": QS}))});
	list.push({"name": "driver pod.exec processResult", "respond": podsRespond, "run": exec(() => ({"name": "p1", "processResult": true}))});
	list.push({"name": "driver pod.exec with ca", "respond": podsRespond, "client": "ca", "run": exec((ctx) => ({"name": "p1", "ca": ctx.ca}))});
	list.push({"name": "driver pod.exec with ca processResult", "respond": podsRespond, "client": "ca", "run": exec((ctx) => ({"filter": QS, "ca": ctx.ca, "processResult": true}))});
	list.push({"name": "driver pod.exec missing", "run": exec(() => ({"name": "missing"}))});
	return list;
}

// connect, then one call with the client it gives
function connectScenarios() {
	const driver = require(root);
	const get = (config) => (ctx, cb) => driver.connect(config(ctx), (error, client) => {
		if (error) {
			return cb(error);
		}
		driver.get.one.namespace(client, {"name": NAME}, cb);
	});
	const ca = (ctx, extra) => ({"requestOptions": Object.assign({"baseUrl": ctx.fake.secureUrl, "ca": ctx.fake.ca}, extra || {}), "authProvider": {"type": null}});
	return [
		{"name": "connect without token", "run": get((ctx) => ({"url": ctx.fake.url}))},
		{"name": "connect without url", "run": get(() => ({"token": TOKEN}))},
		{"name": "connect url and token", "run": get((ctx) => ({"url": ctx.fake.url, "token": TOKEN}))},
		{"name": "connect https url, certificate not verified", "run": get((ctx) => ({"url": ctx.fake.secureUrl, "token": TOKEN}))},
		{"name": "connect ca", "run": get((ctx) => ({"url": ctx.fake.url, "token": TOKEN, "ca": ca(ctx)}))},
		{"name": "connect ca with its own bearer", "run": get((ctx) => ({"url": ctx.fake.url, "token": TOKEN, "ca": ca(ctx, {"auth": {"bearer": OTHER_TOKEN}})}))},
		{"name": "connect ca, another server's certificate", "run": get((ctx) => ({"url": ctx.fake.url, "token": TOKEN, "ca": ca(ctx, {"ca": ctx.otherCa})}))},
		{"name": "connect, server down", "run": get((ctx) => ({"url": ctx.downUrl, "token": TOKEN}))}
	];
}

function all() {
	return clientScenarios().concat(driverScenarios(), connectScenarios());
}

module.exports = {all, TOKEN, OTHER_TOKEN};
