"use strict";

/**
 * Runs the driver's scenarios (kubeScenarios.js) against the fake API server (kubeFake.js) and
 * gives, for each, {error, result, requests, console}:
 * - error: the callback's error as {message, code, statusCode}, or null;
 * - result: the callback's result ("<stream>" for a stream);
 * - requests: what the server received (the bearer token included);
 * - console: what the driver wrote with console.log or console.warn.
 */

const fs = require("fs");
const net = require("net");
const path = require("path");
const fake = require("./kubeFake.js");
const scenarios = require("./kubeScenarios.js");

const TIMEOUT = 10000;

function errorOf(error) {
	if (!error) {
		return null;
	}
	if (!(error instanceof Error) && typeof error !== "object") {
		return {"value": error};
	}
	// the port of a refused connection changes on every run
	const message = typeof error.message === "string" ? error.message.replace(/^(connect ECONNREFUSED 127\.0\.0\.1:)\d+$/, "$1<port>") : error.message;
	return {"message": message, "code": error.code === undefined ? null : error.code, "statusCode": error.statusCode === undefined ? null : error.statusCode};
}

function resultOf(result) {
	if (result && typeof result.pipe === "function") {
		return "<stream>";
	}
	return result === undefined ? null : JSON.parse(JSON.stringify(result));
}

// a port nothing listens on
function downUrl(cb) {
	const s = net.createServer();
	s.listen(0, "127.0.0.1", () => {
		const port = s.address().port;
		s.close(() => cb("http://127.0.0.1:" + port));
	});
}

function run(cb) {
	const driver = require("../../../driver/kubernetes");
	const otherCa = fs.readFileSync(path.join(__dirname, "../../data/kubernetes/test-other.crt")).toString();
	fake.start((server) => {
		downUrl((down) => {
			const ca = {"requestOptions": {"baseUrl": server.secureUrl, "ca": server.ca}, "authProvider": {"type": null}};
			driver.connect({"url": server.url, "token": scenarios.TOKEN}, (error, client) => {
				if (error) {
					throw error;
				}
				driver.connect({"url": server.url, "token": scenarios.TOKEN, "ca": ca}, (error, caClient) => {
					if (error) {
						throw error;
					}
					const list = scenarios.all();
					const results = {};
					const log = console.log;
					const warn = console.warn;
					let i = 0;
					const next = () => {
						if (i >= list.length) {
							console.log = log;
							console.warn = warn;
							return server.close(() => cb(results));
						}
						const s = list[i++];
						if (results[s.name]) {
							throw new Error("two scenarios named " + s.name);
						}
						const written = [];
						console.log = (...args) => written.push(args.join(" "));
						console.warn = (...args) => written.push(args.join(" "));
						server.seen.length = 0;
						server.respond = s.respond || null;
						const ctx = {"client": s.client === "ca" ? caClient : client, "ca": ca, "fake": server, "otherCa": otherCa, "downUrl": down};
						let done = false;
						let timer = null;
						const finish = (error, result) => {
							if (done) {
								return;
							}
							done = true;
							clearTimeout(timer);
							// let the server log the last requests (WebSocket closes)
							setTimeout(() => {
								results[s.name] = {
									"error": errorOf(error),
									"result": error ? null : resultOf(result),
									"requests": JSON.parse(JSON.stringify(server.seen)),
									"console": written
								};
								next();
							}, 50);
						};
						timer = setTimeout(() => finish({"message": "no answer in " + TIMEOUT + "ms"}), TIMEOUT);
						try {
							s.run(ctx, finish);
						} catch (e) {
							finish({"message": "thrown: " + e.message});
						}
					};
					next();
				});
			});
		});
	});
}

module.exports = {run};
