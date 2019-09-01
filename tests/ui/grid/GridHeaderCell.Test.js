import { assert } from 'chai';
import * as gridConstants from '../../../src/ui/grid/gridConstants';
import GridHeaderCell from '../../../src/ui/grid/GridHeaderCell';
import { CONTEXT_MENU_EVENT } from '../../../src/utility/domConstants';
import query from '../../query';
import TestUtil from '../../TestUtil';
import ControlTests from '../ControlTests';

const testUtil = new TestUtil(GridHeaderCell);
const controlBaseTests = new ControlTests(GridHeaderCell, testUtil, {
	mainCssClass: 'grid-header-cell'
});

const addTag = (text) => {
	document.querySelector('input').value = text;
	testUtil.hitEnter();
};

describe('GridHeaderCell', () => {

	controlBaseTests.run();

	describe('Label', () => {
		testUtil.testMethod({
			methodName: 'label',
			defaultValue: '',
			testValue: 'test',
			secondTestValue: 'another'
		});

		it('should have a heading element', () => {
			window.control = new GridHeaderCell({
				container: window.testContainer
			});

			assert.equal(document.querySelectorAll('.heading').length, 1);
		});

		it('should have a label element with label text in it', () => {
			window.control = new GridHeaderCell({
				container: window.testContainer,
				label: 'title'
			});

			assert.equal(document.querySelector('.heading span').textContent, 'title');
		});
	});

	describe('DataType', () => {
		testUtil.testMethod({
			methodName: 'dataType',
			defaultValue: gridConstants.COLUMN_TYPES.NONE,
			testValue: gridConstants.COLUMN_TYPES.DATE,
			secondTestValue: gridConstants.COLUMN_TYPES.TEXT
		});

		it('should build a checkbox if dataType is set to checkbox', () => {
			window.control = new GridHeaderCell({
				container: window.testContainer,
				dataType: gridConstants.COLUMN_TYPES.CHECKBOX
			});

			assert.equal(document.querySelectorAll('input[type=checkbox]').length, 1);
		});

		it('should remove the checkbox if dataType is set back to none', () => {
			window.control = new GridHeaderCell({
				container: window.testContainer,
				dataType: gridConstants.COLUMN_TYPES.CHECKBOX
			});

			window.control.dataType(gridConstants.COLUMN_TYPES.NONE);

			assert.equal(document.querySelectorAll('input[type=checkbox]').length, 0);
		});

		it('should call the onSelect callback with true when a checkbox is clicked', () => {
			let testVar;

			window.control = new GridHeaderCell({
				container: window.testContainer,
				dataType: gridConstants.COLUMN_TYPES.CHECKBOX,
				onSelect(newValue) {
					testVar = newValue;
				}
			});

			testUtil.simulateClick(document.querySelector('.checkbox'));

			assert.isTrue(testVar === true);
		});

		it('should call the onSelect callback with false when a checkbox is clicked a second time', () => {
			let testVar;

			window.control = new GridHeaderCell({
				container: window.testContainer,
				dataType: gridConstants.COLUMN_TYPES.CHECKBOX,
				onSelect(newValue) {
					testVar = newValue;
				}
			});

			testUtil.simulateClick(document.querySelector('.checkbox'));
			testUtil.simulateClick(document.querySelector('.checkbox'));

			assert.isTrue(testVar === false);
		});
	});

	describe('CanSort', () => {
		testUtil.testMethod({
			methodName: 'canSort',
			defaultValue: false,
			testValue: true
		});

		it('should have class "sortable" if canSort is true', () => {
			window.control = new GridHeaderCell({
				container: window.testContainer,
				canSort: true
			});

			assert.equal(document.querySelectorAll('.heading.sortable').length, 1);
		});

		it('should NOT have class "sortable" if canSort is set back to false', () => {
			window.control = new GridHeaderCell({
				container: window.testContainer,
				canSort: true
			});

			window.control.canSort(false);

			assert.equal(document.querySelectorAll('label.sortable').length, 0);
		});

		it('should set sortDirection to ASC when the label is clicked once', () => {
			window.control = new GridHeaderCell({
				container: window.testContainer,
				canSort: true
			});

			testUtil.simulateClick(document.querySelector('.heading'));

			assert.equal(window.control.sortDirection(), gridConstants.SORT_TYPES.ASC);
		});

		it('should set sortDirection to DESC when the label is clicked twice', () => {
			window.control = new GridHeaderCell({
				container: window.testContainer,
				canSort: true
			});

			testUtil.simulateClick(document.querySelector('.heading'));
			testUtil.simulateClick(document.querySelector('.heading'));

			assert.equal(window.control.sortDirection(), gridConstants.SORT_TYPES.DESC);
		});

		it('should set sortDirection back to NONE when the label is clicked thrice', () => {
			window.control = new GridHeaderCell({
				container: window.testContainer,
				canSort: true
			});

			testUtil.simulateClick(document.querySelector('label'));
			testUtil.simulateClick(document.querySelector('label'));
			testUtil.simulateClick(document.querySelector('label'));

			assert.equal(window.control.sortDirection(), gridConstants.SORT_TYPES.NONE);
		});
	});

	describe('SortDirection', () => {
		testUtil.testMethod({
			methodName: 'sortDirection',
			defaultValue: gridConstants.SORT_TYPES.NONE,
			testValue: gridConstants.SORT_TYPES.ASC,
			secondTestValue: gridConstants.SORT_TYPES.DESC
		});

		it('should NOT have class "sort-asc" if sortDirection is set to asc and canSort is false', () => {
			window.control = new GridHeaderCell({
				container: window.testContainer,
				canSort: false,
				sortDirection: gridConstants.SORT_TYPES.ASC
			});

			assert.equal(document.querySelectorAll('label.sort-asc').length, 0);
		});

		it('should have class "sort-asc" if sortDirection is set to asc', () => {
			window.control = new GridHeaderCell({
				container: window.testContainer,
				canSort: true,
				sortDirection: gridConstants.SORT_TYPES.ASC
			});

			assert.equal(document.querySelectorAll('.heading.sort-asc').length, 1);
		});

		it('should have class "sort-desc" if sortDirection is set to desc', () => {
			window.control = new GridHeaderCell({
				container: window.testContainer,
				canSort: true,
				sortDirection: gridConstants.SORT_TYPES.DESC
			});

			assert.equal(document.querySelectorAll('.heading.sort-desc').length, 1);
		});

		it('should call the onSort callback when sortDirection is set and the label is clicked', () => {
			let testVar = '';

			window.control = new GridHeaderCell({
				container: window.testContainer,
				canSort: true,
				onSort() {
					testVar = 'test';
				}
			});

			window.control.sortDirection(gridConstants.SORT_TYPES.ASC);
			testUtil.simulateClick(document.querySelector('.heading'));

			assert.equal(testVar, 'test');
		});
	});

	describe('FilterType', () => {
		testUtil.testMethod({
			methodName: 'filterType',
			defaultValue: gridConstants.FILTER_TYPES.NONE,
			testValue: gridConstants.FILTER_TYPES.AUTO_COMPLETE,
			secondTestValue: gridConstants.FILTER_TYPES.DROPDOWN
		});

		it('should build a tag control when filterType is set to AUTO_COMPLETE', () => {
			window.control = new GridHeaderCell({
				container: window.testContainer,
				filterType: gridConstants.FILTER_TYPES.AUTO_COMPLETE
			});

			assert.equal(document.querySelectorAll('.tags').length, 1);
		});

		it('should call the onGetFilterOptions callback when filterType is set to AUTO_COMPLETE', () => {
			let testVar = '';

			window.control = new GridHeaderCell({
				container: window.testContainer,
				onGetFilterOptions(type, id, callback) {
					testVar = 'test';
					callback(['test']);
				}
			})
				.filterType(gridConstants.FILTER_TYPES.AUTO_COMPLETE);

			testUtil.simulateClick(document.querySelector('.tags-list-container'));

			assert.equal(testVar, 'test');
		});

		it('should build a picker control when filterType is set to DROPDOWN', () => {
			window.control = new GridHeaderCell({
				container: window.testContainer,
				filterType: gridConstants.FILTER_TYPES.DROPDOWN
			});

			assert.equal(document.querySelectorAll('.grouped-buttons').length, 1);
		});

		it('should call the onGetFilterOptions callback when filterType is set to DROPDOWN', () => {
			let testVar = '';

			window.control = new GridHeaderCell({
				container: window.testContainer,
				onGetFilterOptions(type, id, callback) {
					testVar = 'test';
					callback([]);
				}
			})
				.filterType(gridConstants.FILTER_TYPES.DROPDOWN);

			assert.equal(testVar, 'test');
		});

		it('should build a picker control when filterType is set to DATE', () => {
			window.control = new GridHeaderCell({
				container: window.testContainer,
				filterType: gridConstants.FILTER_TYPES.DATE
			});

			assert.equal(document.querySelectorAll('.grouped-buttons').length, 1);
		});

		it('should set the width of a picker control when filterType is set to DATE and resize is called', () => {
			window.control = new GridHeaderCell({
				container: window.testContainer,
				filterType: gridConstants.FILTER_TYPES.DATE,
				width: '100px'
			});

			window.control.resize();

			assert.equal(getComputedStyle(document.querySelector('.grouped-buttons')).width, '100px');
		});

		it('should remove all filter controls when filterType is set back to NONE', () => {
			window.control = new GridHeaderCell({
				container: window.testContainer,
				filterType: gridConstants.FILTER_TYPES.DATE
			});

			window.control.filterType(gridConstants.FILTER_TYPES.NONE);

			assert.equal(document.querySelectorAll('.form-control').length, 0);
		});

		it('should build two text controls when filterType is set to NUMBER', () => {
			window.control = new GridHeaderCell({
				container: window.testContainer,
				dataType: gridConstants.COLUMN_TYPES.NUMBER,
				filterType: gridConstants.FILTER_TYPES.NUMBER
			});

			assert.equal(document.querySelectorAll('input[type=text]').length, 2);
		});

		it('should have default widths set on the two filters when filterType is set to NUMBER', () => {
			window.control = new GridHeaderCell({
				container: window.testContainer,
				dataType: gridConstants.COLUMN_TYPES.NUMBER,
				filterType: gridConstants.FILTER_TYPES.NUMBER,
				width: '100px'
			});

			assert.equal(getComputedStyle(document.querySelectorAll('.text-input')[0]).width, '48px');
			assert.equal(getComputedStyle(document.querySelectorAll('.text-input')[1]).width, '48px');
		});

		it('should have equal widths set on the two NUMBER filters after resize is called when filterType is set to NUMBER', () => {
			window.control = new GridHeaderCell({
				container: window.testContainer,
				dataType: gridConstants.COLUMN_TYPES.NUMBER,
				filterType: gridConstants.FILTER_TYPES.NUMBER,
				width: '200px'
			});

			window.control.resize(true);

			assert.equal(getComputedStyle(document.querySelectorAll('.text-input')[0]).width, '98px');
			assert.equal(getComputedStyle(document.querySelectorAll('.text-input')[1]).width, '98px');
		});
	});

	describe('Filter', () => {
		testUtil.testMethod({
			methodName: 'filter',
			defaultSettings: {
				container: window.testContainer
			},
			defaultValue: '',
			testValue: 'test',
			secondTestValue: 'blah'
		});

		it('should call the onFilter callback once when the filter method is set', () => {
			let testVar = 0;

			window.control = new GridHeaderCell({
				container: window.testContainer,
				onFilter() {
					testVar++;
				}
			});

			window.control.filter('asdf');

			assert.equal(testVar, 1);
		});

		it('should call the onFilter callback once when the filter method is set and filterType is AUTO_COMPLETE', () => {
			let testVar = '';

			window.control = new GridHeaderCell({
				container: window.testContainer,
				filterType: gridConstants.FILTER_TYPES.AUTO_COMPLETE,
				onFilter(filterValue) {
					testVar = filterValue;
				}
			});

			window.control.filter('asdf');

			assert.equal(testVar, 'asdf');
		});

		it('should return a filter when an AUTO_COMPLETE filter control is set', () => {
			window.control = new GridHeaderCell({
				container: window.testContainer,
				filterType: gridConstants.FILTER_TYPES.AUTO_COMPLETE,
				onFilter() {
				}
			});

			testUtil.simulateClick(document.querySelector('.tags-list-container'));
			addTag('test1');

			assert.equal(window.control.filter(), 'test1');
		});

		it('should call the onFilter callback when an AUTO_COMPLETE filter control is set', () => {
			let testVar = '';

			window.control = new GridHeaderCell({
				container: window.testContainer,
				filterType: gridConstants.FILTER_TYPES.AUTO_COMPLETE,
				onFilter() {
					testVar = 'test';
				}
			});

			testUtil.simulateClick(document.querySelector('.tags-list-container'));
			addTag('test1');

			assert.equal(testVar, 'test');
		});

		it('should call the onFilter callback once when the filter method is set and filterType is DROPDOWN', () => {
			let testVar = '';

			window.control = new GridHeaderCell({
				container: window.testContainer,
				filterType: gridConstants.FILTER_TYPES.DROPDOWN,
				onFilter(filterValue) {
					testVar = filterValue;
				}
			});

			window.control.filter('asdf');

			assert.equal(testVar, 'asdf');
		});

		it('should return a filter value when a DROPDOWN filter control is set', () => {
			window.control = new GridHeaderCell({
				container: window.testContainer,
				onGetFilterOptions(type, id, callback) {
					callback(['test']);
				}
			})
				.filterType(gridConstants.FILTER_TYPES.DROPDOWN);

			testUtil.simulateClick(document.querySelector('.popup-button'));
			testUtil.simulateClick(document.querySelector('.menu .heading'));

			assert.equal(window.control.filter(), 'test');
		});

		it('should call the onFilter callback when a DROPDOWN filter control is set', () => {
			let testVar = '';

			window.control = new GridHeaderCell({
				container: window.testContainer,
				onFilter() {
					testVar = 'test';
				},
				onGetFilterOptions(type, id, callback) {
					callback(['test']);
				}
			})
				.filterType(gridConstants.FILTER_TYPES.DROPDOWN);

			testUtil.simulateClick(document.querySelector('.popup-button'));
			testUtil.simulateClick(document.querySelector('.menu .heading'));

			assert.equal(testVar, 'test');
		});

		it('should call the onFilter callback once when the filter method is set and filterType is NUMBER', () => {
			let testVar = 0;

			window.control = new GridHeaderCell({
				container: window.testContainer,
				filterType: gridConstants.FILTER_TYPES.NUMBER,
				onFilter() {
					testVar++;
				}
			});

			window.control.filter('asdf');

			assert.equal(testVar, 1);
		});

		it('should return a filter value when a NUMBER filter control is set', () => {
			let inputs;

			window.control = new GridHeaderCell({
				container: window.testContainer
			})
				.filterType(gridConstants.FILTER_TYPES.NUMBER);

			inputs = query.all('input');

			inputs[0].value = '5';
			testUtil.trigger(inputs[0], 'change');

			inputs[1].value = '10';
			testUtil.trigger(inputs[1], 'change');

			return testUtil.delay(210)
				.then(() => {
					assert.equal(window.control.filter(), '5,10');
				});
		});

		it('should call the onFilter callback when a NUMBER filter control is set', () => {
			let testVar = '';
			let inputs;

			window.control = new GridHeaderCell({
				container: window.testContainer,
				onFilter(filterValue) {
					testVar = filterValue;
				}
			})
				.filterType(gridConstants.FILTER_TYPES.NUMBER);

			inputs = query.all('input');

			inputs[0].value = '5';
			testUtil.trigger(inputs[0], 'change');

			inputs[1].value = '10';
			testUtil.trigger(inputs[1], 'change');

			return testUtil.delay(210)
				.then(() => {
					assert.equal(testVar, '5,10');
				});
		});

		it('should have a filter value of empty string when a NUMBER filter control is set and then set to nothing', () => {
			let testVar = '';
			let inputs;

			window.control = new GridHeaderCell({
				container: window.testContainer,
				onFilter(filterValue) {
					testVar = filterValue;
				}
			})
				.filterType(gridConstants.FILTER_TYPES.NUMBER);

			inputs = query.all('input');

			inputs[0].value = '5';
			testUtil.trigger(inputs[0], 'change');

			return testUtil.defer()
				.then(() => {
					inputs[0].value = '';
					testUtil.trigger(inputs[0], 'change');

					assert.equal(testVar, '');
				});
		});
	});

	describe('SelectableColumns', () => {
		testUtil.testMethod({
			methodName: 'selectableColumns',
			defaultValue: [],
			testValue: [{
				ID: 'test',
				title: 'test title'
			}]
		});

		it('should NOT have a contextmenu if selectableColumns is not set and canSort is false', () => {
			window.control = new GridHeaderCell({
				container: window.testContainer,
				label: 'column label',
				canSort: false,
				selectableColumns: []
			});

			testUtil.trigger(window.control.element(), CONTEXT_MENU_EVENT);

			return testUtil.defer()
				.then(() => {
					assert.equal(document.querySelectorAll('.context-menu').length, 0);
				});
		});

		it('should have three options in the contextmenu if selectableColumns is not set and canSort is true', () => {
			window.control = new GridHeaderCell({
				container: window.testContainer,
				label: 'column label',
				canSort: true,
				selectableColumns: []
			});

			testUtil.trigger(window.control.element(), CONTEXT_MENU_EVENT);

			return testUtil.defer()
				.then(() => {
					assert.equal(document.querySelectorAll('.menu .heading').length, 3);
				});
		});

		it('should have five options in the contextmenu if selectableColumns is set to two columns', () => {
			window.control = new GridHeaderCell({
				container: window.testContainer,
				label: 'column label',
				canSort: true,
				selectableColumns: [{
					ID: 'test',
					title: 'test'
				}, {
					ID: 'test2',
					title: 'test 2'
				}]
			});

			testUtil.trigger(window.control.element(), CONTEXT_MENU_EVENT);

			return testUtil.defer()
				.then(() => {
					assert.equal(document.querySelectorAll('.menu .heading').length, 5);
				});
		});

		it('should have five options in the contextmenu if selectableColumns is set to three columns but one doesn\'t have a title', () => {
			window.control = new GridHeaderCell({
				container: window.testContainer,
				label: 'column label',
				canSort: true,
				selectableColumns: [{
					ID: 'test',
					title: 'test'
				}, {
					ID: 'test2'
				}, {
					ID: 'test3',
					title: 'test 3'
				}]
			});

			testUtil.trigger(window.control.element(), CONTEXT_MENU_EVENT);

			return testUtil.defer()
				.then(() => {
					assert.equal(document.querySelectorAll('.menu .heading').length, 5);
				});
		});

		it('should have a checked checkbox in the contextmenu if one of the selectableColumns has isHidden set to false', () => {
			window.control = new GridHeaderCell({
				container: window.testContainer,
				label: 'column label',
				canSort: true,
				selectableColumns: [{
					ID: 'test',
					title: 'test',
					isHidden: true
				}, {
					ID: 'test2',
					title: 'test 2',
					isHidden: false
				}, {
					ID: 'test3',
					title: 'test 3',
					isHidden: true
				}]
			});

			testUtil.trigger(window.control.element(), CONTEXT_MENU_EVENT);

			return testUtil.defer()
				.then(() => {
					assert.equal(document.querySelectorAll('.menu .heading.selected').length, 1);
				});
		});

		it('should call settings.onColumnChange when the fourth option in the context menu is clicked', () => {
			let testVar = '';

			window.control = new GridHeaderCell({
				container: window.testContainer,
				label: 'column label',
				canSort: true,
				onColumnChange(itemID) {
					testVar = itemID;
				},
				selectableColumns: [{
					ID: 'test',
					title: 'test',
					isHidden: true
				}, {
					ID: 'test2',
					title: 'test 2',
					isHidden: false
				}, {
					ID: 'test3',
					title: 'test 3',
					isHidden: true
				}]
			});

			testUtil.trigger(window.control.element(), CONTEXT_MENU_EVENT);

			return testUtil.defer()
				.then(() => {
					testUtil.simulateClick(document.querySelectorAll('.menu .heading')[3]);

					assert.equal(testVar, 'test');
				});
		});

		it('should set sortDirection to gridConstants.SORT_TYPES.ASC when the first option in the context menu is clicked', () => {
			window.control = new GridHeaderCell({
				container: window.testContainer,
				label: 'column label',
				canSort: true
			});

			testUtil.trigger(window.control.element(), CONTEXT_MENU_EVENT);

			return testUtil.defer()
				.then(() => {
					testUtil.simulateClick(document.querySelectorAll('.menu .heading')[0]);

					assert.equal(window.control.sortDirection(), gridConstants.SORT_TYPES.ASC);
				});
		});

		it('should set sortDirection to gridConstants.SORT_TYPES.DESC when the second option in the context menu is clicked', () => {
			window.control = new GridHeaderCell({
				container: window.testContainer,
				label: 'column label',
				canSort: true
			});

			testUtil.trigger(window.control.element(), CONTEXT_MENU_EVENT);

			return testUtil.defer()
				.then(() => {
					testUtil.simulateClick(document.querySelectorAll('.menu .heading')[1]);

					assert.equal(window.control.sortDirection(), gridConstants.SORT_TYPES.DESC);
				});
		});

		it('should set sortDirection to gridConstants.SORT_TYPES.NONE when the third option in the context menu is clicked', () => {
			window.control = new GridHeaderCell({
				container: window.testContainer,
				label: 'column label',
				canSort: true
			});

			testUtil.trigger(window.control.element(), CONTEXT_MENU_EVENT);

			return testUtil.defer()
				.then(() => {
					testUtil.simulateClick(document.querySelectorAll('.menu .heading')[2]);

					assert.equal(window.control.sortDirection(), gridConstants.SORT_TYPES.NONE);
				});
		});
	});

	describe('IsAllRowsSelected', () => {
		testUtil.testMethod({
			methodName: 'isAllRowsSelected',
			defaultValue: false,
			testValue: true
		});

		it('should have a checked checkbox if dataType is set to checkbox and isAllRowsSelected is true', () => {
			window.control = new GridHeaderCell({
				container: window.testContainer,
				dataType: gridConstants.COLUMN_TYPES.CHECKBOX,
				isAllRowsSelected: true
			});

			assert.equal(document.querySelector('input[type=checkbox]').checked, true);
		});

		it('should have an unchecked checkbox if dataType is set to checkbox and isAllRowsSelected is true then false', () => {
			window.control = new GridHeaderCell({
				container: window.testContainer,
				dataType: gridConstants.COLUMN_TYPES.CHECKBOX,
				isAllRowsSelected: true
			});

			window.control.isAllRowsSelected(false);

			assert.equal(document.querySelector('input[type=checkbox]').checked, false);
		});

		it('should have a checked checkbox if dataType is set to checkbox and isAllRowsSelected is true then false then true', () => {
			window.control = new GridHeaderCell({
				container: window.testContainer,
				dataType: gridConstants.COLUMN_TYPES.CHECKBOX
			});

			window.control.isAllRowsSelected(true);
			window.control.isAllRowsSelected(false);
			window.control.isAllRowsSelected(true);

			assert.equal(document.querySelector('input[type=checkbox]').checked, true);
		});

		it('should not throw an error if isAllRowsSelected is set when the datatype is something other than checkbox', () => {
			window.control = new GridHeaderCell({
				container: window.testContainer,
				dataType: gridConstants.COLUMN_TYPES.NUMBER,
				isAllRowsSelected: true
			});

			assert.equal(document.querySelectorAll('input[type=checkbox]').length, 0);
		});
	});

	describe('IsSomeRowsSelected', () => {
		testUtil.testMethod({
			methodName: 'isSomeRowsSelected',
			defaultValue: false,
			testValue: true
		});

		it('should have a checkbox with indeterminate set to true if dataType is set to checkbox and isSomeRowsSelected is true', () => {
			window.control = new GridHeaderCell({
				container: window.testContainer,
				dataType: gridConstants.COLUMN_TYPES.CHECKBOX,
				isSomeRowsSelected: true
			});

			assert.equal(document.querySelector('input[type=checkbox]').indeterminate, true);
		});

		it('should not throw an error if isSomeRowsSelected is set when the datatype is something other than checkbox', () => {
			window.control = new GridHeaderCell({
				container: window.testContainer,
				dataType: gridConstants.COLUMN_TYPES.NUMBER,
				isSomeRowsSelected: true
			});

			assert.equal(document.querySelectorAll('input[type=checkbox]').length, 0);
		});
	});
});
