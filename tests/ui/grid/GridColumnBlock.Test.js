import { assert } from 'chai';
import shortid from 'shortid';
import { CONTEXT_MENU_EVENT } from '../../../src';
import GridColumnBlock from '../../../src/ui/grid/GridColumnBlock';
import * as gridConstants from '../../../src/ui/grid/gridConstants';
import query from '../../query';
import TestUtil from '../../TestUtil';
import ControlTests from '../ControlTests';

const testUtil = new TestUtil(GridColumnBlock);
const controlBaseTests = new ControlTests(GridColumnBlock, testUtil);

describe('GridColumnBlock', () => {

	controlBaseTests.run();

	describe('Columns', () => {
		testUtil.testMethod({
			methodName: 'columns',
			defaultValue: [],
			testValue: [{
				ID: '0',
				title: 'test'
			}],
			secondTestValue: [{
				ID: '1',
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
			window.control = new GridColumnBlock({
				container: window.testContainer,
				columns: [{
					ID: 'test',
					title: 'test',
					type: gridConstants.COLUMN_TYPES.CHECKBOX
				}, {
					ID: 'test2',
					title: 'test 2',
					canSort: true,
					type: gridConstants.COLUMN_TYPES.TEXT
				}],
				selectableColumns: [{
					ID: 'test',
					title: 'test'
				}, {
					ID: 'test2',
					title: 'test 2'
				}]
			});

			testUtil.trigger(document.querySelectorAll('.grid-header-cell')[1], CONTEXT_MENU_EVENT);

			return testUtil.defer()
				.then(() => {
					assert.equal(document.querySelectorAll('.menu .heading').length, 5);
				});
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
			window.control = new GridColumnBlock({
				container: window.testContainer,
				columns: [{
					title: 'test 1',
					type: gridConstants.COLUMN_TYPES.CHECKBOX
				}, {
					title: 'test 2',
					type: gridConstants.COLUMN_TYPES.TEXT
				}],
				isAllRowsSelected: true
			});

			assert.equal(document.querySelector('input[type=checkbox]').checked, true);
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
			window.control = new GridColumnBlock({
				container: window.testContainer,
				columns: [{
					title: 'test 1',
					type: gridConstants.COLUMN_TYPES.CHECKBOX
				}, {
					title: 'test 2',
					type: gridConstants.COLUMN_TYPES.TEXT
				}],
				isSomeRowsSelected: true
			});

			assert.equal(document.querySelector('input[type=checkbox]').indeterminate, true);
		});
	});

	describe('rows', () => {
		it('should return the row data when a button is clicked after setting rows', () => {
			let testVar = '';
			const onRowClick = (rowData) => {
				testVar = rowData.something;
			};
			const onTrashClick = (rowData) => {
				testVar = rowData.rowID + '_trash';
			};

			window.control = new GridColumnBlock({
				container: window.testContainer,
				onSelectRow() {
				},
				isSelectable: true,
				isAutoHeight: true
			})
				.columns([{
					type: gridConstants.COLUMN_TYPES.TEXT,
					ID: '0'
				}, {
					type: gridConstants.COLUMN_TYPES.ACTIONS,
					currentWidth: 120,
					ID: '1',
					buttons: [{
						icon: 'circle',
						onClick: onRowClick
					}, {
						icon: 'trash',
						onClick: onTrashClick
					}]
				}]);

			window.control.rows([{
				ID: shortid.generate(),
				rowID: '1',
				cells: [{
					text: 'text 1'
				}, {}],
				something: 'else'
			}, {
				ID: shortid.generate(),
				rowID: '2',
				cells: [{
					text: 'text 1'
				}, {}],
				something: 'another'
			}]);

			window.control.rows([]);

			window.control.rows([{
				ID: shortid.generate(),
				rowID: '1',
				cells: [{
					text: 'text 1'
				}, {}],
				something: 'else'
			}, {
				ID: shortid.generate(),
				rowID: '2',
				cells: [{
					text: 'text 2'
				}, {}],
				something: 'another'
			}, {
				ID: shortid.generate(),
				rowID: '3',
				cells: [{
					text: 'text 3'
				}, {}],
				something: 'meh'
			}, {
				ID: shortid.generate(),
				rowID: '4',
				cells: [{
					text: 'text 4'
				}, {}],
				something: 'stone'
			}, {
				ID: shortid.generate(),
				rowID: '5',
				cells: [{
					text: 'text 5'
				}, {}],
				something: 'mini'
			}]);

			return testUtil.defer()
				.then(() => {
					testUtil.simulateClick(query.all('button')[5]);

					assert.equal(testVar, '3_trash');
				});
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
