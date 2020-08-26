import { assert } from 'type-enforcer';
import { CONTEXT_MENU_EVENT } from '../../index.js';
import GridColumnBlock from '../../src/grid/GridColumnBlock.js';
import { COLUMN_TYPES } from '../../src/grid/gridConstants.js';
import ControlTests from '../ControlTests.js';
import TestUtil from '../TestUtil.js';

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
					type: COLUMN_TYPES.CHECKBOX
				}, {
					id: 'test2',
					title: 'test 2',
					canSort: true,
					type: COLUMN_TYPES.TEXT
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

			assert.is(testUtil.count('.menu .heading', true), 5);
		});
	});

	describe('IsAllRowsSelected', () => {
		testUtil.testMethod({
			methodName: 'isAllRowsSelected',
			defaultValue: false,
			testValue: true,
			secondTestValue: false
		});

		it(
			'should have a checked checkbox if a column has a dataType set to checkbox and isAllRowsSelected is true',
			() => {
				testUtil.control = new GridColumnBlock({
					container: testUtil.container,
					columns: [{
						title: 'test 1',
						type: COLUMN_TYPES.CHECKBOX
					}, {
						title: 'test 2',
						type: COLUMN_TYPES.TEXT
					}],
					isAllRowsSelected: true
				});

				assert.is(testUtil.first('input[type=checkbox]').checked, true);
			}
		);
	});

	describe('IsSomeRowsSelected', () => {
		testUtil.testMethod({
			methodName: 'isSomeRowsSelected',
			defaultValue: false,
			testValue: true,
			secondTestValue: false
		});

		it(
			'should have a checkbox with indeterminate set to true if one column has a dataType set to checkbox and isSomeRowsSelected is true',
			() => {
				testUtil.control = new GridColumnBlock({
					container: testUtil.container,
					columns: [{
						title: 'test 1',
						type: COLUMN_TYPES.CHECKBOX
					}, {
						title: 'test 2',
						type: COLUMN_TYPES.TEXT
					}],
					isSomeRowsSelected: true
				});

				assert.is(testUtil.first('input[type=checkbox]').indeterminate, true);
			}
		);
	});

	describe('rows', () => {
		it('should return the row data when a button is clicked after setting rows', () => {
			let testValue = '';
			const onRowClick = (rowData) => {
				testValue = rowData.something;
			};
			const onTrashClick = (rowData) => {
				testValue = rowData.id + '_trash';
			};

			testUtil.control = new GridColumnBlock({
				container: testUtil.container,
				onSelectRow() {
				},
				isSelectable: true,
				height: '30rem'
			})
				.columns([{
					type: COLUMN_TYPES.TEXT,
					id: '0'
				}, {
					type: COLUMN_TYPES.ACTIONS,
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
				id: '1',
				cells: [{
					text: 'text 1'
				}, {}],
				something: 'else'
			}, {
				id: '2',
				cells: [{
					text: 'text 1'
				}, {}],
				something: 'another'
			}]);

			testUtil.control.rows([]);

			testUtil.control.rows([{
				id: '1',
				cells: [{
					text: 'text 1'
				}, {}],
				something: 'else'
			}, {
				id: '2',
				cells: [{
					text: 'text 2'
				}, {}],
				something: 'another'
			}, {
				id: '3',
				cells: [{
					text: 'text 3'
				}, {}],
				something: 'meh'
			}, {
				id: '4',
				cells: [{
					text: 'text 4'
				}, {}],
				something: 'stone'
			}, {
				id: '5',
				cells: [{
					text: 'text 5'
				}, {}],
				something: 'mini'
			}]);

			testUtil.simulateClick(testUtil.all('button')[5]);

			assert.is(testValue, '3_trash');
		});
	});

	describe('IsFiltered', () => {
		testUtil.testMethod({
			methodName: 'isFiltered',
			defaultValue: false,
			testValue: true
		});
	});
});
