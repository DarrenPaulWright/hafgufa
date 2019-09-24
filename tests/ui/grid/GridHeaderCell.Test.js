import { wait } from 'async-agent';
import { assert } from 'chai';
import { CONTEXT_MENU_EVENT } from '../../../src';
import * as gridConstants from '../../../src/ui/grid/gridConstants';
import GridHeaderCell from '../../../src/ui/grid/GridHeaderCell';
import TestUtil from '../../TestUtil';
import ControlTests from '../ControlTests';

describe('GridHeaderCell', () => {
	const testUtil = new TestUtil(GridHeaderCell);
	const controlBaseTests = new ControlTests(GridHeaderCell, testUtil, {
		mainCssClass: 'grid-header-cell'
	});

	const addTag = (text) => {
		testUtil.first('input').value = text;
		testUtil.hitEnter();
	};

	controlBaseTests.run();

	describe('Label', () => {
		testUtil.testMethod({
			methodName: 'label',
			defaultValue: '',
			testValue: 'test',
			secondTestValue: 'another'
		});

		it('should have a heading element', () => {
			testUtil.control = new GridHeaderCell({
				container: testUtil.container
			});

			assert.equal(testUtil.count('.heading'), 1);
		});

		it('should have a label element with label text in it', () => {
			testUtil.control = new GridHeaderCell({
				container: testUtil.container,
				label: 'title'
			});

			assert.equal(testUtil.first('.heading span').textContent, 'title');
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
			testUtil.control = new GridHeaderCell({
				container: testUtil.container,
				dataType: gridConstants.COLUMN_TYPES.CHECKBOX
			});

			assert.equal(testUtil.count('input[type=checkbox]'), 1);
		});

		it('should remove the checkbox if dataType is set back to none', () => {
			testUtil.control = new GridHeaderCell({
				container: testUtil.container,
				dataType: gridConstants.COLUMN_TYPES.CHECKBOX
			});

			testUtil.control.dataType(gridConstants.COLUMN_TYPES.NONE);

			assert.equal(testUtil.count('input[type=checkbox]'), 0);
		});

		it('should call the onSelect callback with true when a checkbox is clicked', () => {
			let testVar;

			testUtil.control = new GridHeaderCell({
				container: testUtil.container,
				dataType: gridConstants.COLUMN_TYPES.CHECKBOX,
				onSelect(newValue) {
					testVar = newValue;
				}
			});

			testUtil.simulateClick(testUtil.first('.checkbox'));

			assert.isTrue(testVar === true);
		});

		it('should call the onSelect callback with false when a checkbox is clicked a second time', () => {
			let testVar;

			testUtil.control = new GridHeaderCell({
				container: testUtil.container,
				dataType: gridConstants.COLUMN_TYPES.CHECKBOX,
				onSelect(newValue) {
					testVar = newValue;
				}
			});

			testUtil.simulateClick(testUtil.first('.checkbox'));
			testUtil.simulateClick(testUtil.first('.checkbox'));

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
			testUtil.control = new GridHeaderCell({
				container: testUtil.container,
				canSort: true
			});

			assert.equal(testUtil.count('.heading.sortable'), 1);
		});

		it('should NOT have class "sortable" if canSort is set back to false', () => {
			testUtil.control = new GridHeaderCell({
				container: testUtil.container,
				canSort: true
			});

			testUtil.control.canSort(false);

			assert.equal(testUtil.count('label.sortable'), 0);
		});

		it('should set sortDirection to ASC when the label is clicked once', () => {
			testUtil.control = new GridHeaderCell({
				container: testUtil.container,
				canSort: true
			});

			testUtil.simulateClick(testUtil.first('.heading'));

			assert.equal(testUtil.control.sortDirection(), gridConstants.SORT_TYPES.ASC);
		});

		it('should set sortDirection to DESC when the label is clicked twice', () => {
			testUtil.control = new GridHeaderCell({
				container: testUtil.container,
				canSort: true
			});

			testUtil.simulateClick(testUtil.first('.heading'));
			testUtil.simulateClick(testUtil.first('.heading'));

			assert.equal(testUtil.control.sortDirection(), gridConstants.SORT_TYPES.DESC);
		});

		it('should set sortDirection back to NONE when the label is clicked thrice', () => {
			testUtil.control = new GridHeaderCell({
				container: testUtil.container,
				canSort: true
			});

			testUtil.simulateClick(testUtil.first('label'));
			testUtil.simulateClick(testUtil.first('label'));
			testUtil.simulateClick(testUtil.first('label'));

			assert.equal(testUtil.control.sortDirection(), gridConstants.SORT_TYPES.NONE);
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
			testUtil.control = new GridHeaderCell({
				container: testUtil.container,
				canSort: false,
				sortDirection: gridConstants.SORT_TYPES.ASC
			});

			assert.equal(testUtil.count('label.sort-asc'), 0);
		});

		it('should have class "sort-asc" if sortDirection is set to asc', () => {
			testUtil.control = new GridHeaderCell({
				container: testUtil.container,
				canSort: true,
				sortDirection: gridConstants.SORT_TYPES.ASC
			});

			assert.equal(testUtil.count('.heading.sort-asc'), 1);
		});

		it('should have class "sort-desc" if sortDirection is set to desc', () => {
			testUtil.control = new GridHeaderCell({
				container: testUtil.container,
				canSort: true,
				sortDirection: gridConstants.SORT_TYPES.DESC
			});

			assert.equal(testUtil.count('.heading.sort-desc'), 1);
		});

		it('should call the onSort callback when sortDirection is set and the label is clicked', () => {
			let testVar = '';

			testUtil.control = new GridHeaderCell({
				container: testUtil.container,
				canSort: true,
				onSort() {
					testVar = 'test';
				}
			});

			testUtil.control.sortDirection(gridConstants.SORT_TYPES.ASC);
			testUtil.simulateClick(testUtil.first('.heading'));

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
			testUtil.control = new GridHeaderCell({
				container: testUtil.container,
				filterType: gridConstants.FILTER_TYPES.AUTO_COMPLETE
			});

			assert.equal(testUtil.count('.tags'), 1);
		});

		it('should call the onGetFilterOptions callback when filterType is set to AUTO_COMPLETE', () => {
			let testVar = '';

			testUtil.control = new GridHeaderCell({
				container: testUtil.container,
				onGetFilterOptions(type, id, callback) {
					testVar = 'test';
					callback(['test']);
				}
			})
				.filterType(gridConstants.FILTER_TYPES.AUTO_COMPLETE);

			testUtil.simulateClick(testUtil.first('.tags-list-container'));

			assert.equal(testVar, 'test');
		});

		it('should build a picker control when filterType is set to DROPDOWN', () => {
			testUtil.control = new GridHeaderCell({
				container: testUtil.container,
				filterType: gridConstants.FILTER_TYPES.DROPDOWN
			});

			assert.equal(testUtil.count('.grouped-buttons'), 1);
		});

		it('should call the onGetFilterOptions callback when filterType is set to DROPDOWN', () => {
			let testVar = '';

			testUtil.control = new GridHeaderCell({
				container: testUtil.container,
				onGetFilterOptions(type, id, callback) {
					testVar = 'test';
					callback([]);
				}
			})
				.filterType(gridConstants.FILTER_TYPES.DROPDOWN);

			assert.equal(testVar, 'test');
		});

		it('should build a picker control when filterType is set to DATE', () => {
			testUtil.control = new GridHeaderCell({
				container: testUtil.container,
				filterType: gridConstants.FILTER_TYPES.DATE
			});

			assert.equal(testUtil.count('.grouped-buttons'), 1);
		});

		it('should set the width of a picker control when filterType is set to DATE and resize is called', () => {
			testUtil.control = new GridHeaderCell({
				container: testUtil.container,
				filterType: gridConstants.FILTER_TYPES.DATE,
				width: '100px'
			});

			testUtil.control.resize();

			assert.equal(getComputedStyle(testUtil.first('.grouped-buttons')).width, '100px');
		});

		it('should remove all filter controls when filterType is set back to NONE', () => {
			testUtil.control = new GridHeaderCell({
				container: testUtil.container,
				filterType: gridConstants.FILTER_TYPES.DATE
			});

			testUtil.control.filterType(gridConstants.FILTER_TYPES.NONE);

			assert.equal(testUtil.count('.form-control'), 0);
		});

		it('should build two text controls when filterType is set to NUMBER', () => {
			testUtil.control = new GridHeaderCell({
				container: testUtil.container,
				dataType: gridConstants.COLUMN_TYPES.NUMBER,
				filterType: gridConstants.FILTER_TYPES.NUMBER
			});

			assert.equal(testUtil.count('input[type=text]'), 2);
		});

		it('should have default widths set on the two filters when filterType is set to NUMBER', () => {
			testUtil.control = new GridHeaderCell({
				container: testUtil.container,
				dataType: gridConstants.COLUMN_TYPES.NUMBER,
				filterType: gridConstants.FILTER_TYPES.NUMBER,
				width: '100px'
			});

			assert.equal(getComputedStyle(testUtil.nth('.text-input', 0)).width, '48px');
			assert.equal(getComputedStyle(testUtil.nth('.text-input', 1)).width, '48px');
		});

		it('should have equal widths set on the two NUMBER filters after resize is called when filterType is set to NUMBER', () => {
			testUtil.control = new GridHeaderCell({
				container: testUtil.container,
				dataType: gridConstants.COLUMN_TYPES.NUMBER,
				filterType: gridConstants.FILTER_TYPES.NUMBER,
				width: '200px'
			});

			testUtil.control.resize(true);

			assert.equal(getComputedStyle(testUtil.nth('.text-input', 0)).width, '98px');
			assert.equal(getComputedStyle(testUtil.nth('.text-input', 1)).width, '98px');
		});
	});

	describe('Filter', () => {
		testUtil.testMethod({
			methodName: 'filter',
			defaultSettings: {
				container: testUtil.container
			},
			defaultValue: '',
			testValue: 'test',
			secondTestValue: 'blah'
		});

		it('should call the onFilter callback once when the filter method is set', () => {
			let testVar = 0;

			testUtil.control = new GridHeaderCell({
				container: testUtil.container,
				onFilter() {
					testVar++;
				}
			});

			testUtil.control.filter('asdf');

			assert.equal(testVar, 1);
		});

		it('should call the onFilter callback once when the filter method is set and filterType is AUTO_COMPLETE', () => {
			let testVar = '';

			testUtil.control = new GridHeaderCell({
				container: testUtil.container,
				filterType: gridConstants.FILTER_TYPES.AUTO_COMPLETE,
				onFilter(filterValue) {
					testVar = filterValue;
				}
			});

			testUtil.control.filter('asdf');

			assert.equal(testVar, 'asdf');
		});

		it('should return a filter when an AUTO_COMPLETE filter control is set', () => {
			testUtil.control = new GridHeaderCell({
				container: testUtil.container,
				filterType: gridConstants.FILTER_TYPES.AUTO_COMPLETE,
				onFilter() {
				}
			});

			testUtil.simulateClick(testUtil.first('.tags-list-container'));
			addTag('test1');

			assert.equal(testUtil.control.filter(), 'test1');
		});

		it('should call the onFilter callback when an AUTO_COMPLETE filter control is set', () => {
			let testVar = '';

			testUtil.control = new GridHeaderCell({
				container: testUtil.container,
				filterType: gridConstants.FILTER_TYPES.AUTO_COMPLETE,
				onFilter() {
					testVar = 'test';
				}
			});

			testUtil.simulateClick(testUtil.first('.tags-list-container'));
			addTag('test1');

			assert.equal(testVar, 'test');
		});

		it('should call the onFilter callback once when the filter method is set and filterType is DROPDOWN', () => {
			let testVar = '';

			testUtil.control = new GridHeaderCell({
				container: testUtil.container,
				filterType: gridConstants.FILTER_TYPES.DROPDOWN,
				onFilter(filterValue) {
					testVar = filterValue;
				}
			});

			testUtil.control.filter('asdf');

			assert.equal(testVar, 'asdf');
		});

		it('should return a filter value when a DROPDOWN filter control is set', () => {
			testUtil.control = new GridHeaderCell({
				container: testUtil.container,
				onGetFilterOptions(type, id, callback) {
					callback(['test']);
				}
			})
				.filterType(gridConstants.FILTER_TYPES.DROPDOWN);

			testUtil.simulateClick(testUtil.first('.popup-button'));
			testUtil.simulateClick(testUtil.first('.menu .heading', true));

			assert.equal(testUtil.control.filter(), 'test');
		});

		it('should call the onFilter callback when a DROPDOWN filter control is set', () => {
			let testVar = '';

			testUtil.control = new GridHeaderCell({
				container: testUtil.container,
				onFilter() {
					testVar = 'test';
				},
				onGetFilterOptions(type, id, callback) {
					callback(['test']);
				}
			})
				.filterType(gridConstants.FILTER_TYPES.DROPDOWN);

			testUtil.simulateClick(testUtil.first('.popup-button'));
			testUtil.simulateClick(testUtil.first('.menu .heading', true));

			assert.equal(testVar, 'test');
		});

		it('should call the onFilter callback once when the filter method is set and filterType is NUMBER', () => {
			let testVar = 0;

			testUtil.control = new GridHeaderCell({
				container: testUtil.container,
				filterType: gridConstants.FILTER_TYPES.NUMBER,
				onFilter() {
					testVar++;
				}
			});

			testUtil.control.filter('asdf');

			assert.equal(testVar, 1);
		});

		it('should return a filter value when a NUMBER filter control is set', () => {
			let inputs;

			testUtil.control = new GridHeaderCell({
				container: testUtil.container
			})
				.filterType(gridConstants.FILTER_TYPES.NUMBER);

			inputs = testUtil.all('input');

			inputs[0].value = '5';
			testUtil.trigger(inputs[0], 'change');

			inputs[1].value = '10';
			testUtil.trigger(inputs[1], 'change');

			return wait(210)
				.then(() => {
					assert.equal(testUtil.control.filter(), '5,10');
				});
		});

		it('should call the onFilter callback when a NUMBER filter control is set', () => {
			let testVar = '';
			let inputs;

			testUtil.control = new GridHeaderCell({
				container: testUtil.container,
				onFilter(filterValue) {
					testVar = filterValue;
				}
			})
				.filterType(gridConstants.FILTER_TYPES.NUMBER);

			inputs = testUtil.all('input');

			inputs[0].value = '5';
			testUtil.trigger(inputs[0], 'change');

			inputs[1].value = '10';
			testUtil.trigger(inputs[1], 'change');

			return wait(210)
				.then(() => {
					assert.equal(testVar, '5,10');
				});
		});

		it('should have a filter value of empty string when a NUMBER filter control is set and then set to nothing', () => {
			let testVar = '';
			let inputs;

			testUtil.control = new GridHeaderCell({
				container: testUtil.container,
				onFilter(filterValue) {
					testVar = filterValue;
				}
			})
				.filterType(gridConstants.FILTER_TYPES.NUMBER);

			inputs = testUtil.all('input');

			inputs[0].value = '5';
			testUtil.trigger(inputs[0], 'change');

			return wait()
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
				id: 'test',
				title: 'test title'
			}]
		});

		it('should NOT have a contextmenu if selectableColumns is not set and canSort is false', () => {
			testUtil.control = new GridHeaderCell({
				container: testUtil.container,
				label: 'column label',
				canSort: false,
				selectableColumns: []
			});

			testUtil.trigger(testUtil.control.element(), CONTEXT_MENU_EVENT);

			return wait()
				.then(() => {
					assert.equal(testUtil.count('.context-menu'), 0);
				});
		});

		it('should have three options in the contextmenu if selectableColumns is not set and canSort is true', () => {
			testUtil.control = new GridHeaderCell({
				container: testUtil.container,
				label: 'column label',
				canSort: true,
				selectableColumns: []
			});

			testUtil.trigger(testUtil.control.element(), CONTEXT_MENU_EVENT);

			return wait()
				.then(() => {
					assert.equal(testUtil.count('.menu .heading', true), 3);
				});
		});

		it('should have five options in the contextmenu if selectableColumns is set to two columns', () => {
			testUtil.control = new GridHeaderCell({
				container: testUtil.container,
				label: 'column label',
				canSort: true,
				selectableColumns: [{
					id: 'test',
					title: 'test'
				}, {
					id: 'test2',
					title: 'test 2'
				}]
			});

			testUtil.trigger(testUtil.control.element(), CONTEXT_MENU_EVENT);

			return wait()
				.then(() => {
					assert.equal(testUtil.count('.menu .heading', true), 5);
				});
		});

		it('should have five options in the contextmenu if selectableColumns is set to three columns but one doesn\'t have a title', () => {
			testUtil.control = new GridHeaderCell({
				container: testUtil.container,
				label: 'column label',
				canSort: true,
				selectableColumns: [{
					id: 'test',
					title: 'test'
				}, {
					id: 'test2'
				}, {
					id: 'test3',
					title: 'test 3'
				}]
			});

			testUtil.trigger(testUtil.control.element(), CONTEXT_MENU_EVENT);

			return wait()
				.then(() => {
					assert.equal(testUtil.count('.menu .heading', true), 5);
				});
		});

		it('should have a checked checkbox in the contextmenu if one of the selectableColumns has isHidden set to false', () => {
			testUtil.control = new GridHeaderCell({
				container: testUtil.container,
				label: 'column label',
				canSort: true,
				selectableColumns: [{
					id: 'test',
					title: 'test',
					isHidden: true
				}, {
					id: 'test2',
					title: 'test 2',
					isHidden: false
				}, {
					id: 'test3',
					title: 'test 3',
					isHidden: true
				}]
			});

			testUtil.trigger(testUtil.control.element(), CONTEXT_MENU_EVENT);

			return wait()
				.then(() => {
					assert.equal(testUtil.count('.menu .heading.selected', true), 1);
				});
		});

		it('should call settings.onColumnChange when the fourth option in the context menu is clicked', () => {
			let testVar = '';

			testUtil.control = new GridHeaderCell({
				container: testUtil.container,
				label: 'column label',
				canSort: true,
				onColumnChange(itemId) {
					testVar = itemId;
				},
				selectableColumns: [{
					id: 'test',
					title: 'test',
					isHidden: true
				}, {
					id: 'test2',
					title: 'test 2',
					isHidden: false
				}, {
					id: 'test3',
					title: 'test 3',
					isHidden: true
				}]
			});

			testUtil.trigger(testUtil.control.element(), CONTEXT_MENU_EVENT);

			return wait()
				.then(() => {
					testUtil.simulateClick(testUtil.nth('.menu .heading', 3, true));

					assert.equal(testVar, 'test');
				});
		});

		it('should set sortDirection to gridConstants.SORT_TYPES.ASC when the first option in the context menu is clicked', () => {
			testUtil.control = new GridHeaderCell({
				container: testUtil.container,
				label: 'column label',
				canSort: true
			});

			testUtil.trigger(testUtil.control.element(), CONTEXT_MENU_EVENT);

			return wait()
				.then(() => {
					testUtil.simulateClick(testUtil.nth('.menu .heading', 0, true));

					assert.equal(testUtil.control.sortDirection(), gridConstants.SORT_TYPES.ASC);
				});
		});

		it('should set sortDirection to gridConstants.SORT_TYPES.DESC when the second option in the context menu is clicked', () => {
			testUtil.control = new GridHeaderCell({
				container: testUtil.container,
				label: 'column label',
				canSort: true
			});

			testUtil.trigger(testUtil.control.element(), CONTEXT_MENU_EVENT);

			return wait()
				.then(() => {
					testUtil.simulateClick(testUtil.nth('.menu .heading', 1, true));

					assert.equal(testUtil.control.sortDirection(), gridConstants.SORT_TYPES.DESC);
				});
		});

		it('should set sortDirection to gridConstants.SORT_TYPES.NONE when the third option in the context menu is clicked', () => {
			testUtil.control = new GridHeaderCell({
				container: testUtil.container,
				label: 'column label',
				canSort: true
			});

			testUtil.trigger(testUtil.control.element(), CONTEXT_MENU_EVENT);

			return wait()
				.then(() => {
					testUtil.simulateClick(testUtil.nth('.menu .heading', 2, true));

					assert.equal(testUtil.control.sortDirection(), gridConstants.SORT_TYPES.NONE);
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
			testUtil.control = new GridHeaderCell({
				container: testUtil.container,
				dataType: gridConstants.COLUMN_TYPES.CHECKBOX,
				isAllRowsSelected: true
			});

			assert.equal(testUtil.first('input[type=checkbox]').checked, true);
		});

		it('should have an unchecked checkbox if dataType is set to checkbox and isAllRowsSelected is true then false', () => {
			testUtil.control = new GridHeaderCell({
				container: testUtil.container,
				dataType: gridConstants.COLUMN_TYPES.CHECKBOX,
				isAllRowsSelected: true
			});

			testUtil.control.isAllRowsSelected(false);

			assert.equal(testUtil.first('input[type=checkbox]').checked, false);
		});

		it('should have a checked checkbox if dataType is set to checkbox and isAllRowsSelected is true then false then true', () => {
			testUtil.control = new GridHeaderCell({
				container: testUtil.container,
				dataType: gridConstants.COLUMN_TYPES.CHECKBOX
			});

			testUtil.control.isAllRowsSelected(true);
			testUtil.control.isAllRowsSelected(false);
			testUtil.control.isAllRowsSelected(true);

			assert.equal(testUtil.first('input[type=checkbox]').checked, true);
		});

		it('should not throw an error if isAllRowsSelected is set when the datatype is something other than checkbox', () => {
			testUtil.control = new GridHeaderCell({
				container: testUtil.container,
				dataType: gridConstants.COLUMN_TYPES.NUMBER,
				isAllRowsSelected: true
			});

			assert.equal(testUtil.count('input[type=checkbox]'), 0);
		});
	});

	describe('IsSomeRowsSelected', () => {
		testUtil.testMethod({
			methodName: 'isSomeRowsSelected',
			defaultValue: false,
			testValue: true
		});

		it('should have a checkbox with indeterminate set to true if dataType is set to checkbox and isSomeRowsSelected is true', () => {
			testUtil.control = new GridHeaderCell({
				container: testUtil.container,
				dataType: gridConstants.COLUMN_TYPES.CHECKBOX,
				isSomeRowsSelected: true
			});

			assert.equal(testUtil.first('input[type=checkbox]').indeterminate, true);
		});

		it('should not throw an error if isSomeRowsSelected is set when the datatype is something other than checkbox', () => {
			testUtil.control = new GridHeaderCell({
				container: testUtil.container,
				dataType: gridConstants.COLUMN_TYPES.NUMBER,
				isSomeRowsSelected: true
			});

			assert.equal(testUtil.count('input[type=checkbox]'), 0);
		});
	});
});
