import { wait } from 'async-agent';
import { assert } from 'type-enforcer';
import { CONTEXT_MENU_EVENT } from '../../index.js';
import { COLUMN_TYPES, FILTER_TYPES, SORT_TYPES } from '../../src/grid/gridConstants.js';
import GridHeaderCell from '../../src/grid/GridHeaderCell.js';
import ControlTests from '../ControlTests.js';
import TestUtil from '../TestUtil.js';

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

			assert.is(testUtil.count('.heading'), 1);
		});

		it('should have a label element with label text in it', () => {
			testUtil.control = new GridHeaderCell({
				container: testUtil.container,
				label: 'title'
			});

			assert.is(testUtil.first('.heading span').textContent, 'title');
		});
	});

	describe('DataType', () => {
		testUtil.testMethod({
			methodName: 'dataType',
			defaultValue: COLUMN_TYPES.NONE,
			testValue: COLUMN_TYPES.DATE,
			secondTestValue: COLUMN_TYPES.TEXT
		});

		it('should build a checkbox if dataType is set to checkbox', () => {
			testUtil.control = new GridHeaderCell({
				container: testUtil.container,
				dataType: COLUMN_TYPES.CHECKBOX
			});

			assert.is(testUtil.count('input[type=checkbox]'), 1);
		});

		it('should remove the checkbox if dataType is set back to none', () => {
			testUtil.control = new GridHeaderCell({
				container: testUtil.container,
				dataType: COLUMN_TYPES.CHECKBOX
			});

			testUtil.control.dataType(COLUMN_TYPES.NONE);

			assert.is(testUtil.count('input[type=checkbox]'), 0);
		});

		it('should call the onSelect callback with true when a checkbox is clicked', () => {
			let testValue = false;

			testUtil.control = new GridHeaderCell({
				container: testUtil.container,
				dataType: COLUMN_TYPES.CHECKBOX,
				onSelect(newValue) {
					testValue = newValue;
				}
			});

			testUtil.simulateClick(testUtil.first('.checkbox'));

			assert.is(testValue === true, true);
		});

		it('should call the onSelect callback with false when a checkbox is clicked a second time', () => {
			let testValue = true;

			testUtil.control = new GridHeaderCell({
				container: testUtil.container,
				dataType: COLUMN_TYPES.CHECKBOX,
				onSelect(newValue) {
					testValue = newValue;
				}
			});

			testUtil.simulateClick(testUtil.first('.checkbox'));
			testUtil.simulateClick(testUtil.first('.checkbox'));

			assert.is(testValue === false, true);
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

			assert.is(testUtil.count('.heading.sortable'), 1);
		});

		it('should NOT have class "sortable" if canSort is set back to false', () => {
			testUtil.control = new GridHeaderCell({
				container: testUtil.container,
				canSort: true
			});

			testUtil.control.canSort(false);

			assert.is(testUtil.count('label.sortable'), 0);
		});

		it('should set sortDirection to ASC when the label is clicked once', () => {
			testUtil.control = new GridHeaderCell({
				container: testUtil.container,
				canSort: true
			});

			testUtil.simulateClick(testUtil.first('.heading'));

			assert.is(testUtil.control.sortDirection(), SORT_TYPES.ASC);
		});

		it('should set sortDirection to DESC when the label is clicked twice', () => {
			testUtil.control = new GridHeaderCell({
				container: testUtil.container,
				canSort: true
			});

			testUtil.simulateClick(testUtil.first('.heading'));
			testUtil.simulateClick(testUtil.first('.heading'));

			assert.is(testUtil.control.sortDirection(), SORT_TYPES.DESC);
		});

		it('should set sortDirection back to NONE when the label is clicked thrice', () => {
			testUtil.control = new GridHeaderCell({
				container: testUtil.container,
				canSort: true
			});

			testUtil.simulateClick(testUtil.first('.heading'));
			testUtil.simulateClick(testUtil.first('.heading'));
			testUtil.simulateClick(testUtil.first('.heading'));

			assert.is(testUtil.control.sortDirection(), SORT_TYPES.NONE);
		});
	});

	describe('SortDirection', () => {
		testUtil.testMethod({
			methodName: 'sortDirection',
			defaultValue: SORT_TYPES.NONE,
			testValue: SORT_TYPES.ASC,
			secondTestValue: SORT_TYPES.DESC
		});

		it('should NOT have class "sort-asc" if sortDirection is set to asc and canSort is false', () => {
			testUtil.control = new GridHeaderCell({
				container: testUtil.container,
				canSort: false,
				sortDirection: SORT_TYPES.ASC
			});

			assert.is(testUtil.count('label.sort-asc'), 0);
		});

		it('should have class "sort-asc" if sortDirection is set to asc', () => {
			testUtil.control = new GridHeaderCell({
				container: testUtil.container,
				canSort: true,
				sortDirection: SORT_TYPES.ASC
			});

			assert.is(testUtil.count('.heading.sort-asc'), 1);
		});

		it('should have class "sort-desc" if sortDirection is set to desc', () => {
			testUtil.control = new GridHeaderCell({
				container: testUtil.container,
				canSort: true,
				sortDirection: SORT_TYPES.DESC
			});

			assert.is(testUtil.count('.heading.sort-desc'), 1);
		});

		it('should call the onSort callback when sortDirection is set and the label is clicked', () => {
			let testValue = '';

			testUtil.control = new GridHeaderCell({
				container: testUtil.container,
				canSort: true,
				onSort() {
					testValue = 'test';
				}
			});

			testUtil.control.sortDirection(SORT_TYPES.ASC);
			testUtil.simulateClick(testUtil.first('.heading'));

			assert.is(testValue, 'test');
		});
	});

	describe('FilterType', () => {
		testUtil.testMethod({
			methodName: 'filterType',
			defaultValue: FILTER_TYPES.NONE,
			testValue: FILTER_TYPES.AUTO_COMPLETE,
			secondTestValue: FILTER_TYPES.DROPDOWN
		});

		it('should build a tag control when filterType is set to AUTO_COMPLETE', () => {
			testUtil.control = new GridHeaderCell({
				container: testUtil.container,
				filterType: FILTER_TYPES.AUTO_COMPLETE
			});

			assert.is(testUtil.count('.tags'), 1);
		});

		it('should call the onGetFilterOptions callback when filterType is set to AUTO_COMPLETE', () => {
			let testValue = '';

			testUtil.control = new GridHeaderCell({
				container: testUtil.container,
				onGetFilterOptions(type, id, callback) {
					testValue = 'test';
					callback(['test']);
				}
			})
				.filterType(FILTER_TYPES.AUTO_COMPLETE);

			testUtil.simulateClick(testUtil.first('.tags-list-container'));

			assert.is(testValue, 'test');
		});

		it('should build a picker control when filterType is set to DROPDOWN', () => {
			testUtil.control = new GridHeaderCell({
				container: testUtil.container,
				filterType: FILTER_TYPES.DROPDOWN
			});

			assert.is(testUtil.count('.grouped-buttons'), 1);
		});

		it('should call the onGetFilterOptions callback when filterType is set to DROPDOWN', () => {
			let testValue = '';

			testUtil.control = new GridHeaderCell({
				container: testUtil.container,
				onGetFilterOptions(type, id, callback) {
					testValue = 'test';
					callback([]);
				}
			})
				.filterType(FILTER_TYPES.DROPDOWN);

			assert.is(testValue, 'test');
		});

		it('should build a picker control when filterType is set to DATE', () => {
			testUtil.control = new GridHeaderCell({
				container: testUtil.container,
				filterType: FILTER_TYPES.DATE
			});

			assert.is(testUtil.count('.grouped-buttons'), 1);
		});

		it('should set the width of a picker control when filterType is set to DATE and resize is called', () => {
			testUtil.control = new GridHeaderCell({
				container: testUtil.container,
				filterType: FILTER_TYPES.DATE,
				width: '100px'
			});

			testUtil.control.resize();

			assert.is(getComputedStyle(testUtil.first('.grouped-buttons')).width, '100px');
		});

		it('should remove all filter controls when filterType is set back to NONE', () => {
			testUtil.control = new GridHeaderCell({
				container: testUtil.container,
				filterType: FILTER_TYPES.DATE
			});

			testUtil.control.filterType(FILTER_TYPES.NONE);

			assert.is(testUtil.count('.form-control'), 0);
		});

		it('should build two text controls when filterType is set to NUMBER', () => {
			testUtil.control = new GridHeaderCell({
				container: testUtil.container,
				dataType: COLUMN_TYPES.NUMBER,
				filterType: FILTER_TYPES.NUMBER
			});

			assert.is(testUtil.count('input[type=text]'), 2);
		});

		it('should have default widths set on the two filters when filterType is set to NUMBER', () => {
			testUtil.control = new GridHeaderCell({
				container: testUtil.container,
				dataType: COLUMN_TYPES.NUMBER,
				filterType: FILTER_TYPES.NUMBER,
				width: '100px'
			});

			assert.is(getComputedStyle(testUtil.nth('.text-input', 0)).width, '48px');
			assert.is(getComputedStyle(testUtil.nth('.text-input', 1)).width, '48px');
		});

		it('should have equal widths set on the two NUMBER filters after resize is called when filterType is set to NUMBER', () => {
			testUtil.control = new GridHeaderCell({
				container: testUtil.container,
				dataType: COLUMN_TYPES.NUMBER,
				filterType: FILTER_TYPES.NUMBER,
				width: '200px'
			});

			testUtil.control.resize(true);

			assert.is(getComputedStyle(testUtil.nth('.text-input', 0)).width, '98px');
			assert.is(getComputedStyle(testUtil.nth('.text-input', 1)).width, '98px');
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
			let testValue = 0;

			testUtil.control = new GridHeaderCell({
				container: testUtil.container,
				onFilter() {
					testValue++;
				}
			});

			testUtil.control.filter('asdf');

			assert.is(testValue, 1);
		});

		it(
			'should call the onFilter callback once when the filter method is set and filterType is AUTO_COMPLETE',
			() => {
				let testValue = '';

				testUtil.control = new GridHeaderCell({
					container: testUtil.container,
					filterType: FILTER_TYPES.AUTO_COMPLETE,
					onFilter(filterValue) {
						testValue = filterValue;
					}
				});

				testUtil.control.filter('asdf');

				assert.is(testValue, 'asdf');
			}
		);

		it('should return a filter when an AUTO_COMPLETE filter control is set', () => {
			testUtil.control = new GridHeaderCell({
				container: testUtil.container,
				filterType: FILTER_TYPES.AUTO_COMPLETE,
				onFilter() {
				}
			});

			testUtil.simulateClick(testUtil.first('.tags-list-container'));
			addTag('test1');

			assert.is(testUtil.control.filter(), 'test1');
		});

		it('should call the onFilter callback when an AUTO_COMPLETE filter control is set', () => {
			let testValue = '';

			testUtil.control = new GridHeaderCell({
				container: testUtil.container,
				filterType: FILTER_TYPES.AUTO_COMPLETE,
				onFilter() {
					testValue = 'test';
				}
			});

			testUtil.simulateClick(testUtil.first('.tags-list-container'));
			addTag('test1');

			assert.is(testValue, 'test');
		});

		it('should call the onFilter callback once when the filter method is set and filterType is DROPDOWN', () => {
			let testValue = '';

			testUtil.control = new GridHeaderCell({
				container: testUtil.container,
				filterType: FILTER_TYPES.DROPDOWN,
				onFilter(filterValue) {
					testValue = filterValue;
				}
			});

			testUtil.control.filter('asdf');

			assert.is(testValue, 'asdf');
		});

		it('should return a filter value when a DROPDOWN filter control is set', () => {
			testUtil.control = new GridHeaderCell({
				container: testUtil.container,
				onGetFilterOptions(type, id, callback) {
					callback(['test']);
				}
			})
				.filterType(FILTER_TYPES.DROPDOWN);

			testUtil.simulateClick(testUtil.first('.popup-button'));
			testUtil.simulateClick(testUtil.first('.menu .heading', true));

			assert.is(testUtil.control.filter(), 'test');
		});

		it('should call the onFilter callback when a DROPDOWN filter control is set', () => {
			let testValue = '';

			testUtil.control = new GridHeaderCell({
				container: testUtil.container,
				onFilter() {
					testValue = 'test';
				},
				onGetFilterOptions(type, id, callback) {
					callback(['test']);
				}
			})
				.filterType(FILTER_TYPES.DROPDOWN);

			testUtil.simulateClick(testUtil.first('.popup-button'));
			testUtil.simulateClick(testUtil.first('.menu .heading', true));

			assert.is(testValue, 'test');
		});

		it('should call the onFilter callback once when the filter method is set and filterType is NUMBER', () => {
			let testValue = 0;

			testUtil.control = new GridHeaderCell({
				container: testUtil.container,
				filterType: FILTER_TYPES.NUMBER,
				onFilter() {
					testValue++;
				}
			});

			testUtil.control.filter('asdf');

			assert.is(testValue, 1);
		});

		it('should return a filter value when a NUMBER filter control is set', () => {
			testUtil.control = new GridHeaderCell({
				container: testUtil.container
			})
				.filterType(FILTER_TYPES.NUMBER);

			const inputs = testUtil.all('input');

			inputs[0].value = '5';
			testUtil.trigger(inputs[0], 'change');

			inputs[1].value = '10';
			testUtil.trigger(inputs[1], 'change');

			return wait(210)
				.then(() => {
					assert.is(testUtil.control.filter(), '5,10');
				});
		});

		it('should call the onFilter callback when a NUMBER filter control is set', () => {
			let testValue = '';

			testUtil.control = new GridHeaderCell({
				container: testUtil.container,
				onFilter(filterValue) {
					testValue = filterValue;
				}
			})
				.filterType(FILTER_TYPES.NUMBER);

			const inputs = testUtil.all('input');

			inputs[0].value = '5';
			testUtil.trigger(inputs[0], 'change');

			inputs[1].value = '10';
			testUtil.trigger(inputs[1], 'change');

			return wait(210)
				.then(() => {
					assert.is(testValue, '5,10');
				});
		});

		it(
			'should have a filter value of empty string when a NUMBER filter control is set and then set to nothing',
			() => {
				let testValue = '';

				testUtil.control = new GridHeaderCell({
					container: testUtil.container,
					onFilter(filterValue) {
						testValue = filterValue;
					}
				})
					.filterType(FILTER_TYPES.NUMBER);

				const inputs = testUtil.all('input');

				inputs[0].value = '5';
				testUtil.trigger(inputs[0], 'change');

				inputs[0].value = '';
				testUtil.trigger(inputs[0], 'change');

				assert.is(testValue, '');
			}
		);
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

			testUtil.trigger(testUtil.control.element, CONTEXT_MENU_EVENT);

			assert.is(testUtil.count('.context-menu'), 0);
		});

		it('should have three options in the contextmenu if selectableColumns is not set and canSort is true', () => {
			testUtil.control = new GridHeaderCell({
				container: testUtil.container,
				label: 'column label',
				canSort: true,
				selectableColumns: []
			});

			testUtil.trigger(testUtil.control.element, CONTEXT_MENU_EVENT);

			assert.is(testUtil.count('.menu .heading', true), 3);
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

			testUtil.trigger(testUtil.control.element, CONTEXT_MENU_EVENT);

			assert.is(testUtil.count('.menu .heading', true), 5);
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

			testUtil.trigger(testUtil.control.element, CONTEXT_MENU_EVENT);

			assert.is(testUtil.count('.menu .heading', true), 5);
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

			testUtil.trigger(testUtil.control.element, CONTEXT_MENU_EVENT);

			assert.is(testUtil.count('.menu .heading.selected', true), 1);
		});

		it('should call settings.onColumnChange when the fourth option in the context menu is clicked', () => {
			let testValue = '';

			testUtil.control = new GridHeaderCell({
				container: testUtil.container,
				label: 'column label',
				canSort: true,
				onColumnChange(itemId) {
					testValue = itemId;
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

			testUtil.trigger(testUtil.control.element, CONTEXT_MENU_EVENT);

			testUtil.simulateClick(testUtil.nth('.menu .heading', 3, true));

			assert.is(testValue, 'test');
		});

		it('should set sortDirection to gridConstants.SORT_TYPES.ASC when the first option in the context menu is clicked', () => {
			testUtil.control = new GridHeaderCell({
				container: testUtil.container,
				label: 'column label',
				canSort: true
			});

			testUtil.trigger(testUtil.control.element, CONTEXT_MENU_EVENT);

			testUtil.simulateClick(testUtil.nth('.menu .heading', 0, true));

			assert.is(testUtil.control.sortDirection(), SORT_TYPES.ASC);
		});

		it('should set sortDirection to gridConstants.SORT_TYPES.DESC when the second option in the context menu is clicked', () => {
			testUtil.control = new GridHeaderCell({
				container: testUtil.container,
				label: 'column label',
				canSort: true
			});

			testUtil.trigger(testUtil.control.element, CONTEXT_MENU_EVENT);

			testUtil.simulateClick(testUtil.nth('.menu .heading', 1, true));

			assert.is(testUtil.control.sortDirection(), SORT_TYPES.DESC);
		});

		it('should set sortDirection to gridConstants.SORT_TYPES.NONE when the third option in the context menu is clicked', () => {
			testUtil.control = new GridHeaderCell({
				container: testUtil.container,
				label: 'column label',
				canSort: true
			});

			testUtil.trigger(testUtil.control.element, CONTEXT_MENU_EVENT);

			testUtil.simulateClick(testUtil.nth('.menu .heading', 2, true));

			assert.is(testUtil.control.sortDirection(), SORT_TYPES.NONE);
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
				dataType: COLUMN_TYPES.CHECKBOX,
				isAllRowsSelected: true
			});

			assert.is(testUtil.first('input[type=checkbox]').checked, true);
		});

		it('should have an unchecked checkbox if dataType is set to checkbox and isAllRowsSelected is true then false', () => {
			testUtil.control = new GridHeaderCell({
				container: testUtil.container,
				dataType: COLUMN_TYPES.CHECKBOX,
				isAllRowsSelected: true
			});

			testUtil.control.isAllRowsSelected(false);

			assert.is(testUtil.first('input[type=checkbox]').checked, false);
		});

		it('should have a checked checkbox if dataType is set to checkbox and isAllRowsSelected is true then false then true', () => {
			testUtil.control = new GridHeaderCell({
				container: testUtil.container,
				dataType: COLUMN_TYPES.CHECKBOX
			});

			testUtil.control.isAllRowsSelected(true);
			testUtil.control.isAllRowsSelected(false);
			testUtil.control.isAllRowsSelected(true);

			assert.is(testUtil.first('input[type=checkbox]').checked, true);
		});

		it('should not throw an error if isAllRowsSelected is set when the datatype is something other than checkbox', () => {
			testUtil.control = new GridHeaderCell({
				container: testUtil.container,
				dataType: COLUMN_TYPES.NUMBER,
				isAllRowsSelected: true
			});

			assert.is(testUtil.count('input[type=checkbox]'), 0);
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
				dataType: COLUMN_TYPES.CHECKBOX,
				isSomeRowsSelected: true
			});

			assert.is(testUtil.first('input[type=checkbox]').indeterminate, true);
		});

		it('should not throw an error if isSomeRowsSelected is set when the datatype is something other than checkbox', () => {
			testUtil.control = new GridHeaderCell({
				container: testUtil.container,
				dataType: COLUMN_TYPES.NUMBER,
				isSomeRowsSelected: true
			});

			assert.is(testUtil.count('input[type=checkbox]'), 0);
		});
	});
});
