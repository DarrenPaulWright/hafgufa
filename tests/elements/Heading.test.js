import { wait } from 'async-agent';
import { assert } from 'type-enforcer';
import { Heading, MOUSE_ENTER_EVENT } from '../../index.js';
import ControlTests from '../ControlTests.js';
import TestUtil from '../TestUtil.js';

describe('Heading', () => {
	const testUtil = new TestUtil(Heading);
	const controlTests = new ControlTests(Heading, testUtil, {
		mainCssClass: 'heading',
		focusableElement: '.heading'
	});

	controlTests.run(['stopPropagation'], 'focus');

	describe('Init', () => {
		it('should have a class \'heading\'', () => {
			testUtil.control = new Heading({
				container: testUtil.container
			});

			assert.is(testUtil.count('.heading'), 1);
		});
	});

	describe('.title', () => {
		testUtil.testMethod({
			methodName: 'title',
			defaultValue: '',
			testValue: 'This is a branch!@#$%^&*()',
			secondTestValue: 'Another title'
		});

		it('should have a span with text in it when title is set', () => {
			testUtil.control = new Heading({
				container: testUtil.container,
				title: 'test 1'
			});

			assert.is(testUtil.first('.heading span').textContent, 'test 1');
		});
	});

	describe('.subTitle', () => {
		testUtil.testMethod({
			methodName: 'subTitle',
			defaultValue: '',
			testValue: 'This is a branch!@#$%^&*()',
			secondTestValue: 'Another title'
		});

		it('should have a div with a class \'subtitle\' with text in it when subTitle is set', () => {
			testUtil.control = new Heading({
				container: testUtil.container,
				subTitle: 'test 1'
			});

			assert.is(testUtil.first('.heading .subtitle').textContent, 'test 1');
		});

		it('should NOT have a div with a class \'subtitle\' when subTitle is set back to an empty string', () => {
			testUtil.control = new Heading({
				container: testUtil.container,
				subTitle: 'test 1'
			});

			testUtil.control.subTitle('');

			assert.is(testUtil.count('.heading .subtitle'), 0);
		});
	});

	describe('.icon', () => {
		testUtil.testMethod({
			methodName: 'icon',
			defaultValue: '',
			testValue: 'edit',
			secondTestValue: 'trash'
		});

		it('should have an icon as the third child when isExpandable is true, isSelectable is true, and an icon is provided', () => {
			testUtil.control = new Heading({
				container: testUtil.container,
				title: 'test 1',
				showExpander: true,
				showCheckbox: true,
				isExpandable: true,
				isSelectable: true,
				icon: 'edit'
			});

			assert.is(testUtil.nthChild('.heading', 2), testUtil.first('.heading > i'));
		});

		it('should not have an icon element in the DOM when icon is set to an icon and then nothing', () => {
			testUtil.control = new Heading({
				container: testUtil.container,
				title: 'test 1',
				isExpandable: true,
				isSelectable: true,
				icon: 'edit'
			});

			testUtil.control.icon('');

			assert.is(testUtil.count('.heading i'), 0);
		});

		it('should have an icon element in the DOM when icon is set and then an image is set', () => {
			testUtil.control = new Heading({
				container: testUtil.container,
				title: 'test 1',
				isExpandable: true,
				isSelectable: true,
				icon: 'edit'
			});

			testUtil.control.image('edit.png');

			assert.is(testUtil.count('.heading i'), 1);
		});
	});

	describe('.iconTooltip', () => {
		testUtil.testMethod({
			methodName: 'iconTooltip',
			defaultValue: '',
			testValue: 'test string',
			secondTestValue: 'another test string'
		});

		it('should have an icon with a tooltip if iconTooltip is set', () => {
			testUtil.control = new Heading({
				container: testUtil.container,
				icon: 'circle',
				iconTooltip: 'test tooltip'
			});

			testUtil.trigger(testUtil.first('i'), MOUSE_ENTER_EVENT);

			return wait(210)
				.then(() => {
					assert.is(testUtil.count('.tooltip', true), 1);
				});
		});
	});

	describe('.image', () => {
		testUtil.testMethod({
			methodName: 'image',
			defaultValue: '',
			testValue: 'edit.png',
			secondTestValue: 'trash.png'
		});

		it('should not have an image element in the DOM when image is set to an image and then nothing', () => {
			testUtil.control = new Heading({
				container: testUtil.container,
				title: 'test 1',
				isExpandable: true,
				isSelectable: true,
				image: 'edit.png'
			});

			testUtil.control.image('');

			assert.is(testUtil.count('.heading img'), 0);
		});

		it('should have an image element in the DOM when image is set and then an icon is set', () => {
			testUtil.control = new Heading({
				container: testUtil.container,
				title: 'test 1',
				isExpandable: true,
				isSelectable: true,
				image: 'edit.png'
			});

			testUtil.control.icon('edit');

			assert.is(testUtil.count('.heading img'), 1);
		});
	});

	describe('.buttons', () => {
		testUtil.testMethod({
			methodName: 'buttons',
			defaultValue: [],
			testValue: [{
				label: 'test 1'
			}],
			secondTestValue: [{
				label: 'test 2'
			}]
		});

		it('should have a div with a class \'toolbar\' when buttons is set', () => {
			testUtil.control = new Heading({
				container: testUtil.container,
				buttons: [{
					label: 'test 1',
					classes: 'test-class'
				}]
			});

			assert.is(testUtil.count('.heading .toolbar'), 1);
		});

		it('should have a the same div when buttons is set twice', () => {
			let buttonContainer;

			testUtil.control = new Heading({
				container: testUtil.container,
				buttons: [{
					label: 'test 1',
					classes: 'test-class'
				}]
			});

			buttonContainer = testUtil.first('.heading .toolbar');

			testUtil.control.buttons([{
				label: 'test 2',
				classes: 'test-class'
			}]);

			assert.is(testUtil.first('.heading .toolbar'), buttonContainer);
		});

		it('should return the set data object first in the click event for buttons', () => {
			let testValue = 0;

			testUtil.control = new Heading({
				container: testUtil.container,
				width: '300px',
				isSelectable: false,
				isExpandable: false,
				data: {
					testProp: 2
				}
			});

			testUtil.control.buttons([{
				label: 'test 1',
				onClick(data) {
					testValue = data.testProp;
				}
			}]);

			testUtil.simulateClick(testUtil.first('.icon-button'));

			assert.is(testValue, 2);
		});

		it('should accept a function for a buttons isEnabled property', () => {
			testUtil.control = new Heading({
				container: testUtil.container,
				width: '300px',
				isSelectable: false,
				isExpandable: false,
				data: {
					testProp: 2
				}
			});

			testUtil.control.buttons([{
				label: 'test 1',
				isEnabled(data) {
					return data.testProp === 3;
				}
			}]);

			assert.is(testUtil.hasClass(testUtil.first('.icon-button'), 'disabled'), true);
		});
	});

	describe('.isSelected', () => {
		testUtil.testMethod({
			methodName: 'isSelected',
			defaultValue: false,
			testValue: true,
			secondTestValue: false
		});

		it('should have a class \'selected\' when isSelected is true', () => {
			testUtil.control = new Heading({
				container: testUtil.container,
				showCheckbox: true,
				isSelected: true
			});

			assert.is(testUtil.count('.heading.selected'), 1);
		});

		it('should have a checked checkbox when isSelected is true', () => {
			testUtil.control = new Heading({
				container: testUtil.container,
				showCheckbox: true,
				isSelected: true
			});

			assert.is(testUtil.first('.heading input[type=checkbox]').checked, true);
		});

		it('should set isSelected to true when clicked', () => {
			testUtil.control = new Heading({
				container: testUtil.container,
				showCheckbox: true,
				isSelected: false
			});

			testUtil.simulateClick(testUtil.first('.heading'));

			assert.is(testUtil.control.isSelected(), true);
		});

		it('should set isSelected to true when the checkbox is clicked', () => {
			testUtil.control = new Heading({
				container: testUtil.container,
				showCheckbox: true,
				isSelected: false
			});

			testUtil.simulateClick(testUtil.first('.heading .checkbox'));

			assert.is(testUtil.control.isSelected(), true);
		});

		it('should set isSelected to false when clicked', () => {
			testUtil.control = new Heading({
				container: testUtil.container,
				showCheckbox: true,
				isSelected: true
			});

			testUtil.simulateClick(testUtil.first('.heading'));

			assert.is(testUtil.control.isSelected(), false);
		});

		it('should set isSelected to false when the checkbox is clicked', () => {
			testUtil.control = new Heading({
				container: testUtil.container,
				showCheckbox: true,
				isSelected: true
			});

			testUtil.simulateClick(testUtil.first('.heading .checkbox'));

			assert.is(testUtil.control.isSelected(), false);
		});
	});

	describe('.isExpandable', () => {
		testUtil.testMethod({
			methodName: 'isExpandable',
			defaultValue: false,
			testValue: true,
			secondTestValue: false
		});

		it('should have class "clickable" if isExpandable is set', () => {
			testUtil.control = new Heading({
				container: testUtil.container,
				isExpandable: true
			});

			assert.is(testUtil.hasClass(testUtil.control.element, 'clickable'), true);
		});

		it('should have a button when isExpandable is true', () => {
			testUtil.control = new Heading({
				container: testUtil.container,
				showExpander: true,
				isExpandable: true
			});

			assert.is(testUtil.count('.heading button'), 1);
		});
	});

	describe('.isExpanded', () => {
		testUtil.testMethod({
			methodName: 'isExpanded',
			defaultValue: false,
			testValue: true,
			secondTestValue: false
		});

		it('should have an empty button when isExpandable is false and isExpanded is true', () => {
			testUtil.control = new Heading({
				container: testUtil.container,
				showExpander: true,
				isExpandable: false,
				isExpanded: true
			});

			assert.is(testUtil.first('button span').innerHTML, '&nbsp;');
		});

		it('should have a div with class \'expander\' and not \'expanded\' when isExpandable is true and isExpanded is true', () => {
			testUtil.control = new Heading({
				container: testUtil.container,
				showExpander: true,
				isExpandable: true,
				isExpanded: true
			});

			assert.is(testUtil.first('button').textContent, '');
		});
	});

	describe('.shouldMainClickExpand', () => {
		testUtil.testMethod({
			methodName: 'shouldMainClickExpand',
			defaultValue: false,
			testValue: true,
			secondTestValue: false
		});

		it('should be expanded when shouldMainClickExpand is true and isExpandable is true and isSelectable is true and the main element is clicked', () => {
			testUtil.control = new Heading({
				container: testUtil.container,
				showExpander: true,
				isExpandable: true,
				shouldMainClickExpand: true,
				isSelectable: true
			});

			testUtil.simulateClick(testUtil.control.element);

			assert.is(testUtil.count('.heading button'), 1);
		});
	});

	describe('.isSelectable', () => {
		testUtil.testMethod({
			methodName: 'isSelectable',
			defaultValue: false,
			testValue: true,
			secondTestValue: false
		});

		it('should have class "clickable" if isSelectable is set', () => {
			testUtil.control = new Heading({
				container: testUtil.container,
				isSelectable: true
			});

			assert.is(testUtil.hasClass(testUtil.control.element, 'clickable'), true);
		});
	});

	describe('.isIndeterminate', () => {
		testUtil.testMethod({
			methodName: 'isIndeterminate',
			defaultValue: false,
			testValue: true,
			secondTestValue: false
		});

		it('should have a class "indeterminate" if isIndeterminate is set', () => {
			testUtil.control = new Heading({
				container: testUtil.container,
				showCheckbox: true,
				isIndeterminate: true
			});

			assert.equal(testUtil.count('.indeterminate'), 1);
		});

		it('should NOT have a div with class \'checked\' when isSelected is true and isIndeterminate is true', () => {
			testUtil.control = new Heading({
				container: testUtil.container,
				showCheckbox: true,
				isSelected: true,
				isIndeterminate: true
			});

			assert.is(testUtil.count('.heading .checked'), 0);
		});

		it('should set isSelected to false when isSelected is true and isIndeterminate is true', () => {
			testUtil.control = new Heading({
				container: testUtil.container,
				showCheckbox: true,
				isSelected: true,
				isIndeterminate: true
			});

			assert.is(testUtil.control.isSelected(), false);
		});
	});

	describe('.showExpander', () => {
		testUtil.testMethod({
			methodName: 'showExpander',
			defaultSettings: {
				container: testUtil.container
			},
			defaultValue: false,
			testValue: true,
			secondTestValue: false
		});

		it('should have a div with class \'expander\' when showExpander is true', () => {
			testUtil.control = new Heading({
				container: testUtil.container,
				showExpander: true,
				isExpandable: true,
				isExpanded: true
			});

			assert.is(testUtil.count('.heading #expander'), 1);
		});

		it('should NOT have a div with class \'expander\' when showExpander is false', () => {
			testUtil.control = new Heading({
				container: testUtil.container,
				showExpander: false,
				isExpandable: true,
				isExpanded: true
			});

			assert.is(testUtil.count('.heading #expander'), 0);
		});
	});

	describe('.showCheckbox', () => {
		testUtil.testMethod({
			methodName: 'showCheckbox',
			defaultSettings: {
				container: testUtil.container
			},
			defaultValue: false,
			testValue: true,
			secondTestValue: false
		});

		it('should have class "clickable" if showCheckbox is set', () => {
			testUtil.control = new Heading({
				container: testUtil.container,
				showCheckbox: true
			});

			assert.is(testUtil.hasClass(testUtil.control.element, 'clickable'), true);
		});

		it('should NOT have a div with class \'checkboxes\' when showCheckbox is false', () => {
			testUtil.control = new Heading({
				container: testUtil.container,
				showCheckbox: false,
				isSelectable: true,
				isSelected: true
			});

			assert.is(testUtil.count('.heading .checkboxes'), 0);
		});
	});

	describe('.onSelect', () => {
		it('should have class "clickable" if onSelect is set', () => {
			testUtil.control = new Heading({
				container: testUtil.container,
				onSelect() {
				}
			});

			assert.is(testUtil.hasClass(testUtil.control.element, 'clickable'), true);
		});

		it('should NOT execute the onSelect callback when clicked if not set', () => {
			const testValue = 1;

			testUtil.control = new Heading({
				container: testUtil.container
			});

			testUtil.simulateClick(testUtil.first('.heading'));

			assert.is(testValue, 1);
		});

		it('should execute the onSelect callback when clicked', () => {
			let testValue = 1;

			testUtil.control = new Heading({
				container: testUtil.container,
				isSelectable: true,

				onSelect() {
					testValue++;
				}
			});

			testUtil.simulateClick(testUtil.first('.heading'));

			assert.is(testValue, 2);
		});

		it('should execute the onSelect callback when the checkbox is clicked', () => {
			let testValue = 1;

			testUtil.control = new Heading({
				container: testUtil.container,
				showCheckbox: true,
				isSelectable: true,
				onSelect() {
					testValue++;
				}
			});

			testUtil.simulateClick(testUtil.first('.heading .checkbox'));

			assert.is(testValue, 2);
		});

		it('should execute the onSelect callback after the onSelect callback is changed and the checkbox is clicked', () => {
			let testValue = 1;

			testUtil.control = new Heading({
				container: testUtil.container,
				showCheckbox: true,
				isSelectable: true,
				onSelect() {
					testValue++;
				}
			});

			testUtil.simulateClick(testUtil.first('.heading .checkbox'));

			assert.is(testValue, 2);

			testUtil.control.onSelect().discardAll();
			testUtil.simulateClick(testUtil.first('.heading .checkbox'));

			assert.is(testValue, 2);

			testUtil.control.onSelect(() => {
				testValue++;
			});
			testUtil.simulateClick(testUtil.first('.heading .checkbox'));

			assert.is(testValue, 3);
		});
	});

	describe('.onExpand', () => {
		it('should NOT execute the onExpand callback when the expander is clicked if isExpandable is false', () => {
			let testValue = 1;

			testUtil.control = new Heading({
				container: testUtil.container,
				isExpandable: false,
				onExpand() {
					testValue = 2;
				}
			});

			testUtil.simulateClick(testUtil.first('.heading'));

			assert.is(testValue, 1);
		});

		it('should NOT execute the onExpand callback when the expander is clicked if onExpand is not set', () => {
			const testValue = 1;

			testUtil.control = new Heading({
				container: testUtil.container,
				isExpandable: true
			});

			testUtil.simulateClick(testUtil.first('.heading'));

			assert.is(testValue, 1);
		});

		it('should execute the onExpand callback when the expander is clicked', () => {
			let testValue = 1;

			testUtil.control = new Heading({
				container: testUtil.container,
				isExpandable: true,
				onExpand() {
					testValue = 2;
				}
			});

			testUtil.simulateClick(testUtil.first('.heading'));

			assert.is(testValue, 2);
		});

		it('should NOT execute the onSelect callback when the expander is clicked', () => {
			let testValue = 1;

			testUtil.control = new Heading({
				container: testUtil.container,
				isExpandable: true,
				onSelect() {
					testValue = 2;
				}
			});

			testUtil.simulateClick(testUtil.first('.heading'));

			assert.is(testValue, 1);
		});

		it('should execute the onExpand callback when the branch is clicked and isSelectable is false', () => {
			let testValue = 1;

			testUtil.control = new Heading({
				container: testUtil.container,
				isExpandable: true,
				isSelectable: false,
				onExpand() {
					testValue = 2;
				}
			});

			testUtil.simulateClick(testUtil.first('.heading'));

			assert.is(testValue, 2);
		});
	});

	describe('.data', () => {
		testUtil.testMethod({
			methodName: 'data',
			defaultValue: undefined,
			testValue: {
				testProp: 'test 1'
			},
			secondTestValue: {
				testProp2: 'test 2'
			}
		});
	});
});
