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
					"type": "string"
				},
				"name": {
					"required": true,
					"type": "string"
				},
				"group": {
					"required": true,
					"type": "string"
				},
				"type": {
					"required": true,
					"type": "string"
				},
				"subtype": {
					"required": true,
					"type": "string"
				},
				"version": {
					"required": true,
					"type": "string"
				}
			}
		},
		
		"deployment": {
			"required": true,
			"type": "object",
			"properties": {
				"apiVersion": {
					"required": true,
					"type": "string"
				},
				"kind": {
					"required": true,
					"type": "string"
				},
				"metadata": {
					"required": true,
					"type": "object"
				},
				"spec": {
					"required": true,
					"type": "object",
					"properties": {
						"selector": {
							"required": true,
							"type": "object"
						},
						"template": {
							"required": true,
							"type": "object",
							"properties": {
								"metadata": {
									"required": true,
									"type": "string"
								}
							}
						}
					}
				}
			}
		},
		"service": {
			"required": false,
			"type": "object",
			"properties": {
				"apiVersion": {
					"required": true,
					"type": "string"
				},
				"kind": {
					"required": true,
					"type": "string"
				},
				"metadata": {
					"required": true,
					"type": "object"
				},
				"spec": {
					"required": true,
					"type": "object",
					"properties": {
						"selector": {
							"required": true,
							"type": "object"
						}
					}
				}
			}
		}
	}
};

module.exports = config;