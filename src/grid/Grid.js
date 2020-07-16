import { debounce } from 'async-agent';
import { format as formatDate, formatRelative, isValid, parseISO } from 'date-fns';
import { Collection, compare, List } from 'hord';
import { clone, deepEqual, erase, get } from 'object-agent';
import shortid from 'shortid';
import {
	applySettings,
	AUTO,
	enforceBoolean,
	enforceDate,
	enforceEnum,
	enforceString,
	HUNDRED_PERCENT,
	isArray,
	isString,
	methodArray,
	methodBoolean,
	methodFunction,
	methodString,
	Queue
} from 'type-enforcer-ui';
import Control from '../Control';
import controlTypes from '../controlTypes';
import assign from '../utility/assign.js';
import locale from '../utility/locale';
import search from '../utility/search';
import setDefaults from '../utility/setDefaults.js';
import './Grid.less';
import GridColumnBlock from './GridColumnBlock';
import { CELL_ALIGNMENT, COLUMN_TYPES, FILTER_TYPES, SORT_TYPES } from './gridConstants';
import GridFooter from './GridFooter';

const baseSort = compare();
const descSort = (a, b) => baseSort(b, a);

const RENDERED_QUEUE = Symbol();
const ROWS = Symbol();
const HAS_GROUPS = Symbol();
const GROUPED_ROWS = Symbol();
const FILTERED_ROWS = Symbol();
const FLATTENED_ROWS = Symbol();
const TOTAL_FILTERED_ROWS = Symbol();
const GRID_COLUMN_BLOCK = Symbol();
const IS_RENDERING = Symbol();
const ARE_GROUPS_RENDERED = Symbol();
const CURRENT_EXPANDED_GROUPS = Symbol();
const SELECTED_ROWS = Symbol();
const LAST_SELECTED_ROW = Symbol();
const FOOTER = Symbol();

const setColumns = Symbol();
const toggleColumnHidden = Symbol();
const updateFooter = Symbol();
const whenDoneRendering = Symbol();
const preProcessCells = Symbol();
const removeRow = Symbol();
const eachChild = Symbol();
const eachGroup = Symbol();
const selectGroup = Symbol();
const selectAllGroups = Symbol();
const doneSelecting = Symbol();
const expandCollapseGroup = Symbol();
const expandCollapseAllGroups = Symbol();
const saveCollapsedState = Symbol();
const getCollapsedState = Symbol();
const getChildrenCount = Symbol();
const getGroupCount = Symbol();
const expandGroupOfRow = Symbol();
const group = Symbol();
const filter = Symbol();
const sort = Symbol();
const flattenRows = Symbol();
const getFilterData = Symbol();
const debouncedGroup = Symbol();
const updateSelectState = Symbol();

/**
 * A data grid control.
 * @module Grid
 * @constructor
 *
 * @param {Object}   settings                                     -
 * @param {Boolean} [settings.wordWrap=false] - If 'false' then each cell will clip it's text and add an ellipsis.
 * @param {String} [settings.isVirtualized=true] - If set to false then all rows will be rendered and row heights can be variable.
 *
 *
 *
 * @param {Object}   [settings.footer]                            -
 * @param {String}   [settings.footer.countSuffix=items]          - What do the rows represent?
 */
export default class Grid extends Control {
	constructor(settings = {}) {
		super(setDefaults({
			type: controlTypes.GRID,
			height: HUNDRED_PERCENT
		}, settings));

		const self = this;
		self[ROWS] = new Collection();
		self[HAS_GROUPS] = false;
		self[GROUPED_ROWS] = [];
		self[FILTERED_ROWS] = [];
		self[FLATTENED_ROWS] = [];
		self[TOTAL_FILTERED_ROWS] = 0;
		self[IS_RENDERING] = false;
		self[ARE_GROUPS_RENDERED] = false;
		self[CURRENT_EXPANDED_GROUPS] = [];
		self[SELECTED_ROWS] = [];
		self[LAST_SELECTED_ROW] = '';
		self[FOOTER];

		self.addClass('grid');

		self[RENDERED_QUEUE] = new Queue();

		self[GRID_COLUMN_BLOCK] = new GridColumnBlock({
			container: self.element,
			isAutoHeight: settings.height === AUTO,
			isVirtualized: settings.isVirtualized,
			wordWrap: settings.wordWrap,
			onSort: (direction, columnNum) => self[sort](direction, columnNum),
			onFilter: (value, columnId) => self[filter](value, columnId),
			onGetFilterData: (filterType, columnNum, callback) => self[getFilterData](filterType, columnNum, callback),
			onSelectGroup: (control) => self[selectGroup](control),
			onSelectAllGroups: (isSelected) => self[selectAllGroups](isSelected),
			onExpandCollapseGroup: (group) => self[expandCollapseGroup](group),
			onColumnChange: (columnId) => self[toggleColumnHidden](columnId)
		});

		self[updateFooter]();

		applySettings(self, settings, ['columns', 'groupBy'], ['rows']);

		self.onResize((width, height) => {
				const footerHeight = self[FOOTER] ? self[FOOTER].borderHeight() : 0;

				if (!self.height().isAuto) {
					self[GRID_COLUMN_BLOCK].height(height - footerHeight);
				}
				else {
					self[GRID_COLUMN_BLOCK].height(AUTO);
				}
			})
			.onRemove(() => {
				self[GRID_COLUMN_BLOCK].remove();
				self[GRID_COLUMN_BLOCK] = null;
			});

		self.resize();
	}

	/**
	 * Set which columns the GRidColumnBlock can see and select
	 * @function setColumns
	 */
	[setColumns]() {
		const self = this;

		self[GRID_COLUMN_BLOCK]
			.columns(self.columns()
				.map((column) => !column.isHidden ? column : null)
				.filter(Boolean), true)
			.selectableColumns(self.columns()
				.map((column) => column.canHide ? column : null)
				.filter(Boolean), true);
	}

	/**
	 * Toggle whether a specific column is hidden or not.
	 * @function toggleColumnHidden
	 */
	[toggleColumnHidden](columnId) {
		const self = this;

		self.columns().forEach((column) => {
			if (column.id === columnId) {
				column.isHidden = !column.isHidden;
			}
		});

		self[setColumns]();
	}

	/**
	 * Recalculate the number of items in the grid and tell the view to update the footer.
	 * @function updateFooter
	 */
	[updateFooter]() {
		const self = this;

		if (self.hideFooter()) {
			if (self[FOOTER]) {
				self[FOOTER].remove();
				self[FOOTER] = null;
			}
		}
		else {
			if (!self[FOOTER]) {
				self[FOOTER] = new GridFooter({
					container: self.element,
					onCollapseAllGroups: (isCollapsed) => self[expandCollapseAllGroups](isCollapsed),
					countSuffix: self.itemsLabel()
				});

				self[FOOTER].groupSuffixes(self.groupBy().map((groupBy) => groupBy.footerSuffix || groupBy.property));
			}

			if (self[HAS_GROUPS]) {
				self[FOOTER].showExpandCollapseButtons();
			}

			self[FOOTER]
				.groupCounts(self.groupBy().map((groupBy) => groupBy.count || 0))
				.count(self[GROUPED_ROWS].childCount);
		}
	}

	/**
	 * Execute a callback when the grid is done rendering
	 * @function whenDoneRendering
	 * @param {Function} callback
	 */
	[whenDoneRendering](callback) {
		const self = this;
		let executed = false;

		if (self[IS_RENDERING]) {
			self[RENDERED_QUEUE].add(() => {
				if (!executed) {
					executed = true;
					callback();
				}
			});
		}
		else {
			callback();
		}
	}

	/**
	 * Pre process cell content once before sending the data for rendering
	 * @function preProcessCells
	 */
	[preProcessCells](rowData) {
		const self = this;
		const cells = rowData.cells || [];

		if (!rowData.cells) {
			rowData.cells = cells;
		}

		const setStringValue = (key, cell, column) => {
			let value = column.path ? get(rowData, column.path) : cell[key];

			if (isArray(value)) {
				value = value.join(', ');
			}

			cell[key] = enforceString(value, '', true);
		};

		self.columns().forEach((column, columnIndex) => {
			const cell = cells[columnIndex] || {};

			if (cells[columnIndex] === undefined) {
				cells[columnIndex] = cell;
			}

			if (column.onProcess) {
				column.onProcess(cell, rowData);
			}
			else if (
				column.type === COLUMN_TYPES.TEXT ||
				column.type === COLUMN_TYPES.EMAIL ||
				column.type === COLUMN_TYPES.LINK ||
				column.type === COLUMN_TYPES.NUMBER
			) {
				setStringValue('text', cell, column);
			}
			else if (column.type === COLUMN_TYPES.IMAGE) {
				setStringValue('src', cell, column);
			}
			else if (column.type === COLUMN_TYPES.ICON) {
				setStringValue('icon', cell, column);
			}
			else if (
				column.type === COLUMN_TYPES.DATE ||
				column.type === COLUMN_TYPES.DATE_TIME ||
				column.type === COLUMN_TYPES.TIME
			) {
				let value = column.path ? get(rowData, column.path) : cell.date;

				cell.date = enforceDate(value, '', true);

				if (!cell.original) {
					cell.original = cell.text;
				}
				cell.date = cell.date || parseISO(cell.original);

				if (isValid(cell.date)) {
					switch (column.type) {
						case COLUMN_TYPES.DATE:
							cell.text = formatDate(cell.date, self.dateFormat());
							break;
						case COLUMN_TYPES.DATE_TIME:
							cell.text = formatRelative(cell.date, new Date());
							break;
						case COLUMN_TYPES.TIME:
							cell.text = formatDate(cell.date, self.timeFormat());
							break;
					}
				}
				else {
					cell.text = '-';
				}
			}
		});
	}

	/**
	 * Remove a specific row
	 * @function removeRow
	 */
	[removeRow](rowIndex) {
		if (rowIndex !== -1) {
			this[ROWS].splice(rowIndex, 1);
			this[group]();
		}
	}

	/**
	 * Execute a callback for all rows
	 * @function eachChild
	 * @param {Object}   item     - use groupedRows
	 * @param {Function} callback
	 * @returns {Boolean} - returns whatever the callback returns; return false in the callback to stop the callback
	 *    from working on other children
	 */
	[eachChild](item, callback) {
		const self = this;

		if (item.children) {
			for (let childIndex = 0, itemsLength = item.children.length; childIndex < itemsLength; childIndex++) {
				if (self[eachChild](item.children[childIndex], callback)) {
					break;
				}
			}
		}
		else {
			return callback(item);
		}
	}

	/**
	 * Execute a callback on each group
	 * @function eachGroup
	 * @param {Object}   item     - use groupedRows
	 * @param {Function} callback - provides the group, that groups children, and that groups nested depth
	 * @param {Number} [depth=0]     - returned in the callback, lets you know how deeply nested the row is
	 */
	[eachGroup](item, callback, depth) {
		const self = this;

		if (!depth) {
			depth = 0;
		}

		if (item.children) {
			for (let childIndex = 0, itemsLength = item.children.length; childIndex < itemsLength; childIndex++) {
				if (self[eachGroup](item.children[childIndex], callback, depth + 1)) {
					break;
				}
			}
			return callback(item, item.children, depth);
		}
	}

	/**
	 * Toggle the checked state of a group
	 * @function selectGroup
	 * @param {Object} control
	 */
	[selectGroup](control) {
		const self = this;
		const group = control.data();
		const isSelected = control.isSelected();

		self[eachGroup](self[GROUPED_ROWS], (localGroup) => {
			const childGroupId = localGroup.groupId - group.groupId;

			if (group.groupId === localGroup.groupId) {
				localGroup.isSelected = isSelected;

				self[eachChild](localGroup, (localChild) => {
					self.selectRow(localChild.id, isSelected, {
						ctrlKey: true
					}, true);
				});

				return true;
			}
			else if (0 < childGroupId && childGroupId <= group.groupCount) {
				localGroup.isSelected = isSelected;
			}
		});

		self[doneSelecting]();
	}

	/**
	 * Toggle the checked state of all groups
	 * @function selectAllGroups
	 */
	[selectAllGroups](isSelected) {
		const self = this;

		self[eachGroup](self[GROUPED_ROWS], (localGroup) => {
			localGroup.isSelected = isSelected;

			self[eachChild](localGroup, (localChild) => {
				self.selectRow(localChild.id, isSelected, {
					ctrlKey: true
				}, true);
			});
		});

		self[doneSelecting]();
	}

	/**
	 * When done setting selected rows update everything needed for rendering
	 * @function doneSelecting
	 */
	[doneSelecting]() {
		const self = this;

		self[filter]();
		if (self.onSelect() && self[SELECTED_ROWS].length === 1) {
			self.onSelect()(self[SELECTED_ROWS][0]);
		}
		if (self.onMultiSelect() && self[SELECTED_ROWS].length > 1) {
			self.onMultiSelect()(self[SELECTED_ROWS]);
		}

		self[GRID_COLUMN_BLOCK].isAllRowsSelected(self[TOTAL_FILTERED_ROWS] === self[SELECTED_ROWS].length);
		self[GRID_COLUMN_BLOCK].isSomeRowsSelected(self[TOTAL_FILTERED_ROWS] > self[SELECTED_ROWS].length && self[SELECTED_ROWS].length > 0);
	}

	/**
	 * Set the expanded state of a group
	 * @function expandCollapseGroup
	 * @param {Object} control
	 */
	[expandCollapseGroup](control) {
		const self = this;
		const group = control.data ? control.data() : control;

		self[eachGroup](self[GROUPED_ROWS], (localGroup) => {
			if (group.groupId === localGroup.groupId) {
				localGroup.isCollapsed = !localGroup.isCollapsed;
				group.isCollapsed = localGroup.isCollapsed;

				self[saveCollapsedState](group, localGroup.isCollapsed);

				self[filter]();

				return true;
			}
		});
	}

	/**
	 * Collapse all open groups
	 * @function expandCollapseAllGroups
	 * @param {Boolean} isCollapsed - true will collapse, false will expand
	 */
	[expandCollapseAllGroups](isCollapsed) {
		const self = this;

		self[eachGroup](self[GROUPED_ROWS], (group) => {
			self[saveCollapsedState](group, isCollapsed);
		});
		self[filter]();
	}

	/**
	 * Save the collapsed state of a group
	 * @function saveCollapsedState
	 * @param {Object} group - must be a pointer to an actual group
	 * @param {boolean} isCollapsed
	 */
	[saveCollapsedState](group, isCollapsed) {
		const self = this;

		group.isCollapsed = isCollapsed;

		if (!isCollapsed) {
			if (self[getCollapsedState](group)) {
				self[CURRENT_EXPANDED_GROUPS].push(group.title);
			}
		}
		else {
			self[CURRENT_EXPANDED_GROUPS] = self[CURRENT_EXPANDED_GROUPS].filter((item) => item !== group.title);
		}
	}

	/**
	 * Get the collapsed state of a group
	 * @function getCollapsedState
	 * @param {Object} group - must be a pointer to an actual group
	 */
	[getCollapsedState](group) {
		return !this[CURRENT_EXPANDED_GROUPS].includes(group.title);
	}

	/**
	 * Count all the children of a group
	 * @function getChildrenCount
	 * @param {Object} group - must be a pointer to an actual group
	 */
	[getChildrenCount](group) {
		const self = this;
		let childCount = 0;
		let selectedCount = 0;

		if (group.children) {
			group.children.forEach((item) => {
				if (item.children) {
					childCount += item.childCount;
				}
				else {
					childCount++;
					if (self[SELECTED_ROWS].includes(item.id)) {
						selectedCount++;
					}
				}
			});
		}

		return [childCount, selectedCount];
	}

	/**
	 * Count all the groups within a group
	 * @function getGroupCount
	 * @param {Object} group - must be a pointer to an actual group
	 */
	[getGroupCount](group) {
		let output = 0;

		if (group.children) {
			group.children.forEach((item) => {
				if (item.children) {
					output++;
				}
			});
		}

		return output;
	}

	/**
	 * Find the containing group of the provided row and tell the view to expand that group
	 * @function expandGroupOfRow
	 * @param {Object} row
	 */
	[expandGroupOfRow](row) {
		const self = this;

		self[eachGroup](self[FILTERED_ROWS], (group, rows, depth) => {
			if (depth > 0) {
				rows.some((testRow) => {
					if (row[self.groupBy()[depth - 1].property] === testRow[self.groupBy()[depth - 1].property]) {
						if (group.isCollapsed) {
							self[expandCollapseGroup](group);
						}
						return true;
					}
				});
			}
		});
	}

	/**
	 * Process all the row data into groups.
	 * @function group
	 */
	[group]() {
		this[IS_RENDERING] = true;
		this[debouncedGroup]();
	}

	/**
	 * Filter rows from each group
	 * @function filter
	 * @param {String} value - filter string
	 * @param {Number} columnId
	 */
	[filter](value, columnId) {
		const self = this;
		let previousColumns = clone(self.columns());

		const filterWithinGroups = (filteredRows, filterFunction) => filteredRows.filter((item) => {
			let output = false;

			if (item.children) {
				item.children = filterWithinGroups(item.children, filterFunction);
				output = true;
			}
			else {
				output = filterFunction(item);
			}
			return output;
		});

		const filterUnmatchedGroups = (filteredRows) => {
			self[eachGroup](filteredRows, (group, children, depth) => {
				for (let childIndex = 0; childIndex < children.length; childIndex++) {
					if ((children[childIndex].children && children[childIndex].children.length === 0) || (depth === 0 && !children[childIndex].children)) {
						children.splice(childIndex, 1);
						childIndex--;
					}
				}
			});
		};

		self[IS_RENDERING] = true;

		self[FILTERED_ROWS] = clone(self[GROUPED_ROWS]);

		if (columnId) {
			self.columns()[columnId].filter = value;
		}

		self.columns().forEach((column) => {
			let filterFunction;

			if (column.filter && !column.isHidden) {
				switch (column.type) {
					case COLUMN_TYPES.TEXT:
					case COLUMN_TYPES.EMAIL:
					case COLUMN_TYPES.LINK:
						filterFunction = (row) => {
							return (column.filter === 'undefined' && !row.cells[column.id].text) || search.find(
								column.filter,
								row.cells[column.id].text || '-'
							);
						};
						break;
					case COLUMN_TYPES.NUMBER:
						filterFunction = (row) => {
							const minValue = column.filter.split(',')[0];
							const maxValue = column.filter.split(',')[1];
							const actualValue = row.cells[column.id].text;

							if (minValue && maxValue) {
								return actualValue >= minValue && actualValue <= maxValue;
							}
							else if (minValue) {
								return actualValue >= minValue;
							}
							else {
								return actualValue <= maxValue;
							}
						};
						break;
					case COLUMN_TYPES.DATE:
					case COLUMN_TYPES.DATE_TIME:
					case COLUMN_TYPES.TIME:
						filterFunction = (row) => row.cells[column.id].text === column.filter;
						break;
				}

				if (filterFunction) {
					self[FILTERED_ROWS].children = filterWithinGroups(self[FILTERED_ROWS].children, filterFunction);
					if (self[HAS_GROUPS]) {
						filterUnmatchedGroups(self[FILTERED_ROWS]);
					}
				}
			}
		});

		if (!deepEqual(previousColumns, self.columns())) {
			self[GRID_COLUMN_BLOCK].isFiltered(self.columns().map((item) => item.value).filter(Boolean).length > -1);

			self[eachGroup](self[FILTERED_ROWS], (group) => {
				if (!self[GRID_COLUMN_BLOCK].isFiltered()) {
					self[saveCollapsedState](group, true);
				}
				else {
					self[saveCollapsedState](group, group.childCount === 0);
				}
			});

			self[setColumns]();
		}

		self[sort]();
		self[updateFooter]();
	}

	/**
	 * Sort the filtered rows within each group. When done call {@link module:GridColumnBlock#rows}
	 * @function sort
	 * @param {String}   direction  - 'asc' or 'desc'
	 * @param {Number}   columnNum  - column index of the column to be sorted
	 */
	[sort](direction, columnNum) {
		const self = this;

		const sortGroups = (a, b) => {
			if (a.children && b.children) {
				return List.comparers.string.asc(a.title, b.title);
			}
			else if (a.children) {
				return 1;
			}
			else if (b.children) {
				return -1;
			}
			return 0;
		};

		const sortWithinGroups = (filteredRows, column) => {
			const sortFunction = column.direction === SORT_TYPES.ASC ? column.sortFunctionAsc : column.sortFunctionDesc;

			if (column.direction !== SORT_TYPES.NONE) {
				self[eachGroup](filteredRows, (group, rows) => {
					rows.sort((a, b) => sortGroups(a, b) || sortFunction(
						a.cells[column.id][column.sortKey] || '',
						b.cells[column.id][column.sortKey] || ''
					));

					group.isCollapsed = self[getCollapsedState](group);
				});
			}
		};

		const applySort = () => {
			let currentColumn;

			self.columns().forEach((column) => {
				if (column.id === columnNum) {
					if (direction !== undefined) {
						column.direction = direction;
					}
					currentColumn = column;
				}
				else if (direction !== undefined) {
					column.direction = SORT_TYPES.NONE;
				}
				else if (column.direction !== SORT_TYPES.NONE) {
					currentColumn = column;
				}
			});

			if (currentColumn && (direction !== undefined || currentColumn.direction !== SORT_TYPES.NONE)) {

				sortWithinGroups(self[FILTERED_ROWS], currentColumn);
			}
		};

		self[IS_RENDERING] = true;

		applySort();

		self[TOTAL_FILTERED_ROWS] = self[getChildrenCount](self[FILTERED_ROWS])[0];
		self[FLATTENED_ROWS] = self[flattenRows](self[FILTERED_ROWS].children);

		if (self[GRID_COLUMN_BLOCK]) {
			self[GRID_COLUMN_BLOCK].rows(self[FLATTENED_ROWS]);
		}

		self[IS_RENDERING] = false;
		self[RENDERED_QUEUE].trigger();
		self[RENDERED_QUEUE].discardAll();
	}

	/**
	 * Flatten the grouped row collection for display in a virtualized list control
	 * @function flattenRows
	 */
	[flattenRows](rows) {
		const self = this;
		let counts;
		let childCount;
		let selectedCount;

		return new Collection(rows || []).flatten({
			saveDepth: true,
			onParent(row) {
				row.id = shortid.generate();
				row.footerSuffix = row.footerSuffix || self.itemsLabel() || locale.get('items');

				counts = self[getChildrenCount](row);
				childCount = counts[0];
				selectedCount = counts[1];
				row.childCount = childCount;
				row.isSelected = (childCount > 0 && selectedCount === childCount);
				row.isIndeterminate = (childCount > 1 && selectedCount > 0 && selectedCount < childCount);

				if (row.isCollapsed) {
					erase(row, 'children');
				}

				return row.isCollapsed;
			},
			onChild(row) {
				row.id = row.id || shortid.generate();
				row.isSelected = self[SELECTED_ROWS].includes(row.id);
			}
		});
	}

	/**
	 * Get data to populate the filter UI controls
	 * @function getFilterData
	 * @param {String}   filterType
	 * @param {number}   columnNum
	 * @param {function}   callback
	 */
	[getFilterData](filterType, columnNum, callback) {
		const self = this;
		const output = [];

		const buildDropDownFilters = () => {
			self[eachChild](self[GROUPED_ROWS], (rowCellData) => {
				if (!output.includes(rowCellData.cells[columnNum].text)) {
					output.push(rowCellData.cells[columnNum].text);
				}
			});

			if (self.columns()[columnNum].sortFunctionAsc) {
				output.sort(self.columns()[columnNum].sortFunctionAsc);
			}
			else {
				output.sort(List.comparers.string.asc);
			}
		};

		const buildAutoCompleteFilters = () => {
			self[eachChild](self[FILTERED_ROWS], (rowCellData) => {
				if (!output.includes(rowCellData.cells[columnNum].text) && rowCellData.cells[columnNum].text !== '') {
					output.push(rowCellData.cells[columnNum].text);
				}
			});
		};

		const buildDateFilters = () => {
			self[eachChild](self[FILTERED_ROWS], (rowCellData) => {
				if (!output.includes(rowCellData.cells[columnNum].text) && rowCellData.cells[columnNum].text !== '') {
					output.push(rowCellData.cells[columnNum].text);
				}
			});

			if (self.columns()[columnNum].sortFunctionAsc) {
				output.sort((a, b) => self.columns()[columnNum].sortFunctionAsc(a.date, b.date));
			}
			else {
				output.sort(compare('date'));
			}
		};

		self[whenDoneRendering](() => {
			if (self[FILTERED_ROWS].children && self[FILTERED_ROWS].children.length > 0) {
				switch (filterType) {
					case FILTER_TYPES.DROPDOWN:
						buildDropDownFilters();
						break;
					case FILTER_TYPES.AUTO_COMPLETE:
						buildAutoCompleteFilters();
						break;
					case FILTER_TYPES.DATE:
						buildDateFilters();
						break;
				}
			}

			callback(output);
		});
	}

	[updateSelectState]() {
		const self = this;

		if (self.onSelect() || self.onMultiSelect()) {
			self[GRID_COLUMN_BLOCK].onSelect((...args) => self.selectRow(...args));
		}
		else {
			self[GRID_COLUMN_BLOCK].onSelect(undefined);
		}
	}

	/**
	 * Get a clone of the first matching row from the grid
	 * @method getRow
	 * @member module:Grid
	 * @instance
	 * @param {Object} search - An object that matches a row
	 * @return {Object}
	 */
	getRow(search) {
		return this[ROWS].find(search);
	}

	/**
	 * Add a row to the grid without affecting the other rows
	 * @method addRow
	 * @member module:Grid
	 * @instance
	 * @param {Object}   rowData
	 * @param {Object[]} rowData.cells
	 * @param {String}   [rowData.cells[].text]
	 * @param {String}   [rowData.cells[].src]        - use this if the column type is image
	 * @param {String}   [rowData.cells[].icon]       - an icon to include with a text column type
	 * @param {Boolean}  [rowData.cells[].link]       - path to download this image or the file that it represents
	 *    (creates clickable image)
	 * @param {String}   [rowData.cells[].classes]    - A space separated list of css classes to apply to this cell
	 * @param {String}   [rowData.cells[].width]
	 * @param {String}   [rowData.cells[].margin]
	 *    is applied to this cell
	 * @param {Boolean}  [rowData.cells[].validationState] - Must be in VALIDATION_STATES
	 * @param {String}   [rowData.classes]            - A space separated list of cssclasses to apply to this row
	 * @param {Boolean}  [rowData.disabled]
	 *    is applied to this row
	 * @param {Boolean}  [rowData.validationState]    - Must be in VALIDATION_STATES
	 * @param {Object[]} [rowData.buttons]
	 * @param {String}   [rowData.buttons[].disabled] - Disables the corresponding button on this row
	 */
	addRow(rowData) {
		const self = this;

		if (rowData) {
			if ('id' in rowData && !isString(rowData.id)) {
				console.warn('Grid row property id should be a string.');
			}

			self[preProcessCells](rowData);

			rowData.isSelected = false;

			self[ROWS].push(rowData);

			self[group]();
		}
	}

	/**
	 * Add multiple rows to the grid at one time
	 * @method addRows
	 * @member module:Grid
	 * @instance
	 * @param {Object[]} newRows - Array of rowData objects. Same data structure as addRow.
	 */
	addRows(newRows) {
		if (newRows) {
			newRows.forEach(this.addRow.bind(this));
		}
	}

	/**
	 * Remove the first matching row from the grid
	 * @method removeRow
	 * @member module:Grid
	 * @instance
	 * @param {Object} search - An object that matches a row
	 */
	removeRow(search) {
		this[removeRow](this[ROWS].findIndex(search));
	}

	/**
	 * Remove matching rows from the grid
	 * @method removeRows
	 * @member module:Grid
	 * @instance
	 * @param {Object} search - An object that matches rows
	 */
	removeRows(search) {
		const self = this;
		let rowIndex;

		while ((rowIndex = self[ROWS].findIndex(search)) !== -1) {
			self[removeRow](rowIndex);
		}
	}

	/**
	 * Set the rows in the grid. Merges data into current rows and renders them.
	 * @method removeRows
	 * @member module:Grid
	 * @instance
	 * @param {Object[]} newRows - An array of row objects.
	 */
	rows(newRows) {
		const self = this;

		let rowIndex;

		if (newRows) {
			newRows.forEach((newRow) => {
				if (self.getRow((row) => row.id === newRow.id)) {
					self.updateRowData(newRow.id, newRow);
				}
				else {
					self.addRow(newRow);
				}
			});

			for (rowIndex = 0; rowIndex < self[ROWS].length; rowIndex++) {
				if (!newRows.find((row) => row.id === self[ROWS][rowIndex].id)) {
					self.selectRow(self[ROWS][rowIndex].id, false, {
						ctrlKey: true
					}, true);
					self[removeRow](rowIndex);
					rowIndex--;
				}
			}

			return self;
		}

		return clone(this[ROWS], { isCircular: true });
	}

	/**
	 * Save new data into a specified cell
	 * @method updateCellData
	 * @member module:Grid
	 * @instance
	 * @param {String|Number} editId    - id of the row being updated
	 * @param {Number} columnIndex - column index of the cell being updated
	 * @param {String|Number|Object} newValue    - the new value to save
	 */
	updateCellData(id, columnIndex, newValue) {
		const self = this;

		if (id && columnIndex !== undefined && newValue !== undefined) {
			self[eachChild](self[FILTERED_ROWS], (row) => {
				if (row.id === id) {
					row.cells[columnIndex] = newValue;
					return true;
				}
			});

			self[ROWS].forEach((row) => {
				if (row.id === id) {
					row.cells[columnIndex] = newValue;
					return false;
				}
			});

			self[group]();
		}
	}

	/**
	 * Save new data into a specified cell
	 * @method updateRowData
	 * @member module:Grid
	 * @instance
	 * @param {String|Number} id
	 * @param {object} newData
	 */
	updateRowData(id, newData) {
		const self = this;

		self[eachChild](self[FILTERED_ROWS], (row) => {
			if (row.id === id) {
				assign(row, newData);
				self[preProcessCells](row);
				return true;
			}
		});

		self[ROWS].forEach((row) => {
			if (row.id === id) {
				assign(row, newData);
				self[preProcessCells](row);
				return false;
			}
		});

		self[group]();
	}

	/**
	 * Delete all the rows and display a 'no content' warning.
	 * @method emptyContent
	 * @member module:Grid
	 * @instance
	 */
	emptyContent() {
		const self = this;

		self[ROWS].length = 0;
		self.clearSelected();
		self[group]();
	}

	/**
	 * Look for rows that are currently selected and change them back to not being selected.
	 * @method clearSelected
	 * @member module:Grid
	 * @instance
	 */
	clearSelected() {
		const self = this;

		self[SELECTED_ROWS] = [];
		if (self[FILTERED_ROWS]) {
			self[eachChild](self[FILTERED_ROWS], (localChild) => {
				localChild.isSelected = false;
			});
		}
		self[sort]();
	}

	/**
	 * Set the selected state of a row
	 * @method selectRow
	 * @member module:Grid
	 * @instance
	 * @param {String} id
	 * @param {boolean} isSelected
	 * @param {boolean} skipRender
	 */
	selectRow(id, isSelected, skipRender, event) {
		const self = this;
		let selectedRow;
		const thisEvent = event || {};

		const getShiftSelection = () => {
			const items = new Collection(self[FLATTENED_ROWS]).sliceBy({
				id: self[LAST_SELECTED_ROW]
			}, {
				id: id
			});

			return items.map((item) => item.groupId === undefined ? item.id : null).filter(Boolean);
		};

		isSelected = enforceBoolean(isSelected, true);

		if (self.onSelect() || self.onMultiSelect()) {
			selectedRow = self.getRow((row) => row.id === id);

			if (selectedRow) {
				if (self.onMultiSelect() && thisEvent.ctrlKey ||
					!thisEvent.shiftKey && thisEvent.target && thisEvent.target.nodeName === 'INPUT') {

					if (isSelected) {
						self[SELECTED_ROWS].push(id);
					}
					else {
						self[SELECTED_ROWS] = self[SELECTED_ROWS].filter((item) => item !== id);
						if (id === self[LAST_SELECTED_ROW]) {
							self[LAST_SELECTED_ROW] = self[SELECTED_ROWS][0];
						}
					}
				}
				else if (self.onMultiSelect() && thisEvent.shiftKey) {
					self[SELECTED_ROWS] = getShiftSelection();
				}
				else {
					if (isSelected || self[SELECTED_ROWS].length > 1) {
						self[SELECTED_ROWS] = [id];
						self[LAST_SELECTED_ROW] = id;
					}
					else {
						self[SELECTED_ROWS] = [];
						self[LAST_SELECTED_ROW] = '';
					}
				}

				self[SELECTED_ROWS] = self[SELECTED_ROWS].reduce((result, item) => {
					if (!result.includes(item)) {
						result.push(item);
					}
					return result;
				}, []);

				if (!skipRender) {
					self[doneSelecting]();
				}
			}
		}
	}

	/**
	 * If onSelect or onMultiSelect is set, then this will select the first rendered row (after sorting).
	 * @method selectFirstRow
	 * @member module:Grid
	 * @instance
	 */
	selectFirstRow() {
		const self = this;

		if (self.onSelect() || self.onMultiSelect()) {
			self[whenDoneRendering](() => {
				self[eachGroup](self[FILTERED_ROWS], (group) => {
					if (group.isCollapsed) {
						self[expandCollapseGroup](group);
					}
					return true;
				});

				self[FLATTENED_ROWS].forEach((row) => {
					if (!row.groupId && row.groupId !== 0) {
						self.selectRow(row.id, true);
						return false;
					}
				});
			});
		}
	}

	/**
	 * Focus on a specific row. Expand groups and scroll to the row if necessary.
	 * @method focus
	 * @member module:Grid
	 * @instance
	 * @param {Object} focusObject - must be an object that matches the row data in some way
	 */
	focus(focusObject) {
		const self = this;

		if (focusObject) {
			self[whenDoneRendering](() => {
				const rowIndex = self[ROWS].findIndex(focusObject);

				self[expandGroupOfRow](self[ROWS][rowIndex]);
				self[GRID_COLUMN_BLOCK].scrollToRowIndex(rowIndex);
			});
		}
	}

	onNearBottom(callback) {
		this[GRID_COLUMN_BLOCK].onNearBottom(callback);
	}

	/**
	 * Refresh the display
	 * @method refresh
	 * @member module:Grid
	 * @instance
	 */
	refresh() {
		this[GRID_COLUMN_BLOCK].refresh();
	}
}

Object.assign(Grid.prototype, {
	[debouncedGroup]: debounce(function() {
		const self = this;
		let currentId = 1;
		let currentRowId = 0;

		const getIsCollapsed = (isCollapsedCallback, group) => {
			if (!self[ARE_GROUPS_RENDERED] && isCollapsedCallback && typeof isCollapsedCallback === 'function') {
				const newIsCollapsed = isCollapsedCallback(group);
				self[saveCollapsedState](group, newIsCollapsed);
				return newIsCollapsed;
			}
			else if (group.title) {
				return self[getCollapsedState](group);
			}

			return true;
		};

		const buildGroupStructure = (input, depth) => {
			let output = [];
			let row;

			if (self.groupBy().length > depth) {
				const groupColumn = self.groupBy()[depth].property;
				let currentGroup = {};
				let groupBy = self.groupBy()[depth];

				input.sort(compare(self.groupBy()[depth].property));

				if (groupBy.sort !== 'none' && input.length > 1) {
					if (groupBy.type === 'text') {
						input.sort((a, b) => groupBy.sort === 'desc' ? List.comparers.string.desc(
							a[groupBy.property],
							b[groupBy.property]
						) : List.comparers.string.asc(a[groupBy.property], b[groupBy.property]));
					}
					else if (groupBy.type === 'date') {
						input.sort(compare(groupBy.property, groupBy.sort === 'desc'));
					}
				}

				for (let itemIndex = 0, inputLength = input.length; itemIndex < inputLength; itemIndex++) {
					row = input[itemIndex];
					row.id = row.id || currentRowId;
					currentRowId++;

					if (row[groupColumn]) {
						if (row[groupColumn] !== currentGroup.title) {
							currentGroup = {
								title: row[groupColumn],
								isCollapsed: true,
								isSelected: row.isSelected,
								groupId: currentId,
								children: [],
								depth: depth,
								buttons: groupBy.buttons,
								image: groupBy.image,
								footerSuffix: groupBy.footerSuffix,
								groupItemData: row.groupItemData || {}
							};

							currentId++;

							output.push(currentGroup);
						}

						if (currentGroup.depth === 0 || (currentGroup.depth > 0 && !row.isHidden)) {
							currentGroup.children.push(row);
						}

						if (!input[itemIndex + 1] || input[itemIndex + 1][groupColumn] !== currentGroup.title) {
							currentGroup.children = buildGroupStructure(currentGroup.children, depth + 1);
							currentGroup.isCollapsed = getIsCollapsed(groupBy.isCollapsed, currentGroup);
						}
					}
					else {
						if (!row.isHidden) {
							output.push(row);
						}
					}
				}
			}
			else {
				output = input;
			}

			return output;
		};

		self[GROUPED_ROWS] = {
			title: '',
			children: buildGroupStructure(self[ROWS], 0)
		};

		self.groupBy().forEach((groupBy) => {
			groupBy.count = 0;
		});

		self[eachGroup](self[GROUPED_ROWS], (group) => {
			group.childCount = self[getChildrenCount](group)[0];
			group.isCollapsed = group.childCount < 1 || group.isCollapsed;
			group.groupCount = self[getGroupCount](group);
			self.groupBy().forEach((groupBy, groupByDepth) => {
				if (group.depth === groupByDepth) {
					groupBy.count++;
				}
			});
		});

		if (self[GROUPED_ROWS].children.length > 0) {
			self[ARE_GROUPS_RENDERED] = true;
		}

		self[filter]();
	}),

	/**
	 * @method columns
	 * @memberOf Grid
	 *
	 * @param {Object[]} columns
	 * @param {String} columns[].type - Available types: text, email, int, date, time, datetime, actions, image, custom.
	 * @param {String} [columns[].size="1*"] - May be a fixed width like '3rem' or a percent like '30%'. Percents are calculated from the remaining width after all the fixed width columns are calculated.
	 * @param {String} [columns[].align] - See Grid.CELL_ALIGNMENT
	 * @param {String} [columns[].title] - Displayed title for the column.
	 * @param {Boolean} [columns[].canSort=false] - 'True' will make the header clickable, draw the arrows indicating that this column is sortable, and when clicked will sort based on the column type.
	 * @param {String} [columns[].defaultSort] - 'asc' or 'desc': only use this on the column that should be sorted when the grid first loads.
	 * @param {Function} [columns[].sortFunctionAsc] - Override for the 'asc' sort function. If "type" is "custom" and canSort is true, then this must be provided.
	 * @param {Function} [columns[].sortFunctionDesc] - Override for the 'desc' sort function. If "type" is "custom" and canSort is true, then this must be provided.
	 * @param {Boolean} [columns[].canFilter=false] - 'True' will add a filter control to the header that automatically filters when the user interacts with it.
	 * @param {String} [columns[].filterType] - Available types: dropdown, autoComplete, date, custom.
	 * @param {Function} [columns[].canHide=false] - If true then the user can hide this column via a context menu
	 * @param {Function} [columns[].isHidden=false] - If true then hide the column unless the user selects it from the context menu
	 * @param {String} [columns[].minWidth=5rem]
	 * @param {Object[]} [columns[].buttons] - Only for column type 'actions'. These buttons will appear on every row.
	 * @param {String}   columns[].buttons[].src - Applied to the src attribute of the image
	 * @param {Function} columns[].buttons[].onClick - Called on click
	 * @param {String}   [columns[].buttons[].title] - Applied to title and alt attributes
	 */
	// TODO: enforce inidividual column data via a Schema
	columns: methodArray({
		enforce(columns, oldValue) {
			if (!isArray(columns)) {
				return oldValue;
			}

			return columns.map((column, index) => {
				column = {
					...column,
					id: index.toString(),
					title: enforceString(column.title, ''),
					sortKey: enforceString(column.sortKey, 'text'),
					canSort: enforceBoolean(column.canSort, false),
					filterType: enforceEnum(column.filterType, FILTER_TYPES, FILTER_TYPES.TEXT),
					canFilter: enforceBoolean(column.canFilter, false),
					direction: enforceEnum(column.defaultSort, SORT_TYPES, SORT_TYPES.NONE)
				};

				switch (column.type) {
					case COLUMN_TYPES.TEXT:
					case COLUMN_TYPES.EMAIL:
					case COLUMN_TYPES.LINK:
						column.sortFunctionAsc = column.sortFunctionAsc || List.comparers.string.asc;
						column.sortFunctionDesc = column.sortFunctionDesc || List.comparers.string.desc;
						column.filterType = column.filterType || FILTER_TYPES.AUTO_COMPLETE;
						break;
					case COLUMN_TYPES.NUMBER:
						column.sortFunctionAsc = column.sortFunctionAsc || List.comparers.number.asc;
						column.sortFunctionDesc = column.sortFunctionDesc || List.comparers.number.desc;
						column.filterType = column.filterType || FILTER_TYPES.NUMBER;
						break;
					case COLUMN_TYPES.DATE:
					case COLUMN_TYPES.DATE_TIME:
					case COLUMN_TYPES.TIME:
						column.filterType = column.filterType || FILTER_TYPES.DATE;
						column.sortFunctionAsc = column.sortFunctionAsc || baseSort;
						column.sortFunctionDesc = column.sortFunctionDesc || descSort;
						column.sortKey = column.sortKey || 'date';
						break;
					case COLUMN_TYPES.IMAGE:
						column.sortFunctionAsc = column.sortFunctionAsc || List.comparers.string.asc;
						column.sortFunctionDesc = column.sortFunctionDesc || List.comparers.string.desc;
						column.sortKey = column.sortKey || 'icon';
				}

				return column;
			});
		},
		set: setColumns
	}),
	/**
	 * @method groupBy
	 * @memberOf Grid
	 *
	 * @param {Object[]} [groupBy]                           -
	 * @param {String}   [groupBy[].groupItemData]           - Data associated with the group.
	 * @param {String}   [groupBy[].property=Title]          - Corresponds to a property attached to each row.
	 * @param {String}   [groupBy[].footerSuffix=Categories] - A title to use in the footer for the count of
	 *    groups.
	 * @param {String}   [groupBy[].type]                    - May be: text, int, date.
	 * @param {String}   [groupBy[].sort]                    - If 'none' then don't sort this group
	 * @param {Function} [groupBy[].image]                   - The function must return a string of the url to an
	 *    image or falsy
	 * @param {Function} [groupBy[].isCollapsed]             - The function must return a Boolean
	 * @param {Object[]} [groupBy[].buttons]                 - Optional buttons to show on the right hand side of
	 *    the group header.
	 * @param {String}   groupBy[].buttons.image             - URL for an image
	 * @param {String}   [groupBy[].buttons.title]           - String applied to the "alt" and "title" attributes
	 *    of the button
	 * @param {String}   [groupBy[].buttons.classes]         - A space separated list of css classes to apply to
	 *    this button
	 * @param {Function} [groupBy[].buttons.onClick]         - A function to be called when the button is clicked
	 */
	groupBy: methodArray({
		set(groupBy) {
			this[HAS_GROUPS] = groupBy.length !== 0;
		}
	}),
	onSelect: methodFunction({
		set: updateSelectState
	}),
	onMultiSelect: methodFunction({
		set: updateSelectState
	}),
	itemsLabel: methodString(),
	hideFooter: methodBoolean({
		set: updateFooter
	}),
	dateFormat: methodString({
		init: 'MM/dd/yyyy'
	}),
	timeFormat: methodString({
		init: 'hh:mm:ss'
	})
});

Grid.COLUMN_TYPES = COLUMN_TYPES;
Grid.SORT_TYPES = SORT_TYPES;
Grid.FILTER_TYPES = FILTER_TYPES;
Grid.CELL_ALIGNMENT = CELL_ALIGNMENT;

