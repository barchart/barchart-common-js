var Stack = require('./../Stack');

var assert = require('./../../lang/assert');
var Disposable = require('./../../lang/Disposable');

module.exports = (() => {
	'use strict';

	class DisposableStack extends Disposable {
		constructor() {
			super();

			this._stack = new Stack();
		}

		push(disposable) {
			assert.argumentIsRequired(disposable, 'disposable', Disposable, 'Disposable');

			if (this.getIsDisposed()) {
				throw new Error('Unable to push item onto DisposableStack because it has been disposed.');
			}

			this._stack.push(disposable);
		}

		_onDispose() {
			while (!this._stack.empty()) {
				this._stack.pop().dispose();
			}
		}

		static fromArray(bindings) {
			assert.argumentIsArray(bindings, 'bindings', Disposable, 'Disposable');

			const returnRef = new DisposableStack();

			for (let i = 0; i < bindings.length; i++) {
				returnRef.push(bindings[i]);
			}

			return returnRef;
		}
	}

	return DisposableStack;
})();