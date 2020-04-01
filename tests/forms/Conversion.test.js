import { assert } from 'type-enforcer';
import { Conversion, locale } from '../..';
import TestUtil from '../TestUtil';
import FormControlTests from './FormControlTests';

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

describe('Conversion', () => {
	const testUtil = new TestUtil(Conversion);
	const formControlTests = new FormControlTests(Conversion, testUtil, {
		mainCssClass: 'conversion',
		focusableElement: 'input[type="text"]',
		focusableSubElement: 'input[type="text"]'
	});

	const getFromInput = () => testUtil.first('input[type="text"]');

	const getToInput = () => testUtil.nth('input[type="text"]', 1);

	formControlTests.run(['changeDelay'], ['focus'], {
		onChange: {
			buildControl: function() {
				testUtil.control = new Conversion({
					container: testUtil.container,
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
			testUtil.control = new Conversion({
				container: testUtil.container,
				fromType: Conversion.CONVERSION_TYPES.LENGTH.FEET,
				toType: Conversion.CONVERSION_TYPES.LENGTH.METERS
			});

			assert.is(testUtil.nth('.input-suffix', 0).textContent, 'ft');
		});

		it('should show a label after the \'to\' text box', () => {
			testUtil.control = new Conversion({
				container: testUtil.container,
				fromType: Conversion.CONVERSION_TYPES.LENGTH.FEET,
				toType: Conversion.CONVERSION_TYPES.LENGTH.METERS
			});

			assert.is(testUtil.nth('.input-suffix', 1).textContent, 'm');
		});

		it('should show two labels, one for each type', () => {
			testUtil.control = new Conversion({
				container: testUtil.container,
				fromType: Conversion.CONVERSION_TYPES.LENGTH.FEET,
				toType: Conversion.CONVERSION_TYPES.LENGTH.METERS
			});

			assert.is(testUtil.nth('.input-suffix', 0).textContent, 'ft');
			assert.is(testUtil.nth('.input-suffix', 1).textContent, 'm');
		});
	});

	describe('ConvertsLength', () => {
		it('should convert feet to meters', () => {
			testUtil.control = new Conversion({
				container: testUtil.container,
				fromType: Conversion.CONVERSION_TYPES.LENGTH.FEET,
				toType: Conversion.CONVERSION_TYPES.LENGTH.METERS
			})
				.changeDelay(0);

			testUtil.control.value(10);
			assert.is(testUtil.control.getToValue(), '3');
		});

		it('should convert meters back to feet', () => {
			testUtil.control = new Conversion({
				container: testUtil.container,
				fromType: Conversion.CONVERSION_TYPES.LENGTH.FEET,
				toType: Conversion.CONVERSION_TYPES.LENGTH.METERS
			})
				.changeDelay(0);

			getToInput().value = 10;
			testUtil.control.triggerToChange();
			assert.is(testUtil.control.value(), '32.8');
		});

		it('should convert meters to feet', () => {
			testUtil.control = new Conversion({
				container: testUtil.container,
				fromType: Conversion.CONVERSION_TYPES.LENGTH.METERS,
				toType: Conversion.CONVERSION_TYPES.LENGTH.FEET
			})
				.changeDelay(0);

			getFromInput().value = 10;
			testUtil.control.triggerFromChange();
			assert.is(testUtil.control.getToValue(), '32.8');
		});

		it('should convert feet back to meters', () => {
			testUtil.control = new Conversion({
				container: testUtil.container,
				fromType: Conversion.CONVERSION_TYPES.LENGTH.METERS,
				toType: Conversion.CONVERSION_TYPES.LENGTH.FEET
			})
				.changeDelay(0);

			getToInput().value = 10;
			testUtil.control.triggerToChange();
			assert.is(testUtil.control.value(), '3');
		});

		it('should set feet to empty when meters is set to empty', () => {
			testUtil.control = new Conversion({
				container: testUtil.container,
				fromType: Conversion.CONVERSION_TYPES.LENGTH.METERS,
				toType: Conversion.CONVERSION_TYPES.LENGTH.FEET
			})
				.changeDelay(0);

			getToInput().value = '';
			testUtil.control.triggerToChange();
			assert.is(testUtil.control.value(), '');
		});

		it('should convert inches to millimeters', () => {
			testUtil.control = new Conversion({
				container: testUtil.container,
				fromType: Conversion.CONVERSION_TYPES.LENGTH.INCHES,
				toType: Conversion.CONVERSION_TYPES.LENGTH.MILLIMETERS
			})
				.changeDelay(0);

			getFromInput().value = 10;
			testUtil.control.triggerFromChange();
			assert.is(testUtil.control.getToValue(), '254');
		});

		it('should convert millimeters to inches', () => {
			testUtil.control = new Conversion({
				container: testUtil.container,
				fromType: Conversion.CONVERSION_TYPES.LENGTH.MILLIMETERS,
				toType: Conversion.CONVERSION_TYPES.LENGTH.INCHES
			})
				.changeDelay(0);

			getFromInput().value = 10;
			testUtil.control.triggerFromChange();
			assert.is(testUtil.control.getToValue(), '0.4');
		});
	});

	describe('ConvertsWeight', () => {
		it('should convert kilograms to pounds', () => {
			testUtil.control = new Conversion({
				container: testUtil.container,
				fromType: Conversion.CONVERSION_TYPES.WEIGHT.KILOGRAMS,
				toType: Conversion.CONVERSION_TYPES.WEIGHT.POUNDS
			})
				.changeDelay(0);

			testUtil.control.value(10);
			assert.is(testUtil.control.getToValue(), '22');
		});

		it('should convert pounds back to kilograms', () => {
			testUtil.control = new Conversion({
				container: testUtil.container,
				fromType: Conversion.CONVERSION_TYPES.WEIGHT.KILOGRAMS,
				toType: Conversion.CONVERSION_TYPES.WEIGHT.POUNDS
			})
				.changeDelay(0);

			getToInput().value = 10;
			testUtil.control.triggerToChange();
			assert.is(testUtil.control.value(), '4.5');
		});

		it('should convert pounds to kilograms', () => {
			testUtil.control = new Conversion({
				container: testUtil.container,
				fromType: Conversion.CONVERSION_TYPES.WEIGHT.POUNDS,
				toType: Conversion.CONVERSION_TYPES.WEIGHT.KILOGRAMS
			})
				.changeDelay(0);

			getFromInput().value = 10;
			testUtil.control.triggerFromChange();
			assert.is(testUtil.control.getToValue(), '4.5');
		});

		it('should convert kilograms back to pounds', () => {
			testUtil.control = new Conversion({
				container: testUtil.container,
				fromType: Conversion.CONVERSION_TYPES.WEIGHT.POUNDS,
				toType: Conversion.CONVERSION_TYPES.WEIGHT.KILOGRAMS
			})
				.changeDelay(0);

			getToInput().value = 10;
			testUtil.control.triggerToChange();
			assert.is(testUtil.control.value(), '22');
		});

		it('should set kilograms to empty when pounds is set to empty', () => {
			testUtil.control = new Conversion({
				container: testUtil.container,
				fromType: Conversion.CONVERSION_TYPES.WEIGHT.POUNDS,
				toType: Conversion.CONVERSION_TYPES.WEIGHT.KILOGRAMS
			})
				.changeDelay(0);

			getFromInput().value = 100;
			testUtil.control.triggerFromChange();
			getFromInput().value = '';
			testUtil.control.triggerFromChange();
			assert.is(testUtil.control.value(), '');
		});
	});

	describe('ConvertsTemperature', () => {
		it('should convert celsius to fahrenheit', () => {
			testUtil.control = new Conversion({
				container: testUtil.container,
				fromType: Conversion.CONVERSION_TYPES.TEMPERATURE.CELSIUS,
				toType: Conversion.CONVERSION_TYPES.TEMPERATURE.FAHRENHEIT
			})
				.changeDelay(0);

			testUtil.control.value(10);
			assert.is(testUtil.control.getToValue(), '50');
		});

		it('should convert fahrenheit back to celsius', () => {
			testUtil.control = new Conversion({
				container: testUtil.container,
				fromType: Conversion.CONVERSION_TYPES.TEMPERATURE.CELSIUS,
				toType: Conversion.CONVERSION_TYPES.TEMPERATURE.FAHRENHEIT
			})
				.changeDelay(0);

			getToInput().value = 100;
			testUtil.control.triggerToChange();
			assert.is(testUtil.control.value(), '37.8');
		});

		it('should convert fahrenheit to celsius', () => {
			testUtil.control = new Conversion({
				container: testUtil.container,
				fromType: Conversion.CONVERSION_TYPES.TEMPERATURE.FAHRENHEIT,
				toType: Conversion.CONVERSION_TYPES.TEMPERATURE.CELSIUS
			})
				.changeDelay(0);

			getFromInput().value = 100;
			testUtil.control.triggerFromChange();
			assert.is(testUtil.control.getToValue(), '37.8');
		});

		it('should convert celsius back to fahrenheit', () => {
			testUtil.control = new Conversion({
				container: testUtil.container,
				fromType: Conversion.CONVERSION_TYPES.TEMPERATURE.FAHRENHEIT,
				toType: Conversion.CONVERSION_TYPES.TEMPERATURE.CELSIUS
			})
				.changeDelay(0);

			getToInput().value = 10;
			testUtil.control.triggerToChange();
			assert.is(testUtil.control.value(), '50');
		});

		it('should set celsius to empty when fahrenheit is set to empty', () => {
			testUtil.control = new Conversion({
				container: testUtil.container,
				fromType: Conversion.CONVERSION_TYPES.TEMPERATURE.FAHRENHEIT,
				toType: Conversion.CONVERSION_TYPES.TEMPERATURE.CELSIUS
			})
				.changeDelay(0);

			getFromInput().value = '';
			testUtil.control.triggerFromChange();
			assert.is(testUtil.control.value(), '');
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
