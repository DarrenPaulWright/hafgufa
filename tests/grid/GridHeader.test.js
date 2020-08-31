import { assert } from 'type-enforcer';
import { CONTEXT_MENU_EVENT } from '../../index.js';
import { COLUMN_TYPES, FILTER_TYPES, SORT_TYPES } from '../../src/grid/gridConstants.js';
import GridHeader from '../../src/grid/GridHeader.js';
import TestUtil from '../TestUtil.js';

describe('GridHeader', () => {
	const testUtil = new TestUtil(GridHeader);

	const addTag = (text) => {
		testUtil.first('input').value = text;
		testUtil.hitEnter();
	};

	testUtil.run({
		mainCssClass: 'grid-header'
	});

	describe('.columns', () => {
		testUtil.testMethod({
			methodName: 'columns',
			defaultValue: [],
			testValue: [{
				title: 'test'
			}],
			secondTestValue: [{
				title: 'test 2'
			}]
		});

		it('should add a cell control for each column added', () => {
			testUtil.control = new GridHeader({
				container: testUtil.container,
				columns: [{
					title: 'test 1'
				}, {
					title: 'test 2'
				}]
			});

			assert.is(testUtil.count('.grid-header-cell'), 2);
		});

		it('should remove previous columns when new columns are set', () => {
			testUtil.control = new GridHeader({
				container: testUtil.container,
				columns: [{
					title: 'test 1'
				}, {
					title: 'test 2'
				}, {
					title: 'test 9'
				}]
			});

			testUtil.control.columns([{
				title: 'test 3'
			}, {
				title: 'test 4'
			}]);

			assert.is(testUtil.count('.grid-header-cell'), 2);
		});

		it('should set the width of flexible width columns proportionally', () => {
			testUtil.control = new GridHeader({
				container: testUtil.container,
				columns: [{
					id: '0',
					title: 'test 1',
					size: '3*',
					minWidth: '0'
				}, {
					id: '1',
					title: 'test 2',
					size: '1*',
					minWidth: '0'
				}, {
					id: '2',
					title: 'test 2',
					size: '20px'
				}]
			});

			testUtil.control.desiredWidth(400);

			const firstCellWidth = testUtil.nth('.grid-header-cell', 0).offsetWidth;
			const secondCellWidth = testUtil.nth('.grid-header-cell', 1).offsetWidth;

			assert.is(firstCellWidth, secondCellWidth * 3);
		});

		it('should accept % or * for flexible width columns', () => {
			testUtil.control = new GridHeader({
				container: testUtil.container,
				columns: [{
					id: '0',
					title: 'test 1',
					size: '3%'
				}, {
					id: '1',
					title: 'test 2',
					size: '1*'
				}, {
					id: '2',
					title: 'test 2',
					size: '20px'
				}]
			});

			testUtil.control.desiredWidth(400);

			const firstCellWidth = testUtil.nth('.grid-header-cell', 0).offsetWidth;
			const secondCellWidth = testUtil.nth('.grid-header-cell', 1).offsetWidth;

			assert.is(firstCellWidth, secondCellWidth * 3);
		});

		it('should accept an asterisk without a number as a width value', () => {
			testUtil.control = new GridHeader({
				container: testUtil.container,
				columns: [{
					id: '0',
					title: 'test 1',
					size: '3%'
				}, {
					id: '1',
					title: 'test 2',
					size: '*'
				}, {
					id: '2',
					title: 'test 2',
					size: '20px'
				}]
			});

			testUtil.control.desiredWidth(400);

			const firstCellWidth = testUtil.nth('.grid-header-cell', 0).offsetWidth;
			const secondCellWidth = testUtil.nth('.grid-header-cell', 1).offsetWidth;

			assert.is(firstCellWidth, secondCellWidth * 3);
		});

		it('should resize flexible width columns when the header width changes', () => {
			testUtil.control = new GridHeader({
				container: testUtil.container,
				columns: [{
					id: '0',
					title: 'test 1',
					size: '*'
				}, {
					id: '1',
					title: 'test 2',
					size: '*'
				}],
				width: '400px'
			});

			testUtil.control.width(200);
			testUtil.control.desiredWidth(200);

			assert.is(testUtil.nth('.grid-header-cell', 0).offsetWidth, 100);
		});

		it('should resize flexible width columns to the minWidth when the header width changes', () => {
			testUtil.control = new GridHeader({
				container: testUtil.container,
				columns: [{
					id: '1',
					title: 'test 1',
					size: '*',
					minWidth: 60
				}, {
					id: '2',
					title: 'test 2',
					size: '*',
					minWidth: 49
				}, {
					id: '3',
					title: 'test 3',
					size: '2*',
					minWidth: 230
				}],
				width: '200px'
			});

			testUtil.control.desiredWidth(200);

			assert.is(testUtil.nth('.grid-header-cell', 1).offsetWidth, 49);
		});

		it('should only have one sorted column after two different columns are sorted', () => {
			testUtil.control = new GridHeader({
				container: testUtil.container,
				columns: [{
					id: 0,
					title: 'test 1',
					size: '*',
					canSort: true
				}, {
					id: 1,
					title: 'test 2',
					size: '*',
					canSort: true
				}]
			});

			testUtil.simulateClick(testUtil.nth('.heading', 0));
			testUtil.simulateClick(testUtil.nth('.heading', 1));

			assert.is(testUtil.count('.sort-asc'), 1);
		});
	});

	describe('.filterTypes', () => {
		it('should render a tags control if filterType is AUTO_COMPLETE', () => {
			testUtil.control = new GridHeader({
				container: testUtil.container,
				columns: [{
					title: 'test 1',
					size: '*',
					canFilter: true,
					type: COLUMN_TYPES.TEXT,
					filterType: FILTER_TYPES.AUTO_COMPLETE
				}]
			});

			assert.is(testUtil.count('.tags'), 1);
		});

		it('should render a picker if filterType is DATE', () => {
			testUtil.control = new GridHeader({
				container: testUtil.container,
				columns: [{
					title: 'test 1',
					size: '*',
					canFilter: true,
					type: COLUMN_TYPES.DATE,
					filterType: FILTER_TYPES.DATE
				}]
			});

			assert.is(testUtil.count('.grouped-buttons'), 1);
		});

		it('should render two text inputs if filterType is NUMBER', () => {
			testUtil.control = new GridHeader({
				container: testUtil.container,
				columns: [{
					title: 'test 1',
					size: '*',
					canFilter: true,
					type: COLUMN_TYPES.NUMBER,
					filterType: FILTER_TYPES.NUMBER
				}]
			});

			assert.is(testUtil.count('input[type=text]'), 2);
		});
	});

	describe('Callbacks', () => {
		it('should call the onSort callback when a column is sorted', () => {
			let testValue = '';

			testUtil.control = new GridHeader({
				container: testUtil.container,
				columns: [{
					title: 'test 1',
					size: '*',
					canSort: true
				}],
				onSort(sortDirection) {
					testValue = sortDirection;
				}
			});

			testUtil.simulateClick(testUtil.nth('.heading', 0));

			assert.is(testValue, SORT_TYPES.ASC);
		});

		it('should call the onSort callback when a column is sorted twice', () => {
			let testValue = '';

			testUtil.control = new GridHeader({
				container: testUtil.container,
				columns: [{
					title: 'test 1',
					size: '*',
					canSort: true
				}],
				onSort(sortDirection) {
					testValue = sortDirection;
				}
			});

			testUtil.simulateClick(testUtil.nth('.heading', 0));
			testUtil.simulateClick(testUtil.nth('.heading', 0));

			assert.is(testValue, SORT_TYPES.DESC);
		});

		it('should call the onSort callback when a column is sorted three times', () => {
			let testValue = '';

			testUtil.control = new GridHeader({
				container: testUtil.container,
				columns: [{
					title: 'test 1',
					size: '*',
					canSort: true
				}],
				onSort(sortDirection) {
					testValue = sortDirection;
				}
			});

			testUtil.simulateClick(testUtil.nth('.heading', 0));
			testUtil.simulateClick(testUtil.nth('.heading', 0));
			testUtil.simulateClick(testUtil.nth('.heading', 0));

			assert.is(testValue, SORT_TYPES.NONE);
		});

		it('should set the first column sort direction to none when a second column is sorted', () => {
			testUtil.control = new GridHeader({
				container: testUtil.container,
				columns: [{
					id: '1',
					title: 'test 1',
					size: '*',
					canSort: true
				}, {
					id: '2',
					title: 'test 2',
					size: '*',
					canSort: true
				}]
			});

			testUtil.simulateClick(testUtil.nth('.heading', 0));
			testUtil.simulateClick(testUtil.nth('.heading', 1));

			assert.is(testUtil.hasClass(testUtil.nth('.heading', 0), 'sort-asc'), false);
		});

		it('should call the onSelectAllGroups callback when a checkbox is clicked', () => {
			let testValue = '';

			testUtil.control = new GridHeader({
				container: testUtil.container,
				columns: [{
					title: 'test 1',
					type: COLUMN_TYPES.CHECKBOX
				}],
				onSelectAllGroups() {
					testValue = 'test';
				}
			});

			testUtil.simulateClick(testUtil.first('.checkbox'));

			assert.is(testValue, 'test');
		});

		it('should call the onGetFilterData callback when a filter control is built', () => {
			let testValue = '';

			testUtil.control = new GridHeader({
				container: testUtil.container,
				columns: [{
					title: 'test 1',
					type: COLUMN_TYPES.TEXT,
					filterType: FILTER_TYPES.DROPDOWN,
					canFilter: true
				}],
				onGetFilterData() {
					testValue = 'test';
				}
			});

			assert.is(testValue, 'test');
		});

		it('should call the onFilter callback when a filter is set', () => {
			let testValue = '';

			testUtil.control = new GridHeader({
				container: testUtil.container,
				columns: [{
					title: 'test 1',
					type: COLUMN_TYPES.TEXT,
					filterType: FILTER_TYPES.AUTO_COMPLETE,
					canFilter: true
				}],
				onFilter() {
					testValue = 'test';
				}
			});

			testUtil.simulateClick(testUtil.first('.tags-list-container'));
			addTag('test1');

			assert.is(testValue, 'test');
		});
	});

	describe('.selectableColumns', () => {
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
			testUtil.control = new GridHeader({
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

	describe('.isAllRowsSelected', () => {
		testUtil.testMethod({
			methodName: 'isAllRowsSelected',
			defaultValue: false,
			testValue: true,
			secondTestValue: false
		});

		it('should have a checked checkbox if a column has a dataType set to checkbox and isAllRowsSelected is true', () => {
			testUtil.control = new GridHeader({
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
		});
	});

	describe('.isSomeRowsSelected', () => {
		testUtil.testMethod({
			methodName: 'isSomeRowsSelected',
			defaultValue: false,
			testValue: true,
			secondTestValue: false
		});

		it('should have a checkbox with indeterminate set to true if one column has a dataType set to checkbox and isSomeRowsSelected is true', () => {
			testUtil.control = new GridHeader({
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
		});
	});

	describe('.scrollbarWidth', () => {
		testUtil.testMethod({
			methodName: 'scrollbarWidth',
			defaultValue: 0,
			testValue: 17,
			secondTestValue: 100
		});

		it('should add scrollbarWidth to the width of the last column control', () => {
			testUtil.control = new GridHeader({
				container: testUtil.container,
				columns: [{
					id: '0',
					title: 'test 1',
					size: '3%'
				}, {
					id: '1',
					title: 'test 2',
					size: '*'
				}, {
					id: '2',
					title: 'test 2',
					size: '20px'
				}]
			});

			testUtil.control.scrollbarWidth(17);
			testUtil.control.desiredWidth(200);

			const lastCellWidth = testUtil.nth('.grid-header-cell', 2).offsetWidth;

			assert.is(lastCellWidth, 37);
		});
	});
});
