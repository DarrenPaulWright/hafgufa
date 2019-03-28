import { assert } from 'chai';
import { AUTO } from 'type-enforcer';
import { Button, Heading, VirtualList } from '../../../src';
import dom from '../../../src/utility/dom';
import { SCROLL_EVENT } from '../../../src/utility/domConstants';
import TestUtil from '../../TestUtil';
import ControlTests from '../ControlTests';

const testUtil = new TestUtil(VirtualList);
const controlTests = new ControlTests(VirtualList, testUtil, {
	extraSettings: {
		itemControl: Button,
		itemData: [{
			ID: 1,
			text: 'test'
		}]
	},
	focusableElement: 'button'
});

const VIRTUAL_LIST_CLASS = '.virtual-list';
const VIRTUAL_ITEM_CLASS = '.virtual-item';
const EMPTY_CONTENT_CLASS = '.empty-content-message';

const testRows = [{
	ID: 1
}, {
	ID: 2
}, {
	ID: 3
}];

describe('VirtualList', () => {

	controlTests.run(['stopPropagation'], ['focus']);

	describe('InitialLayout', () => {
		it('should have a css class called ' + VIRTUAL_LIST_CLASS, () => {
			window.control = new VirtualList({
				container: window.testContainer
			});

			assert.equal(document.querySelectorAll(VIRTUAL_LIST_CLASS).length, 1);
		});
	});

	describe('Rows', () => {
		testUtil.testMethod({
			methodName: 'itemData',
			defaultValue: [],
			testValue: testRows
		});

		it('should display the same items that are passed in to the items options', () => {
			window.control = new VirtualList({
				container: window.testContainer,
				itemControl: Button,
				height: '100px',
				itemData: testRows
			});

			return testUtil.defer()
				.then(() => {
					assert.equal(document.querySelectorAll(VIRTUAL_ITEM_CLASS).length, 3);
				});
		});

		it('should display the same items that are passed in to the items method', () => {
			window.control = new VirtualList({
				container: window.testContainer,
				height: '100px'
			})
				.itemControl(Button)
				.itemData(testRows);

			return testUtil.defer()
				.then(() => {
					assert.equal(document.querySelectorAll(VIRTUAL_ITEM_CLASS).length, 3);
				});
		});

		it('should display an "empty content" message when there are no items', () => {
			window.control = new VirtualList({
				container: window.testContainer,
				emptyContentMessage: 'No Content'
			});

			assert.equal(document.querySelectorAll(EMPTY_CONTENT_CLASS).length, 1);
		});

		it('should NOT display an "empty content" message when there are items', () => {
			window.control = new VirtualList({
				container: window.testContainer,
				emptyContentMessage: 'No Content',
				height: '100px'
			})
				.itemControl(Button)
				.itemData(testRows);

			assert.equal(document.querySelectorAll(EMPTY_CONTENT_CLASS).length, 0);
		});
	});

	describe('GetRenderedControls', () => {
		it('should return three items when getRenderedControls is called', () => {
			window.control = new VirtualList({
				container: window.testContainer,
				height: '100px',
				itemControl: Button
			})
				.itemData(testRows);

			return testUtil.defer()
				.then(() => {
					assert.equal(window.control.getRenderedControls().length, 3);
				});
		});
	});

	describe('FitHeightToContents', () => {
		it('should set the height of the control to the combined height of the items when fitHeightToContents is called', () => {
			window.control = new VirtualList({
				container: window.testContainer,
				height: '100px',
				itemSize: '20px',
				itemControl: Button
			})
				.itemData(testRows)
				.fitHeightToContents();

			assert.equal(dom.get.height(window.testContainer), 60);
		});

		it('should set the height of the control to the combined height of the items when the height is set to auto', () => {
			window.control = new VirtualList({
				container: window.testContainer,
				height: AUTO,
				itemSize: '30px',
				itemControl: Button
			})
				.itemData(testRows);

			assert.equal(dom.get.height(window.testContainer), 90);
		});
	});

	describe('itemControl', () => {
		testUtil.testMethod({
			methodName: 'itemControl',
			defaultValue: undefined,
			testValue: Button,
			secondTestValue: Heading
		});
	});

	describe('ExtraRenderedItemsRatio', () => {
		testUtil.testMethod({
			methodName: 'extraRenderedItemsRatio',
			defaultValue: 0.1,
			testValue: 0.5
		});

		it('should return 0 when extraRenderedItemsRatio is set to something lower than 0', () => {
			window.control = new VirtualList({
				container: window.testContainer,
				extraRenderedItemsRatio: -1
			});

			assert.equal(window.control.extraRenderedItemsRatio(), 0);
		});
	});

	describe('itemDefaultSettings', () => {
		testUtil.testMethod({
			methodName: 'itemDefaultSettings',
			defaultValue: undefined,
			testValue: {
				title: 'test'
			}
		});

		it('should return undefined when the itemDefaultSettings is set back to undefined', () => {
			window.control = new VirtualList({
				container: window.testContainer,
				itemDefaultSettings: {
					title: 'test'
				}
			});

			window.control.itemDefaultSettings(undefined);

			assert.equal(window.control.itemDefaultSettings(), undefined);
		});
	});

	describe('onItemRender', () => {
		const testCallback = () => {
		};

		testUtil.testMethod({
			methodName: 'onItemRender',
			defaultValue: undefined,
			testValue: testCallback
		});

		it('should execute the onItemRender callback when items are rendered', () => {
			let testValue = 0;

			window.control = new VirtualList({
				container: window.testContainer,
				height: '100px',
				itemControl: Button,
				onItemRender: function() {
					testValue = 1;
				}
			})
				.itemData(testRows);

			assert.equal(testValue, 1);
		});

		it('should return a control when the onItemRender callback is executed', () => {
			let testValue = 0;
			const button = new Button();

			window.control = new VirtualList({
				container: window.testContainer,
				height: '100px',
				itemControl: Button,
				onItemRender: function(control) {
					testValue = control;
				}
			})
				.itemData(testRows);

			assert.equal(testValue.type(), button.type());

			button.remove();
		});

		it('should return the row data when the onItemRender callback is executed', () => {
			let testValue = 0;

			window.control = new VirtualList({
				container: window.testContainer,
				height: '100px',
				itemControl: Button,
				onItemRender: function(control, rowData) {
					testValue = rowData;
				}
			})
				.itemData(testRows);

			return testUtil.defer()
				.then(() => {
					assert.equal(testValue.ID, 3);
				});
		});
	});

	describe('IsVirtualized', () => {
		testUtil.testMethod({
			methodName: 'isVirtualized',
			defaultValue: true,
			testValue: false
		});

		it('should be able to display items of varying height if isVirtualized is set to false', () => {
			window.control = new VirtualList({
				container: window.testContainer,
				itemControl: Button,
				isVirtualized: false,
				onItemRender: function(button, rowData) {
					let newLabel = 'test';
					for (let index = 0; index < rowData.ID; index++) {
						newLabel += '<br>test ' + index;
					}
					button.label(newLabel);
				},
				height: '200px',
				itemData: testRows
			});

			return testUtil.defer()
				.then(() => {
					const renderedControls = window.control.getRenderedControls();

					assert.isBelow(renderedControls[0].borderHeight(), renderedControls[2].borderHeight());
				});
		});

		it('should NOT be able to display items of varying height if isVirtualized is set to true', () => {
			window.control = new VirtualList({
				container: window.testContainer,
				itemControl: Button,
				isVirtualized: true,
				onItemRender: function(button, rowData) {
					let newLabel = 'test';
					for (let index = 0; index < rowData.ID; index++) {
						newLabel += '<br>test ' + index;
					}
					button.label(newLabel);
				},
				height: '200px',
				itemData: testRows
			})
				.updateItemPositions();

			return testUtil.defer()
				.then(() => {
					const renderedControls = window.control.getRenderedControls();

					assert.isTrue(renderedControls[0].borderHeight() === renderedControls[2].borderHeight());
				});
		});

		it('should set the height of the control if height is "auto" and isVirtualized is set to false', () => {
			window.control = new VirtualList({
				container: window.testContainer,
				itemControl: Button,
				isVirtualized: false,
				onItemRender: function(button, rowData) {
					let newLabel = 'test';
					for (let index = 0; index < rowData.ID; index++) {
						newLabel += '<br>test ' + index;
					}
					button.label(newLabel);
				},
				height: AUTO,
				itemData: testRows
			});

			assert.isTrue(window.control.borderHeight() > 0);
		});
	});

	describe('Scroll', () => {
		const longList = [];

		for (let index = 1; index < 30; index++) {
			longList.push({
				ID: index,
				text: 'test: ' + index
			});
		}

		it('should render no more than two more items than fit in the height of the list', () => {
			window.control = new VirtualList({
				container: window.testContainer,
				itemControl: Button,
				onItemRender: function(button, rowData) {
					button.label(rowData.text);
				},
				itemSize: '20px',
				height: '100px',
				itemData: longList
			});

			return testUtil.defer()
				.then(() => {
					const renderedControls = window.control.getRenderedControls();

					assert.isBelow(renderedControls.length, 9);
				});
		});

		it('should render no more than two more items than fit in the height of the list after the list is scrolled', () => {
			window.control = new VirtualList({
				container: window.testContainer,
				itemControl: Button,
				onItemRender: function(button, rowData) {
					button.label(rowData.text);
				},
				itemSize: '20px',
				height: '100px',
				itemData: longList
			});

			window.control.element().scrollTop = 57;
			testUtil.trigger(window.control.element(), SCROLL_EVENT);

			return testUtil.defer()
				.then(() => {
					const renderedControls = window.control.getRenderedControls();

					assert.isBelow(renderedControls.length, 9);
				});
		});

		it('should render no more than two more items than fit in the height of the list after the list is scrolled a long distance and then back a little', () => {
			window.control = new VirtualList({
				container: window.testContainer,
				itemControl: Button,
				onItemRender: function(button, rowData) {
					button.label(rowData.text);
				},
				itemSize: '20px',
				height: '100px',
				itemData: longList
			});

			window.control.element().scrollTop = 357;
			window.control.element().scrollTop = 300;
			testUtil.trigger(window.control.element(), SCROLL_EVENT);

			return testUtil.defer()
				.then(() => {
					const renderedControls = window.control.getRenderedControls();

					assert.isBelow(renderedControls.length, 9);
				});
		});

		it('should render no more than two more items than fit in the height of the list after the list is scrolled a long distance and then back a lot', () => {
			window.control = new VirtualList({
				container: window.testContainer,
				itemControl: Button,
				onItemRender: function(button, rowData) {
					button.label(rowData.text);
				},
				itemSize: '20px',
				height: '100px',
				itemData: longList
			});

			window.control.element().scrollTop = 357;
			window.control.element().scrollTop = 100;
			testUtil.trigger(window.control.element(), SCROLL_EVENT);

			return testUtil.defer()
				.then(() => {
					const renderedControls = window.control.getRenderedControls();

					assert.isBelow(renderedControls.length, 9);
				});
		});
	});

	describe('.isHorizontal', () => {
		testUtil.testMethod({
			methodName: 'isHorizontal',
			defaultValue: false,
			testValue: true
		});
	});
});
