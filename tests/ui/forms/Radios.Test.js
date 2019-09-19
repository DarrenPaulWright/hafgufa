import { assert } from 'chai';
import { Radios } from '../../../src';
import TestUtil from '../../TestUtil';
import FormControlTests from './FormControlTests';

const testUtil = new TestUtil(Radios);
const formControlTests = new FormControlTests(Radios, testUtil);

describe('Radios', () => {

	formControlTests.run();

	describe('Values', () => {
		testUtil.testMethod({
			methodName: 'value',
			defaultSettings: {
				container: window.testContainer,
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
			window.control = new Radios({
				container: window.testContainer
			});

			assert.deepEqual(window.control.value(), '');
		});

		it('should have a value of 3 when an item of value 3 is checked', () => {
			window.control = new Radios({
				container: window.testContainer,
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

			assert.deepEqual(window.control.value(), '3');
		});

		it('should call the onChange callback when a radio is clicked', () => {
			let testVar = '';

			window.control = new Radios({
				container: window.testContainer,
				values: [{
					content: 'option1',
					value: '1',
					isChecked: false,
					onChange() {
						testVar = 'test';
					}
				}]
			});

			testUtil.simulateClick(document.querySelector('.radio'));

			assert.equal(testVar, 'test');
		});

		it('should call the onChecked callback when a radio is clicked', () => {
			let testVar = '';

			window.control = new Radios({
				container: window.testContainer,
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

			testUtil.simulateClick(document.querySelector('.radio'));

			assert.equal(testVar, 'test');
		});
	});
});
