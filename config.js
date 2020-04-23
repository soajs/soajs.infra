/**
 * @license
 * Copyright SOAJS All Rights Reserved.
 *
 * Use of this source code is governed by an Apache license that can be
 * found in the LICENSE file at the root of this repository
 */

'use strict';


module.exports = {
	type: 'service',
	prerequisites: {
		cpu: '',
		memory: ''
	},
	"serviceVersion": 1,
	"serviceName": "infra",
	"serviceGroup": "SOAJS Core Services",
	"servicePort": 4008,
	"requestTimeout": 30,
	"requestTimeoutRenewal": 5,
	"oauth": true,
	"extKeyRequired": true,
	
	"maintenance": {
		"readiness": "/heartbeat",
		"port": {"type": "maintenance"},
		"commands": [
			{"label": "Reload Registry", "path": "/reloadRegistry", "icon": "fas fa-undo"},
			{"label": "Resource Info", "path": "/resourceInfo", "icon": "fas fa-info"}
		]
	},
	
	//-------------------------------------
	"errors": {
		400: "Business logic required data are missing",
		
		500: "Nothing to Update!",
		501: "Item not found!",
		502: "Item is locked!",
		
		700: "Driver configuration not found",
		701: "Driver not found",
		702: "Driver error: "
		
	},
	"schema": {
		
		"post": {
			
			"/kubernetes/deploy": {
				"_apiInfo": {
					"l": "This API creates the service and the related deployment or daemonset",
					"group": "Kubernetes"
				},
				"namespace": {
					"source": ['body.namespace'],
					"required": true,
					"validation": {
						"type": "string"
					}
				},
				"service": {
					"source": ['body.service'],
					"required": true,
					"validation": {
						"type": "object"
					}
				},
				"deployment": {
					"source": ['body.deployment'],
					"required": true,
					"validation": {
						"type": "object"
					}
				},
				"getIps": {
					"source": ['body.getIps'],
					"required": false,
					"validation": {
						"type": "boolean"
					}
				}
			}
			
		}
	}
};