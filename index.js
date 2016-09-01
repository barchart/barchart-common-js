var collections = require('./collections/index');
var commands = require('./commands/index');
var lang = require('./lang/index');
var messaging = require('./messaging/index');
var models = require('./models/index');
var specifications = require('./specifications/index');
var timing = require('./timing/index');

module.exports = (() => {
	'use strict';

	var namespaces = {
		Collections: collections,
		Commands: commands,
		Messaging: messaging,
		Models: models,
		Timing: timing,
		Specifications: specifications
	};

	Object.keys(lang).forEach((key) => {
		namespaces[key] = lang[key];
	});
})();