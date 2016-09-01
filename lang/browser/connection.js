var assert = require('./../assert');
var is = require('./../is');

module.exports = (() => {
	'use strict';

	const connection = {
		getIsSecure(secure) {
			let returnVal;

			if (is.boolean(secure)) {
				returnVal = secure;
			} else {
				let protocol;

				if (window && window.location && is.string(window.location.protocol)) {
					protocol = window.location.protocol;
				} else if (document && document.location && is.string(document.location.protocol)) {
					protocol = document.location.protocol;
				} else {
					protocol = '';
				}

				returnVal = protocol.startsWith('https');
			}

			return returnVal;
		}
	};

	return connection;
})();