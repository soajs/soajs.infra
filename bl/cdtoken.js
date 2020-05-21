/**
 * @license
 * Copyright SOAJS All Rights Reserved.
 *
 * Use of this source code is governed by an Apache license that can be
 * found in the LICENSE file at the root of this repository
 */

'use strict';
const crypto = require('crypto');

let bl = {
	"modelObj": null,
	"model": null,
	"soajs_service": null,
	"localConfig": null,
	
	"handleError": (soajs, errCode, err) => {
		if (err) {
			soajs.log.error(err.message);
		}
		return ({
			"code": errCode,
			"msg": bl.localConfig.errors[errCode] + ((err && errCode === 602) ? err.message : "")
		});
	},
	"handleUpdateResponse": (response) => {
		if (response) {
			return true;
		} else {
			return false;
		}
	},
	"mp": {
		"getModel": (soajs) => {
			let modelObj = bl.modelObj;
			if (soajs && soajs.tenant && soajs.tenant.type === "client" && soajs.tenant.dbConfig) {
				let options = {
					"dbConfig": soajs.tenant.dbConfig,
					"index": soajs.tenant.id
				};
				modelObj = new bl.model(bl.soajs_service, options, null);
			}
			return modelObj;
		},
		"closeModel": (soajs, modelObj) => {
			if (soajs && soajs.tenant && soajs.tenant.type === "client" && soajs.tenant.dbConfig) {
				modelObj.closeConnection();
			}
		}
	},
	
	"add_token": (soajs, inputmaskData, options, cb) => {
		if (!inputmaskData) {
			return cb(bl.handleError(soajs, 400, null));
		}
		let modelObj = bl.mp.getModel(soajs, options);
		
		modelObj.count(inputmaskData, (err, count) => {
			if (err) {
				bl.mp.closeModel(modelObj);
				return cb(bl.handleError(soajs, 602, err));
			}
			if (count > bl.localConfig.maxAllowed) {
				return cb(bl.handleError(soajs, 540, null));
			}
			//add URAC
			if (soajs && soajs.urac) {
				inputmaskData.urac = {
					"id": soajs.urac._id,
					"username": soajs.urac.username
				};
			}
			// generate token
			inputmaskData.token = crypto.randomBytes(64).toString('hex');
			inputmaskData.status = "active";
			modelObj.add(inputmaskData, (err, response) => {
				bl.mp.closeModel(modelObj);
				if (err) {
					return cb(bl.handleError(soajs, 602, err));
				}
				return cb(null, response);
			});
		});
	},
	"delete_token": (soajs, inputmaskData, options, cb) => {
		if (!inputmaskData) {
			return cb(bl.handleError(soajs, 400, null));
		}
		let modelObj = bl.mp.getModel(soajs, options);
		modelObj.delete(inputmaskData, (err, response) => {
			bl.mp.closeModel(modelObj);
			if (err) {
				return cb(bl.handleError(soajs, 602, err));
			}
			let result = {};
			if (response) {
				result.n = response.result.n;
				result.ok = response.result.ok;
				result.deletedCount = response.deletedCount;
			}
			return cb(null, result);
		});
	},
	"update_token_status": (soajs, inputmaskData, options, cb) => {
		if (!inputmaskData) {
			return cb(bl.handleError(soajs, 400, null));
		}
		let modelObj = bl.mp.getModel(soajs, options);
		modelObj.update(inputmaskData, (err, response) => {
			bl.mp.closeModel(modelObj);
			if (err) {
				return cb(bl.handleError(soajs, 602, err));
			}
			if (!response) {
				return cb(bl.handleError(soajs, 533, null));
			}
			return cb(null, bl.handleUpdateResponse(response));
		});
	},
	"get_token": (soajs, inputmaskData, options, cb) => {
		if (!inputmaskData) {
			return cb(bl.handleError(soajs, 400, null));
		}
		let modelObj = bl.mp.getModel(soajs, options);
		
		modelObj.getOne(inputmaskData, (err, item) => {
			bl.mp.closeModel(modelObj);
			if (err) {
				return cb(bl.handleError(soajs, 602, err));
			}
			return cb(null, item);
		});
	},
	"get_tokens": (soajs, inputmaskData, options, cb) => {
		if (!inputmaskData) {
			return cb(bl.handleError(soajs, 400, null));
		}
		let modelObj = bl.mp.getModel(soajs, options);
		
		modelObj.getAll(inputmaskData, (err, items) => {
			bl.mp.closeModel(modelObj);
			if (err) {
				return cb(bl.handleError(soajs, 602, err));
			}
			return cb(null, items);
		});
	},
};

module.exports = bl;
