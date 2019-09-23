import { assert } from 'chai';
import { CheckBox } from '../../../src';
import TestUtil from '../../TestUtil';
import ControlTests from '../ControlTests';

describe('CheckBox', () => {
	const testUtil = new TestUtil(CheckBox);
	const controlTests = new ControlTests(CheckBox, testUtil, {
		mainCssClass: 'checkbox'
	});

	controlTests.run(['width', 'height']);

	describe('.name', () => {
		testUtil.testMethod({
			methodName: 'name',
			defaultValue: '',
			testValue: '1',
			secondTestValue: '2'
		});

		it('should have an input with attr name', () => {
			testUtil.control = new CheckBox({
				container: testUtil.container,
				name: 'test'
			});

			assert.deepEqual(testUtil.first('input').getAttribute('name'), 'test');
		});
	});

	describe('.value', () => {
		testUtil.testMethod({
			methodName: 'value',
			defaultValue: '',
			testValue: '1',
			secondTestValue: '2'
		});

		it('should have an input with attr value', () => {
			testUtil.control = new CheckBox({
				container: testUtil.container,
				value: 'test'
			});

			assert.deepEqual(testUtil.first('input').getAttribute('value'), 'test');
		});
	});

	describe('.content', () => {
		it('should NOT have a span if label is not set', () => {
			testUtil.control = new CheckBox({
				container: testUtil.container
			});

			assert.deepEqual(testUtil.count('div'), 0);
		});

		it('should have a span with text', () => {
			testUtil.control = new CheckBox({
				container: testUtil.container,
				content: 'test'
			});

			assert.deepEqual(testUtil.first('div').textContent, 'test');
		});
	});

	describe('.isChecked', () => {
		testUtil.testMethod({
			methodName: 'isChecked',
			defaultValue: false,
			testValue: true,
			secondTestValue: false,
			testValueClass: 'checked'
		});

		it('should have an inout with property checked=true', () => {
			testUtil.control = new CheckBox({
				container: testUtil.container,
				isChecked: true
			});

			assert.deepEqual(testUtil.first('input').checked, true);
		});
	});

	describe('.isIndeterminate', () => {
		testUtil.testMethod({
			methodName: 'isIndeterminate',
			defaultValue: false,
			testValue: true,
			secondTestValue: false,
			testValueClass: 'indeterminate'
		});

		it('should have an inout with property checked=true', () => {
			testUtil.control = new CheckBox({
				container: testUtil.container,
				isIndeterminate: true
			});

			assert.deepEqual(testUtil.first('input').indeterminate, true);
		});
	});

	describe('.onChange', () => {
		it('should not call the onChange callback when isChecked is set to true', () => {
			let context;
			let value;

			testUtil.control = new CheckBox({
				container: testUtil.container,
				onChange(isChecked) {
					context = this;
					value = isChecked;
				}
			});

			assert.equal(context, undefined);
			assert.equal(value, undefined);

			testUtil.control.isChecked(true);

			assert.equal(context, undefined);
			assert.equal(value, undefined);
		});

		it('should not call the onChange callback when isChecked is set to false', () => {
			let context;
			let value;

			testUtil.control = new CheckBox({
				container: testUtil.container,
				onChange(isChecked) {
					context = this;
					value = isChecked;
				}
			});

			assert.equal(context, undefined);
			assert.equal(value, undefined);

			testUtil.control.isChecked(true);
			testUtil.control.isChecked(false);

			assert.equal(context, undefined);
			assert.equal(value, undefined);
		});

		it('should call the onChange callback when the label is clicked', () => {
			let context;
			let value;

			testUtil.control = new CheckBox({
				container: testUtil.container,
				onChange(isChecked) {
					context = this;
					value = isChecked;
				}
			});

			assert.equal(context, undefined);
			assert.equal(value, undefined);

			testUtil.simulateClick(document.querySelector('label'));

			assert.equal(context, testUtil.control);
			assert.equal(value, true);

			testUtil.simulateClick(document.querySelector('label'));

			assert.equal(context, testUtil.control);
			assert.equal(value, false);
		});

		it('should call the onChange callback when the input is clicked', () => {
			let context;
			let value;

			testUtil.control = new CheckBox({
				container: testUtil.container,
				onChange(isChecked) {
					context = this;
					value = isChecked;
				}
			});

			assert.equal(context, undefined);
			assert.equal(value, undefined);

			testUtil.simulateClick(document.querySelector('input'));

			assert.equal(context, testUtil.control);
			assert.equal(value, true);

			testUtil.simulateClick(document.querySelector('input'));

			assert.equal(context, testUtil.control);
			assert.equal(value, false);
		});
	});
	// describe('Values', () => {
	// 	testUtil.testMethod({
	// 		methodName: 'value',
	// 		defaultValue: [],
	// 		testValue: ['test'],
	// 		secondTestValue: ['test 2']
	// 	});
	//
	// 	it('should have a default value of an empty array', () => {
	// 		testUtil.control = new CheckBox({
	// 			container: testUtil.container
	// 		});
	//
	// 		assert.deepEqual(testUtil.control.value(), []);
	// 	});
	//
	// 	it('should have a value that matches the checked items provided when instantiated', () => {
	// 		testUtil.control = new CheckBox({
	// 			container: testUtil.container,
	// 			values: [{
	// 				'label': 'option1',
	// 				'value': 1,
	// 				'isChecked': true
	// 			}, {
	// 				'label': 'option2',
	// 				'value': 2,
	// 				'isChecked': false
	// 			}, {
	// 				'label': 'option3',
	// 				'value': 3,
	// 				'isChecked': true
	// 			}, {
	// 				'label': 'option4',
	// 				'value': 4,
	// 				'isChecked': false
	// 			}]
	// 		});
	//
	// 		assert.deepEqual(testUtil.control.value(), [1, 3]);
	// 	});
	//
	// 	it('should call the onChange callback when a checkbox is clicked', () => {
	// 		let testVar = '';
	//
	// 		testUtil.control = new CheckBox({
	// 			container: testUtil.container,
	// 			values: [{
	// 				'label': 'option1',
	// 				'value': '1',
	// 				'isChecked': false,
	// 				onChange() {
	// 					testVar = 'test';
	// 				}
	// 			}]
	// 		});
	//
	// 		testUtil.simulateClick(document.querySelector('.checkbox-label'));
	//
	// 		assert.equal(testVar, 'test');
	// 	});
	//
	// 	it('should call the onChecked callback when a checkbox is clicked', () => {
	// 		let testVar = '';
	//
	// 		testUtil.control = new CheckBox({
	// 			container: testUtil.container,
	// 			values: [{
	// 				'label': 'option1',
	// 				'value': '1',
	// 				'isChecked': false,
	// 				onChecked() {
	// 					testVar = 'test';
	// 				}
	// 			}]
	// 		});
	//
	// 		testUtil.simulateClick(document.querySelector('.checkbox-label'));
	//
	// 		assert.equal(testVar, 'test');
	// 	});
	//
	// 	it('should call the onUnChecked callback when a checkbox is clicked twice', () => {
	// 		let testVar = '';
	//
	// 		testUtil.control = new CheckBox({
	// 			container: testUtil.container,
	// 			values: [{
	// 				'label': 'option1',
	// 				'value': '1',
	// 				'isChecked': false,
	// 				onUnChecked() {
	// 					testVar = 'test';
	// 				}
	// 			}]
	// 		});
	//
	// 		testUtil.simulateClick(document.querySelector('.checkbox-label'));
	// 		testUtil.simulateClick(document.querySelector('.checkbox-label'));
	//
	// 		assert.equal(testVar, 'test');
	// 	});
	//
	// 	it('should call the onChecked callback with an event when a checkbox is clicked', () => {
	// 		let testVar = '';
	//
	// 		testUtil.control = new CheckBox({
	// 			container: testUtil.container,
	// 			values: [{
	// 				'label': 'option1',
	// 				'value': '1',
	// 				'isChecked': false,
	// 				onChecked() {
	// 					testVar = event;
	// 				}
	// 			}]
	// 		});
	//
	// 		testUtil.simulateClick(document.querySelector('.checkbox-label'));
	//
	// 		assert.equal(typeof testVar, 'object');
	// 	});
	//
	// 	it('should call the onUnChecked callback with an event when a checkbox is clicked twice', () => {
	// 		let testVar = '';
	//
	// 		testUtil.control = new CheckBox({
	// 			container: testUtil.container,
	// 			values: [{
	// 				'label': 'option1',
	// 				'value': '1',
	// 				'isChecked': false,
	// 				onUnChecked() {
	// 					testVar = event;
	// 				}
	// 			}]
	// 		});
	//
	// 		testUtil.simulateClick(document.querySelector('.checkbox-label'));
	// 		testUtil.simulateClick(document.querySelector('.checkbox-label'));
	//
	// 		assert.equal(typeof testVar, 'object');
	// 	});
	// });
	//
	// describe('IsChecked', () => {
	// 	it('should return false for an option that is set to false', () => {
	// 		testUtil.control = new CheckBox({
	// 			container: testUtil.container,
	// 			values: [{
	// 				'label': 'option1',
	// 				'value': '1',
	// 				'isChecked': true
	// 			}, {
	// 				'label': 'option2',
	// 				'value': '2',
	// 				'isChecked': false
	// 			}, {
	// 				'label': 'option3',
	// 				'value': '3',
	// 				'isChecked': true
	// 			}, {
	// 				'label': 'option4',
	// 				'value': '4',
	// 				'isChecked': false
	// 			}]
	// 		});
	//
	// 		assert.equal(testUtil.control.isChecked('2'), false);
	// 	});
	//
	// 	it('should return true for an option that is set to true', () => {
	// 		testUtil.control = new CheckBox({
	// 			container: testUtil.container,
	// 			values: [{
	// 				'label': 'option1',
	// 				'value': '1',
	// 				'isChecked': true
	// 			}, {
	// 				'label': 'option2',
	// 				'value': '2',
	// 				'isChecked': false
	// 			}, {
	// 				'label': 'option3',
	// 				'value': '3',
	// 				'isChecked': true
	// 			}, {
	// 				'label': 'option4',
	// 				'value': '4',
	// 				'isChecked': false
	// 			}]
	// 		});
	//
	// 		assert.equal(testUtil.control.isChecked('1'), true);
	// 	});
	//
	// 	it('should return false for an option that is set to true and clicked', () => {
	// 		testUtil.control = new CheckBox({
	// 			container: testUtil.container,
	// 			values: [{
	// 				'label': 'option1',
	// 				'value': '1',
	// 				'isChecked': true
	// 			}]
	// 		});
	//
	// 		testUtil.simulateClick(document.querySelector('.checkbox-label'));
	//
	// 		assert.equal(testUtil.control.isChecked('1'), false);
	// 	});
	//
	// 	it('should return true for an option that is set to false and then clicked', () => {
	// 		testUtil.control = new CheckBox({
	// 			container: testUtil.container,
	// 			values: [{
	// 				'label': 'option1',
	// 				'value': '1',
	// 				'isChecked': false
	// 			}]
	// 		});
	//
	// 		testUtil.simulateClick(document.querySelector('.checkbox-label'));
	//
	// 		assert.equal(testUtil.control.isChecked('1'), true);
	// 	});
	//
	// 	it('should return true for an option that is set to true and clicked twice', () => {
	// 		testUtil.control = new CheckBox({
	// 			container: testUtil.container,
	// 			values: [{
	// 				'label': 'option1',
	// 				'value': '1',
	// 				'isChecked': true
	// 			}]
	// 		});
	//
	// 		testUtil.simulateClick(document.querySelector('.checkbox-label'));
	// 		testUtil.simulateClick(document.querySelector('.checkbox-label'));
	//
	// 		assert.equal(testUtil.control.isChecked('1'), true);
	// 	});
	//
	// 	it('should return false for an option that is set to false and then clicked twice', () => {
	// 		testUtil.control = new CheckBox({
	// 			container: testUtil.container,
	// 			values: [{
	// 				'label': 'option1',
	// 				'value': '1',
	// 				'isChecked': false
	// 			}]
	// 		});
	//
	// 		testUtil.simulateClick(document.querySelector('.checkbox-label'));
	// 		testUtil.simulateClick(document.querySelector('.checkbox-label'));
	//
	// 		assert.equal(testUtil.control.isChecked('1'), false);
	// 	});
	// });
	//
	// describe('SetIndeterminate', () => {
	// 	it('should have a class "indeterminate" if setIsDeterminate is set', () => {
	// 		testUtil.control = new CheckBox({
	// 			container: testUtil.container,
	// 			values: [{
	// 				'label': 'option1',
	// 				'value': '1',
	// 				'isChecked': false
	// 			}]
	// 		});
	//
	// 		testUtil.control.setIndeterminate('1');
	//
	// 		assert.deepEqual(document.querySelectorAll('.indeterminate').length, 1);
	// 	});
	// });
});
