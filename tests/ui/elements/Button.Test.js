import { assert } from 'chai';
import { Button } from '../../../src';
import TestUtil from '../../TestUtil';
import ControlTests from '../ControlTests';

const testUtil = new TestUtil(Button);
const controlTests = new ControlTests(Button, testUtil, {
	focusableElement: 'button'
});

describe('Button', () => {

	controlTests.run([], ['focus']);

	describe('.label', () => {
		const TEXT_LABEL = 'This is a button!@#$%^&*()';

		it('should have a label if no label is provided', () => {
			window.control = new Button({
				container: window.testContainer
			});

			assert.equal(document.querySelector('button>span').innerHTML, '&nbsp;');
		});

		it('should have a label if the label option is set', () => {
			window.control = new Button({
				container: window.testContainer,
				label: TEXT_LABEL
			});

			assert.equal(document.querySelector('button>span').textContent, TEXT_LABEL);
		});

		it('should have a label if the setLabel method is called', () => {
			window.control = new Button({
				container: window.testContainer
			})
				.label(TEXT_LABEL);

			assert.equal(document.querySelector('button').textContent, TEXT_LABEL);
		});

		it('should have an "alt" property that is the same as the label if the label is set', () => {
			window.control = new Button({
				container: window.testContainer,
				label: TEXT_LABEL
			});

			assert.equal(document.querySelector('button').getAttribute('alt'), TEXT_LABEL);
		});

		it('should have a "title" property that is the same as the label if the label is set', () => {
			window.control = new Button({
				container: window.testContainer,
				label: TEXT_LABEL
			});

			assert.equal(document.querySelector('button').getAttribute('title'), TEXT_LABEL);
		});
	});

	describe('.isSelected', () => {
		const SELECTED_CLASS = '.selected';

		it('should NOT have a toggled css class when the isSelectable and isSelected options are not set', () => {
			window.control = new Button({
				container: window.testContainer
			});

			assert.equal(document.querySelectorAll(SELECTED_CLASS).length, 0);
		});

		it('should NOT have a toggled css class when the isSelectable option is NOT set and the isSelected method is called', () => {
			window.control = new Button({
				container: window.testContainer
			})
				.isSelected(true);

			assert.equal(document.querySelectorAll(SELECTED_CLASS).length, 0);
		});

		it('should have a toggled css class when the isSelectable and isSelected options are set', () => {
			window.control = new Button({
				container: window.testContainer,
				isSelectable: true,
				isSelected: true
			});

			assert.equal(document.querySelectorAll(SELECTED_CLASS).length, 1);
		});

		it('should have a toggled css class when the isSelectable option is set and the isSelected method is called', () => {
			window.control = new Button({
				container: window.testContainer,
				isSelectable: true
			})
				.isSelected(true);

			assert.equal(document.querySelectorAll(SELECTED_CLASS).length, 1);
		});

		it('should have a toggled css class when the isSelectable method is called and the isSelected method is called', () => {
			window.control = new Button({
				container: window.testContainer
			})
				.isSelectable(true)
				.isSelected(true);

			assert.equal(document.querySelectorAll(SELECTED_CLASS).length, 1);
		});
	});
});
