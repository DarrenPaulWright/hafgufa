import { assert } from 'chai';
import { CheckBox } from '../..';
import ControlTests from '../ControlTests';
import TestUtil from '../TestUtil';

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

			testUtil.simulateClick(testUtil.first('label'));

			assert.equal(context, testUtil.control);
			assert.equal(value, true);

			testUtil.simulateClick(testUtil.first('label'));

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

			testUtil.simulateClick(testUtil.first('input'));

			assert.equal(context, testUtil.control);
			assert.equal(value, true);

			testUtil.simulateClick(testUtil.first('input'));

			assert.equal(context, testUtil.control);
			assert.equal(value, false);
		});
	});
});
