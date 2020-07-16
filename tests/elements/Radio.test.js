import { assert } from 'type-enforcer';
import { Radio } from '../../index.js';
import ControlTests from '../ControlTests.js';
import TestUtil from '../TestUtil.js';

describe('Radio', () => {
	const testUtil = new TestUtil(Radio);
	const controlTests = new ControlTests(Radio, testUtil, {
		mainCssClass: 'radio'
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
			testUtil.control = new Radio({
				container: testUtil.container,
				name: 'test'
			});

			assert.equal(testUtil.first('input').getAttribute('name'), 'test');
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
			testUtil.control = new Radio({
				container: testUtil.container,
				value: 'test'
			});

			assert.equal(testUtil.first('input').getAttribute('value'), 'test');
		});
	});

	describe('.content', () => {
		it('should NOT have a span if label is not set', () => {
			testUtil.control = new Radio({
				container: testUtil.container
			});

			assert.equal(testUtil.count('div'), 0);
		});

		it('should have a span with text', () => {
			testUtil.control = new Radio({
				container: testUtil.container,
				content: 'test'
			});

			assert.equal(testUtil.first('div').textContent, 'test');
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
			testUtil.control = new Radio({
				container: testUtil.container,
				isChecked: true
			});

			assert.equal(testUtil.first('input').checked, true);
		});
	});

	describe('.onChange', () => {
		it('should not call the onChange callback when isChecked is set to true', () => {
			let context;
			let value;

			testUtil.control = new Radio({
				container: testUtil.container,
				onChange(isChecked) {
					context = this;
					value = isChecked;
				}
			});

			assert.is(context, undefined);
			assert.is(value, undefined);

			testUtil.control.isChecked(true);

			assert.is(context, undefined);
			assert.is(value, undefined);
		});

		it('should not call the onChange callback when isChecked is set to false', () => {
			let context;
			let value;

			testUtil.control = new Radio({
				container: testUtil.container,
				onChange(isChecked) {
					context = this;
					value = isChecked;
				}
			});

			assert.is(context, undefined);
			assert.is(value, undefined);

			testUtil.control.isChecked(true);
			testUtil.control.isChecked(false);

			assert.is(context, undefined);
			assert.is(value, undefined);
		});

		it('should call the onChange callback when the label is clicked', () => {
			let context;
			let value;

			testUtil.control = new Radio({
				container: testUtil.container,
				onChange(isChecked) {
					context = this;
					value = isChecked;
				}
			});

			assert.is(context, undefined);
			assert.is(value, undefined);

			testUtil.simulateClick(testUtil.first('label'));

			assert.is(context, testUtil.control);
			assert.is(value, true);

			testUtil.simulateClick(testUtil.first('label'));

			assert.is(context, testUtil.control);
			assert.is(value, false);
		});

		it('should call the onChange callback when the input is clicked', () => {
			let context;
			let value;

			testUtil.control = new Radio({
				container: testUtil.container,
				onChange(isChecked) {
					context = this;
					value = isChecked;
				}
			});

			assert.is(context, undefined);
			assert.is(value, undefined);

			testUtil.simulateClick(testUtil.first('input'));

			assert.is(context, testUtil.control);
			assert.is(value, true);

			testUtil.simulateClick(testUtil.first('input'));

			assert.is(context, testUtil.control);
			assert.is(value, false);
		});
	});
});
