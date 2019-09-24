import { assert } from 'chai';
import { AUTO } from 'type-enforcer';
import { Description, dom, TEXT_ALIGN, WIDTH } from '../../../src';
import TestUtil from '../../TestUtil';
import FormControlTests from './FormControlTests';

describe('Description', () => {
	const testUtil = new TestUtil(Description);
	const formControlTests = new FormControlTests(Description, testUtil, {
		mainCssClass: 'description'
	});

	formControlTests.run();

	describe('Value', () => {
		testUtil.testMethod({
			methodName: 'value',
			defaultValue: '',
			testValue: 'test String 2130478#$%&^#$%&',
			secondTestValue: 'test String 2'
		});
	});

	describe('TextWidth', () => {
		testUtil.testMethod({
			methodName: 'textWidth',
			defaultValue: AUTO,
			testValue: '100px',
			secondTestValue: '200px'
		});

		it('should set the width of the content div to whatever is passed in to the textWidth option', () => {
			testUtil.control = new Description({
				container: testUtil.container,
				title: 'Test Title',
				textWidth: '100px',
				description: 'sample'
			});

			assert.equal(dom.css(testUtil.first('.form-control > div:first-of-type'), WIDTH), '100px');
		});
	});

	describe('Align', () => {
		testUtil.testMethod({
			methodName: 'align',
			defaultValue: 'left',
			testValue: 'center',
			secondTestValue: 'middle'
		});

		it('should set the text-align css property of the content div to whatever is passed in to the align option', () => {
			testUtil.control = new Description({
				container: testUtil.container,
				align: 'center'
			});

			assert.equal(dom.css(testUtil.first('.description > div'), TEXT_ALIGN), 'center');
		});
	});

	describe('Focused', () => {
		it('should return false when the isFocused method is called', () => {
			testUtil.control = new Description();

			assert.equal(testUtil.control.isFocused(), false);
		});
	});
});
