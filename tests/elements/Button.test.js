import { assert } from 'type-enforcer';
import { Button } from '../../index.js';
import TestUtil from '../TestUtil.js';

describe('Button', () => {
	const testUtil = new TestUtil(Button);
	testUtil.run({
		extraTests: { focus: true },
		focusableElement: 'button'
	});

	describe('.label', () => {
		const TEXT_LABEL = 'This is a button!@#$%^&*()';

		it('should have a label if no label is provided', () => {
			testUtil.control = new Button({
				container: testUtil.container
			});

			assert.is(testUtil.first('button>span').innerHTML, '&nbsp;');
		});

		it('should have a label if the label option is set', () => {
			testUtil.control = new Button({
				container: testUtil.container,
				label: TEXT_LABEL
			});

			assert.is(testUtil.first('button>span').textContent, TEXT_LABEL);
		});

		it('should have a label if the setLabel method is called', () => {
			testUtil.control = new Button({
				container: testUtil.container
			})
				.label(TEXT_LABEL);

			assert.is(testUtil.first('button').textContent, TEXT_LABEL);
		});

		it('should have an "alt" property that is the same as the label if the label is set', () => {
			testUtil.control = new Button({
				container: testUtil.container,
				label: TEXT_LABEL
			});

			assert.is(testUtil.first('button').getAttribute('alt'), TEXT_LABEL);
		});

		it('should have a "title" property that is the same as the label if the label is set', () => {
			testUtil.control = new Button({
				container: testUtil.container,
				label: TEXT_LABEL
			});

			assert.is(testUtil.first('button').getAttribute('title'), TEXT_LABEL);
		});
	});

	describe('.isSelected', () => {
		const SELECTED_CLASS = '.selected';

		it('should NOT have a toggled css class when the isSelectable and isSelected options are not set', () => {
			testUtil.control = new Button({
				container: testUtil.container
			});

			assert.is(testUtil.count(SELECTED_CLASS), 0);
		});

		it('should NOT have a toggled css class when the isSelectable option is NOT set and the isSelected method is called', () => {
			testUtil.control = new Button({
				container: testUtil.container
			})
				.isSelected(true);

			assert.is(testUtil.count(SELECTED_CLASS), 0);
		});

		it('should have a toggled css class when the isSelectable and isSelected options are set', () => {
			testUtil.control = new Button({
				container: testUtil.container,
				isSelectable: true,
				isSelected: true
			});

			assert.is(testUtil.count(SELECTED_CLASS), 1);
		});

		it('should have a toggled css class when the isSelectable option is set and the isSelected method is called', () => {
			testUtil.control = new Button({
				container: testUtil.container,
				isSelectable: true
			})
				.isSelected(true);

			assert.is(testUtil.count(SELECTED_CLASS), 1);
		});

		it('should have a toggled css class when the isSelectable method is called and the isSelected method is called', () => {
			testUtil.control = new Button({
				container: testUtil.container
			})
				.isSelectable(true)
				.isSelected(true);

			assert.is(testUtil.count(SELECTED_CLASS), 1);
		});
	});

	describe('.onMouseEnter', () => {
		it('should call the callback when the mouse enters the button', () => {
			let testValue = '';

			testUtil.control = new Button({
				container: testUtil.container,
				onMouseEnter() {
					testValue = this;
				}
			});

			testUtil.trigger(testUtil.control.element, 'mouseenter');

			assert.is(testUtil.control, testValue);
		});
	});

	describe('.onMouseLeave', () => {
		it('should call the callback when the mouse leaves the button', () => {
			let testValue = '';

			testUtil.control = new Button({
				container: testUtil.container,
				onMouseEnter() {
					testValue = 'fail';
				},
				onMouseLeave() {
					testValue = this;
				}
			});

			testUtil.trigger(testUtil.control.element, 'mouseenter');
			testUtil.trigger(testUtil.control.element, 'mouseleave');

			assert.is(testUtil.control, testValue);
		});
	});
});
