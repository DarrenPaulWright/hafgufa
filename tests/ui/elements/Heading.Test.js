import { assert } from 'chai';
import { Heading, HEADING_LEVELS } from '../../../src';
import { MOUSE_ENTER_EVENT, WINDOW } from '../../../src/utility/domConstants';
import query from '../../query';
import TestUtil from '../../TestUtil';
import ControlBaseTests from '../ControlBaseTests';

const testUtil = new TestUtil(Heading);
const controlBaseTests = new ControlBaseTests(Heading, testUtil, {
	mainCssClass: 'heading',
	focusableElement: '.heading'
});

describe('Heading', () => {

	controlBaseTests.run(['stopPropagation'], 'focus');

	describe('Init', () => {
		it('should have a class \'heading\'', () => {
			WINDOW.control = new Heading({
				container: WINDOW.testContainer
			});

			assert.equal(query.count('.heading'), 1);
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
			WINDOW.control = new Heading({
				container: WINDOW.testContainer,
				title: 'test 1'
			});

			assert.equal(query.first('.heading span').innerText, 'test 1');
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
			WINDOW.control = new Heading({
				container: WINDOW.testContainer,
				subTitle: 'test 1'
			});

			assert.equal(query.first('.heading .subtitle').textContent, 'test 1');
		});

		it('should NOT have a div with a class \'subtitle\' when subTitle is set back to an empty string', () => {
			WINDOW.control = new Heading({
				container: WINDOW.testContainer,
				subTitle: 'test 1'
			});

			WINDOW.control.subTitle('');

			assert.equal(query.count('.heading .subtitle'), 0);
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
			WINDOW.control = new Heading({
				container: WINDOW.testContainer,
				title: 'test 1',
				showExpander: true,
				showCheckbox: true,
				isExpandable: true,
				isSelectable: true,
				icon: 'edit'
			});

			assert.equal(query.nthChild('.heading', 2), query.first('.heading > i'));
		});

		it('should not have an icon element in the DOM when icon is set to an icon and then nothing', () => {
			WINDOW.control = new Heading({
				container: WINDOW.testContainer,
				title: 'test 1',
				isExpandable: true,
				isSelectable: true,
				icon: 'edit'
			});

			WINDOW.control.icon('');

			assert.equal(query.count('.heading i'), 0);
		});

		it('should have an icon element in the DOM when icon is set and then an image is set', () => {
			WINDOW.control = new Heading({
				container: WINDOW.testContainer,
				title: 'test 1',
				isExpandable: true,
				isSelectable: true,
				icon: 'edit'
			});

			WINDOW.control.image('edit.png');

			assert.equal(query.count('.heading i'), 1);
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
			WINDOW.control = new Heading({
				container: WINDOW.testContainer,
				icon: 'circle',
				iconTooltip: 'test tooltip'
			});

			testUtil.trigger(query.first('i'), MOUSE_ENTER_EVENT);

			return testUtil.delay(210)
				.then(() => {
					assert.equal(document.querySelectorAll('.tooltip').length, 1);
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

		it('should have a div with a class \'image\' as the third child when isExpandable is true, isSelectable is true, and an image is provided', () => {
			WINDOW.control = new Heading({
				container: WINDOW.testContainer,
				title: 'test 1',
				isExpandable: true,
				isSelectable: true,
				image: 'edit.png'
			});

			assert.equal(query.nth('.heading', 2), query.first('.heading .image'));
		});

		it('should not have an image element in the DOM when image is set to an image and then nothing', () => {
			WINDOW.control = new Heading({
				container: WINDOW.testContainer,
				title: 'test 1',
				isExpandable: true,
				isSelectable: true,
				image: 'edit.png'
			});

			WINDOW.control.image('');

			assert.equal(query.count('.heading .image'), 0);
		});

		it('should have an image element in the DOM when image is set and then an icon is set', () => {
			WINDOW.control = new Heading({
				container: WINDOW.testContainer,
				title: 'test 1',
				isExpandable: true,
				isSelectable: true,
				image: 'edit.png'
			});

			WINDOW.control.icon('edit');

			assert.equal(query.count('.heading img'), 1);
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
			WINDOW.control = new Heading({
				container: WINDOW.testContainer,
				buttons: [{
					label: 'test 1',
					classes: 'test-class'
				}]
			});

			assert.equal(query.count('.heading .toolbar'), 1);
		});

		it('should have a the same div when buttons is set twice', () => {
			let buttonContainer;

			WINDOW.control = new Heading({
				container: WINDOW.testContainer,
				buttons: [{
					label: 'test 1',
					classes: 'test-class'
				}]
			});

			buttonContainer = query.first('.heading .toolbar');

			WINDOW.control.buttons([{
				label: 'test 2',
				classes: 'test-class'
			}]);

			assert.equal(query.first('.heading .toolbar'), buttonContainer);
		});

		it('should return the set data object first in the click event for buttons', () => {
			let testVar = 0;

			WINDOW.control = new Heading({
				container: WINDOW.testContainer,
				width: '300px',
				isSelectable: false,
				isExpandable: false,
				data: {
					testProp: 2
				}
			});

			WINDOW.control.buttons([{
				label: 'test 1',
				onClick: function(data) {
					testVar = data.testProp;
				}
			}]);

			testUtil.simulateClick(query.first('.icon-button'));

			assert.equal(testVar, 2);
		});

		it('should accept a function for a buttons isEnabled property', () => {
			WINDOW.control = new Heading({
				container: WINDOW.testContainer,
				width: '300px',
				isSelectable: false,
				isExpandable: false,
				data: {
					testProp: 2
				}
			});

			WINDOW.control.buttons([{
				label: 'test 1',
				isEnabled: function(data) {
					return data.testProp === 3;
				}
			}]);

			assert.isTrue(query.hasClass(query.first('.icon-button'), 'disabled'));
		});
	});

	describe('.level', () => {
		testUtil.testMethod({
			methodName: 'level',
			defaultValue: HEADING_LEVELS.SIX,
			testValue: HEADING_LEVELS.FOUR,
			secondTestValue: HEADING_LEVELS.THREE
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
			WINDOW.control = new Heading({
				container: WINDOW.testContainer,
				showCheckbox: true,
				isSelected: true
			});

			assert.equal(query.count('.heading.selected'), 1);
		});

		it('should have a checked checkbox when isSelected is true', () => {
			WINDOW.control = new Heading({
				container: WINDOW.testContainer,
				showCheckbox: true,
				isSelected: true
			});

			assert.isTrue(query.first('.heading input[type=checkbox]').checked);
		});
	});

	describe('.isExpandable', () => {
		testUtil.testMethod({
			methodName: 'isExpandable',
			defaultValue: false,
			testValue: true,
			secondTestValue: false
		});

		it('should have a button when isExpandable is true', () => {
			WINDOW.control = new Heading({
				container: WINDOW.testContainer,
				showExpander: true,
				isExpandable: true
			});

			assert.equal(query.count('.heading button'), 1);
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
			WINDOW.control = new Heading({
				container: WINDOW.testContainer,
				showExpander: true,
				isExpandable: false,
				isExpanded: true
			});

			assert.equal(query.first('button span').innerHTML, '&nbsp;');
		});

		it('should have a div with class \'expander\' and not \'expanded\' when isExpandable is true and isExpanded is true', () => {
			WINDOW.control = new Heading({
				container: WINDOW.testContainer,
				showExpander: true,
				isExpandable: true,
				isExpanded: true
			});

			assert.equal(query.first('button').textContent, '');
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
			WINDOW.control = new Heading({
				container: WINDOW.testContainer,
				showExpander: true,
				isExpandable: true,
				shouldMainClickExpand: true,
				isSelectable: true
			});

			testUtil.simulateClick(WINDOW.control.element());

			assert.equal(query.count('.heading button'), 1);
		});
	});

	describe('.isSelectable', () => {
		testUtil.testMethod({
			methodName: 'isSelectable',
			defaultValue: false,
			testValue: true,
			secondTestValue: false
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
			WINDOW.control = new Heading({
				container: WINDOW.testContainer,
				showCheckbox: true,
				isIndeterminate: true
			});

			assert.deepEqual(query.count('.indeterminate'), 1);
		});

		it('should NOT have a div with class \'checked\' when isSelected is true and isIndeterminate is true', () => {
			WINDOW.control = new Heading({
				container: WINDOW.testContainer,
				showCheckbox: true,
				isSelected: true,
				isIndeterminate: true
			});

			assert.equal(query.count('.heading .checked'), 0);
		});

		it('should set isSelected to false when isSelected is true and isIndeterminate is true', () => {
			WINDOW.control = new Heading({
				container: WINDOW.testContainer,
				showCheckbox: true,
				isSelected: true,
				isIndeterminate: true
			});

			assert.equal(WINDOW.control.isSelected(), false);
		});
	});

	describe('.showExpander', () => {
		testUtil.testMethod({
			methodName: 'showExpander',
			defaultSettings: {
				container: WINDOW.testContainer
			},
			defaultValue: false,
			testValue: true,
			secondTestValue: false
		});

		it('should NOT have a div with class \'expander\' when showExpander is false', () => {
			WINDOW.control = new Heading({
				container: WINDOW.testContainer,
				showExpander: false,
				isExpandable: true,
				isExpanded: true
			});

			assert.equal(query.count('.heading .expander'), 0);
		});
	});

	describe('.showCheckbox', () => {
		testUtil.testMethod({
			methodName: 'showCheckbox',
			defaultSettings: {
				container: WINDOW.testContainer
			},
			defaultValue: false,
			testValue: true,
			secondTestValue: false
		});

		it('should NOT have a div with class \'checkboxes\' when showCheckbox is false', () => {
			WINDOW.control = new Heading({
				container: WINDOW.testContainer,
				showCheckbox: false,
				isSelectable: true,
				isSelected: true
			});

			assert.equal(query.count('.heading .checkboxes'), 0);
		});
	});

	describe('.onSelect', () => {
		testUtil.testMethod({
			methodName: 'onSelect',
			defaultValue: undefined,
			testValue: function() {
			}
		});

		it('should NOT execute the onSelect callback when clicked if not set', () => {
			let testVar = 1;

			WINDOW.control = new Heading({
				container: WINDOW.testContainer
			});

			testUtil.simulateClick(query.first('.heading'));

			assert.equal(testVar, 1);
		});

		it('should execute the onSelect callback when clicked', () => {
			let testVar = 1;

			WINDOW.control = new Heading({
				container: WINDOW.testContainer,
				isSelectable: true,
				onSelect: function() {
					testVar = 2;
				}
			});

			testUtil.simulateClick(query.first('.heading'));

			assert.equal(testVar, 2);
		});
	});

	describe('.onExpand', () => {
		testUtil.testMethod({
			methodName: 'onExpand',
			defaultValue: undefined,
			testValue: function() {
			}
		});

		it('should NOT execute the onExpand callback when the expander is clicked if isExpandable is false', () => {
			let testVar = 1;

			WINDOW.control = new Heading({
				container: WINDOW.testContainer,
				isExpandable: false,
				onExpand: function() {
					testVar = 2;
				}
			});

			testUtil.simulateClick(query.first('.heading'));

			assert.equal(testVar, 1);
		});

		it('should NOT execute the onExpand callback when the expander is clicked if onExpand is not set', () => {
			let testVar = 1;

			WINDOW.control = new Heading({
				container: WINDOW.testContainer,
				isExpandable: true
			});

			testUtil.simulateClick(query.first('.heading'));

			assert.equal(testVar, 1);
		});

		it('should execute the onExpand callback when the expander is clicked', () => {
			let testVar = 1;

			WINDOW.control = new Heading({
				container: WINDOW.testContainer,
				isExpandable: true,
				onExpand: function() {
					testVar = 2;
				}
			});

			testUtil.simulateClick(query.first('.heading'));

			assert.equal(testVar, 2);
		});

		it('should NOT execute the onSelect callback when the expander is clicked', () => {
			let testVar = 1;

			WINDOW.control = new Heading({
				container: WINDOW.testContainer,
				isExpandable: true,
				onSelect: function() {
					testVar = 2;
				}
			});

			testUtil.simulateClick(query.first('.heading'));

			assert.equal(testVar, 1);
		});

		it('should execute the onExpand callback when the branch is clicked and isSelectable is false', () => {
			let testVar = 1;

			WINDOW.control = new Heading({
				container: WINDOW.testContainer,
				isExpandable: true,
				isSelectable: false,
				onExpand: function() {
					testVar = 2;
				}
			});

			testUtil.simulateClick(query.first('.heading'));

			assert.equal(testVar, 2);
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
