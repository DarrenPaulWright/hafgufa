import { assert } from 'chai';
import { Radio } from '../../../src';
import query from '../../query';
import TestUtil from '../../TestUtil';
import ControlTests from '../ControlTests';

const testUtil = new TestUtil(Radio);
const controlTests = new ControlTests(Radio, testUtil, {
	mainCssClass: 'radio'
});

describe('Radio', () => {

	controlTests.run(['width', 'height']);

	describe('.name', () => {
		testUtil.testMethod({
			methodName: 'name',
			defaultValue: '',
			testValue: '1',
			secondTestValue: '2'
		});

		it('should have an input with attr name', () => {
			window.control = new Radio({
				container: window.testContainer,
				name: 'test'
			});

			assert.deepEqual(query.first('input').getAttribute('name'), 'test');
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
			window.control = new Radio({
				container: window.testContainer,
				value: 'test'
			});

			assert.deepEqual(query.first('input').getAttribute('value'), 'test');
		});
	});

	describe('.content', () => {
		it('should NOT have a span if label is not set', () => {
			window.control = new Radio({
				container: window.testContainer
			});

			assert.deepEqual(query.count('div'), 0);
		});

		it('should have a span with text', () => {
			window.control = new Radio({
				container: window.testContainer,
				content: 'test'
			});

			assert.deepEqual(query.first('div').textContent, 'test');
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
			window.control = new Radio({
				container: window.testContainer,
				isChecked: true
			});

			assert.deepEqual(query.first('input').checked, true);
		});
	});

	describe('.onChange', () => {
		it('should not call the onChange callback when isChecked is set to true', () => {
			let context;
			let value;

			window.control = new Radio({
				container: window.testContainer,
				onChange(isChecked) {
					context = this;
					value = isChecked;
				}
			});

			assert.equal(context, undefined);
			assert.equal(value, undefined);

			window.control.isChecked(true);

			assert.equal(context, undefined);
			assert.equal(value, undefined);
		});

		it('should not call the onChange callback when isChecked is set to false', () => {
			let context;
			let value;

			window.control = new Radio({
				container: window.testContainer,
				onChange(isChecked) {
					context = this;
					value = isChecked;
				}
			});

			assert.equal(context, undefined);
			assert.equal(value, undefined);

			window.control.isChecked(true);
			window.control.isChecked(false);

			assert.equal(context, undefined);
			assert.equal(value, undefined);
		});

		it('should call the onChange callback when the label is clicked', () => {
			let context;
			let value;

			window.control = new Radio({
				container: window.testContainer,
				onChange(isChecked) {
					context = this;
					value = isChecked;
				}
			});

			assert.equal(context, undefined);
			assert.equal(value, undefined);

			testUtil.simulateClick(document.querySelector('label'));

			assert.equal(context, window.control);
			assert.equal(value, true);

			testUtil.simulateClick(document.querySelector('label'));

			assert.equal(context, window.control);
			assert.equal(value, false);
		});

		it('should call the onChange callback when the input is clicked', () => {
			let context;
			let value;

			window.control = new Radio({
				container: window.testContainer,
				onChange(isChecked) {
					context = this;
					value = isChecked;
				}
			});

			assert.equal(context, undefined);
			assert.equal(value, undefined);

			testUtil.simulateClick(document.querySelector('input'));

			assert.equal(context, window.control);
			assert.equal(value, true);

			testUtil.simulateClick(document.querySelector('input'));

			assert.equal(context, window.control);
			assert.equal(value, false);
		});
	});
});
