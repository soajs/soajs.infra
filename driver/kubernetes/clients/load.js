/**
 * @license
 * Copyright SOAJS All Rights Reserved.
 *
 * Use of this source code is governed by an Apache license that can be
 * found in the LICENSE file at the root of this repository
 */

'use strict';

/* jshint esversion: 11 */

// @kubernetes/client-node is an ES module. It is imported once, on the first connect, with
// import(), so it never loads inside another module's evaluation, and only when the driver is used.
let loading = null;

function load() {
	if (!loading) {
		loading = import('@kubernetes/client-node').catch((e) => {
			loading = null;
			throw e;
		});
	}
	return loading;
}

module.exports = load;
