import { assert } from 'chai';
import { event } from 'd3';
import { CheckBoxes } from '../../../src/';
import TestUtil from '../../TestUtil';
import FormControlTests from './FormControlTests';

const testUtil = new TestUtil(CheckBoxes);
const formControlTests = new FormControlTests(CheckBoxes, testUtil, {
	mainCssClass: 'checkboxes'
});

describe('CheckBoxes', () => {

	formControlTests.run(undefined, undefined, {
		onChange: {
			buildControl: function() {
				window.control = new CheckBoxes({
					container: window.testContainer,
					values: [{
						content: 'option1',
						value: '1',
						isChecked: false
					}]
				});
			},
			validValue: '1',
			setValueViaDom: function() {
				testUtil.simulateClick(document.querySelector('.checkbox'));
			}
		}
	});

	describe('Values', () => {
		it('should have a default value of an empty array', () => {
			window.control = new CheckBoxes({
				container: window.testContainer
			});

			assert.deepEqual(window.control.value(), []);
		});

		it('should have a value that matches the checked items provided when instantiated', () => {
			window.control = new CheckBoxes({
				container: window.testContainer,
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

			assert.deepEqual(window.control.value(), ['1', '3']);
		});

		it('should call the onChange callback when a checkbox is clicked', () => {
			let testVar = '';

			window.control = new CheckBoxes({
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

			testUtil.simulateClick(document.querySelector('.checkbox'));

			assert.equal(testVar, 'test');
		});

		it('should call the onChecked callback when a checkbox is clicked', () => {
			let testVar = '';

			window.control = new CheckBoxes({
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

			testUtil.simulateClick(document.querySelector('.checkbox'));

			assert.equal(testVar, 'test');
		});

		it('should call the onUnChecked callback when a checkbox is clicked twice', () => {
			let testVar = '';

			window.control = new CheckBoxes({
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

			testUtil.simulateClick(document.querySelector('.checkbox'));
			testUtil.simulateClick(document.querySelector('.checkbox'));

			assert.equal(testVar, 'test');
		});

		it('should call the onChecked callback with an event when a checkbox is clicked', () => {
			let testVar = '';

			window.control = new CheckBoxes({
				container: window.testContainer,
				values: [{
					content: 'option1',
					value: '1',
					isChecked: false,
					onChange() {
						testVar = event;
					}
				}]
			});

			testUtil.simulateClick(document.querySelector('.checkbox'));

			assert.equal(typeof testVar, 'object');
		});
	});
});
