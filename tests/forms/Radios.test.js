import { assert } from 'type-enforcer';
import { Radios } from '../..';
import TestUtil from '../TestUtil';
import FormControlTests from './FormControlTests';

describe('Radios', () => {
	const testUtil = new TestUtil(Radios);
	const formControlTests = new FormControlTests(Radios, testUtil);

	formControlTests.run();

	describe('Values', () => {
		testUtil.testMethod({
			methodName: 'value',
			defaultSettings: {
				container: testUtil.container,
				values: [{
					content: 'option1',
					value: '1',
					isChecked: false
				}, {
					content: 'option2',
					value: '2',
					isChecked: false
				}, {
					content: 'option3',
					value: '3',
					isChecked: false
				}, {
					content: 'option4',
					value: '4',
					isChecked: false
				}]
			},
			defaultValue: '',
			testValue: '1',
			secondTestValue: '2'
		});

		it('should have a default value of an empty string', () => {
			testUtil.control = new Radios({
				container: testUtil.container
			});

			assert.equal(testUtil.control.value(), '');
		});

		it('should have a value of 3 when an item of value 3 is checked', () => {
			testUtil.control = new Radios({
				container: testUtil.container,
				values: [{
					content: 'option1',
					value: '1',
					isChecked: false
				}, {
					content: 'option2',
					value: '2',
					isChecked: false
				}, {
					content: 'option3',
					value: '3',
					isChecked: true
				}, {
					content: 'option4',
					value: '4',
					isChecked: false
				}]
			});

			assert.equal(testUtil.control.value(), '3');
		});

		it('should call the onChange callback when a radio is clicked', () => {
			let testVar = '';

			testUtil.control = new Radios({
				container: testUtil.container,
				values: [{
					content: 'option1',
					value: '1',
					isChecked: false,
					onChange() {
						testVar = 'test';
					}
				}]
			});

			testUtil.simulateClick(testUtil.first('.radio'));

			assert.is(testVar, 'test');
		});

		it('should call the onChecked callback when a radio is clicked', () => {
			let testVar = '';

			testUtil.control = new Radios({
				container: testUtil.container,
				values: [{
					content: 'option1',
					value: '1',
					isChecked: false,
					onChange() {
						testVar = 'test';
					}
				}, {
					content: 'option2',
					value: '2',
					isChecked: false
				}]
			});

			testUtil.simulateClick(testUtil.first('.radio'));

			assert.is(testVar, 'test');
		});
	});
});
