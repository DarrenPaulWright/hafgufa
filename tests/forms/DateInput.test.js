import { wait } from 'async-agent';
import { assert } from 'type-enforcer';
import { DateInput, locale } from '../../index.js';
import TestUtil from '../TestUtil.js';

locale.set({
	'dateFormatError': 'The date should be formatted: <dateFormat>',
	'maxDateError': 'Date must be no more than <maxDate>',
	'minDateError': 'Date must be at least <minDate>'
});

describe('DateInput', () => {
	const testUtil = new TestUtil(DateInput);
	testUtil.run();

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
