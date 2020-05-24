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
				},
				"shell": {
					"required": true,
					"type": "string",
					"pattern": /^(shell\/)([A-Za-z0-9\/_.]*)$/
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
					"type": "string",
					"enum": ["CronJob"]
				},
				"metadata": {
					"required": true,
					"type": "object"
				},
				"spec": {
					"required": true,
					"type": "object",
					"properties": {
						"schedule": {
							"required": true,
							"type": "string"
						},
						"jobTemplate": {
							"required": true,
							"type": "object",
							"properties": {
								"spec": {
									"required": true,
									"type": "object",
									"properties": {
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
					"type": "string",
					"enum": ["Service"]
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