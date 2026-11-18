/**
 * @license
 * Copyright SOAJS All Rights Reserved.
 *
 * Use of this source code is governed by an Apache license that can be
 * found in the LICENSE file at the root of this repository
 */

'use strict';

const WebSocket = require('ws');

/**
 * The Kubernetes API calls of the clients, with the connection's kubeconfig (authentication and
 * TLS from @kubernetes/client-node). The API server's JSON is answered as it is, so the driver
 * gives the same objects as with kubernetes-client.
 */

// a path segment: a namespace or a name
function segment(value) {
	return encodeURIComponent(String(value));
}

// the query string: an array is repeated (command=a&command=b), null and undefined are left out
function urlOf(deployer, path, qs) {
	const url = new URL(deployer.server + path);
	if (qs) {
		for (const [name, value] of Object.entries(qs)) {
			if (value === undefined || value === null) {
				continue;
			}
			for (const one of [].concat(value)) {
				url.searchParams.append(name, String(one));
			}
		}
	}
	return url;
}

function errorOf(status, body) {
	const error = new Error((body && body.message) || ("Kubernetes API answered " + status));
	error.statusCode = status;
	error.code = status;
	return error;
}

// a network error: its cause says what happened (e.g. connect ECONNREFUSED)
function networkError(err) {
	if (err && !err.statusCode && err.cause && err.cause.message) {
		const error = new Error(err.cause.message);
		error.code = err.cause.code;
		return error;
	}
	return err;
}

/**
 * request calls the API: method, path, and opts {qs, body, contentType, text}. POST, PUT and PATCH
 * send a JSON body (PATCH as a strategic merge patch, as kubernetes-client did). The answer is the
 * JSON body, or the text with opts.text. An error answer gives an Error with the API server's
 * Status message, and the HTTP status as statusCode and code.
 */
function request(deployer, method, path, opts, cb) {
	const k8s = deployer.k8s;
	opts = opts || {};
	async function main() {
		const req = new k8s.RequestContext(urlOf(deployer, path, opts.qs).toString(), k8s.HttpMethod[method]);
		req.setHeaderParam("Accept", opts.text ? "*/*" : "application/json");
		if (method === "POST" || method === "PUT" || method === "PATCH") {
			req.setHeaderParam("Content-Type", opts.contentType || (method === "PATCH" ? "application/strategic-merge-patch+json" : "application/json"));
			if (opts.body !== undefined && opts.body !== null) {
				req.setBody(JSON.stringify(opts.body));
			}
		}
		await deployer.kubeconfig.applySecurityAuthentication(req);
		const response = await deployer.http.send(req).toPromise();
		const text = await response.body.text();
		let body = null;
		try {
			body = text ? JSON.parse(text) : null;
		} catch (e) {
			body = null;
		}
		if (response.httpStatusCode < 200 || response.httpStatusCode >= 300) {
			throw errorOf(response.httpStatusCode, body);
		}
		return opts.text ? text : body;
	}

	main().then((body) => {
		return cb(null, body);
	}).catch((err) => {
		return cb(networkError(err));
	});
}

/**
 * exec runs a command in a pod over a WebSocket (base64.channel.k8s.io), with the connection's
 * kubeconfig. The answer is the command's output, stdout and stderr (channels 1 and 2), as UTF-8
 * text; the status channel is not part of it.
 */
function exec(deployer, path, qs, cb) {
	let done = false;
	const finish = (error, output) => {
		if (!done) {
			done = true;
			cb(error, output);
		}
	};
	const url = urlOf(deployer, path, qs);
	url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
	const options = {};
	deployer.kubeconfig.applyToHTTPSOptions(options).then(() => {
		const chunks = [];
		const ws = new WebSocket(url.toString(), "base64.channel.k8s.io", options);
		ws.on('message', (data) => {
			const message = data.toString();
			const channel = message[0];
			if (channel === "1" || channel === "2") {
				chunks.push(Buffer.from(message.slice(1), 'base64'));
			}
		});
		ws.on('error', (error) => finish(networkError(error)));
		ws.on('close', () => finish(null, Buffer.concat(chunks).toString('utf-8')));
	}).catch((err) => finish(networkError(err)));
}

module.exports = {request, exec, segment};
