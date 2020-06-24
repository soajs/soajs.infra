'use strict';

/**
 * @license
 * Copyright SOAJS All Rights Reserved.
 *
 * Use of this source code is governed by an Apache license that can be
 * found in the LICENSE file at the root of this repository
 */

const soajsCoreLibs = require("soajs.core.libs");

let bl = {
	"localConfig": null,
	"handleError": null,
	"handleConnect": null,
	"driver": null,
	
	"maintenance": (soajs, inputmaskData, options, cb) => {
		if (!inputmaskData || !inputmaskData.operation || !inputmaskData.name) {
			return cb(bl.handleError(soajs, 400, null));
		}
		
		let metaname = inputmaskData.name.metaname;
		if (inputmaskData.name.item) {
			let sanytized_version = soajsCoreLibs.version.sanitize(inputmaskData.name.item.version);
			metaname = inputmaskData.name.item.env + "-" + inputmaskData.name.item.name + "-v" + sanytized_version;
		}
		
		let filter = {labelSelector: 'soajs.service.label=' + metaname};
		bl.handleConnect(soajs, inputmaskData.configuration, (error, client, config) => {
			if (error) {
				return cb(bl.handleError(soajs, 702, error));
			}
			//remove all / from the beginning of a string
			while (inputmaskData.operation.route.charAt(0) === '/') {
				inputmaskData.operation.route = inputmaskData.operation.route.substr(1);
			}
			let commands = [`curl -s -X GET http://localhost:${inputmaskData.maintenancePort}/${inputmaskData.operation.route}`];
			bl.driver.pod.exec(client, {
				"namespace": config.namespace,
				"config": config,
				"filter": filter,
				"commands": commands,
				"processResult": true
			}, (error, response) => {
				if (error) {
					return cb(bl.handleError(soajs, 702, error));
				}
				return cb(null, response);
			});
		});
	},
	"custom": (soajs, inputmaskData, options, cb) => {
		if (!inputmaskData) {
			return cb(bl.handleError(soajs, 400, null));
		}
		bl.handleConnect(soajs, inputmaskData.configuration, (error, client, config) => {
			if (error) {
				return cb(bl.handleError(soajs, 702, error));
			}
			bl.driver.pod.exec(client, {
				"namespace": config.namespace,
				"config": config,
				"filter": inputmaskData.filter || null,
				"name": inputmaskData.name || null,
				"commands": inputmaskData.commands,
				"processResult": inputmaskData.processResult || false
			}, (error, response) => {
				if (error) {
					return cb(bl.handleError(soajs, 702, error));
				}
				return cb(null, response);
			});
		});
	}
};
module.exports = bl;