import { assert } from 'type-enforcer';
import { AUTO } from 'type-enforcer-ui';
import { Button, Heading, SCROLL_EVENT, VirtualList } from '../../index.js';
import TestUtil from '../TestUtil.js';

describe('VirtualList', () => {
	const testUtil = new TestUtil(VirtualList);

	const VIRTUAL_LIST_CLASS = '.virtual-list';
	const VIRTUAL_ITEM_CLASS = '.virtual-item';
	const EMPTY_CONTENT_CLASS = '.empty-content-message';

	const testRows = [{
		id: '1'
	}, {
		id: '2'
	}, {
		id: '3'
	}];

	testUtil.run({
		skipTests: ['stopPropagation'],
		settings: {
			itemControl: Button,
			itemData: [{
				id: '1',
				text: 'test'
			}]
		},
		focusableElement: 'button'
	});

	describe('InitialLayout', () => {
		it('should have a css class called ' + VIRTUAL_LIST_CLASS, () => {
			testUtil.control = new VirtualList({
				container: testUtil.container
			});

			assert.is(testUtil.count(VIRTUAL_LIST_CLASS), 1);
		});
	});

	describe('.rows', () => {
		testUtil.testMethod({
			methodName: 'itemData',
			defaultValue: [],
			testValue: testRows
		});

		it('should display the same items that are passed in to the items options', () => {
			testUtil.control = new VirtualList({
				container: testUtil.container,
				itemControl: Button,
				height: '100px',
				itemData: testRows
			});

			assert.is(testUtil.count(VIRTUAL_ITEM_CLASS), 3);
		});

		it('should display the same items that are passed in to the items method', () => {
			testUtil.control = new VirtualList({
				container: testUtil.container,
				height: '100px'
			})
				.itemControl(Button)
				.itemData(testRows);

			assert.is(testUtil.count(VIRTUAL_ITEM_CLASS), 3);
		});

		it('should display the same items that are passed in to the items method after previous rows', () => {
			testUtil.control = new VirtualList({
				container: testUtil.container,
				height: '100px'
			})
				.itemControl(Button)
				.itemData(testRows);

			testUtil.control.itemData([{
				id: '1'
			}]);

			assert.is(testUtil.count(VIRTUAL_ITEM_CLASS), 1);
		});

		it('should display an "empty content" message when there are no items', () => {
			testUtil.control = new VirtualList({
				container: testUtil.container,
				emptyContentMessage: 'No Content'
			});

			assert.is(testUtil.count(EMPTY_CONTENT_CLASS), 1);
		});

		it('should NOT display an "empty content" message when there are items', () => {
			testUtil.control = new VirtualList({
				container: testUtil.container,
				emptyContentMessage: 'No Content',
				height: '100px'
			})
				.itemControl(Button)
				.itemData(testRows);

			assert.is(testUtil.count(EMPTY_CONTENT_CLASS), 0);
		});
	});

	describe('.getRenderedControls', () => {
		it('should return three items when getRenderedControls is called', () => {
			testUtil.control = new VirtualList({
				container: testUtil.container,
				height: '100px',
				itemControl: Button
			})
				.itemData(testRows);

			assert.is(testUtil.control.getRenderedControls().length, 3);
		});
	});

	describe('.fitHeightToContents', () => {
		it('should set the height of the control to the combined height of the items when fitHeightToContents is called', () => {
			testUtil.control = new VirtualList({
				container: testUtil.container,
				height: '100px',
				itemSize: '20px',
				itemControl: Button
			})
				.itemData(testRows)
				.fitHeightToContents();

			assert.is(testUtil.container.element.offsetHeight, 60);
		});

		it('should set the height of the control to the combined height of the items when the height is set to auto', () => {
			testUtil.control = new VirtualList({
				container: testUtil.container,
				height: AUTO,
				itemSize: '30px',
				itemControl: Button
			})
				.itemData(testRows);

			assert.is(testUtil.container.element.offsetHeight, 90);
		});
	});

	describe('.itemControl', () => {
		testUtil.testMethod({
			methodName: 'itemControl',
			defaultValue: undefined,
			testValue: Button,
			secondTestValue: Heading
		});
	});

	describe('.extraRenderedItemsRatio', () => {
		testUtil.testMethod({
			methodName: 'extraRenderedItemsRatio',
			defaultValue: 0.1,
			testValue: 0.5
		});

		it('should return 0 when extraRenderedItemsRatio is set to something lower than 0', () => {
			testUtil.control = new VirtualList({
				container: testUtil.container,
				extraRenderedItemsRatio: -1
			});

			assert.is(testUtil.control.extraRenderedItemsRatio(), 0);
		});
	});

	describe('.itemDefaultSettings', () => {
		testUtil.testMethod({
			methodName: 'itemDefaultSettings',
			defaultValue: undefined,
			testValue: {
				title: 'test'
			}
		});

		it('should return undefined when the itemDefaultSettings is set back to undefined', () => {
			testUtil.control = new VirtualList({
				container: testUtil.container,
				itemDefaultSettings: {
					title: 'test'
				}
			});

			testUtil.control.itemDefaultSettings(undefined);

			assert.is(testUtil.control.itemDefaultSettings(), undefined);
		});
	});

	describe('.onItemRender', () => {
		it('should execute the onItemRender callback when items are rendered', () => {
			let testValue = 0;

			testUtil.control = new VirtualList({
				container: testUtil.container,
				height: '100px',
				itemControl: Button,
				onItemRender() {
					testValue = 1;
				}
			})
				.itemData(testRows);

			assert.is(testValue, 1);
		});

		it('should return a control when the onItemRender callback is executed', () => {
			let testValue = 0;
			const button = new Button();

			testUtil.control = new VirtualList({
				container: testUtil.container,
				height: '100px',
				itemControl: Button,
				onItemRender(control) {
					testValue = control;
				}
			})
				.itemData(testRows);

			assert.is(testValue.type, button.type);

			button.remove();
		});

		it('should return the row data when the onItemRender callback is executed', () => {
			let testValue = 0;

			testUtil.control = new VirtualList({
				container: testUtil.container,
				height: '100px',
				itemControl: Button,
				onItemRender(control, rowData) {
					testValue = rowData;
				}
			})
				.itemData(testRows);

			assert.is(testValue.id, '3');
		});
	});

	describe('.isVirtualized', () => {
		testUtil.testMethod({
			methodName: 'isVirtualized',
			defaultValue: true,
			testValue: false
		});

		it('should be able to display items of varying height if isVirtualized is set to false', () => {
			testUtil.control = new VirtualList({
				container: testUtil.container,
				itemControl: Button,
				isVirtualized: false,
				onItemRender(button, rowData) {
					let newLabel = 'test';
					for (let index = 0; index < rowData.id; index++) {
						newLabel += '<br>test ' + index;
					}
					button.label(newLabel);
				},
				height: '200px',
				itemData: testRows
			});

			const renderedControls = testUtil.control.getRenderedControls();

			assert.lessThan(renderedControls[0].borderHeight(), renderedControls[2].borderHeight());
		});

		it('should NOT be able to display items of varying height if isVirtualized is set to true', () => {
			testUtil.control = new VirtualList({
				container: testUtil.container,
				itemControl: Button,
				isVirtualized: true,
				onItemRender(button, rowData) {
					let newLabel = 'test';
					for (let index = 0; index < rowData.id; index++) {
						newLabel += '<br>test ' + index;
					}
					button.label(newLabel);
				},
				height: '200px',
				itemData: testRows
			})
				.updateItemPositions();

			const renderedControls = testUtil.control.getRenderedControls();

			assert.is(renderedControls[0].borderHeight() === renderedControls[2].borderHeight(), true);
		});

		it('should set the height of the control if height is "auto" and isVirtualized is set to false', () => {
			testUtil.control = new VirtualList({
				container: testUtil.container,
				itemControl: Button,
				isVirtualized: false,
				onItemRender(button, rowData) {
					let newLabel = 'test';
					for (let index = 0; index < rowData.id; index++) {
						newLabel += '<br>test ' + index;
					}
					button.label(newLabel);
				},
				height: AUTO,
				itemData: testRows
			});

			assert.is(testUtil.control.borderHeight() > 0, true);
		});
	});

	describe('.scroll', () => {
		const longList = [];

		for (let index = 1; index < 30; index++) {
			longList.push({
				id: index + '',
				text: 'test: ' + index
			});
		}

		it('should render no more than two more items than fit in the height of the list', () => {
			testUtil.control = new VirtualList({
				container: testUtil.container,
				itemControl: Button,
				onItemRender(button, rowData) {
					button.label(rowData.text);
				},
				itemSize: '20px',
				height: '100px',
				itemData: longList
			});

			const renderedControls = testUtil.control.getRenderedControls();

			assert.lessThan(renderedControls.length, 9);
		});

		it('should render no more than two more items than fit in the height of the list after the list is scrolled', () => {
			testUtil.control = new VirtualList({
				container: testUtil.container,
				itemControl: Button,
				onItemRender(button, rowData) {
					button.label(rowData.text);
				},
				itemSize: '20px',
				height: '100px',
				itemData: longList
			});

			testUtil.control.element.scrollTop = 57;
			testUtil.trigger(testUtil.control.element, SCROLL_EVENT);

			const renderedControls = testUtil.control.getRenderedControls();

			assert.lessThan(renderedControls.length, 9);
		});

		it('should render no more than two more items than fit in the height of the list after the list is scrolled a long distance and then back a little', () => {
			testUtil.control = new VirtualList({
				container: testUtil.container,
				itemControl: Button,
				onItemRender(button, rowData) {
					button.label(rowData.text);
				},
				itemSize: '20px',
				height: '100px',
				itemData: longList
			});

			testUtil.control.element.scrollTop = 357;
			testUtil.control.element.scrollTop = 300;
			testUtil.trigger(testUtil.control.element, SCROLL_EVENT);

			const renderedControls = testUtil.control.getRenderedControls();

			assert.lessThan(renderedControls.length, 9);
		});

		it('should render no more than two more items than fit in the height of the list after the list is scrolled a long distance and then back a lot', () => {
			testUtil.control = new VirtualList({
				container: testUtil.container,
				itemControl: Button,
				onItemRender(button, rowData) {
					button.label(rowData.text);
				},
				itemSize: '20px',
				height: '100px',
				itemData: longList
			});

			testUtil.control.element.scrollTop = 357;
			testUtil.control.element.scrollTop = 100;
			testUtil.trigger(testUtil.control.element, SCROLL_EVENT);

			const renderedControls = testUtil.control.getRenderedControls();

			assert.lessThan(renderedControls.length, 9);
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
