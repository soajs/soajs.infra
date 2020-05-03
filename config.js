/**
 * @license
 * Copyright SOAJS All Rights Reserved.
 *
 * Use of this source code is governed by an Apache license that can be
 * found in the LICENSE file at the root of this repository
 */

'use strict';

const item_soajs = require("./schemas/item_soajs.js");
const item_native = require("./schemas/item_native.js");

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
		504: "Unsupported kind only (Deployment, DaemonSet, CronJob) are supported",
		
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
		"get": {
			"/kubernetes/pod/log": {
				"_apiInfo": {
					"l": "Get container Logs",
					"group": "Kubernetes"
				},
				"name": {
					"source": ['query.name'],
					"required": true,
					"validation": {
						"type": "string"
					}
				},
				"follow": {
					"source": ['query.follow'],
					"required": false,
					"validation": {
						"type": "boolean",
						"default": false
					}
				},
				"lines": {
					"source": ['query.lines'],
					"required": false,
					"validation": {
						"type": "integer",
						"default": 400,
						"minimum": 400,
						"maximum": 2000
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
			
			"/kubernetes/namespace": {
				"_apiInfo": {
					"l": "This API creates a namespace",
					"group": "Kubernetes"
				},
				"commonFields": ["configuration"],
				"name": {
					"source": ['body.name'],
					"required": true,
					"validation": {
						"type": "string"
					}
				}
			},
			"/kubernetes/secret": {
				"_apiInfo": {
					"l": "This API creates a secret",
					"group": "Kubernetes"
				},
				"commonFields": ["configuration"],
				"name": {
					"source": ['body.name'],
					"required": true,
					"validation": {
						"type": "string"
					}
				},
				"content": {
					"source": ['body.content'],
					"required": true,
					"validation": {
						"type": "array",
						"minItems": 1,
						"items": {
							"type": "object",
							"properties": {
								"name": {
									"required": true,
									"type": "string"
								},
								"content": {
									"required": true,
									"type": "string"
								}
							}
						}
					}
				}
			},
			"/kubernetes/secret/registry": {
				"_apiInfo": {
					"l": "This API creates a secret for private image registry",
					"group": "Kubernetes"
				},
				"commonFields": ["configuration"],
				"name": {
					"source": ['body.name'],
					"required": true,
					"validation": {
						"type": "string"
					}
				},
				"content": {
					"source": ['body.content'],
					"required": true,
					"validation": {
						"type": "object",
						"properties": {
							"username": {
								"required": true,
								"type": "string"
							},
							"password": {
								"required": true,
								"type": "string"
							},
							"email": {
								"required": true,
								"type": "string"
							},
							"server": {
								"required": true,
								"type": "string"
							}
						}
					}
				}
			},
			
			"/kubernetes/deploy/item/soajs": {
				"_apiInfo": {
					"l": "This API deploys an item from the catalog using soajs recipe",
					"group": "Kubernetes"
				},
				"commonFields": ["configuration"],
				"recipe": {
					"source": ['body.recipe'],
					"required": true,
					"validation": item_soajs
				}
			},
			"/kubernetes/deploy/item/native": {
				"_apiInfo": {
					"l": "This API deploys an item from the catalog using kubernetes native recipe",
					"group": "Kubernetes"
				},
				"commonFields": ["configuration"],
				"recipe": {
					"source": ['body.recipe'],
					"required": true,
					"validation": item_native
				}
			},
			"/kubernetes/deploy/native": {
				"_apiInfo": {
					"l": "This API creates the service and the related deployment, daemonset or cronjob",
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
						"type": "object",
						"properties": {
							"kind": {
								"required": true,
								"type": "string",
								"enum": ["Deployment", "DaemonSet", "CronJob"]
							}
						}
					}
				}
			},
			
			"/kubernetes/item/maintenance": {
				"_apiInfo": {
					"l": "This API trigger maintenance operation on a deployed item",
					"group": "Kubernetes"
				},
				"commonFields": ["configuration"],
				"item": {
					"source": ['body.item'],
					"required": true,
					"validation": {
						"type": "object",
						"additionalProperties": false,
						"properties": {
							"env": {
								"required": true,
								"type": "string"
							},
							"name": {
								"required": true,
								"type": "string"
							},
							"version": {
								"required": true,
								"type": "string"
							},
							"maintenancePort": {
								"required": true,
								"type": "integer"
							}
						}
					}
				},
				"operation": {
					"source": ['body.operation'],
					"required": true,
					"validation": {
						"type": "object",
						"additionalProperties": false,
						"properties": {
							"route": {
								"required": true,
								"type": "string"
							},
							"qs": {
								"required": false,
								"type": "string"
							}
						}
					}
					
				}
			}
		},
		
		"delete": {
			"/kubernetes/namespace": {
				"_apiInfo": {
					"l": "This API deletes a namespace",
					"group": "Kubernetes"
				},
				"commonFields": ["configuration"],
				"name": {
					"source": ['body.name'],
					"required": true,
					"validation": {
						"type": "string"
					}
				}
			},
			"/kubernetes/autoscale": {
				"_apiInfo": {
					"l": "This API deletes an autoscale",
					"group": "Kubernetes"
				},
				"commonFields": ["configuration"],
				"name": {
					"source": ['body.name'],
					"required": true,
					"validation": {
						"type": "string"
					}
				}
			},
			"/kubernetes/secret": {
				"_apiInfo": {
					"l": "This API deletes a secret",
					"group": "Kubernetes"
				},
				"commonFields": ["configuration"],
				"name": {
					"source": ['body.name'],
					"required": true,
					"validation": {
						"type": "string"
					}
				}
			},
			"/kubernetes/item": {
				"_apiInfo": {
					"l": "This API deletes an item including (service, deployment or deamonset and the related auto scaling)",
					"group": "Kubernetes"
				},
				"commonFields": ["configuration"],
				"name": {
					"source": ['body.name'],
					"required": true,
					"validation": {
						"type": "string"
					}
				},
				"serviceName": {
					"source": ['body.serviceName'],
					"required": false,
					"validation": {
						"type": "string"
					}
				},
				"mode": {
					"source": ['body.mode'],
					"required": true,
					"validation": {
						"type": "string",
						"enum": ["Deployment", "DaemonSet", "CronJob"]
					}
				},
				"cleanup": {
					"source": ['body.cleanup'],
					"required": false,
					"validation": {
						"type": "boolean",
						"default": false
					}
				}
			},
			"/kubernetes/service": {
				"_apiInfo": {
					"l": "This API deletes a namespace",
					"group": "Kubernetes"
				},
				"commonFields": ["configuration"],
				"name": {
					"source": ['query.name'],
					"required": true,
					"validation": {
						"type": "string"
					}
				}
			}
		}
	}
};