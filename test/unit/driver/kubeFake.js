"use strict";

/**
 * A fake Kubernetes API server for the driver tests. It answers every REST call with an echo of
 * the request it received (method, path, query, content type, body), a pod's log with text, a
 * pod's exec as the API server does (400 "Upgrade request required", then a WebSocket with
 * base64.channel.k8s.io), and paths with "missing" with a 404 Status. It records each request.
 * A scenario can answer some requests itself with respond(entry) -> {status, body} or null.
 */

const fs = require("fs");
const http = require("http");
const https = require("https");
const path = require("path");
const WebSocket = require("ws");

// a self-signed certificate for 127.0.0.1, for the tests only
const tls = {
	"key": fs.readFileSync(path.join(__dirname, "../../data/kubernetes/test-server.key")),
	"cert": fs.readFileSync(path.join(__dirname, "../../data/kubernetes/test-server.crt"))
};

const EXEC_OUTPUT = [
	["1", "out é {\"a\":1}\n"],
	["2", "warning\n"],
	["3", "{\"metadata\":{},\"status\":\"Success\"}"]
];

function query(url) {
	const out = {};
	for (const [k, v] of url.searchParams) {
		if (out[k] === undefined) {
			out[k] = v;
		} else {
			out[k] = [].concat(out[k], v);
		}
	}
	return out;
}

function start(cb) {
	const seen = [];
	const api = {"seen": seen, "respond": null};
	const handler = (req, res) => {
		const chunks = [];
		req.on("data", (d) => chunks.push(d));
		req.on("end", () => {
			const url = new URL(req.url, "http://localhost");
			const raw = Buffer.concat(chunks).toString();
			let body = raw === "" ? null : raw;
			try {
				body = raw === "" ? null : JSON.parse(raw);
			} catch (e) {
				body = raw;
			}
			const entry = {
				"method": req.method, "path": url.pathname, "query": query(url),
				"contentType": req.headers["content-type"] || null, "authorization": req.headers.authorization || null, "body": body
			};
			seen.push(entry);
			const json = (code, obj) => {
				res.writeHead(code, {"Content-Type": "application/json"});
				res.end(JSON.stringify(obj));
			};
			const answer = api.respond ? api.respond(entry) : null;
			if (answer) {
				return json(answer.status || 200, answer.body);
			}
			if (url.pathname.includes("missing")) {
				return json(404, {"kind": "Status", "apiVersion": "v1", "metadata": {}, "status": "Failure", "message": "the thing \"missing\" was not found", "reason": "NotFound", "code": 404});
			}
			if (url.pathname.endsWith("/log")) {
				res.writeHead(200, {"Content-Type": "text/plain"});
				return res.end("line one\nline two é\n");
			}
			if (url.pathname.endsWith("/exec")) {
				return json(400, {"kind": "Status", "apiVersion": "v1", "metadata": {}, "status": "Failure", "message": "Upgrade request required", "reason": "BadRequest", "code": 400});
			}
			return json(200, {"kind": "Echo", "method": entry.method, "path": entry.path, "query": entry.query, "contentType": entry.contentType, "body": entry.body});
		});
	};
	const upgrade = (wss) => (req, socket, head) => {
		const url = new URL(req.url, "http://localhost");
		seen.push({"method": "WEBSOCKET", "path": url.pathname, "query": query(url), "protocol": req.headers["sec-websocket-protocol"] || null, "authorization": req.headers.authorization || null});
		wss.handleUpgrade(req, socket, head, (ws) => {
			const binary = ws.protocol !== "base64.channel.k8s.io";
			for (const [channel, text] of EXEC_OUTPUT) {
				if (binary) {
					ws.send(Buffer.concat([Buffer.from([Number(channel)]), Buffer.from(text)]));
				} else {
					ws.send(channel + Buffer.from(text).toString("base64"));
				}
			}
			setTimeout(() => ws.close(1000), 20);
		});
	};
	const server = http.createServer(handler);
	const secure = https.createServer(tls, handler);
	const wssOptions = {"noServer": true, "handleProtocols": (protocols) => [...protocols][0]};
	server.on("upgrade", upgrade(new WebSocket.Server(wssOptions)));
	secure.on("upgrade", upgrade(new WebSocket.Server(wssOptions)));
	server.listen(0, "127.0.0.1", () => {
		secure.listen(0, "127.0.0.1", () => {
			Object.assign(api, {
				"url": "http://127.0.0.1:" + server.address().port,
				"secureUrl": "https://127.0.0.1:" + secure.address().port,
				"ca": tls.cert.toString(),
				"close": (done) => {
					server.closeAllConnections();
					secure.closeAllConnections();
					server.close(() => secure.close(done));
				}
			});
			cb(api);
		});
	});
}

module.exports = {start};
