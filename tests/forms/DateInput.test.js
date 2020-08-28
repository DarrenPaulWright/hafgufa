import { wait } from 'async-agent';
import { assert } from 'type-enforcer';
import { DateInput, locale } from '../../index.js';
import TestUtil from '../TestUtil.js';
import FormControlTests from './FormControlTests.js';

locale.set({
	'dateFormatError': 'The date should be formatted: <dateFormat>',
	'maxDateError': 'Date must be no more than <maxDate>',
	'minDateError': 'Date must be at least <minDate>'
});

describe('DateInput', () => {
	const testUtil = new TestUtil(DateInput);
	const formControlTests = new FormControlTests(DateInput, testUtil);

	formControlTests.run();

	describe('.isFocused', () => {
		it('should focus the text input when isFocused(true) is called', () => {
			testUtil.control = new DateInput({
				container: testUtil.container
			});

			testUtil.control.isFocused(true);

			assert.is(testUtil.first('input'), document.activeElement);
		});

		it('should call the onFocus callback when isFocused(true) is called', () => {
			let testValue = 0;

			testUtil.control = new DateInput({
				container: testUtil.container,
				onFocus() {
					testValue++;
				}
			});

			testUtil.control.isFocused(true);

			assert.is(testValue, 1);
		});

		it('should blur the text input when isFocused(false) is called', () => {
			testUtil.control = new DateInput({
				container: testUtil.container
			});

			testUtil.control.isFocused(true);
			testUtil.control.isFocused(false);

			assert.notIs(testUtil.first('input'), document.activeElement);
		});

		it('should call the onBlur callback when isFocused(false) is called', () => {
			let testValue = 0;

			testUtil.control = new DateInput({
				container: testUtil.container,
				onBlur() {
					testValue++;
				}
			});

			testUtil.control.isFocused(true);
			testUtil.control.isFocused(false);

			return wait(1)
				.then(() => {
					assert.is(testValue, 1);
					assert.is(testUtil.control.isFocused(), false);
				});
		});
	});

	describe('.minDate', () => {
		it('should show an error if the date is before the minDate', () => {
			testUtil.control = new DateInput({
				container: testUtil.container,
				minDate: new Date('12/1/2006')
			});

			testUtil.control.isFocused(true);
			testUtil.typeText('11/26/2006');
			testUtil.control.isFocused(false);

			return wait(1)
				.then(() => {
					assert.is(testUtil.control.error(), 'Date must be at least 12/01/2006');
				});
		});

		it('should NOT show an error if the date is the same as the minDate', () => {
			testUtil.control = new DateInput({
				container: testUtil.container,
				minDate: new Date('12/1/2006')
			});

			testUtil.control.isFocused(true);
			testUtil.typeText('12/1/2006');
			testUtil.control.isFocused(false);

			return wait(1)
				.then(() => {
					assert.is(testUtil.control.error(), '');
				});
		});

		it('should NOT show an error if the date is after the minDate', () => {
			testUtil.control = new DateInput({
				container: testUtil.container,
				minDate: new Date('12/1/2006')
			});

			testUtil.control.isFocused(true);
			testUtil.typeText('11/6/2007');
			testUtil.control.isFocused(false);

			return wait(1)
				.then(() => {
					assert.is(testUtil.control.error(), '');
				});
		});
	});

	describe('.maxDate', () => {
		it('should show an error if the date is before the minDate', () => {
			testUtil.control = new DateInput({
				container: testUtil.container,
				maxDate: new Date('12/1/2006')
			});

			testUtil.control.isFocused(true);
			testUtil.typeText('11/6/2007');
			testUtil.control.isFocused(false);

			return wait(1)
				.then(() => {
					assert.is(testUtil.control.error(), 'Date must be no more than 12/01/2006');
				});
		});

		it('should NOT show an error if the date is the same as the minDate', () => {
			testUtil.control = new DateInput({
				container: testUtil.container,
				maxDate: new Date('12/1/2006')
			});

			testUtil.control.isFocused(true);
			testUtil.typeText('12/1/2006');
			testUtil.control.isFocused(false);

			return wait(1)
				.then(() => {
					assert.is(testUtil.control.error(), '');
				});
		});

		it('should NOT show an error if the date is after the minDate', () => {
			testUtil.control = new DateInput({
				container: testUtil.container,
				maxDate: new Date('12/1/2006')
			});

			testUtil.control.isFocused(true);
			testUtil.typeText('11/26/2006');
			testUtil.control.isFocused(false);

			return wait(1)
				.then(() => {
					assert.is(testUtil.control.error(), '');
				});
		});
	});

	describe('.dateFormat', () => {
		it('should have a default value', () => {
			testUtil.control = new DateInput({
				container: testUtil.container
			});

			assert.is(testUtil.control.dateFormat(), 'MM/dd/yyyy');
		});

		it('should show an error if the input is not valid', () => {
			testUtil.control = new DateInput({
				container: testUtil.container
			});

			testUtil.control.isFocused(true);
			testUtil.typeText('asdf');
			testUtil.control.isFocused(false);

			return wait(1)
				.then(() => {
					assert.is(testUtil.control.error(), 'The date should be formatted: MM/dd/yyyy');
				});
		});

		it('should NOT show an error if the input is valid', () => {
			testUtil.control = new DateInput({
				container: testUtil.container
			});

			testUtil.control.isFocused(true);
			testUtil.typeText('12/12/2007');
			testUtil.control.isFocused(false);

			return wait(1)
				.then(() => {
					assert.is(testUtil.control.error(), '');
				});
		});
	});
});
