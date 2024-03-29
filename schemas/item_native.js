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
					"pattern": /^(([a-z0-9][-a-z0-9_.]*)?[a-z0-9])?$/,
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
			"required": ["env", "name", "group", "type", "version"]
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
		
		"deployment": {
			"type": "object",
			"properties": {
				"apiVersion": {
					"type": "string"
				},
				"kind": {
					"type": "string",
					"enum": ["Deployment", "DaemonSet"]
				},
				"metadata": {
					"type": "object"
				},
				"spec": {
					"type": "object",
					"properties": {
						"template": {
							"type": "object",
							"properties": {
								"metadata": {
									"type": "object"
								}
							},
							"required": ["metadata"]
						}
					},
					"required": ["template"]
				}
			},
			"required": ["apiVersion", "kind", "metadata", "spec"]
		},
		"service": {
			"type": "object",
			"properties": {
				"apiVersion": {
					"type": "string"
				},
				"kind": {
					"type": "string",
					"enum": ["Service"]
				},
				"metadata": {
					"type": "object"
				},
				"spec": {
					"type": "object",
					"properties": {
						"selector": {
							"type": "object"
						}
					},
					"required": ["selector"]
				}
			},
			"required": ["apiVersion", "kind", "metadata", "spec"]
		}
	},
	"required": ["item", "deployment"]
};

module.exports = config;