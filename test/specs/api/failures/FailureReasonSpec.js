const Enum = require('./../../../../lang/Enum');

const FailureReason = require('./../../../../api/failures/FailureReason'),
	FailureType = require('./../../../../api/failures/FailureType');

const DataType = require('./../../../../serialization/json/DataType'),
	Field = require('./../../../../serialization/json/Field'),
	Schema = require('./../../../../serialization/json/Schema');

describe('When a FailureReason is created with a verbose failure type', () => {
	'use strict';

	let reason;

	beforeEach(() => {
		reason = FailureReason.forRequest({ endpoint: { description: 'do stuff' }})
			.addItem(FailureType.ENTITLEMENTS_FAILED, { name: '1' });
	});

	describe('and the FailureReason is converted to a human-readable form', () => {
		let human;

		beforeEach(() => {
			human = reason.format();
		});

		it('should have data', () => {
			expect(human[0].value.hasOwnProperty('data')).toEqual(true);
		});

		it('should have the correct data name', () => {
			expect(human[0].value.data.name).toEqual('1');
		});
	});
});

describe('When a FailureReason is created', () => {
	'use strict';

	let reason;

	beforeEach(() => {
		reason = FailureReason.forRequest({ endpoint: { description: 'do stuff' }})
			.addItem(FailureType.REQUEST_CONSTRUCTION_FAILURE, { }, true)
			.addItem(FailureType.REQUEST_PARAMETER_MISSING, { name: 'First' })
			.addItem(FailureType.REQUEST_PARAMETER_MISSING, { name: 'Second' });
	});

	describe('and the FailureReason is checked for severity', () => {
		it('should be considered severe', () => {
			expect(reason.getIsSevere()).toEqual(true);
		});
	});

	describe('and the FailureReason error code is checked', () => {
		it('it should return a null value', () => {
			expect(reason.getErrorCode()).toEqual(null);
		});
	});

	describe('and the FailureReason is converted to a human-readable form', () => {
		let human;

		beforeEach(() => {
			human = reason.format();
		});

		it('should have one primary reason', () => {
			expect(human.length).toEqual(1);
		});

		it('should have two secondary reasons', () => {
			expect(human[0].children.length).toEqual(2);
		});

		it('should have the correct primary code', () => {
			expect(human[0].value.code).toEqual(FailureType.REQUEST_CONSTRUCTION_FAILURE.code);
		});

		it('should have the correct primary message', () => {
			expect(human[0].value.message).toEqual('An attempt to do stuff failed because some required information is missing.');
		});

		it('should have the correct secondary message (1)', () => {
			expect(human[0].children[0].value.message).toEqual('The "first" field is required.');
		});

		it('should have the correct secondary code (1)', () => {
			expect(human[0].children[0].value.code).toEqual(FailureType.REQUEST_PARAMETER_MISSING.code);
		});

		it('should not have verbose data for the secondary message (1)', () => {
			expect(human[0].children[0].value.hasOwnProperty('data')).toEqual(false);
		});

		it('should have the correct secondary message (2)', () => {
			expect(human[0].children[1].value.message).toEqual('The "second" field is required.');
		});

		it('should have the correct secondary code (2)', () => {
			expect(human[0].children[1].value.code).toEqual(FailureType.REQUEST_PARAMETER_MISSING.code);
		});

		it('should not have verbose data for the secondary message (2)', () => {
			expect(human[0].children[1].value.hasOwnProperty('data')).toEqual(false);
		});
	});
});


describe('A FailureReason is created with a FailureType that has a non-standard error code', () => {
	'use strict';

	let type;
	let reason;

	beforeEach(() => {
		const code = 'TEST_ERROR_CODE';
		const template = 'This is an error with a non-standard error code';

		type = Enum.fromCode(FailureType, code) || new FailureType(code, template, false, 403);

		reason = new FailureReason()
			.addItem(type, { });

	});

	describe('and the FailureReason error code is checked', () => {
		it('it should return the non-standard error code', () => {
			expect(reason.getErrorCode()).toEqual(403);
		});
	});
});

describe('When a schema is validated', () => {
	let schema;

	beforeEach(() => {
		schema = new Schema('person', [
			new Field('first', DataType.STRING),
			new Field('last', DataType.STRING)
		]);
	});

	describe('and a valid schema is processed', () => {
		let result;

		beforeEach((done) => {
			FailureReason.validateSchema(schema, { first: 'bryan', last: 'ingle'})
				.then((r) => {
					result = r;

					done();
				});
		});

		it('should return null (not a FailureReason)', () => {
			expect(result).toEqual(null);
		});
	});

	describe('and an invalid schema is processed (with one invalid property)', () => {
		let successResult = null;
		let failureResult = null;

		beforeEach((done) => {
			FailureReason.validateSchema(schema, { first: 'bryan' })
				.then((r) => {
					successResult = r;

					done();
				}).catch((e) => {
					failureResult = e;

					done();
				});
		});

		it('should fail with a formatted failure reason', () => {
			expect(failureResult).not.toEqual(null);
		});

		it('should fail with a formatted failure reason, having one child', () => {
			expect(failureResult[0].children.length).toEqual(1);
		});
	});

	describe('and an invalid schema is processed (with two invalid properties)', () => {
		let successResult = null;
		let failureResult = null;

		beforeEach((done) => {
			FailureReason.validateSchema(schema, { })
				.then((r) => {
					successResult = r;

					done();
				}).catch((e) => {
					failureResult = e;

					done();
				});
		});

		it('should fail with a formatted failure reason', () => {
			expect(failureResult).not.toEqual(null);
		});

		it('should fail with a formatted failure reason, having two children', () => {
			expect(failureResult[0].children.length).toEqual(2);
		});
	});
});
