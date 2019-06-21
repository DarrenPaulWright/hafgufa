import { assert } from 'chai';
import { AUTO } from 'type-enforcer';
import { Description } from '../../../src';
import dom from '../../../src/utility/dom';
import { TEXT_ALIGN, WIDTH } from '../../../src/utility/domConstants';
import TestUtil from '../../TestUtil';
import FormControlTests from './FormControlTests';

const testUtil = new TestUtil(Description);
const formControlTests = new FormControlTests(Description, testUtil, {
	mainCssClass: 'description'
});

describe('Description', () => {

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
			window.control = new Description({
				container: window.testContainer,
				title: 'Test Title',
				textWidth: '100px',
				description: 'sample'
			});

			assert.equal(dom.css(document.querySelector('.form-control > div:first-of-type'), WIDTH), '100px');
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
			window.control = new Description({
				container: window.testContainer,
				align: 'center'
			});

			assert.equal(dom.css(document.querySelector('div > div'), TEXT_ALIGN), 'center');
		});
	});

	describe('Focused', () => {
		it('should return false when the isFocused method is called', () => {
			window.control = new Description();

			assert.equal(window.control.isFocused(), false);
		});
	});
});
