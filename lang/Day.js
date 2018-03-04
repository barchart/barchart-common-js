const assert = require('./assert'),
	ComparatorBuilder = require('./../collections/sorting/ComparatorBuilder'),
	comparators = require('./../collections/sorting/comparators'),
	is = require('./is');

module.exports = (() => {
	'use strict';

	/**
	 * A data structure that represents a day (year, month, and day)
	 * without consideration for time or timezone.
	 *
	 * @public
	 * @param {Number} year
	 * @param {Number} month
	 * @param {Number} day
	 */
	class Day {
		constructor(year, month, day) {
			if (!Day.validate(year, month, day)) {
				throw new Error(`Unable to instantiate Day, input is invalid [${year}], [${month}], [${day}]`);
			}

			this._year = year;
			this._month = month;
			this._day = day;
		}

		/**
		 * Calculates a new {@link Day} in the future (or past).
		 *
		 * @public
		 * @param {Number} days - The number of days to add (negative numbers can be used for subtraction).
		 * @param {Boolean=} inverse - If true, the sign of the "days" value will be flipped.
		 * @returns {Day}
		 */
		addDays(days, inverse) {
			assert.argumentIsRequired(days, 'days', Number);
			assert.argumentIsOptional(inverse, inverse, Boolean);
			assert.argumentIsValid(days, 'days', is.large, 'is an integer');

			let totalDaysToShift;

			if (is.boolean(inverse) && inverse) {
				totalDaysToShift = days * -1;
			} else {
				totalDaysToShift = days;
			}

			const positive = is.positive(totalDaysToShift);

			let shiftedDay = this._day;
			let shiftedMonth = this._month;
			let shiftedYear = this._year;

			while (totalDaysToShift !== 0) {
				let monthDaysAvailable;
				let monthDaysToShift;

				if (positive) {
					monthDaysAvailable = Day.getDaysInMonth(shiftedYear, shiftedMonth) - shiftedDay;
					monthDaysToShift = Math.min(totalDaysToShift, monthDaysAvailable);
				} else {
					monthDaysAvailable = 1 - shiftedDay;
					monthDaysToShift = Math.max(totalDaysToShift, monthDaysAvailable);
				}

				totalDaysToShift = totalDaysToShift - monthDaysToShift;

				if (totalDaysToShift === 0) {
					shiftedDay = shiftedDay + monthDaysToShift;
				} else if (positive) {
					shiftedMonth++;

					if (shiftedMonth > 12) {
						shiftedYear++;
						shiftedMonth = 1;
					}

					shiftedDay = 0;
				} else {
					shiftedMonth--;

					if (shiftedMonth < 1) {
						shiftedYear--;
						shiftedMonth = 12;
					}

					shiftedDay = Day.getDaysInMonth(shiftedYear, shiftedMonth) + 1;
				}
			}

			return new Day(shiftedYear, shiftedMonth, shiftedDay);
		}

		/**
		 * Calculates a new {@link Day} in the past (or future).
		 *
		 * @public
		 * @param {Number} days - The number of days to subtract (negative numbers can be used for addition).
		 * @returns {Day}
		 */
		subtractDays(days) {
			return this.addDays(days, true);
		}

		/**
		 * Calculates a new {@link Day} in the future (or past). If the new date is at the end of
		 * the month and the new month has fewer days than the current month, days will be subtracted
		 * as necessary (e.g. adding one month to March 31 will return April 30).
		 *
		 * @public
		 * @param {Number} months - The number of months to add (negative numbers can be used for subtraction).
		 * @param {Boolean=} inverse - If true, the sign of the "days" value will be flipped.
		 * @returns {Day}
		 */
		addMonths(months, inverse) {
			assert.argumentIsRequired(months, 'months', Number);
			assert.argumentIsOptional(inverse, inverse, Boolean);
			assert.argumentIsValid(months, 'months', is.large, 'is an integer');

			let totalMonthsToShift;

			if (is.boolean(inverse) && inverse) {
				totalMonthsToShift = months * -1;
			} else {
				totalMonthsToShift = months;
			}

			const monthsToShift = totalMonthsToShift % 12;
			const yearsToShift = (totalMonthsToShift - monthsToShift) / 12;

			let shiftedYear = this.year + yearsToShift;
			let shiftedMonth = this.month + monthsToShift;
			let shiftedDay = this.day;

			if (shiftedMonth > 12) {
				shiftedYear = shiftedYear + 1;
				shiftedMonth = shiftedMonth - 12;
			}

			if (shiftedMonth < 1) {
				shiftedYear = shiftedYear - 1;
				shiftedMonth = shiftedMonth + 12;
			}

			while (!Day.validate(shiftedYear, shiftedMonth, shiftedDay)) {
				shiftedDay = shiftedDay - 1;
			}

			return new Day(shiftedYear, shiftedMonth, shiftedDay);
		}

		/**
		 * Calculates a new {@link Day} in the past (or future).
		 *
		 * @public
		 * @param {Number} months - The number of months to subtract (negative numbers can be used for addition).
		 * @returns {Day}
		 */
		subtractMonths(months) {
			return this.addMonths(months, true);
		}

		/**
		 * Calculates a new {@link Day} in the future (or past). If the new date is at the end of
		 * the month and the new month has fewer days than the current month, days will be subtracted
		 * as necessary (e.g. adding one year to February 29 will return February 28).
		 *
		 * @public
		 * @param {Number} years - The number of years to add (negative numbers can be used for subtraction).
		 * @param {Boolean=} inverse - If true, the sign of the "days" value will be flipped.
		 * @returns {Day}
		 */
		addYears(years, inverse) {
			assert.argumentIsRequired(years, 'years', Number);
			assert.argumentIsOptional(inverse, inverse, Boolean);
			assert.argumentIsValid(years, 'years', is.large, 'is an integer');

			let yearsToShift;

			if (is.boolean(inverse) && inverse) {
				yearsToShift = years * -1;
			} else {
				yearsToShift = years;
			}

			let shiftedYear = this.year + yearsToShift;
			let shiftedMonth = this.month;
			let shiftedDay = this.day;

			while (!Day.validate(shiftedYear, shiftedMonth, shiftedDay)) {
				shiftedDay = shiftedDay - 1;
			}

			return new Day(shiftedYear, shiftedMonth, shiftedDay);
		}

		/**
		 * Calculates a new {@link Day} in the past (or future).
		 *
		 * @public
		 * @param {Number} years - The number of years to subtract (negative numbers can be used for addition).
		 * @returns {Day}
		 */
		subtractYears(years) {
			return this.addYears(years, true);
		}

		/**
		 * Indicates if another {@link Day} occurs before the current instance.
		 *
		 * @public
		 * @param {Day} other
		 * @returns {boolean}
		 */
		getIsBefore(other) {
			return Day.compareDays(this, other) < 0;
		}

		/**
		 * Indicates if another {@link Day} occurs after the current instance.
		 *
		 * @public
		 * @param {Day} other
		 * @returns {boolean}
		 */
		getIsAfter(other) {
			return Day.compareDays(this, other) > 0;
		}

		/**
		 * Indicates if another {@link Day} occurs after the current instance.
		 *
		 * @public
		 * @param {Day} other
		 * @returns {boolean}
		 */
		getIsEqual(other) {
			return Day.compareDays(this, other) === 0;
		}

		/**
		 * The year.
		 *
		 * @public
		 * @returns {Number}
		 */
		get year() {
			return this._year;
		}

		/**
		 * The month of the year (January is one, December is twelve).
		 *
		 * @public
		 * @returns {Number}
		 */
		get month() {
			return this._month;
		}

		/**
		 * The day of the month.
		 *
		 * @public
		 * @returns {Number}
		 */
		get day() {
			return this._day;
		}

		/**
		 * Outputs the date as the formatted string: {year}-{month}-{day}.
		 *
		 * @public
		 * @returns {String}
		 */
		format() {
			return `${this._year}-${leftPad(this._month)}-${leftPad(this._day)}`;
		}

		/**
		 * Returns the JSON representation.
		 *
		 * @public
		 * @returns {String}
		 */
		toJSON() {
			return this.format();
		}

		/**
		 * Converts a string (which matches the output of {@link Day#format} into
		 * a {@link Day} instance.
		 *
		 * @public
		 * @static
		 * @param {String} value
		 * @returns {Day}
		 */
		static parse(value) {
			assert.argumentIsRequired(value, 'value', String);

			const match = value.match(dayRegex);

			if (match === null) {
				throw new Error(`Unable to parse value as Day [ ${value} ]`);
			}

			return new Day(parseInt(match[1]), parseInt(match[2]), parseInt(match[3]));
		}

		/**
		 * Creates a {@link Day} from the year, month, and day properties (in local time)
		 * of the {@link Date} argument.
		 *
		 * @public
		 * @static
		 * @param {Date} date
		 * @returns {Day}
		 */
		static fromDate(date) {
			assert.argumentIsRequired(date, 'date', Date);

			return new Day(date.getFullYear(), date.getMonth() + 1, date.getDate());
		}

		/**
		 * Creates a {@link Day} from the year, month, and day properties (in UTC)
		 * of the {@link Date} argument.
		 *
		 * @public
		 * @static
		 * @param {Date} date
		 * @returns {Day}
		 */
		static fromDateUtc(date) {
			assert.argumentIsRequired(date, 'date', Date);

			return new Day(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate());
		}

		/**
		 * Returns a {@link Day} instance using today's local date.
		 *
		 * @static
		 * @public
		 * @return {Day}
		 */
		static getToday() {
			return Day.fromDate(new Date());
		}

		/**
		 * Returns true if the year, month, and day combination is valid; otherwise false.
		 *
		 * @public
		 * @static
		 * @param {Number} year
		 * @param {Number} month
		 * @param {Number} day
		 * @returns {Boolean}
		 */
		static validate(year, month, day) {
			return is.integer(year) &&
				is.integer(month) &&
				is.integer(day) &&
				!(month  < 1) &&
				!(month > 12) &&
				!(day  < 1) &&
				!(day > Day.getDaysInMonth(year, month));
		}

		/**
		 * Returns the number of days in a given month.
		 *
		 * @public
		 * @static
		 * @param {number} year - The year number (e.g. 2017)
		 * @param {number} month - The month number (e.g. 2 is February)
		 */
		static getDaysInMonth(year, month) {
			switch (month) {
				case 1:
				case 3:
				case 5:
				case 7:
				case 8:
				case 10:
				case 12: {
					return 31;
				}
				case 4:
				case 6:
				case 9:
				case 11: {
					return 30;
				}
				case 2: {
					if (((year % 4 === 0) && (year % 100 !== 0)) || (year % 400 === 0)) {
						return 29;
					} else {
						return 28;
					}
				}
			}
		}

		/**
		 * A comparator function for {@link Day} instances.
		 *
		 * @public
		 * @static
		 * @param {Day} a
		 * @param {Day} b
		 * @returns {Number}
		 */
		static compareDays(a, b) {
			assert.argumentIsRequired(a, 'a', Day, 'Day');
			assert.argumentIsRequired(b, 'b', Day, 'Day');

			return comparator(a, b);
		}

		toString() {
			return '[Day]';
		}
	}

	const dayRegex = /^([0-9]{4}).?([0-9]{2}).?([0-9]{2})$/;

	function leftPad(value) {
		return value < 10 ? `0${value}` : `${value}`;
	}

	const comparator = ComparatorBuilder.startWith((a, b) => comparators.compareNumbers(a.year, b.year))
		.thenBy((a, b) => comparators.compareNumbers(a.month, b.month))
		.thenBy((a, b) => comparators.compareNumbers(a.day, b.day))
		.toComparator();

	return Day;
})();
