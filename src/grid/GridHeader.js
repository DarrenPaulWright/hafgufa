import { applySettings, CssSize, methodArray, methodBoolean, methodFunction, methodNumber } from 'type-enforcer-ui';
import Control from '../Control.js';
import ControlRecycler from '../ControlRecycler.js';
import controlTypes from '../controlTypes.js';
import setDefaults from '../utility/setDefaults.js';
import { COLUMN_TYPES, FILTER_TYPES, SORT_TYPES } from './gridConstants.js';
import './GridHeader.less';
import GridHeaderCell from './GridHeaderCell.js';

const MIN_COLUMN_WIDTH = 60;

const CELL_RECYCLER = Symbol();
const TOTAL_FIXED_COLUMN_WIDTH = Symbol();
const TOTAL_FLEXIBLE_COLUMN_WIDTH = Symbol();

const sortColumn = Symbol();

/**
 * Handles the layout of grid header cell controls
 *
 * @module GridHeader
 * @class
 *
 * @param {object} settings
 */
export default class GridHeader extends Control {
	constructor(settings = {}) {
		super(setDefaults({
			type: controlTypes.GRID_HEADER
		}, settings));

		const self = this;
		self[TOTAL_FIXED_COLUMN_WIDTH] = 0;
		self[TOTAL_FLEXIBLE_COLUMN_WIDTH] = 0;
		self.addClass('grid-header');

		self[CELL_RECYCLER] = new ControlRecycler()
			.control(GridHeaderCell)
			.defaultSettings({
				onSort: (control) => self[sortColumn](control),
				onSelect: settings.onSelectAllGroups,
				onFilter: settings.onFilter,
				onGetFilterOptions: settings.onGetFilterData,
				onColumnChange: settings.onColumnChange
			});

		applySettings(self, settings, ['width', 'columns']);

		self.onRemove(() => {
			self[CELL_RECYCLER].remove();
		});
	}

	/**
	 * Apply css classes to appropriate column labels to show the sort state and call grid.sort().
	 *
	 * @function sortColumn
	 * @param {object} headerCellControl
	 */
	[sortColumn](headerCellControl) {
		const self = this;

		if (headerCellControl.sortDirection() !== SORT_TYPES.NONE) {
			self[CELL_RECYCLER].each((control) => {
				if (control.id() !== headerCellControl.id()) {
					control.sortDirection(SORT_TYPES.NONE);
				}
			});
		}
		if (self.onSort()) {
			self.onSort()(headerCellControl.sortDirection(), headerCellControl.id());
		}
	}
}

Object.assign(GridHeader.prototype, {
	/**
	 * @method columns
	 * @member module:GridHeader
	 * @instance
	 * @param {Array} [columns]
	 * @returns {Array|this}
	 */
	columns: methodArray({
		set(columns) {
			const self = this;

			self[TOTAL_FIXED_COLUMN_WIDTH] = 0;
			self[TOTAL_FLEXIBLE_COLUMN_WIDTH] = 0;

			columns.forEach((column, index) => {
				let filterType;

				column.size = column.size || '1*';

				if (!column.size.includes('*') && !column.size.includes('%')) {
					column.size = new CssSize(column.size).element(self.element);
					column.isFixedWidth = true;
				}
				else {
					column.isFixedWidth = false;
				}

				if (column.isFixedWidth) {
					column.currentWidth = column.size.toPixels(true);
					self[TOTAL_FIXED_COLUMN_WIDTH] += column.currentWidth;
				}
				else {
					if (column.size === '*') {
						column.size = '1*';
					}
					self[TOTAL_FLEXIBLE_COLUMN_WIDTH] += parseInt(column.size, 10);
				}

				switch (column.type) {
					case COLUMN_TYPES.TEXT:
					case COLUMN_TYPES.EMAIL:
						filterType = column.canFilter ? column.filterType || FILTER_TYPES.AUTO_COMPLETE : null;
						break;
					case COLUMN_TYPES.NUMBER:
						filterType = column.canFilter ? column.filterType || FILTER_TYPES.NUMBER : null;
						break;
					case COLUMN_TYPES.DATE:
					case COLUMN_TYPES.DATE_TIME:
					case COLUMN_TYPES.TIME:
						filterType = column.canFilter ? FILTER_TYPES.DATE : null;
						break;
				}
				column.minWidth = column.isFixedWidth ? null : (parseInt(column.minWidth || MIN_COLUMN_WIDTH, 10));

				applySettings(self[CELL_RECYCLER].getControlAtIndex(index, true), {
					container: self.element,
					id: column.id,
					label: column.title,
					canSort: column.canSort,
					filter: column.filter || '',
					dataType: column.type,
					filterType,
					sortDirection: column.direction,
					selectableColumns: self.selectableColumns()
				});
			});

			for (let index = columns.length; index < self[CELL_RECYCLER].totalVisibleControls(); index++) {
				self[CELL_RECYCLER].getControlAtIndex(index).container(null);
			}
		}
	}),

	/**
	 * @method selectableColumns
	 * @member module:GridHeader
	 * @instance
	 * @param {Array} [selectableColumns]
	 * @returns {Array|this}
	 */
	selectableColumns: methodArray({
		set(newValue) {
			this[CELL_RECYCLER].each((control) => {
				control.selectableColumns(newValue, true);
			});
		}
	}),

	/**
	 * @method desiredWidth
	 * @member module:GridHeader
	 * @instance
	 * @param {number} desiredWidth
	 * @returns {number} - The actual width used
	 */
	desiredWidth(desiredWidth) {
		const self = this;
		let totalUsedWidth = self[TOTAL_FIXED_COLUMN_WIDTH] + self.scrollbarWidth();
		const totalFlexibleWidth = desiredWidth - totalUsedWidth;
		let usableFlexibleWidth = totalFlexibleWidth;
		let usableFlexibleColumnUnits = self[TOTAL_FLEXIBLE_COLUMN_WIDTH];
		let extraWidth = 0;

		const getWidth = (column, flexibleWidth, flexibleColumnUnits) => {
			return Math.floor(flexibleWidth * (parseInt(column.size, 10) / flexibleColumnUnits));
		};

		self.columns().forEach((column) => {
			if (!column.isFixedWidth) {
				column.currentWidth = getWidth(column, totalFlexibleWidth, self[TOTAL_FLEXIBLE_COLUMN_WIDTH]);
				if (column.currentWidth < column.minWidth) {
					column.currentWidth = column.minWidth;
					usableFlexibleWidth -= column.minWidth;
					usableFlexibleColumnUnits -= parseInt(column.size, 10);
					totalUsedWidth += column.currentWidth;
				}
				else {
					column.currentWidth = 0;
				}
			}
		});

		self.columns().forEach((column, index) => {
			if (column.currentWidth === 0) {
				column.currentWidth = getWidth(column, usableFlexibleWidth, usableFlexibleColumnUnits);
				if (column.currentWidth < column.minWidth) {
					column.currentWidth = column.minWidth;
				}
				totalUsedWidth += column.currentWidth;
			}

			if (index === self.columns().length - 1) {
				extraWidth = self.scrollbarWidth();
			}

			self[CELL_RECYCLER].getControl(column.id)
				.minWidth(column.currentWidth + extraWidth)
				.width(column.currentWidth + extraWidth)
				.maxWidth(column.currentWidth + extraWidth)
				.resize();
		});

		return totalUsedWidth;
	},

	/**
	 * @method isAllRowsSelected
	 * @member module:GridColumnBlock
	 * @instance
	 * @param {boolean} [isAllRowsSelected]
	 * @returns {boolean|this}
	 */
	isAllRowsSelected: methodBoolean({
		set(isAllRowsSelected) {
			this[CELL_RECYCLER].each((control) => {
				control.isAllRowsSelected(isAllRowsSelected, true);
			});
		}
	}),

	/**
	 * @method isSomeRowsSelected
	 * @member module:GridColumnBlock
	 * @instance
	 * @param {boolean} [isSomeRowsSelected]
	 * @returns {boolean|this}
	 */
	isSomeRowsSelected: methodBoolean({
		set(isSomeRowsSelected) {
			this[CELL_RECYCLER].each((control) => {
				control.isSomeRowsSelected(isSomeRowsSelected, true);
			});
		}
	}),

	/**
	 * @method scrollbarWidth
	 * @member module:GridHeader
	 * @instance
	 * @param {number} [scrollbarWidth]
	 * @returns {number|this}
	 */
	scrollbarWidth: methodNumber({
		init: 0
	}),

	onSort: methodFunction(),

	updateFilters() {
		this[CELL_RECYCLER].each((control) => {
			control.updateFilter();
		});
	}
});
