import { assert } from 'type-enforcer';
import { CheckBoxes } from '../../index.js';
import TestUtil from '../TestUtil.js';

describe('CheckBoxes', () => {
	const testUtil = new TestUtil(CheckBoxes);
	testUtil.run({
		mainCssClass: 'checkboxes',
		settings: {
			values: [{
				content: 'option1',
				value: '1',
				isChecked: false
			}]
		},
		extraTests: {
			onChange: {
				buildControl() {
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
				setValueViaDom() {
					testUtil.simulateClick(testUtil.first('.checkbox'));
				}
			}
		}
	});

	describe('.values', () => {
		it('should have a default value of an empty array', () => {
			testUtil.control = new CheckBoxes({
				container: testUtil.container
			});

			assert.equal(testUtil.control.value(), []);
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

			assert.equal(testUtil.control.value(), ['1', '3']);
		});

		it('should call the onChange callback when a checkbox is clicked', () => {
			let testValue = '';

			testUtil.control = new CheckBoxes({
				container: testUtil.container,
				values: [{
					content: 'option1',
					value: '1',
					isChecked: false,
					onChange() {
						testValue = 'test';
					}
				}]
			});

			testUtil.simulateClick(testUtil.first('.checkbox'));

			assert.is(testValue, 'test');
		});

		it('should call the onChecked callback when a checkbox is clicked', () => {
			let testValue = '';

			testUtil.control = new CheckBoxes({
				container: testUtil.container,
				values: [{
					content: 'option1',
					value: '1',
					isChecked: false,
					onChange() {
						testValue = 'test';
					}
				}]
			});

			testUtil.simulateClick(testUtil.first('.checkbox'));

			assert.is(testValue, 'test');
		});

		it('should call the onUnChecked callback when a checkbox is clicked twice', () => {
			let testValue = '';

			testUtil.control = new CheckBoxes({
				container: testUtil.container,
				values: [{
					content: 'option1',
					value: '1',
					isChecked: false,
					onChange() {
						testValue = 'test';
					}
				}]
			});

			testUtil.simulateClick(testUtil.first('.checkbox'));
			testUtil.simulateClick(testUtil.first('.checkbox'));

			assert.is(testValue, 'test');
		});

		it('should call the onChecked callback with an event when a checkbox is clicked', () => {
			let testValue = '';

			testUtil.control = new CheckBoxes({
				container: testUtil.container,
				values: [{
					content: 'option1',
					value: '1',
					isChecked: false,
					onChange(isChecked, event) {
						testValue = event;
					}
				}]
			});

			testUtil.simulateClick(testUtil.first('.checkbox'));

			assert.is(typeof testValue, 'object');
		});
	});
});
