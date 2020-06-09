/**
 * @license
 * Copyright SOAJS All Rights Reserved.
 *
 * Use of this source code is governed by an Apache license that can be
 * found in the LICENSE file at the root of this repository
 */

"use strict";
const colName = "infra_account";
const core = require("soajs");
const access = require("./access");
const Mongo = core.mongo;

let indexing = {};

function Account(service, options, mongoCore) {
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
			__self.mongoCore = new Mongo(registry.coreDB.provision);
		}
		
		let index = "default";
		if (options && options.index) {
			index = options.index;
		}
		if (indexing && !indexing[index]) {
			indexing[index] = true;
			
			service.log.debug("Account: Indexes for " + index + " Updated!");
		}
	}
}

Account.prototype.add = function (data, cb) {
	let __self = this;
	if (!data || !data.type || !data.configuration || !data.label) {
		let error = new Error("Account: type, configuration, label are required.");
		return cb(error, null);
	}
	
	let options = {};
	let doc = {
		type: data.type,
		label: data.label,
		description: data.description || "",
		ts: new Date().getTime(),
		configuration: data.configuration,
		deployments: []
	};
	let versioning = false;
	
	__self.mongoCore.insertOne(colName, doc, options, versioning, cb);
};

Account.prototype.update_configuration = function (data, cb) {
	let __self = this;
	if (!data || !data.id || !data.configuration) {
		let error = new Error("Account: id, configuration are required.");
		return cb(error, null);
	}
	__self.validateId(data.id, (error, _id) => {
		if (error) {
			return cb(error);
		}
		let condition = {
			_id: _id
		};
		
		let options = {'upsert': true, 'safe': true};
		let fields = {
			'$set': {configuration: data.configuration}
		};
		__self.check_if_can_access(data, condition, {}, (error) => {
			if (error) {
				return cb(error);
			}
			__self.mongoCore.updateOne(colName, condition, fields, options, (err, record) => {
				if (err) {
					return cb(err);
				}
				if (!record || (record && !record.nModified)) {
					let error = new Error("Account: [" + data.id + "] was not updated.");
					return cb(error);
				}
				return cb(null, record.nModified);
			});
		});
	});
};

Account.prototype.update_acl = function (data, cb) {
	let __self = this;
	if (!data || !data.id || !data.type || !data.groups) {
		let error = new Error("Account: id, type and groups are required.");
		return cb(error, null);
	}
	let allowedTypes = ["blacklist", "whitelist"];
	if (!allowedTypes.includes(data.type)) {
		let error = new Error("Account: type can only be one of the following: " + allowedTypes.join(","));
		return cb(error, null);
	}
	if (!Array.isArray(data.groups)) {
		let error = new Error("Account: groups must be an array.");
		return cb(error, null);
	}
	__self.validateId(data.id, (err, _id) => {
		if (err) {
			return cb(err, null);
		}
		
		let condition = {"_id": _id};
		
		let s = {
			'$set': {
				"settings.acl.groups.value": data.groups,
				"settings.acl.groups.type": data.type,
				"settings.acl.groups.config": data.config || {}
			}
		};
		__self.check_if_can_access(data, condition, {}, (error) => {
			if (error) {
				return cb(error);
			}
			__self.mongoCore.updateOne(colName, condition, s, null, (err, record) => {
				if (err) {
					return cb(err);
				}
				if (!record || (record && !record.nModified)) {
					let error = new Error("Account: [" + data.id + "] was not updated.");
					return cb(error);
				}
				return cb(null, record.nModified);
			});
		});
	});
};

Account.prototype.get = function (data, cb) {
	let __self = this;
	if (data.id) {
		__self.validateId(data.id, (error, _id) => {
			if (error) {
				return cb(error);
			}
			let condition = {
				_id: _id
			};
			condition = access.add_acl_2_condition(data, condition);
			let options = {};
			__self.mongoCore.findOne(colName, condition, options, cb);
		});
	} else {
		let __self = this;
		let condition = {
			type: data.type
		};
		condition = access.add_acl_2_condition(data, condition);
		let options = {};
		__self.mongoCore.find(colName, condition, options, cb);
	}
};

Account.prototype.delete = function (data, cb) {
	let __self = this;
	if (!data || !data.id) {
		let error = new Error("Account: id is required.");
		return cb(error, null);
	}
	__self.validateId(data.id, (error, _id) => {
		if (error) {
			return cb(error);
		}
		let condition = {
			_id: _id
		};
		let options = {};
		__self.mongoCore.deleteOne(colName, condition, options, cb);
	});
};

Account.prototype.check_if_can_access = function (data, condition, options, cb) {
	let __self = this;
	__self.mongoCore.findOne(colName, condition, options, (err, item) => {
		if (err) {
			return cb(err, null);
		}
		if (!item) {
			let error = new Error("Account: item not found.");
			return cb(error, null);
		}
		access.check_can_access(data, item, cb);
	});
};

Account.prototype.validateId = function (id, cb) {
	let __self = this;
	
	if (!id) {
		let error = new Error("Registry: must provide an id.");
		return cb(error, null);
	}
	
	try {
		id = __self.mongoCore.ObjectId(id);
		return cb(null, id);
	} catch (e) {
		__self.log(e.message);
		return cb(new Error("A valid ID is required"), null);
	}
};
Account.prototype.closeConnection = function () {
	let __self = this;
	__self.mongoCore.closeDb();
};

module.exports = Account;
