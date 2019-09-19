import { assert } from 'chai';
import { Conversion, locale } from '../../../src';
import TestUtil from '../../TestUtil';
import FormControlTests from './FormControlTests';

const testUtil = new TestUtil(Conversion);
const formControlTests = new FormControlTests(Conversion, testUtil, {
	mainCssClass: 'conversion',
	focusableElement: 'input[type="text"]',
	focusableSubElement: 'input[type="text"]'
});

locale.set({
	'feetAbbr': 'ft',
	'inchesAbbr': 'in',
	'kilometersAbbr': 'km',
	'metersAbbr': 'm',
	'millimetersAbbr': 'mm',
	'milesAbbr': 'mi',
	'gramsAbbr': 'g',
	'kilogramsAbbr': 'kg',
	'poundsAbbr': 'lb',
	'ouncesAbbr': 'oz',
	'celsiusAbbr': 'C',
	'fahrenheitAbbr': 'F'
});

const getFromInput = () => document.querySelectorAll('input[type="text"]')[0];

const getToInput = () => document.querySelectorAll('input[type="text"]')[1];

describe('Conversion', () => {

	formControlTests.run(['changeDelay'], ['focus'], {
		onChange: {
			buildControl: function() {
				window.control = new Conversion({
					container: window.testContainer,
					fromType: Conversion.CONVERSION_TYPES.WEIGHT.POUNDS,
					toType: Conversion.CONVERSION_TYPES.WEIGHT.KILOGRAMS
				});
			},
			validValue: '4',
			setValueViaDom: function() {
				const input = getFromInput();
				input.value = '4';
				testUtil.trigger(input, 'change');
			}
		}
	});

	describe('Labels', () => {
		it('should show a label after the \'from\' text box', () => {
			window.control = new Conversion({
				container: window.testContainer,
				fromType: Conversion.CONVERSION_TYPES.LENGTH.FEET,
				toType: Conversion.CONVERSION_TYPES.LENGTH.METERS
			});

			assert.equal(document.querySelectorAll('.input-suffix')[0].textContent, 'ft');
		});

		it('should show a label after the \'to\' text box', () => {
			window.control = new Conversion({
				container: window.testContainer,
				fromType: Conversion.CONVERSION_TYPES.LENGTH.FEET,
				toType: Conversion.CONVERSION_TYPES.LENGTH.METERS
			});

			assert.equal(document.querySelectorAll('.input-suffix')[1].textContent, 'm');
		});

		it('should show two labels, one for each type', () => {
			window.control = new Conversion({
				container: window.testContainer,
				fromType: Conversion.CONVERSION_TYPES.LENGTH.FEET,
				toType: Conversion.CONVERSION_TYPES.LENGTH.METERS
			});

			assert.equal(document.querySelectorAll('.input-suffix')[0].textContent, 'ft');
			assert.equal(document.querySelectorAll('.input-suffix')[1].textContent, 'm');
		});
	});

	describe('ConvertsLength', () => {
		it('should convert feet to meters', () => {
			window.control = new Conversion({
				container: window.testContainer,
				fromType: Conversion.CONVERSION_TYPES.LENGTH.FEET,
				toType: Conversion.CONVERSION_TYPES.LENGTH.METERS
			})
				.changeDelay(0);

			window.control.value(10);
			assert.equal(window.control.getToValue(), '3');
		});

		it('should convert meters back to feet', () => {
			window.control = new Conversion({
				container: window.testContainer,
				fromType: Conversion.CONVERSION_TYPES.LENGTH.FEET,
				toType: Conversion.CONVERSION_TYPES.LENGTH.METERS
			})
				.changeDelay(0);

			getToInput().value = 10;
			window.control.triggerToChange();
			assert.equal(window.control.value(), '32.8');
		});

		it('should convert meters to feet', () => {
			window.control = new Conversion({
				container: window.testContainer,
				fromType: Conversion.CONVERSION_TYPES.LENGTH.METERS,
				toType: Conversion.CONVERSION_TYPES.LENGTH.FEET
			})
				.changeDelay(0);

			getFromInput().value = 10;
			window.control.triggerFromChange();
			assert.equal(window.control.getToValue(), '32.8');
		});

		it('should convert feet back to meters', () => {
			window.control = new Conversion({
				container: window.testContainer,
				fromType: Conversion.CONVERSION_TYPES.LENGTH.METERS,
				toType: Conversion.CONVERSION_TYPES.LENGTH.FEET
			})
				.changeDelay(0);

			getToInput().value = 10;
			window.control.triggerToChange();
			assert.equal(window.control.value(), '3');
		});

		it('should set feet to empty when meters is set to empty', () => {
			window.control = new Conversion({
				container: window.testContainer,
				fromType: Conversion.CONVERSION_TYPES.LENGTH.METERS,
				toType: Conversion.CONVERSION_TYPES.LENGTH.FEET
			})
				.changeDelay(0);

			getToInput().value = '';
			window.control.triggerToChange();
			assert.equal(window.control.value(), '');
		});

		it('should convert inches to millimeters', () => {
			window.control = new Conversion({
				container: window.testContainer,
				fromType: Conversion.CONVERSION_TYPES.LENGTH.INCHES,
				toType: Conversion.CONVERSION_TYPES.LENGTH.MILLIMETERS
			})
				.changeDelay(0);

			getFromInput().value = 10;
			window.control.triggerFromChange();
			assert.equal(window.control.getToValue(), '254');
		});

		it('should convert millimeters to inches', () => {
			window.control = new Conversion({
				container: window.testContainer,
				fromType: Conversion.CONVERSION_TYPES.LENGTH.MILLIMETERS,
				toType: Conversion.CONVERSION_TYPES.LENGTH.INCHES
			})
				.changeDelay(0);

			getFromInput().value = 10;
			window.control.triggerFromChange();
			assert.equal(window.control.getToValue(), '0.4');
		});
	});

	describe('ConvertsWeight', () => {
		it('should convert kilograms to pounds', () => {
			window.control = new Conversion({
				container: window.testContainer,
				fromType: Conversion.CONVERSION_TYPES.WEIGHT.KILOGRAMS,
				toType: Conversion.CONVERSION_TYPES.WEIGHT.POUNDS
			})
				.changeDelay(0);

			window.control.value(10);
			assert.equal(window.control.getToValue(), '22');
		});

		it('should convert pounds back to kilograms', () => {
			window.control = new Conversion({
				container: window.testContainer,
				fromType: Conversion.CONVERSION_TYPES.WEIGHT.KILOGRAMS,
				toType: Conversion.CONVERSION_TYPES.WEIGHT.POUNDS
			})
				.changeDelay(0);

			getToInput().value = 10;
			window.control.triggerToChange();
			assert.equal(window.control.value(), '4.5');
		});

		it('should convert pounds to kilograms', () => {
			window.control = new Conversion({
				container: window.testContainer,
				fromType: Conversion.CONVERSION_TYPES.WEIGHT.POUNDS,
				toType: Conversion.CONVERSION_TYPES.WEIGHT.KILOGRAMS
			})
				.changeDelay(0);

			getFromInput().value = 10;
			window.control.triggerFromChange();
			assert.equal(window.control.getToValue(), '4.5');
		});

		it('should convert kilograms back to pounds', () => {
			window.control = new Conversion({
				container: window.testContainer,
				fromType: Conversion.CONVERSION_TYPES.WEIGHT.POUNDS,
				toType: Conversion.CONVERSION_TYPES.WEIGHT.KILOGRAMS
			})
				.changeDelay(0);

			getToInput().value = 10;
			window.control.triggerToChange();
			assert.equal(window.control.value(), '22');
		});

		it('should set kilograms to empty when pounds is set to empty', () => {
			window.control = new Conversion({
				container: window.testContainer,
				fromType: Conversion.CONVERSION_TYPES.WEIGHT.POUNDS,
				toType: Conversion.CONVERSION_TYPES.WEIGHT.KILOGRAMS
			})
				.changeDelay(0);

			getFromInput().value = 100;
			window.control.triggerFromChange();
			getFromInput().value = '';
			window.control.triggerFromChange();
			assert.equal(window.control.value(), '');
		});
	});

	describe('ConvertsTemperature', () => {
		it('should convert celsius to fahrenheit', () => {
			window.control = new Conversion({
				container: window.testContainer,
				fromType: Conversion.CONVERSION_TYPES.TEMPERATURE.CELSIUS,
				toType: Conversion.CONVERSION_TYPES.TEMPERATURE.FAHRENHEIT
			})
				.changeDelay(0);

			window.control.value(10);
			assert.equal(window.control.getToValue(), '50');
		});

		it('should convert fahrenheit back to celsius', () => {
			window.control = new Conversion({
				container: window.testContainer,
				fromType: Conversion.CONVERSION_TYPES.TEMPERATURE.CELSIUS,
				toType: Conversion.CONVERSION_TYPES.TEMPERATURE.FAHRENHEIT
			})
				.changeDelay(0);

			getToInput().value = 100;
			window.control.triggerToChange();
			assert.equal(window.control.value(), '37.8');
		});

		it('should convert fahrenheit to celsius', () => {
			window.control = new Conversion({
				container: window.testContainer,
				fromType: Conversion.CONVERSION_TYPES.TEMPERATURE.FAHRENHEIT,
				toType: Conversion.CONVERSION_TYPES.TEMPERATURE.CELSIUS
			})
				.changeDelay(0);

			getFromInput().value = 100;
			window.control.triggerFromChange();
			assert.equal(window.control.getToValue(), '37.8');
		});

		it('should convert celsius back to fahrenheit', () => {
			window.control = new Conversion({
				container: window.testContainer,
				fromType: Conversion.CONVERSION_TYPES.TEMPERATURE.FAHRENHEIT,
				toType: Conversion.CONVERSION_TYPES.TEMPERATURE.CELSIUS
			})
				.changeDelay(0);

			getToInput().value = 10;
			window.control.triggerToChange();
			assert.equal(window.control.value(), '50');
		});

		it('should set celsius to empty when fahrenheit is set to empty', () => {
			window.control = new Conversion({
				container: window.testContainer,
				fromType: Conversion.CONVERSION_TYPES.TEMPERATURE.FAHRENHEIT,
				toType: Conversion.CONVERSION_TYPES.TEMPERATURE.CELSIUS
			})
				.changeDelay(0);

			getFromInput().value = '';
			window.control.triggerFromChange();
			assert.equal(window.control.value(), '');
		});
	});

	describe('ChangeDelay', () => {
		testUtil.testMethod({
			methodName: 'changeDelay',
			defaultValue: 200,
			testValue: 0,
			secondTestValue: 20
		});
	});
});
