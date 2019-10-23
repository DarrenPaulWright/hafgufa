import { assert } from 'chai';
import { CheckBoxes } from '../../../src';
import TestUtil from '../../TestUtil';
import FormControlTests from './FormControlTests';

describe('CheckBoxes', () => {
	const testUtil = new TestUtil(CheckBoxes);
	const formControlTests = new FormControlTests(CheckBoxes, testUtil, {
		mainCssClass: 'checkboxes'
	});

	formControlTests.run(undefined, undefined, {
		onChange: {
			buildControl: function() {
				testUtil.control = new CheckBoxes({
					container: testUtil.container,
					values: [{
						content: 'option1',
						value: '1',
						isChecked: false
					}]
				});
			},
			validValue: '1',
			setValueViaDom: function() {
				testUtil.simulateClick(testUtil.first('.checkbox'));
			}
		}
	});

	describe('Values', () => {
		it('should have a default value of an empty array', () => {
			testUtil.control = new CheckBoxes({
				container: testUtil.container
			});

			assert.deepEqual(testUtil.control.value(), []);
		});

		it('should have a value that matches the checked items provided when instantiated', () => {
			testUtil.control = new CheckBoxes({
				container: testUtil.container,
				values: [{
					content: 'option1',
					value: '1',
					isChecked: true
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

			assert.deepEqual(testUtil.control.value(), ['1', '3']);
		});

		it('should call the onChange callback when a checkbox is clicked', () => {
			let testVar = '';

			testUtil.control = new CheckBoxes({
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

			testUtil.simulateClick(testUtil.first('.checkbox'));

			assert.equal(testVar, 'test');
		});

		it('should call the onChecked callback when a checkbox is clicked', () => {
			let testVar = '';

			testUtil.control = new CheckBoxes({
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

			testUtil.simulateClick(testUtil.first('.checkbox'));

			assert.equal(testVar, 'test');
		});

		it('should call the onUnChecked callback when a checkbox is clicked twice', () => {
			let testVar = '';

			testUtil.control = new CheckBoxes({
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

			testUtil.simulateClick(testUtil.first('.checkbox'));
			testUtil.simulateClick(testUtil.first('.checkbox'));

			assert.equal(testVar, 'test');
		});

		it('should call the onChecked callback with an event when a checkbox is clicked', () => {
			let testVar = '';

			testUtil.control = new CheckBoxes({
				container: testUtil.container,
				values: [{
					content: 'option1',
					value: '1',
					isChecked: false,
					onChange(isChecked, event) {
						testVar = event;
					}
				}]
			});

			testUtil.simulateClick(testUtil.first('.checkbox'));

			assert.equal(typeof testVar, 'object');
		});
	});
});
