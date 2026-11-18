"use strict";

/**
 * The Kubernetes driver on @kubernetes/client-node answers as it did on kubernetes-client 9.0.0
 * (test/data/kubernetes/driver-outputs.json, recorded by kubeRecord.js): the same requests to the
 * API server, the same results and errors. The differences are the intended ones, checked here:
 * - calls kubernetes-client sent without their body (known broken) now send it;
 * - calls kubernetes-client could not make (the metrics API, node put, daemonset patch) are made;
 * - a pod's log with follow answers the current log, with a warning, instead of a stream;
 * - exec through the client (with ca) answers stdout and stderr as UTF-8, without the status
 *   channel, as exec without ca does.
 */

const assert = require("assert");
const run = require("./kubeRun.js").run;
const recorded = require("../../data/kubernetes/driver-outputs.json");
const BODY = {"kind": "Thing", "metadata": {"name": "n1"}, "spec": {"replicas": 2}};
const FOLLOW_WARNING = "Kubernetes driver: following a pod's log is not supported, the current log of [p1] is answered";
const EXEC_OUTPUT = "out é {\"a\":1}\nwarning\n";

const copy = (o) => JSON.parse(JSON.stringify(o));
const last = (list) => list[list.length - 1];

// the old answer, with the body the call now sends in its request and in the API server's echo
function withBody(name, body) {
	return (old, now) => {
		assert.strictEqual(last(old.requests).body, null, name + ": kubernetes-client sent no body");
		const want = copy(old);
		const sent = body || last(now.requests).body;
		assert.ok(sent, name + ": a body is sent");
		last(want.requests).body = sent;
		want.result.body = sent;
		assert.deepStrictEqual(now, want);
	};
}

// a call kubernetes-client could not make: now one request, answered by the API server
function nowMade(method, path, body) {
	return (old, now) => {
		assert.ok(old.error, "kubernetes-client failed");
		assert.strictEqual(old.requests.length, 0);
		assert.strictEqual(now.error, null);
		assert.strictEqual(now.requests.length, 1);
		assert.strictEqual(now.requests[0].method, method);
		assert.strictEqual(now.requests[0].path, path);
		assert.deepStrictEqual(now.requests[0].body, body === undefined ? null : body);
		assert.strictEqual(now.requests[0].authorization, "Bearer test-token");
		assert.strictEqual(now.result.path, path);
	};
}

// follow: the log is asked without follow and answered as text, with a warning
function followed(old, now) {
	assert.strictEqual(old.result, "<stream>");
	const want = copy(old);
	last(want.requests).query.follow = "false";
	want.result = "line one\nline two é\n";
	want.console = [FOLLOW_WARNING];
	assert.deepStrictEqual(now, want);
}

// exec through the client: no GET before the WebSocket (kubernetes-client tried one, answered 400),
// and the output as UTF-8 without the status channel
function execThroughClient(response) {
	return (old, now) => {
		const want = copy(old);
		want.requests = old.requests.filter((r) => !(r.method === "GET" && r.path.endsWith("/exec")));
		want.result = response(old.result);
		assert.deepStrictEqual(now, want);
	};
}

const metrics = "/apis/metrics.k8s.io/v1beta1";
const CHANGED = {
	"client autoscale.post": withBody("autoscale.post", BODY),
	"client autoscale.put": withBody("autoscale.put", BODY),
	"client autoscale.patch": withBody("autoscale.patch", BODY),
	"client scale.put": withBody("scale.put", BODY),
	"driver apply.hpa": withBody("apply.hpa", BODY),
	"driver update.hpa": withBody("update.hpa", BODY),
	"driver create.hpa": withBody("create.hpa"),
	"driver hpa.patch": withBody("hpa.patch"),
	"client node.put": nowMade("PUT", "/api/v1/nodes/n1", BODY),
	"driver patch.daemonset": nowMade("PATCH", "/apis/apps/v1/namespaces/ns1/daemonsets/n1", BODY),
	"client metrics.pods one": nowMade("GET", metrics + "/namespaces/ns1/pods/n1"),
	"client metrics.pods all": nowMade("GET", metrics + "/namespaces/ns1/pods"),
	"client metrics.pods no namespace": nowMade("GET", metrics + "/pods"),
	"client metrics.nodes one": nowMade("GET", metrics + "/nodes/n1"),
	"client metrics.nodes all": nowMade("GET", metrics + "/nodes"),
	"client metrics.nodes no namespace": nowMade("GET", metrics + "/nodes"),
	"driver metrics.pods": nowMade("GET", metrics + "/namespaces/ns1/pods/n1"),
	"driver metrics.nodes": nowMade("GET", metrics + "/nodes/n1"),
	"client pod.getLogs follow": followed,
	"driver pod.log follow": followed,
	"client pod.podExec": execThroughClient(() => EXEC_OUTPUT),
	"driver pod.exec with ca": execThroughClient(() => ({"id": "p1", "response": EXEC_OUTPUT})),
	// the output is now JSON that processResult reads (the status channel made it fail)
	"driver pod.exec with ca processResult": execThroughClient(() => [{"id": "p1", "response": {"a": 1}}, {"id": "p2", "response": {"a": 1}}])
};

// scenarios that did not exist on kubernetes-client
const ADDED = {
	"client daemonset.patch": (now) => {
		assert.strictEqual(now.error, null);
		assert.deepStrictEqual(now.requests.map((r) => [r.method, r.path, r.contentType, r.body]),
			[["PATCH", "/apis/apps/v1/namespaces/ns1/daemonsets/n1", "application/strategic-merge-patch+json", BODY]]);
	}
};

describe("Unit test for: driver - kubernetes", () => {
	let results = null;

	before(function (done) {
		this.timeout(120000);
		run((r) => {
			results = r;
			done();
		});
	});

	it("runs every recorded scenario, and only the added ones besides", () => {
		const extra = Object.keys(results).filter((name) => !recorded[name]);
		assert.deepStrictEqual(extra.sort(), Object.keys(ADDED).sort());
		for (const name of Object.keys(CHANGED)) {
			assert.ok(recorded[name], "recorded: " + name);
		}
	});

	it("answers as on kubernetes-client 9.0.0", () => {
		for (const name of Object.keys(recorded)) {
			if (!CHANGED[name]) {
				assert.deepStrictEqual(results[name], recorded[name], name);
			}
		}
	});

	it("changes only the intended answers", () => {
		for (const name of Object.keys(CHANGED)) {
			CHANGED[name](recorded[name], results[name]);
		}
		for (const name of Object.keys(ADDED)) {
			ADDED[name](results[name]);
		}
	});

	it("needs Node.js 22.19 or later", () => {
		const driver = require("../../../driver/kubernetes");
		assert.strictEqual(driver.supported("22.18.0"), false);
		assert.strictEqual(driver.supported("22.19.0"), true);
		assert.strictEqual(driver.supported("24.0.0"), true);
		assert.strictEqual(driver.supported("20.19.0"), false);
	});
});
