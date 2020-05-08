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
const item_soajs_cronjob = require("./schemas/item_soajs_cronjob.js");
const item_native_cronjob = require("./schemas/item_native_cronjob.js");

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
		505: "Unable to get latest version!",
		
		700: "Driver configuration not found",
		701: "Driver not found",
		702: "Driver error: "
		
	},
	"schema": {
		"commonFields": {
			"configuration": {
				"source": ['body.configuration', 'query.configuration'],
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
			"/kubernetes/item/latestVersion": {
				"_apiInfo": {
					"l": "This API fetches the latest version deployed of an item.",
					"group": "Kubernetes"
				},
				"commonFields": ["configuration"],
				"itemName": {
					"source": ['query.itemName'],
					"required": true,
					"validation": {
						"type": "string"
					}
				}
			},
			"/kubernetes/pod/log": {
				"_apiInfo": {
					"l": "This API fetches the container Logs and capable to follow the log if set to true.",
					"group": "Kubernetes"
				},
				"commonFields": ["configuration"],
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
			},
			
			"/kubernetes/item/inspect": {
				"_apiInfo": {
					"l": "This API returns the item inspect information meshed (service, deployment, cronjob, daemonset, and pod).",
					"group": "Kubernetes"
				},
				"commonFields": ["configuration"],
				"item": {
					"source": ['query.item'],
					"required": true,
					"validation": {
						"type": "object",
						"additionalProperties": false,
						"properties": {
							"env": {
								"required": true,
								"type": "string",
								"pattern": /^(([A-Za-z0-9][-A-Za-z0-9_.]*)?[A-Za-z0-9])?$/,
								"minLength": 1
							},
							"name": {
								"required": true,
								"type": "string",
								"pattern": /^(([A-Za-z0-9][-A-Za-z0-9_.]*)?[A-Za-z0-9])?$/,
								"minLength": 1
							},
							"version": {
								"required": true,
								"type": "string",
								"pattern": /^(([A-Za-z0-9][-A-Za-z0-9_.]*)?[A-Za-z0-9])?$/,
								"minLength": 1
							}
						}
					}
				}
			},
			"/kubernetes/resources/item": {
				"_apiInfo": {
					"l": "This API returns the items resource information (services, deployments, cronjobs, daemonsets, or pod).",
					"group": "Kubernetes"
				},
				"commonFields": ["configuration"],
				"mode": {
					"source": ['query.mode'],
					"required": true,
					"validation": {
						"type": "string",
						"enum": ["Services", "Deployments", "DaemonSets", "CronJobs", "Pods"]
					}
				},
				"filter": {
					"source": ['query.filter'],
					"required": false,
					"validation": {
						"type": "object"
					}
				},
				"limit": {
					"source": ['query.limit'],
					"required": true,
					"validation": {
						"type": "integer",
						"minimum": 100,
						"maximum": 500
					}
				},
				"continue": {
					"source": ['query.continue'],
					"required": false,
					"validation": {
						"type": "string"
					}
				}
			},
			"/kubernetes/resources/other": {
				"_apiInfo": {
					"l": "This API returns the resources information (services, deployments, cronjobs, daemonsets, or pods) excluding deployed items.",
					"group": "Kubernetes"
				},
				"commonFields": ["configuration"],
				"mode": {
					"source": ['query.mode'],
					"required": true,
					"validation": {
						"type": "string",
						"enum": ["Services", "Deployments", "DaemonSets", "CronJobs", "Pods"]
					}
				},
				"filter": {
					"source": ['query.filter'],
					"required": false,
					"validation": {
						"type": "object"
					}
				},
				"limit": {
					"source": ['query.limit'],
					"required": true,
					"validation": {
						"type": "integer",
						"minimum": 100,
						"maximum": 500
					}
				},
				"continue": {
					"source": ['query.continue'],
					"required": false,
					"validation": {
						"type": "string"
					}
				}
			},
			"/kubernetes/resources": {
				"_apiInfo": {
					"l": "This API returns the resources information (nodes, services, deployments, cronjobs, daemonsets, or pods).",
					"group": "Kubernetes"
				},
				"commonFields": ["configuration"],
				"mode": {
					"source": ['query.mode'],
					"required": true,
					"validation": {
						"type": "string",
						"enum": ["Services", "Deployments", "DaemonSets", "CronJobs", "Nodes", "Pods"]
					}
				},
				"filter": {
					"source": ['query.filter'],
					"required": false,
					"validation": {
						"type": "object"
					}
				},
				"limit": {
					"source": ['query.limit'],
					"required": true,
					"validation": {
						"type": "integer",
						"minimum": 100,
						"maximum": 500
					}
				},
				"continue": {
					"source": ['query.continue'],
					"required": false,
					"validation": {
						"type": "string"
					}
				}
			}
		},
		
		"put": {
			"/kubernetes/deployment/scale": {
				"_apiInfo": {
					"l": "This API scales a resource of type deployment only",
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
				"scale": {
					"source": ['body.scale'],
					"required": true,
					"validation": {
						"type": "integer",
						"minimum": 1
						
					}
				}
			},
			
			"/kubernetes/item/redeploy": {
				"_apiInfo": {
					"l": "This API redeploys an item.",
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
				"mode": {
					"source": ['body.mode'],
					"required": true,
					"validation": {
						"type": "string",
						"enum": ["Deployment", "DaemonSet", "CronJob"]
					}
				},
				"serviceName": {
					"source": ['body.serviceName'],
					"required": false,
					"validation": {
						"type": "string"
					}
				},
				"image": {
					"source": ['body.image'],
					"required": false,
					"validation": {
						"type": "object",
						"properties": {
							"name": {
								"required": true,
								"type": "string"
							}
						}
					}
				},
				"src": {
					"source": ['body.src'],
					"required": false,
					"validation": {
						"type": "object",
						"properties": {
							"from": {
								"required": true,
								"type": "object",
								"properties": {
									"oneOf": [
										{
											"tag": {
												"required": true,
												"type": "string",
												"pattern": /^(([A-Za-z0-9][-A-Za-z0-9_.]*)?[A-Za-z0-9])?$/,
												"minLength": 1
											}
										},
										{
											"branch": {
												"required": true,
												"type": "string",
												"pattern": /^(([A-Za-z0-9][-A-Za-z0-9_.]*)?[A-Za-z0-9])?$/,
												"minLength": 1
											},
											"commit": {
												"required": true,
												"type": "string",
												"pattern": /^(([A-Za-z0-9][-A-Za-z0-9_.]*)?[A-Za-z0-9])?$/,
												"minLength": 1
											}
										}
									]
								}
							}
						}
					}
				}
			},
			"/kubernetes/resource/restart": {
				"_apiInfo": {
					"l": "This API restarts a resource of type (Deployment, DaemonSet, or CronJob) and all its pod .",
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
				"mode": {
					"source": ['body.mode'],
					"required": true,
					"validation": {
						"type": "string",
						"enum": ["Deployment", "DaemonSet", "CronJob"]
					}
				}
			},
			
			"/kubernetes/item/maintenance": {
				"_apiInfo": {
					"l": "This API trigger maintenance operation on a deployed item",
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
				"maintenancePort": {
					"source": ['body.maintenancePort'],
					"required": true,
					"validation": {
						"type": "string"
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
			},
			"/kubernetes/pods/exec": {
				"_apiInfo": {
					"l": "This API trigger maintenance operation in all the pods",
					"group": "Kubernetes"
				},
				"commonFields": ["configuration"],
				"filter": {
					"source": ['body.filter'],
					"required": true,
					"validation": {
						"type": "object"
					}
				},
				"commands": {
					"source": ['body.commands'],
					"required": true,
					"validation": {
						"type": "array",
						"minItems": 1,
						"items": {
							"type": "string"
						}
					}
				}
			},
			"/kubernetes/pod/exec": {
				"_apiInfo": {
					"l": "This API trigger maintenance operation in a pod",
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
				"commands": {
					"source": ['body.commands'],
					"required": true,
					"validation": {
						"type": "array",
						"minItems": 1,
						"items": {
							"type": "string"
						}
					}
				}
			}
		},
		
		"post": {
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
			
			"/kubernetes/item/deploy/soajs": {
				"_apiInfo": {
					"l": "This API deploys an item from the catalog using soajs recipe of type deployment or daemonset",
					"group": "Kubernetes"
				},
				"commonFields": ["configuration"],
				"recipe": {
					"source": ['body.recipe'],
					"required": true,
					"validation": item_soajs
				}
			},
			"/kubernetes/item/deploy/soajs/conjob": {
				"_apiInfo": {
					"l": "This API deploys an item from the catalog using soajs recipe of type cronjob",
					"group": "Kubernetes"
				},
				"commonFields": ["configuration"],
				"recipe": {
					"source": ['body.recipe'],
					"required": true,
					"validation": item_soajs_cronjob
				}
			},
			"/kubernetes/item/deploy/native": {
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
			"/kubernetes/item/deploy/native/cronjob": {
				"_apiInfo": {
					"l": "This API deploys an item from the catalog using kubernetes native recipe of type cronjob",
					"group": "Kubernetes"
				},
				"commonFields": ["configuration"],
				"recipe": {
					"source": ['body.recipe'],
					"required": true,
					"validation": item_native_cronjob
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
					"l": "This API deletes an item of type (deployment, cronjob  or deamonset) as well as the related auto scaling including the related service",
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
				"mode": {
					"source": ['body.mode'],
					"required": true,
					"validation": {
						"type": "string",
						"enum": ["Deployment", "DaemonSet", "CronJob"]
					}
				},
				"serviceName": {
					"source": ['body.serviceName'],
					"required": false,
					"validation": {
						"type": "string"
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
			},
			"/kubernetes/resource": {
				"_apiInfo": {
					"l": "This API deletes a resource of type deployment, cronjob  or deamonset as well as the related auto scaling",
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
			}
		}
	}
};