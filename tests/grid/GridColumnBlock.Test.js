import { assert } from 'chai';
import shortid from 'shortid';
import { CONTEXT_MENU_EVENT } from '../../src';
import GridColumnBlock from '../../src/grid/GridColumnBlock';
import * as gridConstants from '../../src/grid/gridConstants';
import ControlTests from '../ControlTests';
import TestUtil from '../TestUtil';

describe('GridColumnBlock', () => {
	const testUtil = new TestUtil(GridColumnBlock);
	const controlBaseTests = new ControlTests(GridColumnBlock, testUtil);

	controlBaseTests.run();

	describe('Columns', () => {
		testUtil.testMethod({
			methodName: 'columns',
			defaultValue: [],
			testValue: [{
				id: '0',
				title: 'test'
			}],
			secondTestValue: [{
				id: '1',
				title: 'test 2'
			}]
		});
	});

	describe('SelectableColumns', () => {
		testUtil.testMethod({
			methodName: 'selectableColumns',
			defaultValue: [],
			testValue: [{
				title: 'test'
			}],
			secondTestValue: [{
				title: 'test 2'
			}]
		});

		it('should have five options in the contextmenu if selectableColumns is set to two columns', () => {
			testUtil.control = new GridColumnBlock({
				container: testUtil.container,
				columns: [{
					id: 'test',
					title: 'test',
					type: gridConstants.COLUMN_TYPES.CHECKBOX
				}, {
					id: 'test2',
					title: 'test 2',
					canSort: true,
					type: gridConstants.COLUMN_TYPES.TEXT
				}],
				selectableColumns: [{
					id: 'test',
					title: 'test'
				}, {
					id: 'test2',
					title: 'test 2'
				}]
			});

			testUtil.trigger(testUtil.nth('.grid-header-cell', 1), CONTEXT_MENU_EVENT);

			assert.equal(testUtil.count('.menu .heading', true), 5);
		});
	});

	describe('IsAllRowsSelected', () => {
		testUtil.testMethod({
			methodName: 'isAllRowsSelected',
			defaultValue: false,
			testValue: true,
			secondTestValue: false
		});

		it('should have a checked checkbox if a column has a dataType set to checkbox and isAllRowsSelected is true', () => {
			testUtil.control = new GridColumnBlock({
				container: testUtil.container,
				columns: [{
					title: 'test 1',
					type: gridConstants.COLUMN_TYPES.CHECKBOX
				}, {
					title: 'test 2',
					type: gridConstants.COLUMN_TYPES.TEXT
				}],
				isAllRowsSelected: true
			});

			assert.equal(testUtil.first('input[type=checkbox]').checked, true);
		});
	});

	describe('IsSomeRowsSelected', () => {
		testUtil.testMethod({
			methodName: 'isSomeRowsSelected',
			defaultValue: false,
			testValue: true,
			secondTestValue: false
		});

		it('should have a checkbox with indeterminate set to true if one column has a dataType set to checkbox and isSomeRowsSelected is true', () => {
			testUtil.control = new GridColumnBlock({
				container: testUtil.container,
				columns: [{
					title: 'test 1',
					type: gridConstants.COLUMN_TYPES.CHECKBOX
				}, {
					title: 'test 2',
					type: gridConstants.COLUMN_TYPES.TEXT
				}],
				isSomeRowsSelected: true
			});

			assert.equal(testUtil.first('input[type=checkbox]').indeterminate, true);
		});
	});

	describe('rows', () => {
		it('should return the row data when a button is clicked after setting rows', () => {
			let testVar = '';
			const onRowClick = (rowData) => {
				testVar = rowData.something;
			};
			const onTrashClick = (rowData) => {
				testVar = rowData.rowId + '_trash';
			};

			testUtil.control = new GridColumnBlock({
				container: testUtil.container,
				onSelectRow() {
				},
				isSelectable: true,
				isAutoHeight: true
			})
				.columns([{
					type: gridConstants.COLUMN_TYPES.TEXT,
					id: '0'
				}, {
					type: gridConstants.COLUMN_TYPES.ACTIONS,
					currentWidth: 120,
					id: '1',
					buttons: [{
						icon: 'circle',
						onClick: onRowClick
					}, {
						icon: 'trash',
						onClick: onTrashClick
					}]
				}]);

			testUtil.control.rows([{
				id: shortid.generate(),
				rowId: '1',
				cells: [{
					text: 'text 1'
				}, {}],
				something: 'else'
			}, {
				id: shortid.generate(),
				rowId: '2',
				cells: [{
					text: 'text 1'
				}, {}],
				something: 'another'
			}]);

			testUtil.control.rows([]);

			testUtil.control.rows([{
				id: shortid.generate(),
				rowId: '1',
				cells: [{
					text: 'text 1'
				}, {}],
				something: 'else'
			}, {
				id: shortid.generate(),
				rowId: '2',
				cells: [{
					text: 'text 2'
				}, {}],
				something: 'another'
			}, {
				id: shortid.generate(),
				rowId: '3',
				cells: [{
					text: 'text 3'
				}, {}],
				something: 'meh'
			}, {
				id: shortid.generate(),
				rowId: '4',
				cells: [{
					text: 'text 4'
				}, {}],
				something: 'stone'
			}, {
				id: shortid.generate(),
				rowId: '5',
				cells: [{
					text: 'text 5'
				}, {}],
				something: 'mini'
			}]);

			testUtil.simulateClick(testUtil.all('button')[5]);

			assert.equal(testVar, '3_trash');
		});
	});

	// describe('ScrollToRowIndex');

	describe('IsFiltered', () => {
		testUtil.testMethod({
			methodName: 'isFiltered',
			defaultValue: false,
			testValue: true
		});
	});

	// describe('RefreshLayout');
});
