import { assert } from 'chai';
import { CONTEXT_MENU_EVENT } from '../../../src';
import * as gridConstants from '../../../src/ui/grid/gridConstants';
import GridHeader from '../../../src/ui/grid/GridHeader';
import query from '../../query';
import TestUtil from '../../TestUtil';
import ControlTests from '../ControlTests';

const testUtil = new TestUtil(GridHeader);
const controlBaseTests = new ControlTests(GridHeader, testUtil, {
	mainCssClass: 'grid-header'
});

const addTag = (text) => {
	document.querySelector('input').value = text;
	testUtil.hitEnter();
};

describe('GridHeader', () => {

	controlBaseTests.run();

	describe('Columns', () => {
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
			window.control = new GridHeader({
				container: window.testContainer,
				columns: [{
					title: 'test 1'
				}, {
					title: 'test 2'
				}]
			});

			assert.equal(document.querySelectorAll('.grid-header-cell').length, 2);
		});

		it('should remove previous columns when new columns are set', () => {
			window.control = new GridHeader({
				container: window.testContainer,
				columns: [{
					title: 'test 1'
				}, {
					title: 'test 2'
				}, {
					title: 'test 9'
				}]
			});

			window.control.columns([{
				title: 'test 3'
			}, {
				title: 'test 4'
			}]);

			assert.equal(document.querySelectorAll('.grid-header-cell').length, 2);
		});

		it('should set the width of flexible width columns proportionally', () => {
			let firstCellWidth;
			let secondCellWidth;

			window.control = new GridHeader({
				container: window.testContainer,
				columns: [{
					ID: '0',
					title: 'test 1',
					size: '3*',
					minWidth: '0'
				}, {
					ID: '1',
					title: 'test 2',
					size: '1*',
					minWidth: '0'
				}, {
					ID: '2',
					title: 'test 2',
					size: '20px'
				}]
			});

			window.control.desiredWidth(400);

			firstCellWidth = document.querySelectorAll('.grid-header-cell')[0].offsetWidth;
			secondCellWidth = document.querySelectorAll('.grid-header-cell')[1].offsetWidth;

			assert.equal(firstCellWidth, secondCellWidth * 3);
		});

		it('should accept % or * for flexible width columns', () => {
			let firstCellWidth;
			let secondCellWidth;

			window.control = new GridHeader({
				container: window.testContainer,
				columns: [{
					ID: '0',
					title: 'test 1',
					size: '3%'
				}, {
					ID: '1',
					title: 'test 2',
					size: '1*'
				}, {
					ID: '2',
					title: 'test 2',
					size: '20px'
				}]
			});

			window.control.desiredWidth(400);

			firstCellWidth = document.querySelectorAll('.grid-header-cell')[0].offsetWidth;
			secondCellWidth = document.querySelectorAll('.grid-header-cell')[1].offsetWidth;

			assert.equal(firstCellWidth, secondCellWidth * 3);
		});

		it('should accept an asterisk without a number as a width value', () => {
			let firstCellWidth;
			let secondCellWidth;

			window.control = new GridHeader({
				container: window.testContainer,
				columns: [{
					ID: '0',
					title: 'test 1',
					size: '3%'
				}, {
					ID: '1',
					title: 'test 2',
					size: '*'
				}, {
					ID: '2',
					title: 'test 2',
					size: '20px'
				}]
			});

			window.control.desiredWidth(400);

			firstCellWidth = document.querySelectorAll('.grid-header-cell')[0].offsetWidth;
			secondCellWidth = document.querySelectorAll('.grid-header-cell')[1].offsetWidth;

			assert.equal(firstCellWidth, secondCellWidth * 3);
		});

		it('should resize flexible width columns when the header width changes', () => {
			window.control = new GridHeader({
				container: window.testContainer,
				columns: [{
					ID: '0',
					title: 'test 1',
					size: '*'
				}, {
					ID: '1',
					title: 'test 2',
					size: '*'
				}],
				width: '400px'
			});

			window.control.width(200);
			window.control.desiredWidth(200);

			assert.equal(document.querySelectorAll('.grid-header-cell')[0].offsetWidth, 100);
		});

		it('should resize flexible width columns to the minWidth when the header width changes', () => {
			window.control = new GridHeader({
				container: window.testContainer,
				columns: [{
					ID: '1',
					title: 'test 1',
					size: '*',
					minWidth: 60
				}, {
					ID: '2',
					title: 'test 2',
					size: '*',
					minWidth: 49
				}, {
					ID: '3',
					title: 'test 3',
					size: '2*',
					minWidth: 230
				}],
				width: '200px'
			});

			window.control.desiredWidth(200);

			assert.equal(document.querySelectorAll('.grid-header-cell')[1].offsetWidth, 49);
		});

		it('should only have one sorted column after two different columns are sorted', () => {
			window.control = new GridHeader({
				container: window.testContainer,
				columns: [{
					ID: 0,
					title: 'test 1',
					size: '*',
					canSort: true
				}, {
					ID: 1,
					title: 'test 2',
					size: '*',
					canSort: true
				}]
			});

			testUtil.simulateClick(document.querySelectorAll('.heading')[0]);
			testUtil.simulateClick(document.querySelectorAll('.heading')[1]);

			assert.equal(document.querySelectorAll('.sort-asc').length, 1);
		});
	});

	describe('FilterTypes', () => {
		it('should set a default filter type of autocomplete if canFilter is true and column type is text', () => {
			window.control = new GridHeader({
				container: window.testContainer,
				columns: [{
					title: 'test 1',
					size: '*',
					canFilter: true,
					type: gridConstants.COLUMN_TYPES.TEXT
				}]
			});

			assert.equal(document.querySelectorAll('.tags').length, 1);
		});

		it('should set a default filter type of autocomplete if canFilter is true and column type is email', () => {
			window.control = new GridHeader({
				container: window.testContainer,
				columns: [{
					title: 'test 1',
					size: '*',
					canFilter: true,
					type: gridConstants.COLUMN_TYPES.EMAIL
				}]
			});

			assert.equal(document.querySelectorAll('.tags').length, 1);
		});

		it('should set a default filter type of date if canFilter is true and column type is date', () => {
			window.control = new GridHeader({
				container: window.testContainer,
				columns: [{
					title: 'test 1',
					size: '*',
					canFilter: true,
					type: gridConstants.COLUMN_TYPES.DATE
				}]
			});

			assert.equal(document.querySelectorAll('.grouped-buttons').length, 1);
		});

		it('should NOT set a default filter type of date if canFilter is false and column type is date', () => {
			window.control = new GridHeader({
				container: window.testContainer,
				columns: [{
					title: 'test 1',
					size: '*',
					canFilter: false,
					type: gridConstants.COLUMN_TYPES.DATE
				}]
			});

			assert.equal(document.querySelectorAll('.grouped-buttons').length, 0);
		});

		it('should set a default filter type of date if canFilter is true and column type is datetime', () => {
			window.control = new GridHeader({
				container: window.testContainer,
				columns: [{
					title: 'test 1',
					size: '*',
					canFilter: true,
					type: gridConstants.COLUMN_TYPES.DATE_TIME
				}]
			});

			assert.equal(document.querySelectorAll('.grouped-buttons').length, 1);
		});

		it('should set a default filter type of date if canFilter is true and column type is time', () => {
			window.control = new GridHeader({
				container: window.testContainer,
				columns: [{
					title: 'test 1',
					size: '*',
					canFilter: true,
					type: gridConstants.COLUMN_TYPES.TIME
				}]
			});

			assert.equal(document.querySelectorAll('.grouped-buttons').length, 1);
		});

		it('should set a default filter type of number if canFilter is true and column type is number', () => {
			window.control = new GridHeader({
				container: window.testContainer,
				columns: [{
					title: 'test 1',
					size: '*',
					canFilter: true,
					type: gridConstants.COLUMN_TYPES.NUMBER
				}]
			});

			assert.equal(document.querySelectorAll('input[type=text]').length, 2);
		});

		it('should NOT set a default filter type of number if canFilter is false and column type is number', () => {
			window.control = new GridHeader({
				container: window.testContainer,
				columns: [{
					title: 'test 1',
					size: '*',
					canFilter: false,
					type: gridConstants.COLUMN_TYPES.NUMBER
				}]
			});

			assert.equal(document.querySelectorAll('input[type=text]').length, 0);
		});
	});

	describe('Callbacks', () => {
		it('should call the onSort callback when a column is sorted', () => {
			let testVal = '';

			window.control = new GridHeader({
				container: window.testContainer,
				columns: [{
					title: 'test 1',
					size: '*',
					canSort: true
				}],
				onSort(sortDirection) {
					testVal = sortDirection;
				}
			});

			testUtil.simulateClick(document.querySelectorAll('.heading')[0]);

			assert.equal(testVal, gridConstants.SORT_TYPES.ASC);
		});

		it('should call the onSort callback when a column is sorted twice', () => {
			let testVal = '';

			window.control = new GridHeader({
				container: window.testContainer,
				columns: [{
					title: 'test 1',
					size: '*',
					canSort: true
				}],
				onSort(sortDirection) {
					testVal = sortDirection;
				}
			});

			testUtil.simulateClick(document.querySelectorAll('.heading')[0]);
			testUtil.simulateClick(document.querySelectorAll('.heading')[0]);

			assert.equal(testVal, gridConstants.SORT_TYPES.DESC);
		});

		it('should call the onSort callback when a column is sorted three times', () => {
			let testVal = '';

			window.control = new GridHeader({
				container: window.testContainer,
				columns: [{
					title: 'test 1',
					size: '*',
					canSort: true
				}],
				onSort(sortDirection) {
					testVal = sortDirection;
				}
			});

			testUtil.simulateClick(document.querySelectorAll('.heading')[0]);
			testUtil.simulateClick(document.querySelectorAll('.heading')[0]);
			testUtil.simulateClick(document.querySelectorAll('.heading')[0]);

			assert.equal(testVal, gridConstants.SORT_TYPES.NONE);
		});

		it('should set the first column sort direction to none when a second column is sorted', () => {
			window.control = new GridHeader({
				container: window.testContainer,
				columns: [{
					ID: '1',
					title: 'test 1',
					size: '*',
					canSort: true
				}, {
					ID: '2',
					title: 'test 2',
					size: '*',
					canSort: true
				}]
			});

			testUtil.simulateClick(document.querySelectorAll('label')[0]);
			testUtil.simulateClick(document.querySelectorAll('label')[1]);

			assert.isNotTrue(query.hasClass(document.querySelectorAll('label')[0], 'sort-asc'));
		});

		it('should call the onSelectAllGroups callback when a checkbox is clicked', () => {
			let testVal = '';

			window.control = new GridHeader({
				container: window.testContainer,
				columns: [{
					title: 'test 1',
					type: gridConstants.COLUMN_TYPES.CHECKBOX
				}],
				onSelectAllGroups() {
					testVal = 'test';
				}
			});

			testUtil.simulateClick(document.querySelector('.checkbox'));

			assert.equal(testVal, 'test');
		});

		it('should call the onGetFilterData callback when a filter control is built', () => {
			let testVal = '';

			window.control = new GridHeader({
				container: window.testContainer,
				columns: [{
					title: 'test 1',
					type: gridConstants.COLUMN_TYPES.TEXT,
					filterType: gridConstants.FILTER_TYPES.DROPDOWN,
					canFilter: true
				}],
				onGetFilterData() {
					testVal = 'test';
				}
			});

			assert.equal(testVal, 'test');
		});

		it('should call the onFilter callback when a filter is set', () => {
			let testVal = '';

			window.control = new GridHeader({
				container: window.testContainer,
				columns: [{
					title: 'test 1',
					type: gridConstants.COLUMN_TYPES.TEXT,
					filterType: gridConstants.FILTER_TYPES.AUTO_COMPLETE,
					canFilter: true
				}],
				onFilter() {
					testVal = 'test';
				}
			});

			testUtil.simulateClick(document.querySelector('.tags-list-container'));
			addTag('test1');

			assert.equal(testVal, 'test');
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
			window.control = new GridHeader({
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
			window.control = new GridHeader({
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
			window.control = new GridHeader({
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

	describe('ScrollbarWidth', () => {
		testUtil.testMethod({
			methodName: 'scrollbarWidth',
			defaultValue: 0,
			testValue: 17,
			secondTestValue: 100
		});

		it('should add scrollbarWidth to the width of the last column control', () => {
			let lastCellWidth;

			window.control = new GridHeader({
				container: window.testContainer,
				columns: [{
					ID: '0',
					title: 'test 1',
					size: '3%'
				}, {
					ID: '1',
					title: 'test 2',
					size: '*'
				}, {
					ID: '2',
					title: 'test 2',
					size: '20px'
				}]
			});

			window.control.scrollbarWidth(17);
			window.control.desiredWidth(200);

			lastCellWidth = document.querySelectorAll('.grid-header-cell')[2].offsetWidth;

			assert.equal(lastCellWidth, 37);
		});

	});
});
