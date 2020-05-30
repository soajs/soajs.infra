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

let localConfig = {
	type: 'service',
	prerequisites: {
		cpu: '',
		memory: ''
	},
	"serviceVersion": 1,
	"serviceName": "infra",
	"serviceGroup": "Console",
	"servicePort": 4008,
	"requestTimeout": 30,
	"requestTimeoutRenewal": 5,
	"oauth": true,
	"extKeyRequired": true,
	"urac": true,
	"maintenance": {
		"readiness": "/heartbeat",
		"port": {"type": "maintenance"},
		"commands": [
			{"label": "Reload Registry", "path": "/reloadRegistry", "icon": "fas fa-undo"},
			{"label": "Resource Info", "path": "/resourceInfo", "icon": "fas fa-info"}
		]
	},
	
	//-------------------------------------
	"maxAllowed": 15
};
localConfig.errors = {
	400: "Business logic required data are missing",
	
	500: "Nothing to Update!",
	501: "Item not found!",
	502: "Item is locked!",
	503: "Error while getting all resources",
	504: "Unsupported Mode.",
	505: "Unable to get latest version!",
	506: "The resource kind must match the specified mode.",
	533: "No changes to update",
	540: "You can no longer add cd Token, the max allowed is: " + localConfig.maxAllowed,
	
	601: "Model not found",
	602: "Model error: ",
	
	700: "Driver configuration not found",
	701: "Driver not found",
	702: "Driver error: "
	
};

localConfig.schema = {
	"commonFields": {
		"configuration": {
			"source": ["body.configuration", "query.configuration"],
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
		"/cd/token": {
			"_apiInfo": {
				"l": "This API returns a deployment auth token.",
				"group": "Token"
			},
			"token": {
				"source": ["query.token"],
				"required": true,
				"validation": {
					"type": "string"
				}
			}
		},
		"/cd/tokens": {
			"_apiInfo": {
				"l": "This API returns all the available deployment auth tokens.",
				"group": "Token"
			}
		},
		
		"/kubernetes/resource/:mode": {
			"_apiInfo": {
				"l": "This API returns the information of a resource of mode (Service, Deployment, DaemonSet, CronJob, Pod, Secret, PVC, HPA, PV, StorageClass).",
				"group": "Kubernetes"
			},
			"commonFields": ["configuration"],
			"name": {
				"source": ["query.name"],
				"required": true,
				"validation": {
					"type": "string"
				}
			},
			"mode": {
				"source": ["params.mode"],
				"required": true,
				"validation": {
					"type": "string",
					"enum": ["Service", "Deployment", "DaemonSet", "CronJob", "Pod", "Secret", "PVC", "HPA", "PV", "StorageClass"]
				}
			}
		},
		"/kubernetes/resources/:mode": {
			"_apiInfo": {
				"l": "This API returns the information of all the resources of mode (Node Service, Deployment, DaemonSet, CronJob, Pod, Secret, PVC, HPA, PV, StorageClass).",
				"group": "Kubernetes"
			},
			"commonFields": ["configuration"],
			"filter": {
				"source": ["query.filter"],
				"required": false,
				"validation": {
					"type": "object",
					"additionalProperties": false,
					"properties": {
						"fieldSelector": {
							"type": "string"
						},
						"includeUninitialized": {
							"type": "boolean"
						},
						"labelSelector": {
							"type": "string"
						}
					}
				}
			},
			"limit": {
				"source": ["query.limit"],
				"required": true,
				"validation": {
					"type": "integer",
					"minimum": 100,
					"maximum": 500
				}
			},
			"continue": {
				"source": ["query.continue"],
				"required": false,
				"validation": {
					"type": "string"
				}
			},
			"mode": {
				"source": ["params.mode"],
				"required": true,
				"validation": {
					"type": "string",
					"enum": ["Node", "Service", "Deployment", "DaemonSet", "CronJob", "Pod", "Secret", "PVC", "HPA", "PV", "StorageClass"]
				}
			},
			"type": {
				"source": ["query.type"],
				"required": false,
				"validation": {
					"type": "string",
					"enum": ["Item", "Other", "All"]
				}
			}
		},
		
		"/kubernetes/item/latestVersion": {
			"_apiInfo": {
				"l": "This API fetches the latest version deployed of an item.",
				"group": "Kubernetes"
			},
			"commonFields": ["configuration"],
			"itemName": {
				"source": ["query.itemName"],
				"required": true,
				"validation": {
					"type": "string"
				}
			}
		},
		"/kubernetes/pod/log": {
			"_apiInfo": {
				"l": "This API fetches the container Logs and capable to tail the log if follow is set to true.",
				"group": "Kubernetes"
			},
			"commonFields": ["configuration"],
			"name": {
				"source": ["query.name"],
				"required": true,
				"validation": {
					"type": "string"
				}
			},
			"follow": {
				"source": ["query.follow"],
				"required": false,
				"validation": {
					"type": "boolean",
					"default": false
				}
			},
			"lines": {
				"source": ["query.lines"],
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
				"l": "This API returns the item information meshed (Service, Deployment, DaemonSet, CronJob, and Pod).",
				"group": "Kubernetes"
			},
			"commonFields": ["configuration"],
			"item": {
				"source": ["query.item"],
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
		}
	},
	
	"put": {
		"/cd/token/status": {
			"_apiInfo": {
				"l": "This API updates the status of a deployment auth token.",
				"group": "Token"
			},
			"token": {
				"source": ["body.token"],
				"required": true,
				"validation": {
					"type": "string"
				}
			},
			"status": {
				"source": ["body.status"],
				"required": true,
				"validation": {
					"type": "string",
					"enum": ["active", "inactive"]
				}
			}
		},
		
		"/kubernetes/deployment/scale": {
			"_apiInfo": {
				"l": "This API scales a resource of type deployment only.",
				"group": "Kubernetes"
			},
			"commonFields": ["configuration"],
			"name": {
				"source": ["body.name"],
				"required": true,
				"validation": {
					"type": "string"
				}
			},
			"scale": {
				"source": ["body.scale"],
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
				"source": ["body.name"],
				"required": true,
				"validation": {
					"type": "string"
				}
			},
			"mode": {
				"source": ["body.mode"],
				"required": true,
				"validation": {
					"type": "string",
					"enum": ["Deployment", "DaemonSet", "CronJob"]
				}
			},
			"serviceName": {
				"source": ["body.serviceName"],
				"required": false,
				"validation": {
					"type": "string"
				}
			},
			"image": {
				"source": ["body.image"],
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
				"source": ["body.src"],
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
				"l": "This API restarts a resource of type (Deployment, DaemonSet, or CronJob) and all its pod.",
				"group": "Kubernetes"
			},
			"commonFields": ["configuration"],
			"name": {
				"source": ["body.name"],
				"required": true,
				"validation": {
					"type": "string"
				}
			},
			"mode": {
				"source": ["body.mode"],
				"required": true,
				"validation": {
					"type": "string",
					"enum": ["Deployment", "DaemonSet", "CronJob"]
				}
			}
		},
		"/kubernetes/item/maintenance": {
			"_apiInfo": {
				"l": "This API trigger maintenance operation on a deployed item.",
				"group": "Kubernetes"
			},
			"commonFields": ["configuration"],
			"name": {
				"source": ["body.name"],
				"required": true,
				"validation": {
					"type": "string"
				}
			},
			"maintenancePort": {
				"source": ["body.maintenancePort"],
				"required": true,
				"validation": {
					"type": "string"
				}
			},
			"operation": {
				"source": ["body.operation"],
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
				"l": "This API triggers maintenance operation in all the pods.",
				"group": "Kubernetes"
			},
			"commonFields": ["configuration"],
			"filter": {
				"source": ["body.filter"],
				"required": true,
				"validation": {
					"type": "object"
				}
			},
			"commands": {
				"source": ["body.commands"],
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
				"l": "This API triggers maintenance operation in a pod.",
				"group": "Kubernetes"
			},
			"commonFields": ["configuration"],
			"name": {
				"source": ["body.name"],
				"required": true,
				"validation": {
					"type": "string"
				}
			},
			"commands": {
				"source": ["body.commands"],
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
		"/kubernetes/resource/:mode": {
			"_apiInfo": {
				"l": "This API updates a resource of mode (Service, Deployment, DaemonSet, CronJob, HPA, PV, StorageClass).",
				"group": "Kubernetes"
			},
			"commonFields": ["configuration"],
			"mode": {
				"source": ["params.mode"],
				"required": true,
				"validation": {
					"type": "string",
					"enum": ["Service", "Deployment", "DaemonSet", "CronJob", "HPA", "PV", "StorageClass"]
				}
			},
			"body": {
				"source": ["body.body"],
				"required": true,
				"validation": {
					"type": "object",
					"properties": {
						"kind": {
							"required": true,
							"type": "string",
							"enum": ["Service", "Deployment", "DaemonSet", "CronJob", "HorizontalPodAutoscaler", "PersistentVolume", "StorageClass"]
						},
						"metadata": {
							"required": true,
							"type": "object",
							"properties": {
								"name": {
									"required": true,
									"type": "string"
								}
							}
						}
					}
				}
			}
		}
	},
	
	"post": {
		"/cd/token": {
			"_apiInfo": {
				"l": "This API adds a deployment auth token.",
				"group": "Token"
			},
			"label": {
				"source": ["body.label"],
				"required": true,
				"validation": {
					"type": "string"
				}
			}
		},
		
		"/kubernetes/resource/:mode": {
			"_apiInfo": {
				"l": "This API creates a resource of mode (Service, Deployment, DaemonSet, CronJob, HPA, PVC, Secret, PV, StorageClass).",
				"group": "Kubernetes"
			},
			"commonFields": ["configuration"],
			"mode": {
				"source": ["params.mode"],
				"required": true,
				"validation": {
					"type": "string",
					"enum": ["Service", "Deployment", "DaemonSet", "CronJob", "HPA", "PVC", "Secret", "PV", "StorageClass"]
				}
			},
			"body": {
				"source": ["body.body"],
				"required": true,
				"validation": {
					"type": "object",
					"properties": {
						"kind": {
							"required": true,
							"type": "string",
							"enum": ["Service", "Deployment", "DaemonSet", "CronJob", "HorizontalPodAutoscaler", "PersistentVolumeClaim", "Secret", "PersistentVolume", "StorageClass"]
						}
					}
				}
			}
		},
		
		"/kubernetes/namespace": {
			"_apiInfo": {
				"l": "This API creates a namespace.",
				"group": "Kubernetes"
			},
			"commonFields": ["configuration"],
			"name": {
				"source": ["body.name"],
				"required": true,
				"validation": {
					"type": "string"
				}
			}
		},
		"/kubernetes/hpa": {
			"_apiInfo": {
				"l": "This API creates an HPA.",
				"group": "Kubernetes"
			},
			"commonFields": ["configuration"],
			"name": {
				"source": ["body.name"],
				"required": true,
				"validation": {
					"type": "string"
				}
			},
			"replica": {
				"source": ["body.replica"],
				"required": true,
				"validation": {
					"type": "object",
					"properties": {
						"min": {
							"required": true,
							"type": "integer",
							"minimum": 1
							
						},
						"max": {
							"required": true,
							"type": "integer",
							"minimum": 1
						}
					}
				}
			},
			"metrics": {
				"source": ["body.metrics"],
				"required": true,
				"validation": {
					"type": "array",
					"minItems": 1,
					"items": {
						"anyOf": [{
							"type": "object",
							"additionalProperties": false,
							"properties": {
								"type": {
									"required": true,
									"type": "string",
									"enum": ["Resource"]
								},
								"name": {
									"required": true,
									"type": "string",
									"enum": ["cpu", "memory"]
								},
								"target": {
									"required": true,
									"type": "string",
									"enum": ["AverageValue", "Utilization"]
								},
								"percentage": {
									"required": true,
									"type": "integer",
									"minimum": 1,
									"maximum": 100
								}
							}
						},
							{
								"type": "object",
								"additionalProperties": false,
								"properties": {
									"type": {
										"required": true,
										"type": "string",
										"enum": ["Pods"]
									},
									"name": {
										"required": true,
										"type": "string",
										"enum": ["packets-per-second"]
									},
									"target": {
										"required": true,
										"type": "string",
										"enum": ["AverageValue"]
									},
									"value": {
										"required": true,
										"type": "string"
									}
								}
							},
							{
								"type": "object",
								"additionalProperties": false,
								"properties": {
									"type": {
										"required": true,
										"type": "string",
										"enum": ["Object"]
									},
									"name": {
										"required": true,
										"type": "string",
										"enum": ["requests-per-second"]
									},
									"target": {
										"required": true,
										"type": "string",
										"enum": ["AverageValue", "Value"]
									},
									"value": {
										"required": true,
										"type": "string"
									}
								}
							}
						]
					}
				}
			}
		},
		"/kubernetes/secret": {
			"_apiInfo": {
				"l": "This API creates a secret.",
				"group": "Kubernetes"
			},
			"commonFields": ["configuration"],
			"name": {
				"source": ["body.name"],
				"required": true,
				"validation": {
					"type": "string"
				}
			},
			"content": {
				"source": ["body.content"],
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
				"l": "This API creates a secret for private image registry.",
				"group": "Kubernetes"
			},
			"commonFields": ["configuration"],
			"name": {
				"source": ["body.name"],
				"required": true,
				"validation": {
					"type": "string"
				}
			},
			"content": {
				"source": ["body.content"],
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
		"/kubernetes/pvc": {
			"_apiInfo": {
				"l": "This API creates a PVC.",
				"group": "Kubernetes"
			},
			"commonFields": ["configuration"],
			"name": {
				"source": ["body.name"],
				"required": true,
				"validation": {
					"type": "string"
				}
			},
			"accessModes": {
				"source": ["body.accessModes"],
				"required": true,
				"validation": {
					"type": "array",
					"minItems": 1,
					"uniqueItems": true,
					'items': {
						'type': "string",
						'enum': ["ReadWriteOnce", "ReadOnlyMany", "ReadWriteMany"]
					}
				}
			},
			"storage": {
				"source": ["body.storage"],
				"required": false,
				"validation": {
					"type": "string"
				}
			},
			"storageClassName": {
				"source": ["body.storageClassName"],
				"required": false,
				"validation": {
					"type": "string"
				}
			},
			"volumeMode": {
				"source": ["body.volumeMode"],
				"required": false,
				"validation": {
					"type": "string",
					"enum": ["Filesystem", "Block"]
				}
			}
		},
		"/kubernetes/item/deploy/soajs": {
			"_apiInfo": {
				"l": "This API deploys an item from the catalog using soajs recipe of type Deployment or DaemonSet.",
				"group": "Kubernetes"
			},
			"commonFields": ["configuration"],
			"recipe": {
				"source": ["body.recipe"],
				"required": true,
				"validation": item_soajs
			}
		},
		"/kubernetes/item/deploy/soajs/conjob": {
			"_apiInfo": {
				"l": "This API deploys an item from the catalog using soajs recipe of type CronJob.",
				"group": "Kubernetes"
			},
			"commonFields": ["configuration"],
			"recipe": {
				"source": ["body.recipe"],
				"required": true,
				"validation": item_soajs_cronjob
			}
		},
		"/kubernetes/item/deploy/native": {
			"_apiInfo": {
				"l": "This API deploys an item from the catalog using kubernetes native recipe of type Deployment or DaemonSet.",
				"group": "Kubernetes"
			},
			"commonFields": ["configuration"],
			"recipe": {
				"source": ["body.recipe"],
				"required": true,
				"validation": item_native
			}
		},
		"/kubernetes/item/deploy/native/cronjob": {
			"_apiInfo": {
				"l": "This API deploys an item from the catalog using kubernetes native recipe of type CronJob.",
				"group": "Kubernetes"
			},
			"commonFields": ["configuration"],
			"recipe": {
				"source": ["body.recipe"],
				"required": true,
				"validation": item_native_cronjob
			}
		},
		"/kubernetes/deploy/native": {
			"_apiInfo": {
				"l": "This API creates the service and the related Deployment, DaemonSet or CronJob.",
				"group": "Kubernetes"
			},
			"commonFields": ["configuration"],
			"service": {
				"source": ["body.service"],
				"required": false,
				"validation": {
					"type": "object"
				}
			},
			"deployment": {
				"source": ["body.deployment"],
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
		"/cd/token": {
			"_apiInfo": {
				"l": "This API deletes a deployment auth token.",
				"group": "Token"
			},
			"token": {
				"source": ["body.token"],
				"required": true,
				"validation": {
					"type": "string"
				}
			}
		},
		
		"/kubernetes/resource/:mode": {
			"_apiInfo": {
				"l": "This API deletes a resource of type (Service, Deployment, DaemonSet, CronJob, HPA) as well as the related HPA of a deployment.",
				"group": "Kubernetes"
			},
			"commonFields": ["configuration"],
			"name": {
				"source": ["query.name"],
				"required": true,
				"validation": {
					"type": "string"
				}
			},
			"mode": {
				"source": ["params.mode"],
				"required": true,
				"validation": {
					"type": "string",
					"enum": ["Service", "Deployment", "DaemonSet", "CronJob", "HPA"]
				}
			}
		},
		
		"/kubernetes/pods": {
			"_apiInfo": {
				"l": "This API deletes pods.",
				"group": "Kubernetes"
			},
			"commonFields": ["configuration"],
			"filter": {
				"source": ["body.filter"],
				"required": true,
				"validation": {
					"type": "object",
					"additionalProperties": false,
					"properties": {
						"fieldSelector": {
							"type": "string"
						},
						"includeUninitialized": {
							"type": "boolean"
						},
						"labelSelector": {
							"type": "string"
						}
					}
				}
			}
		},
		
		"/kubernetes/pv": {
			"_apiInfo": {
				"l": "This API deletes a PV.",
				"group": "Kubernetes"
			},
			"commonFields": ["configuration"],
			"name": {
				"source": ["query.name"],
				"required": true,
				"validation": {
					"type": "string"
				}
			}
		},
		"/kubernetes/storageclass": {
			"_apiInfo": {
				"l": "This API deletes a StorageClass.",
				"group": "Kubernetes"
			},
			"commonFields": ["configuration"],
			"name": {
				"source": ["body.name"],
				"required": true,
				"validation": {
					"type": "string"
				}
			}
		},
		"/kubernetes/namespace": {
			"_apiInfo": {
				"l": "This API deletes a namespace.",
				"group": "Kubernetes"
			},
			"commonFields": ["configuration"],
			"name": {
				"source": ["body.name"],
				"required": true,
				"validation": {
					"type": "string"
				}
			}
		},
		"/kubernetes/secret": {
			"_apiInfo": {
				"l": "This API deletes a secret.",
				"group": "Kubernetes"
			},
			"commonFields": ["configuration"],
			"name": {
				"source": ["query.name"],
				"required": true,
				"validation": {
					"type": "string"
				}
			}
		},
		"/kubernetes/pvc": {
			"_apiInfo": {
				"l": "This API deletes a PVC.",
				"group": "Kubernetes"
			},
			"commonFields": ["configuration"],
			"name": {
				"source": ["query.name"],
				"required": true,
				"validation": {
					"type": "string"
				}
			}
		},
		"/kubernetes/item": {
			"_apiInfo": {
				"l": "This API deletes an item of type (Deployment, DaemonSet  or CronJob) as well as the related HPA with the related service.",
				"group": "Kubernetes"
			},
			"commonFields": ["configuration"],
			"name": {
				"source": ["body.name"],
				"required": true,
				"validation": {
					"type": "string"
				}
			},
			"mode": {
				"source": ["body.mode"],
				"required": true,
				"validation": {
					"type": "string",
					"enum": ["Deployment", "DaemonSet", "CronJob"]
				}
			},
			"serviceName": {
				"source": ["body.serviceName"],
				"required": false,
				"validation": {
					"type": "string"
				}
			},
			"cleanup": {
				"source": ["body.cleanup"],
				"required": false,
				"validation": {
					"type": "boolean",
					"default": false
				}
			}
		}
	}
};

module.exports = localConfig;