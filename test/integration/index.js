/**
 * @license
 * Copyright SOAJS All Rights Reserved.
 *
 * Use of this source code is governed by an Apache license that can be
 * found in the LICENSE file at the root of this repository
 */

"use strict";
const imported = require("../data/import.js");
let helper = require("../helper.js");


describe("starting integration tests", () => {
	
	let controller, service;
	
	before((done) => {
		let rootPath = process.cwd();
		//process.env.SOAJS_IMPORTER_DROPDB = true;
		imported.runPath(rootPath + "/test/data/soajs_profile.js", rootPath + "/test/data/integration/", true, null, (err, msg) => {
			if (err) {
				console.log(err);
			}
			if (msg) {
				console.log(msg);
			}
			console.log("Starting Controller ...");
			controller = require("soajs.controller/_index.js");
			controller.runService(() => {
				console.log("Starting Infra ...");
				service = helper.requireModule('./_index.js');
				service.runService(() => {
					setTimeout(function () {
						done();
					}, 5000);
				});
			});
		});
	});
	
	it("loading tests", (done) => {
		
		require("./cdtoken/add.js");
		require("./cdtoken/add_delete.js");
		require("./cdtoken/add_update_get.js");
		require("./cdtoken/add_getAll.js");
		done();
	});
	
	it("loading use cases", (done) => {
		
		done();
	});
});