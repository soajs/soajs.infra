'use strict';

/**
 * @license
 * Copyright SOAJS All Rights Reserved.
 *
 * Use of this source code is governed by an Apache license that can be
 * found in the LICENSE file at the root of this repository
 */

let bl = {
	"localConfig": null,
	"handleError": null,
	"handleConnect": null,
	"driver": null,
	
	"item": (soajs, inputmaskData, options, cb) => {
		if (!inputmaskData) {
			return cb(bl.handleError(soajs, 400, null));
		}
		bl.handleConnect(soajs, inputmaskData.configuration, (error, client, config) => {
			if (error) {
				return cb(bl.handleError(soajs, 702, error));
			}
			let filter = {labelSelector: 'soajs.service.name=' + inputmaskData.name};
			bl.driver.metrics.pods(client, {
				"namespace": config.namespace,
				"filter": filter
			}, (error, metric) => {
				if (error) {
					return cb(bl.handleError(soajs, 702, error));
				}
				return cb(null, metric);
			});
		});
	},
	"pods": (soajs, inputmaskData, options, cb) => {
		if (!inputmaskData) {
			return cb(bl.handleError(soajs, 400, null));
		}
		bl.handleConnect(soajs, inputmaskData.configuration, (error, client, config) => {
			if (error) {
				return cb(bl.handleError(soajs, 702, error));
			}
			bl.driver.metrics.pods(client, {
				"namespace": config.namespace,
				"filter": inputmaskData.filter || null,
				"name": inputmaskData.name || null
			}, (error, metric) => {
				if (error) {
					return cb(bl.handleError(soajs, 702, error));
				}
				return cb(null, metric);
			});
		});
	},
	"nodes": (soajs, inputmaskData, options, cb) => {
		if (!inputmaskData) {
			return cb(bl.handleError(soajs, 400, null));
		}
		bl.handleConnect(soajs, inputmaskData.configuration, (error, client, config) => {
			if (error) {
				return cb(bl.handleError(soajs, 702, error));
			}
			bl.driver.metrics.nodes(client, {
				"namespace": config.namespace,
				"filter": inputmaskData.filter || null,
				"name": inputmaskData.name || null
			}, (error, metric) => {
				if (error) {
					return cb(bl.handleError(soajs, 702, error));
				}
				return cb(null, metric);
			});
		});
	}
};
module.exports = bl;