import Moment from 'moment';

const timeSpans = ['hourly', 'daily', 'weekly', 'monthly', 'quarterly', 'semi annual', 'semi annually', 'annually'];
let first;
let second;

/**
 * <p>Utility sort functions.</p>
 * @module sortBy
 */

/**
 * Sort readable text alphabetically. Uses javascripts .localeCompare for localized sorting.
 * @function textAsc
 * @param   {String}  a
 * @param   {String}  b
 * @returns {Number} - <ul><li>1 if 'a' should be sorted after 'b'</li><li>0 if 'a' is the same as 'b'</li><li>-1 if
 *     'a' should be sorted before 'b'</li></ul>
 */
export const textAsc = (a, b) => a.localeCompare(b);

/**
 * Sort readable text reverse-alphabetically. Uses javascripts .localeCompare for localized sorting.
 * @function textDesc
 * @param   {String}  a
 * @param   {String}  b
 * @returns {Number} - <ul><li>1 if 'a' should be sorted after 'b'</li><li>0 if 'a' is the same as 'b'</li><li>-1 if
 *     'a' should be sorted before 'b'</li></ul>
 */
export const textDesc = (a, b) => b.localeCompare(a);

/**
 * Sort dates in ascending order.
 * @function dateAsc
 * @param   {Date|String}  a
 * @param   {Date|String}  b
 * @returns {Number} - <ul><li>1 if 'a' should be sorted after 'b'</li><li>0 if 'a' is the same as 'b'</li><li>-1 if
 *     'a' should be sorted before 'b'</li></ul>
 */
export const dateAsc = (a, b) => {
	a = Moment(a);
	b = Moment(b);

	first = a.isValid();
	second = b.isValid();

	if (!first && second) {
		return -1;
	}
	else if (first && !second) {
		return 1;
	}
	else if (!first && !second) {
		return 0;
	}
	else {
		return a.diff(b);
	}
};

/**
 * Sort dates in descending order.
 * @function dateDesc
 * @param   {Date|String}  a
 * @param   {Date|String}  b
 * @returns {Number} - <ul><li>1 if 'a' should be sorted after 'b'</li><li>0 if 'a' is the same as 'b'</li><li>-1 if
 *     'a' should be sorted before 'b'</li></ul>
 */
export const dateDesc = (a, b) => {
	a = Moment(a);
	b = Moment(b);

	first = b.isValid();
	second = a.isValid();

	if (!first && second) {
		return -1;
	}
	else if (first && !second) {
		return 1;
	}
	else if (!first && !second) {
		return 0;
	}
	else {
		return b.diff(a);
	}
};

/**
 * Sort time spans in ascending order. Available time spans: 'hourly', 'daily', 'weekly', 'monthly', 'quarterly', 'semi
 * annual', 'semi annually', 'annually'
 * @function timeSpanAsc
 * @param   {String}  a
 * @param   {String}  b
 * @returns {Number} - <ul><li>1 if 'a' should be sorted after 'b'</li><li>0 if 'a' is the same as 'b'</li><li>-1 if
 *     'a' should be sorted before 'b'</li></ul>
 */
export const timeSpanAsc = (a, b) => timeSpans.indexOf(a.toLowerCase()) - timeSpans.indexOf(b.toLowerCase());

/**
 * Sort time spans in descending order. Available time spans: 'hourly', 'daily', 'weekly', 'monthly', 'quarterly',
 * 'semi annual', 'semi annually', 'annually'
 * @function timeSpanDesc
 * @param   {String}  a
 * @param   {String}  b
 * @returns {Number} - <ul><li>1 if 'a' should be sorted after 'b'</li><li>0 if 'a' is the same as 'b'</li><li>-1 if
 *     'a' should be sorted before 'b'</li></ul>
 */
export const timeSpanDesc = (a, b) => timeSpans.indexOf(b.toLowerCase()) - timeSpans.indexOf(a.toLowerCase());

export const numberAsc = (a, b) => a - b;

export const numberDesc = (a, b) => b - a;

export const filteredTitle = (collection, filterText) => {
	collection.sort((a, b) => {
		first = a.title ? a.title.toLowerCase().indexOf(filterText) === 0 : false;
		second = b.title ? b.title.toLowerCase().indexOf(filterText) === 0 : false;

		if (first && !second) {
			return -1;
		}
		else if (!first && second) {
			return 1;
		}
		else {
			return (a.title || '').localeCompare(b.title || '');
		}
	});
};

export const byKey = (key) => (a, b) => {
	if (a[key] === b[key]) {
		return 0;
	}
	if (a[key] < b[key]) {
		return -1;
	}
	if (a[key] > b[key]) {
		return 1;
	}
};

export const byKeyDesc = (key) => (a, b) => {
	if (a[key] === b[key]) {
		return 0;
	}
	if (a[key] < b[key]) {
		return 1;
	}
	if (a[key] > b[key]) {
		return -1;
	}
};
