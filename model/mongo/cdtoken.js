/**
 * @license
 * Copyright SOAJS All Rights Reserved.
 *
 * Use of this source code is governed by an Apache license that can be
 * found in the LICENSE file at the root of this repository
 */

"use strict";
const colName = "settings";
const core = require("soajs");
const Mongo = core.mongo;

let indexing = {};

function Cdtoken(service, options, mongoCore) {
	let __self = this;
	if (__self.log) {
		__self.log = service.log;
	} else {
		__self.log = (log) => {
			console.log(log);
		};
	}
	
	if (mongoCore) {
		__self.mongoCore = mongoCore;
	}
	if (!__self.mongoCore) {
		if (options && options.dbConfig) {
			__self.mongoCore = new Mongo(options.dbConfig);
		} else {
			let registry = service.registry.get();
			if (registry && registry.coreDB && registry.coreDB.provision) {
				__self.mongoCore = new Mongo(registry.coreDB.provision);
			}
		}
	}
	let index = "default";
	if (options && options.index) {
		index = options.index;
	}
	if (indexing && !indexing[index]) {
		indexing[index] = true;
		
		service.log.debug("cdToken: Indexes for " + index + " Updated!");
	}
}

Cdtoken.prototype.add = function (data, cb) {
	let __self = this;
	if (!data || !data.token || !data.label || !data.status || !data.urac) {
		let error = new Error("cdToken: token, label, urac and status are required.");
		return cb(error, null);
	}
	
	let options = {};
	let doc = {
		type: "cdtoken",
		label: data.label,
		token: data.token,
		status: data.status,
		ts: new Date().getTime(),
		urac: data.urac
	};
	let versioning = false;
	
	__self.mongoCore.insertOne(colName, doc, options, versioning, cb);
};

Cdtoken.prototype.count = function (data, cb) {
	let __self = this;
	let condition = {
		type: "cdtoken"
	};
	let options = {};
	__self.mongoCore.countDocuments(colName, condition, options, (err, count) => {
		return cb(err, count);
	});
};

Cdtoken.prototype.update = function (data, cb) {
	let __self = this;
	if (!data || !data.status || !data.token) {
		let error = new Error("cdToken: status and token are required.");
		return cb(error, null);
	}
	let condition = {
		type: "cdtoken",
		token: data.token
	};
	let options = {
		'upsert': false
	};
	let fields = {
		'$set': {status: data.status}
	};
	__self.mongoCore.updateOne(colName, condition, fields, options, (err, record) => {
		let nModified = 0;
		if (!record) {
			nModified = 0;
		} else {
			nModified = record.nModified || 0;
		}
		return cb(err, nModified);
	});
};

Cdtoken.prototype.delete = function (data, cb) {
	let __self = this;
	if (!data || !data.token) {
		let error = new Error("cdToken: token is required.");
		return cb(error, null);
	}
	let condition = {
		type: "cdtoken",
		token: data.token
	};
	let options = {};
	__self.mongoCore.deleteOne(colName, condition, options, cb);
};

Cdtoken.prototype.getOne = function (data, cb) {
	let __self = this;
	if (!data || !data.token) {
		let error = new Error("cdToken: token is required.");
		return cb(error, null);
	}
	let condition = {
		type: "cdtoken",
		token: data.token
	};
	let options = {};
	__self.mongoCore.findOne(colName, condition, options, cb);
};
Cdtoken.prototype.getAll = function (data, cb) {
	let __self = this;
	let condition = {
		type: "cdtoken"
	};
	let options = {};
	__self.mongoCore.find(colName, condition, options, cb);
};

Cdtoken.prototype.closeConnection = function () {
	let __self = this;
	__self.mongoCore.closeDb();
};

module.exports = Cdtoken;