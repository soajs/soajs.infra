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
		503: "Error while getting all resources",
		
		700: "Driver configuration not found",
		701: "Driver not found",
		702: "Driver error: "
		
	},
	"schema": {
		"commonFields": {
			"configuration": {
				"source": ['body.configuration'],
				"required": true,
				"validation": {
					"type": "object",
					"properties": {
						"oneOf": [
							{
								"env": {
									"type": "string",
									"required": true
								}
							},
							{
								"namespace": {
									"type": "string",
									"required": true
								},
								"type": {
									"type": "string",
									"required": true,
									"enum": ["secret"]
								},
								"token": {
									"type": "string",
									"required": true
								},
								"url": {
									"type": "string",
									"required": true
								}
							}
						]
					}
				}
			}
		},
		"post": {
			"/kubernetes/resources/catalog/items": {
				"_apiInfo": {
					"l": "This API returns all the resources information related o catalog items for a given namespace.",
					"group": "Kubernetes"
				},
				"commonFields": ["configuration"]
			},
			"/kubernetes/resources/other": {
				"_apiInfo": {
					"l": "This API returns all the resources information related o catalog items for a given namespace.",
					"group": "Kubernetes"
				},
				"commonFields": ["configuration"]
			},
			"/kubernetes/resources/all": {
				"_apiInfo": {
					"l": "This API returns all the resources information for a given namespace.",
					"group": "Kubernetes"
				},
				"commonFields": ["configuration"]
			},
			"/kubernetes/deploy": {
				"_apiInfo": {
					"l": "This API creates the service and the related deployment or daemonset",
					"group": "Kubernetes"
				},
				"commonFields": ["configuration"],
				"service": {
					"source": ['body.service'],
					"required": false,
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
				}
			}
		}
	}
};