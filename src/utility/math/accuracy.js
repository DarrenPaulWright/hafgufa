import { isFloat } from 'type-enforcer-ui';

/**
 * Gets the mathematical accuracy of a number (digits to the right of the decimal)
 *
 * @function accuracy
 * @static
 *
 * @param {number} number
 */
export default (number) => {
	let e = 1;
	let accuracy = 0;

	if (!isFloat(number)) {
		return 0;
	}
	while (Math.round(number * e) / e !== number) {
		e *= 10;
		accuracy++;
	}
	return accuracy;
};
