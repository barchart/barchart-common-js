module.exports = (() => {
	'use strict';

	const assert = {
		argumentIsRequired: (variable, variableName, type, typeDescription) => {
			checkArgumentType(variable, variableName, type, typeDescription);
		},

		argumentIsOptional: (variable, variableName, type, typeDescription) => {
			if (variable === null || variable === undefined) {
				return;
			}

			checkArgumentType(variable, variableName, type, typeDescription);
		},

		argumentIsArray: (variable, variableName, itemConstraint, itemConstraintDescription) => {
			assert.argumentIsRequired(variable, variableName, Array);

			if (itemConstraint) {
				let itemValidator;

				if (typeof(itemConstraint) === 'function') {
					itemValidator = (value, index) => itemConstraint(value, `${variableName}[${index}]`);
				} else {
					itemValidator = (value, index) => checkArgumentType(value, variableName, itemConstraint, itemConstraintDescription, index);
				}

				variable.forEach((v, i) => {
					itemValidator(v, i);
				});
			}
		},

		areEqual: (a, b, descriptionA, descriptionB) => {
			if (a !== b) {
				throw new Error('The objects must be equal ([' + (descriptionA || a.toString()) + ' and ' + (descriptionB || b.toString()));
			}
		},

		areNotEqual: (a, b, descriptionA, descriptionB) => {
			if (a === b) {
				throw new Error('The objects cannot be equal ([' + (descriptionA || a.toString()) + ' and ' + (descriptionB || b.toString()));
			}
		}
	};

	function checkArgumentType(variable, variableName, type, typeDescription, index) {
		if (type === String) {
			if (typeof(variable) !== 'string') {
				throwInvalidTypeError(variableName, 'string', index);
			}
		} else if (type === Number) {
			if (typeof(variable) !== 'number') {
				throwInvalidTypeError(variableName, 'number', index);
			}
		} else if (type === Function) {
			if (typeof(variable) !== 'function') {
				throwInvalidTypeError(variableName, 'function', index);
			}
		} else if (type === Boolean) {
			if (typeof(variable) !== 'boolean') {
				throwInvalidTypeError(variableName, 'boolean', index);
			}
		} else if (type === Date) {
			if (!(variable instanceof Date)) {
				throwInvalidTypeError(variableName, 'date', index);
			}
		} else if (type === Array) {
			if (!Array.isArray(variable)) {
				throwInvalidTypeError(variableName, 'array', index);
			}
		} else if (!(variable instanceof (type || Object))) {
			throwInvalidTypeError(variableName, typeDescription, index);
		}
	}

	function throwInvalidTypeError(variableName, typeDescription, index) {
		let message;

		if (typeof(index) === 'number') {
			message = 'The argument [' + (variableName || 'unspecified') + '], at index [' + index.toString() + '] must be a ' + (typeDescription || 'unknown');
		} else {
			message = 'The argument [' + (variableName || 'unspecified') + '] must be a ' + (typeDescription || 'Object');
		}

		throw new Error(message);
	}

	return assert;
})();