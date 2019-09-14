import { assert } from 'chai';
import * as gridConstants from '../../../src/ui/grid/gridConstants';
import GridRow from '../../../src/ui/grid/GridRow';
import TestUtil from '../../TestUtil';
import ControlTests from '../ControlTests';

describe('GridRow', () => {
	const testUtil = new TestUtil(GridRow);
	const controlBaseTests = new ControlTests(GridRow, testUtil, {
		mainCssClass: 'grid-row'
	});

	controlBaseTests.run();

	describe('.updateWidth', () => {
		it('should set the widths of cells based on column widths even if the width of the row is set narrower than the total of the cells', () => {
			testUtil.control = new GridRow({
				container: testUtil.container
			})
				.columns([{
					type: gridConstants.COLUMN_TYPES.TEXT,
					currentWidth: 80,
					order: 0
				}, {
					type: gridConstants.COLUMN_TYPES.TEXT,
					currentWidth: 120,
					order: 1
				}, {
					type: gridConstants.COLUMN_TYPES.TEXT,
					currentWidth: 160,
					order: 2
				}])
				.rowData({
					cells: [{
						text: 'test 1'
					}, {
						text: 'test 2'
					}, {
						text: 'test 3'
					}]
				});

			testUtil.control.updateWidth(200);

			assert.equal(getComputedStyle(document.querySelectorAll('.grid-cell')[0]).width, '80px');
			assert.equal(getComputedStyle(document.querySelectorAll('.grid-cell')[1]).width, '120px');
			assert.equal(getComputedStyle(document.querySelectorAll('.grid-cell')[2]).width, '160px');
		});

		it('should set the width of the row if updateWidth is set and the row is a header', () => {
			testUtil.control = new GridRow({
				container: testUtil.container
			})
				.columns([{
					type: gridConstants.COLUMN_TYPES.TEXT,
					currentWidth: 80,
					order: 0
				}, {
					type: gridConstants.COLUMN_TYPES.TEXT,
					currentWidth: 120,
					order: 1
				}, {
					type: gridConstants.COLUMN_TYPES.TEXT,
					currentWidth: 160,
					order: 2
				}])
				.rowData({
					groupId: 1,
					cells: [{
						text: 'test 1'
					}, {
						text: 'test 2'
					}, {
						text: 'test 3'
					}]
				});

			testUtil.control.updateWidth(200);

			assert.equal(getComputedStyle(document.querySelectorAll('.grid-row')[0]).width, '200px');
		});
	});

	describe('.rowData', () => {
		it('should render a heading if rowData.groupId is defined', () => {
			testUtil.control = new GridRow({
				container: testUtil.container
			})
				.rowData({
					groupId: 1
				})
				.groupId(1);

			assert.equal(document.querySelectorAll('.heading').length, 1);
		});

		it('should have one header control if the row is set to a header twice', () => {
			testUtil.control = new GridRow({
				container: testUtil.container
			})
				.rowData({
					groupId: 1,
					title: 'test title 1'
				})
				.groupId(1);

			testUtil.control.rowData({
				groupId: 1,
				title: 'test title 1'
			});

			assert.equal(document.querySelectorAll('.heading').length, 1);
		});

		it('should render a checkbox in the header control if any of the columns are type CHECKBOX', () => {
			testUtil.control = new GridRow({
				container: testUtil.container
			})
				.columns([{
					type: gridConstants.COLUMN_TYPES.TEXT,
					order: 0
				}, {
					type: gridConstants.COLUMN_TYPES.CHECKBOX,
					order: 1
				}])
				.rowData({
					groupId: 1
				})
				.groupId(1);

			assert.equal(document.querySelectorAll('.heading .checkbox').length, 1);
		});

		it('should have a title text if rowData.title is set and the row is a header', () => {
			testUtil.control = new GridRow({
				container: testUtil.container
			})
				.rowData({
					groupId: 1,
					title: 'test title'
				})
				.groupId(1);

			assert.equal(document.querySelector('.heading > .title-container > span').textContent, 'test title');
		});

		it('should have a subtitle if rowData.childCount is set and the row is a header', () => {
			testUtil.control = new GridRow({
				container: testUtil.container
			})
				.rowData({
					groupId: 1,
					title: 'test title',
					childCount: 3
				})
				.groupId(1);

			assert.equal(document.querySelector('.subtitle').textContent, '3 items');
		});

		it('should have a subtitle if rowData.childCount and rowData.footerSuffix is set and the row is a header', () => {
			testUtil.control = new GridRow({
				container: testUtil.container
			})
				.rowData({
					groupId: 1,
					title: 'test title',
					childCount: 3,
					footerSuffix: 'things'
				})
				.groupId(1);

			assert.equal(document.querySelector('.subtitle').textContent, '3 things');
		});

		it('should have a selected checkbox if rowData.isSelected is set to true and the row is a header', () => {
			testUtil.control = new GridRow({
				container: testUtil.container
			})
				.columns([{
					type: gridConstants.COLUMN_TYPES.CHECKBOX,
					order: 0
				}])
				.rowData({
					groupId: 1,
					title: 'test title',
					childCount: 3,
					footerSuffix: 'things',
					isSelected: true
				})
				.isSelected(true)
				.groupId(1);

			assert.isTrue(document.querySelector('.checkbox input').checked);
		});

		it('should have an indeterminate checkbox if isIndeterminate is set to true and the row is a header', () => {
			testUtil.control = new GridRow({
				container: testUtil.container,
				isIndeterminate: true
			})
				.columns([{
					type: gridConstants.COLUMN_TYPES.CHECKBOX,
					order: 0
				}])
				.rowData({
					groupId: 1,
					title: 'test title',
					childCount: 3,
					footerSuffix: 'things'
				})
				.groupId(1);

			assert.isTrue(document.querySelector('.checkbox input').indeterminate);
		});

		it('should have an indeterminate checkbox if the row is a header and isIndeterminate is set to true after', () => {
			testUtil.control = new GridRow({
				container: testUtil.container
			})
				.columns([{
					type: gridConstants.COLUMN_TYPES.CHECKBOX,
					order: 0
				}])
				.rowData({
					groupId: 1,
					title: 'test title',
					childCount: 3,
					footerSuffix: 'things'
				})
				.groupId(1);

			testUtil.control.isIndeterminate(true);

			assert.isTrue(document.querySelector('.checkbox input').indeterminate);
		});

		it('should render an image if rowData.image is a function that returns a string and the row is a header', () => {
			testUtil.control = new GridRow({
				container: testUtil.container
			})
				.rowData({
					groupId: 1,
					title: 'test title',
					image() {
						return 'base/test.png';
					}
				})
				.groupId(1);

			assert.equal(document.querySelectorAll('img').length, 1);
		});

		it('should NOT render an image if rowData.image is a function that returns an empty string and the row is a header', () => {
			testUtil.control = new GridRow({
				container: testUtil.container
			})
				.rowData({
					groupId: 1,
					title: 'test title',
					image() {
					}
				})
				.groupId(1);

			assert.equal(document.querySelectorAll('img').length, 0);
		});

		it('should call the settings.onExpandCollapseGroup callback when the row is a header and it is clicked', () => {
			let testVar = 0;

			testUtil.control = new GridRow({
				container: testUtil.container,
				onExpandCollapseGroup() {
					testVar++;
				}
			})
				.rowData({
					groupId: 1,
					title: 'test title'
				})
				.groupId(1);

			testUtil.simulateClick(document.querySelector('.heading'));

			assert.equal(testVar, 1);
		});

		it('should call the settings.onSelectGroup callback when the row is a header and its checkbox is clicked', () => {
			let testVar = 0;

			testUtil.control = new GridRow({
				container: testUtil.container,
				onSelectGroup() {
					testVar++;
				}
			})
				.columns([{
					type: gridConstants.COLUMN_TYPES.CHECKBOX,
					order: 0
				}])
				.rowData({
					groupId: 1,
					title: 'test title',
					image() {
					}
				})
				.groupId(1);

			testUtil.simulateClick(document.querySelector('.checkbox'));

			assert.equal(testVar, 1);
		});

		it('should have a hidden header control if the row is a header and then it is set to a normal row again', () => {
			testUtil.control = new GridRow({
				container: testUtil.container
			})
				.rowData({
					groupId: 1,
					title: 'test title'
				})
				.groupId(1);

			testUtil.control.columns([{
					type: gridConstants.COLUMN_TYPES.TEXT,
					order: 0
				}])
				.rowData({
					columns: [{
						text: 'test'
					}]
				})
				.groupId(0);

			assert.equal(document.querySelectorAll('.heading.display-none').length, 1);
		});

		it('should not have cells if the row is first set to a normal row with cells and then a header', () => {
			testUtil.control = new GridRow({
				container: testUtil.container
			})
				.rowData({
					columns: [{
						text: 'test'
					}]
				});

			testUtil.control.columns([{
					type: gridConstants.COLUMN_TYPES.TEXT,
					order: 0
				}])
				.rowData({
					groupId: 1,
					title: 'test title'
				})
				.groupId(1);

			assert.equal(document.querySelectorAll('.grid-cell').length, 0);
		});
	});

	describe('.columns', () => {
		it('should render 3 cells if three columns are provided', () => {
			testUtil.control = new GridRow({
				container: testUtil.container
			})
				.rowData({
					cells: [{
						text: 'test 1'
					}, {
						text: 'test 2'
					}, {
						text: 'test 3'
					}]
				})
				.columns([{
					type: gridConstants.COLUMN_TYPES.TEXT,
					order: 0
				}, {
					type: gridConstants.COLUMN_TYPES.TEXT,
					order: 1
				}, {
					type: gridConstants.COLUMN_TYPES.TEXT,
					order: 2
				}]);

			assert.equal(document.querySelectorAll('.grid-cell').length, 3);
		});

		it('should render two cells if three columns are provided and then only two columns are provided', () => {
			testUtil.control = new GridRow({
				container: testUtil.container
			})
				.columns([{
					type: gridConstants.COLUMN_TYPES.TEXT,
					order: 0
				}, {
					type: gridConstants.COLUMN_TYPES.TEXT,
					order: 1
				}, {
					type: gridConstants.COLUMN_TYPES.TEXT,
					order: 2
				}])
				.rowData({
					cells: [{
						text: 'test 1'
					}, {
						text: 'test 2'
					}, {
						text: 'test 3'
					}]
				});

			testUtil.control.columns([{
					type: gridConstants.COLUMN_TYPES.TEXT,
					order: 0
				}, {
					type: gridConstants.COLUMN_TYPES.TEXT,
					order: 1
				}])
				.rowData({
					cells: [{
						text: 'test 1'
					}, {
						text: 'test 2'
					}]
				});

			testUtil.control.updateWidth('200px');

			assert.equal(document.querySelectorAll('.grid-cell').length, 2);
		});
	});

	describe('.isSelected', () => {
		testUtil.testMethod({
			methodName: 'isSelected',
			defaultSettings: {
				container: testUtil.container
			},
			defaultValue: false,
			testValue: true,
			testValueClass: 'selected'
		});

		it('should check a checkbox if isSelected is true and it has a checkbox cell', () => {
			testUtil.control = new GridRow({
				container: testUtil.container
			})
				.rowData({
					cells: [{}]
				})
				.columns([{
					type: gridConstants.COLUMN_TYPES.CHECKBOX,
					id: 0,
					order: 0
				}])
				.isSelected(true);

			assert.equal(document.querySelector('input').checked, true);
		});

		it('should NOT check a checkbox if isSelected is true and it has a checkbox cell', () => {
			testUtil.control = new GridRow({
				container: testUtil.container
			})
				.rowData({
					cells: [{}]
				})
				.columns([{
					type: gridConstants.COLUMN_TYPES.CHECKBOX,
					order: 0
				}])
				.isSelected(false);

			assert.equal(document.querySelector('input').checked, false);
		});

		it('should check a checkbox if it has a checkbox cell and the row is clicked', () => {
			testUtil.control = new GridRow({
				container: testUtil.container,
				onSelect() {
				}
			})
				.rowData({
					cells: [{}]
				})
				.columns([{
					type: gridConstants.COLUMN_TYPES.CHECKBOX,
					order: 0
				}]);

			testUtil.simulateClick(document.querySelector('.grid-row'));

			assert.equal(document.querySelector('input').checked, true);
		});

		it('should NOT check a checkbox if it has a checkbox cell and the row is clicked twice', () => {
			testUtil.control = new GridRow({
				container: testUtil.container,
				onSelect() {
				}
			})
				.rowData({
					cells: [{}]
				})
				.columns([{
					type: gridConstants.COLUMN_TYPES.CHECKBOX,
					order: 0
				}]);

			testUtil.simulateClick(document.querySelector('.grid-row'));
			testUtil.simulateClick(document.querySelector('.grid-row'));

			assert.equal(document.querySelector('input').checked, false);
		});

		it('should NOT check a checkbox if it has a checkbox cell and the row is clicked and then isSelected is set to false', () => {
			testUtil.control = new GridRow({
				container: testUtil.container,
				onSelect() {
				}
			})
				.rowData({
					cells: [{}]
				})
				.columns([{
					type: gridConstants.COLUMN_TYPES.CHECKBOX,
					order: 0
				}]);

			testUtil.simulateClick(document.querySelector('.grid-row'));
			testUtil.control.isSelected(false);

			assert.equal(document.querySelector('input').checked, false);
		});

		it('should check a checkbox if it has a checkbox cell and the row is clicked and then isSelected is set to true', () => {
			testUtil.control = new GridRow({
				container: testUtil.container,
				onSelect() {
				}
			})
				.rowData({
					cells: [{}]
				})
				.columns([{
					type: gridConstants.COLUMN_TYPES.CHECKBOX,
					order: 0
				}]);

			testUtil.simulateClick(document.querySelector('.grid-row'));
			testUtil.control.isSelected(true);

			assert.equal(document.querySelector('input').checked, true);
		});

		it('should check a checkbox if it has a checkbox cell and the checkbox is clicked', () => {
			testUtil.control = new GridRow({
				container: testUtil.container,
				onSelect() {
				}
			})
				.rowData({
					cells: [{}]
				})
				.columns([{
					type: gridConstants.COLUMN_TYPES.CHECKBOX,
					order: 0
				}]);

			testUtil.simulateClick(document.querySelector('.checkbox'));

			assert.equal(document.querySelector('input').checked, true);
		});

		it('should NOT check a checkbox if it has a checkbox cell and the checkbox is clicked twice', () => {
			testUtil.control = new GridRow({
				container: testUtil.container,
				onSelect() {
				}
			})
				.rowData({
					cells: [{}]
				})
				.columns([{
					type: gridConstants.COLUMN_TYPES.CHECKBOX,
					order: 0
				}]);

			testUtil.simulateClick(document.querySelector('.checkbox'));
			testUtil.simulateClick(document.querySelector('.checkbox'));

			assert.equal(document.querySelector('input').checked, false);
		});

		it('should NOT check a checkbox if it has a checkbox cell and the checkbox is clicked and then isSelected is set to false', () => {
			testUtil.control = new GridRow({
				container: testUtil.container,
				onSelect() {
				}
			})
				.rowData({
					cells: [{}]
				})
				.columns([{
					type: gridConstants.COLUMN_TYPES.CHECKBOX,
					order: 0
				}]);

			testUtil.simulateClick(document.querySelector('.checkbox'));
			testUtil.control.isSelected(false);

			assert.equal(document.querySelector('input').checked, false);
		});

		it('should check a checkbox if it has a checkbox cell and the checkbox is clicked and then isSelected is set to true', () => {
			testUtil.control = new GridRow({
				container: testUtil.container,
				onSelect() {
				}
			})
				.rowData({
					cells: [{}]
				})
				.columns([{
					type: gridConstants.COLUMN_TYPES.CHECKBOX,
					order: 0
				}]);

			testUtil.simulateClick(document.querySelector('.checkbox'));
			testUtil.control.isSelected(true);

			assert.equal(document.querySelector('input').checked, true);
		});

		it('should check a checkbox if it has a checkbox cell and the checkbox is clicked and then the rowData is reset', () => {
			testUtil.control = new GridRow({
				container: testUtil.container,
				onSelect() {
				}
			})
				.rowData({
					cells: [{}]
				})
				.columns([{
					type: gridConstants.COLUMN_TYPES.CHECKBOX,
					order: 0
				}]);

			testUtil.simulateClick(document.querySelector('.checkbox'));

			testUtil.control.rowData({
				cells: [{}]
			});

			assert.equal(document.querySelector('input').checked, true);
		});
	});

	describe('.isIndeterminate', () => {
		testUtil.testMethod({
			methodName: 'isIndeterminate',
			defaultSettings: {
				container: testUtil.container
			},
			defaultValue: false,
			testValue: true
		});
	});

	describe('.onSelect', () => {
		testUtil.testMethod({
			methodName: 'onSelect',
			defaultSettings: {
				container: testUtil.container
			},
			defaultValue: undefined,
			testValue() {
				return 1;
			},
			testValueClass: 'clickable'
		});

		it('should call the onSelect callback when clicked', () => {
			let testVar = 0;
			const onRowClick = () => {
				testVar++;
			};

			testUtil.control = new GridRow({
				container: testUtil.container,
				onSelect: onRowClick
			});

			testUtil.simulateClick(testUtil.control.element());

			assert.equal(testVar, 1);
		});

		it('should call the onSelect callback when a button is clicked', () => {
			let testVar = 0;
			const onRowClick = () => {
				testVar++;
			};

			testUtil.control = new GridRow({
				container: testUtil.container,
				onSelect: onRowClick
			})
				.rowData({
					cells: [{}]
				})
				.columns([{
					type: gridConstants.COLUMN_TYPES.ACTIONS,
					id: 0,
					buttons: [{
						icon: 'circle',
						onClick: onRowClick
					}, {
						icon: 'trash',
						onClick() {
						}
					}]
				}]);

			testUtil.simulateClick(document.querySelectorAll('button')[1]);

			assert.equal(testVar, 1);
		});

		it('should have class "clickable" if onSelect is set', () => {
			const onRowClick = () => {
			};

			testUtil.control = new GridRow({
				container: testUtil.container,
				onSelect: onRowClick
			});

			assert.isTrue(testUtil.hasClass(testUtil.control.element(), 'clickable'));
		});

		it('should return the rowData when a button is clicked after setting rowData twice', () => {
			let testVar = '';
			const onRowClick = (rowData) => {
				testVar = rowData.something;
			};

			testUtil.control = new GridRow({
				container: testUtil.container,
				onSelect() {
				}
			})
				.rowData({
					cells: [{}],
					something: 'interesting'
				})
				.columns([{
					type: gridConstants.COLUMN_TYPES.ACTIONS,
					currentWidth: 120,
					id: 0,
					buttons: [{
						icon: 'circle',
						onClick: onRowClick
					}, {
						icon: 'trash'
					}]
				}]);

			testUtil.control.rowData({
				cells: [{}],
				something: 'else'
			});

			testUtil.simulateClick(document.querySelector('button'));

			assert.equal(testVar, 'else');
		});
	});
});
