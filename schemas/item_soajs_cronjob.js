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
	"required": true,
	"properties": {
		"labels": {
			"type": "object",
			"required": false
		},
		"catalog": {
			"required": true,
			"type": "object",
			"additionalProperties": false,
			"properties": {
				"id": {
					"required": true,
					"type": "string"
				},
				"version": {
					"required": true,
					"type": "string"
				},
				"shell": {
					"required": true,
					"type": "string",
					"pattern": /^(shell\/)([A-Za-z0-9\/_.]*)$/
				},
				"schedule": {
					"required": true,
					"type": "string"
				},
				"concurrencyPolicy": {
					"required": true,
					"type": "string"
				}
			}
		},
		"item": {
			"required": true,
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
				"group": {
					"required": true,
					"type": "string",
					"pattern": /^(([A-Za-z0-9][-A-Za-z0-9_.]*)?[A-Za-z0-9])?$/,
					"minLength": 1
				},
				"type": {
					"required": true,
					"type": "string",
					"pattern": /^(([A-Za-z0-9][-A-Za-z0-9_.]*)?[A-Za-z0-9])?$/,
					"minLength": 1
				},
				"subtype": {
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
		},
		"image": {
			"required": true,
			"type": "object",
			"properties": {
				"name": {
					"required": true,
					"type": "string"
				},
				"imagePullPolicy": {
					"required": true,
					"type": "string"
				}
			}
		},
		"src": {
			"required": false,
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
				},
				"repo": {
					"required": true,
					"type": "string",
					"pattern": /^(([A-Za-z0-9][-A-Za-z0-9_.]*)?[A-Za-z0-9])?$/,
					"minLength": 1
				},
				"owner": {
					"required": true,
					"type": "string",
					"pattern": /^(([A-Za-z0-9][-A-Za-z0-9_.]*)?[A-Za-z0-9])?$/,
					"minLength": 1
				}
			}
		},
		"mode": {
			"required": true,
			"type": "string",
			"enum": ["Deployment", "DaemonSet"]
		},
		"ports": {
			"type": "array",
			"required": false,
			"items": {
				"type": "object",
				"additionalProperties": false,
				"properties": {
					"name": {
						"required": true,
						"type": "string"
					},
					"containerPort": {
						"required": true,
						"type": "integer"
					}
				}
			}
		},
		"workingDir": {
			"required": false,
			"type": "string"
		},
		"command": {
			"type": "array",
			"required": false
		},
		"args": {
			"type": "array",
			"required": false
		},
		"readinessProbe": {
			"type": "object",
			"required": true
		},
		"livenessProbe": {
			"type": "object",
			"required": false
		},
		"env": {
			"type": "array",
			"required": false,
			"items": {
				"type": "object",
				"properties": {
					"name": {
						"required": true,
						"type": "string"
					},
					"value": {
						"required": true,
						"type": "string"
					}
				}
			}
		},
		"volume": {
			"required": false,
			"type": "object",
			"additionalProperties": false,
			"properties": {
				"volumeMounts": {
					"type": "array",
					"required": false,
					"items": {
						"type": "object"
					}
				},
				"volumes": {
					"type": "array",
					"required": false,
					"items": {
						"type": "object"
					}
				}
			}
		},
		"replicas": {
			"type": "integer",
			"required": false,
			"default": 1
		},
		"revisionHistoryLimit": {
			"type": "integer",
			"required": false,
			"default": 1
		},
		"restartPolicy": {
			"type": "string",
			"required": false
		},
		"service": {
			"required": false,
			"type": "object",
			"additionalProperties": false,
			"properties": {
				"ports": {
					"type": "array",
					"required": false,
					"items": {
						"type": "object",
						"additionalProperties": true,
						"properties": {
							"name": {
								"required": true,
								"type": "string"
							},
							"port": {
								"required": true,
								"type": "integer"
							}
						}
					}
				},
				"type": {
					"required": false,
					"type": "string"
				},
				"externalTrafficPolicy": {
					"required": false,
					"type": "string"
				}
			}
		}
	}
};

module.exports = config;