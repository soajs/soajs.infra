/**
 * @license
 * Copyright SOAJS All Rights Reserved.
 *
 * Use of this source code is governed by an Apache license that can be
 * found in the LICENSE file at the root of this repository
 */

"use strict";

let config = {
	"type": "object",
	"properties": {
		"labels": {
			"type": "object"
		},
		"catalog": {
			"type": "object",
			"additionalProperties": false,
			"properties": {
				"id": {
					"type": "string"
				},
				"version": {
					"type": "string"
				},
				"shell": {
					"type": "string",
					"pattern": /^(shell\/)([A-Za-z0-9\/_.]*)$/
				}
			},
			"required": ["id", "version", "shell"]
		},
		
		"item": {
			"type": "object",
			"additionalProperties": false,
			"properties": {
				"env": {
					"type": "string",
					"pattern": /^(([A-Za-z0-9][-A-Za-z0-9_.]*)?[A-Za-z0-9])?$/,
					"minLength": 1
				},
				"name": {
					"type": "string",
					"pattern": /^(([A-Za-z0-9][-A-Za-z0-9_.]*)?[A-Za-z0-9])?$/,
					"minLength": 1
				},
				"group": {
					"type": "string",
					"pattern": /^(([A-Za-z0-9][-A-Za-z0-9_.]*)?[A-Za-z0-9])?$/,
					"minLength": 1
				},
				"type": {
					"type": "string",
					"pattern": /^(([A-Za-z0-9][-A-Za-z0-9_.]*)?[A-Za-z0-9])?$/,
					"minLength": 1
				},
				"subtype": {
					"type": "string",
					"pattern": /^(([A-Za-z0-9][-A-Za-z0-9_.]*)?[A-Za-z0-9])?$/,
					"minLength": 1
				},
				"version": {
					"type": "string",
					"pattern": /^(([A-Za-z0-9][-A-Za-z0-9_.]*)?[A-Za-z0-9])?$/,
					"minLength": 1
				}
			},
			"required": ["env", "name", "group", "type", "subtype", "version"]
		},
		"image": {
			"type": "object",
			"properties": {
				"name": {
					"type": "string"
				},
				"imagePullPolicy": {
					"type": "string"
				}
			},
			"required": ["name", "imagePullPolicy"]
		},
		"src": {
			"type": "object",
			"properties": {
				"from": {
					"type": "object",
					"properties": {
						"tag": {
							"type": "string",
							"pattern": /^(([A-Za-z0-9][-A-Za-z0-9_.]*)?[A-Za-z0-9])?$/,
							"minLength": 1
						},
						"branch": {
							"type": "string",
							"pattern": /^(([A-Za-z0-9][-A-Za-z0-9_.]*)?[A-Za-z0-9])?$/,
							"minLength": 1
						},
						"commit": {
							"type": "string",
							"pattern": /^(([A-Za-z0-9][-A-Za-z0-9_.]*)?[A-Za-z0-9])?$/,
							"minLength": 1
						}
					},
					"oneOf": [
						{
							"required": ["tag"]
						},
						{
							"required": ["branch", "commit"]
						}
					]
				},
				"repo": {
					"type": "string",
					"pattern": /^(([A-Za-z0-9][-A-Za-z0-9_.]*)?[A-Za-z0-9])?$/,
					"minLength": 1
				},
				"owner": {
					"type": "string",
					"pattern": /^(([A-Za-z0-9][-A-Za-z0-9_.]*)?[A-Za-z0-9])?$/,
					"minLength": 1
				}
			},
			"required": ["from", "repo", "owner"]
		},
		"mode": {
			"type": "string",
			"enum": ["Deployment", "DaemonSet"]
		},
		"ports": {
			"type": "array",
			"items": {
				"type": "object",
				"additionalProperties": false,
				"properties": {
					"name": {
						"type": "string"
					},
					"containerPort": {
						"type": "integer"
					}
				},
				"required": ["name", "containerPort"]
			}
		},
		"workingDir": {
			"type": "string"
		},
		"command": {
			"type": "array"
		},
		"args": {
			"type": "array"
		},
		"readinessProbe": {
			"type": "object"
		},
		"livenessProbe": {
			"type": "object"
		},
		"env": {
			"type": "array",
			"items": {
				"type": "object",
				"properties": {
					"name": {
						"type": "string"
					},
					"value": {
						"type": "string"
					}
				},
				"required": ["name", "value"]
			}
		},
		"volume": {
			"type": "object",
			"additionalProperties": false,
			"properties": {
				"volumeMounts": {
					"type": "array",
					"items": {
						"type": "object"
					}
				},
				"volumes": {
					"type": "array",
					"items": {
						"type": "object"
					}
				}
			}
		},
		"replicas": {
			"type": "integer",
			"default": 1
		},
		"revisionHistoryLimit": {
			"type": "integer",
			"default": 1
		},
		"restartPolicy": {
			"type": "string"
		},
		"service": {
			"type": "object",
			"additionalProperties": false,
			"properties": {
				"ports": {
					"type": "array",
					"items": {
						"type": "object",
						"additionalProperties": true,
						"properties": {
							"name": {
								"type": "string"
							},
							"port": {
								"type": "integer"
							}
						},
						"required": ["name", "port"]
					}
				},
				"type": {
					"type": "string"
				},
				"externalTrafficPolicy": {
					"type": "string"
				}
			}
		}
	},
	"required": ["catalog", "item", "image", "mode", "readinessProbe"]
};

module.exports = config;