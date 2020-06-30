/**
 * @license
 * Copyright SOAJS All Rights Reserved.
 *
 * Use of this source code is governed by an Apache license that can be
 * found in the LICENSE file at the root of this repository
 */

'use strict';

const soajsCore = require('soajs');
const request = require('request');
const async = require('async');

let bl = {
	"localConfig": null,
	"driver": null,
	"sdk": {},
	
	"handleError": (soajs, errCode, err) => {
		if (err) {
			soajs.log.error(err.message);
		}
		return ({
			"code": errCode,
			"msg": bl.localConfig.errors[errCode] + ((err && errCode === 702) ? err.message : "")
		});
	},
	
	"awareness": (soajs, inputmaskData, options, cb) => {
		if (!inputmaskData) {
			return cb(bl.handleError(soajs, 400, null));
		}
		soajsCore.core.registry.loadByEnv({envCode: inputmaskData.env}, (err, envRecord) => {
			if (err) {
				return cb(bl.handleError(soajs, 400, err));
			}
			if (!envRecord) {
				return cb(bl.handleError(soajs, 550, null));
			}
			if (!envRecord.deployer && envRecord.deployer.type !== 'manual') {
				return cb(bl.handleError(soajs, 551, null));
			}
			
			let controller = {
				port: envRecord.serviceConfig.ports.controller + envRecord.serviceConfig.ports.maintenanceInc,
				ip: envRecord.awareness.host,
			};
			soajs.log.debug("Checking API Gateway Awareness for Environment:", soajs.inputmaskData.env.toUpperCase());
			// let requestOptions = {
			// 	uri: "http://" + controller.ip + ":" + controller.port + "/awarenessStat?update=true",
			// 	json: true
			// };
			let requestOptions = {
				uri: "http://" + controller.ip + ":" + controller.port + "/awarenessStat",
				json: true
			};
			let apiResponse = {};
			request(requestOptions, (error, response, body) => {
				if (error || !body || !body.result) {
					return cb(bl.handleError(soajs, 552, err));
				}
				
				async.forEachOf(body.data.services, function (service, key, callback) {
					apiResponse[key] = {
						version: service.version,
						healthy: service.awarenessStats && service.awarenessStats[controller.ip]? service.awarenessStats[controller.ip].healthy : false,
					};
					callback();
				}, function () {
					return cb(null, apiResponse);
				});
			});
		});
	},
};

module.exports = bl;