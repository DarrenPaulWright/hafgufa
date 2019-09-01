import { defer } from 'async-agent';
import { event } from 'd3';
import { clone } from 'object-agent';
import { applySettings, HUNDRED_PERCENT, method, PIXELS } from 'type-enforcer';
import { CLICK_EVENT, MOUSE_DOWN_EVENT, MOUSE_ENTER_EVENT, MOUSE_LEAVE_EVENT } from '../../utility/domConstants';
import Control from '../Control';
import ControlRecycler from '../ControlRecycler';
import controlTypes from '../controlTypes';
import Heading from '../elements/Heading';
import GridCell from './GridCell';
import { COLUMN_TYPES } from './gridConstants';
import './GridRow.less';

const COLUMN_GROUP_WIDTH = 32;
const CLICKABLE_CLASS = 'clickable';

const GROUP_HEADING = Symbol();
const CELL_RECYCLER = Symbol();
const COLUMNS = Symbol();
const CURRENT_AVAILABLE_WIDTH = Symbol();
const IS_GROUP_HEADER = Symbol();
const IS_CLICK_EVENT_SET = Symbol();

const renderRow = Symbol();
const removeRow = Symbol();
const updateCell = Symbol();
const renderGroupHeader = Symbol();
const removeGroupHeader = Symbol();
const resetRowWidth = Symbol();
const getIndentWidth = Symbol();
const calculateCellWidth = Symbol();
const setClickEvent = Symbol();

/**
 * Controls the display of one row in the grid control
 *
 * @module GridRow
 * @extends Control
 * @constructor
 *
 * @arg {Object} settings - Accepts all control settings plus:
 */
export default class GridRow extends Control {
	constructor(settings = {}) {
		settings.type = settings.type || controlTypes.GRID_ROW;

		super(settings);

		const self = this;
		self[COLUMNS] = [];
		self[CURRENT_AVAILABLE_WIDTH] = 0;
		self[IS_GROUP_HEADER] = false;
		self[IS_CLICK_EVENT_SET] = false;

		self.classes('grid-row');

		self[CELL_RECYCLER] = new ControlRecycler()
			.control(GridCell)
			.defaultSettings({
				onSelect() {
					self.isSelected(!self.isSelected());
					self.onSelectRow()(self.ID(), self.isSelected());
				}
			});

		applySettings(self, settings);

		self.onRemove(() => {
			self[removeRow]();
			if (self[GROUP_HEADING]) {
				self[GROUP_HEADING].remove();
			}
			self[CELL_RECYCLER].remove();
		});
	}

	/**
	 * Render the contents of a normal row.
	 * @function renderRow
	 */
	[renderRow]() {
		const self = this;

		self[removeGroupHeader]();

		if (self.data().cells) {
			self.isSelected(self.data().isSelected);

			self[COLUMNS].forEach((column, index) => {
				const cell = self[CELL_RECYCLER].getControlAtOffset(index) || self[CELL_RECYCLER].getRecycledControl();

				self[updateCell](cell, self.data().cells[column.ID] || {}, column, index);
			});

			self[CELL_RECYCLER].each((cell, index) => {
				if (index >= self[COLUMNS].length) {
					cell.container(null);
				}
			});
		}
	}

	/**
	 * Remove the contents of a normal row
	 * @function removeRow
	 */
	[removeRow]() {
		const self = this;

		self[CELL_RECYCLER].discardAllControls();
		self.isSelected(false);
		self.isSelectable(false);
	}

	/**
	 * Update a cell control with new data.
	 * @function updateCell
	 */
	[updateCell](cell, cellData, column, index) {
		const self = this;

		if (column.type === COLUMN_TYPES.ACTIONS) {
			cellData.columnButtons = column.buttons;
		}

		applySettings(cell, {
			container: self,
			width: self[calculateCellWidth](index),
			classes: cellData.classes || '',
			isEnabled: self.data().disabled !== true,
			onRowClick: self.onClick(),
			onRenderCell: column.onRenderCell,
			onRemoveCell: column.onRemoveCell,
			dataType: column.type,
			content: cellData,
			data: self.data(),
			wordWrap: self.wordWrap()
		});

		cell.isSelected(self.isSelected(), true);

		if (column.align) {
			cell.textAlign(column.align);
		}
	}

	/**
	 * Render the contents of a group header.
	 * @function renderGroupHeader
	 */
	[renderGroupHeader]() {
		const self = this;
		const doRenderCheckBox = !!self[COLUMNS].find((column) => column.type === COLUMN_TYPES.CHECKBOX);

		self[removeRow]();

		if (!self[GROUP_HEADING]) {
			self[GROUP_HEADING] = new Heading({
				container: self.element(),
				width: HUNDRED_PERCENT,
				classes: 'grid-group-header',
				isExpandable: true,
				shouldMainClickExpand: true,
				stopPropagation: true
			});
		}

		self.removeClass(CLICKABLE_CLASS);

		self[GROUP_HEADING]
			.isDisplayed(true)
			.data(self.data())
			.onExpand(self.onExpandCollapseGroup())
			.onSelect(self.onSelectGroup())
			.isExpanded(!self.data().isCollapsed)
			.showCheckbox(doRenderCheckBox)
			.isSelectable(doRenderCheckBox)
			.isSelected(!!self.data().isSelected)
			.isIndeterminate(self.isIndeterminate())
			.title(self.data().title)
			.subTitle(self.data().childCount + ' ' + (self.data().footerSuffix || 'items'))
			.image(self.data().image ? (self.data().image(self.data()) || '') : '')
			.buttons(self.data().buttons, true);

		defer(() => self[GROUP_HEADING].resize());
	}

	/**
	 * Remove the contents of a group header
	 * @function removeGroupHeader
	 */
	[removeGroupHeader]() {
		const self = this;

		if (self[GROUP_HEADING]) {
			self[GROUP_HEADING].isDisplayed(false);
		}
	}

	/**
	 * Reset the row width. Takes in to account group depth.
	 * @function resetRowWidth
	 */
	[resetRowWidth]() {
		const self = this;
		self.width(self[CURRENT_AVAILABLE_WIDTH] - self[getIndentWidth]());
	}

	[getIndentWidth]() {
		return this.data().depth * COLUMN_GROUP_WIDTH;
	}

	/**
	 * Calculate the width of a cell at a given index.
	 * @function calculateCellWidth
	 */
	[calculateCellWidth](cellIndex) {
		const self = this;
		let width = self[COLUMNS][cellIndex].currentWidth || 0;

		if (cellIndex === 0 && self[COLUMNS][0].type !== COLUMN_TYPES.CHECKBOX ||
			cellIndex === 1 && self[COLUMNS][0].type === COLUMN_TYPES.CHECKBOX) {
			width -= self[getIndentWidth]();
		}

		return width + PIXELS;
	}

	/**
	 * Sets or removes the click events for the row.
	 * @function setClickEvent
	 */
	[setClickEvent]() {
		const self = this;
		const doSetClickEvent = ((self.onClick() || self.isSelectable()) && !self.data().disabled && !self[IS_GROUP_HEADER]);

		self.classes(CLICKABLE_CLASS, doSetClickEvent);

		if (doSetClickEvent) {
			if (!self[IS_CLICK_EVENT_SET]) {
				self.on(CLICK_EVENT, () => {
					if (self.onClick()) {
						self.onClick()(clone(self.data()));
					}
					if (self.isSelectable()) {
						self.isSelected(!self.isSelected());
						self.onSelectRow()(self.ID(), self.isSelected());
					}
				});
				self.on(MOUSE_DOWN_EVENT, () => event.preventDefault());
				self[IS_CLICK_EVENT_SET] = true;
			}
		}
		else {
			self.off(CLICK_EVENT);
			self.off(MOUSE_DOWN_EVENT);
			self[IS_CLICK_EVENT_SET] = false;
		}
	}
}

Object.assign(GridRow.prototype, {
	/**
	 * Update the widths of all cells in this row to corresponding values stored in the Array "columns".
	 * @method updateWidth
	 * @member module:GridRow
	 * @instance
	 * @arg {Number} availableWidth
	 * @returns {this}
	 */
	updateWidth(availableWidth) {
		const self = this;

		self[CURRENT_AVAILABLE_WIDTH] = availableWidth;
		self[resetRowWidth]();

		if (self.data().groupId === undefined) {
			self[CELL_RECYCLER].each((cell, index) => {
				if (index < self[COLUMNS].length) {
					cell.width(self[calculateCellWidth](index));
				}
			});
		}

		return self;
	},

	/**
	 * @method data
	 * @member module:GridRow
	 * @instance
	 * @arg {Boolean} newData
	 * @returns {Boolean|this}
	 */
	data: method.object({
		init: {},
		set(newValue) {
			const self = this;

			newValue.depth = newValue.depth || 0;

			self.margin('0 0 0 ' + self[getIndentWidth]() + PIXELS);
			self[resetRowWidth]();

			self[IS_GROUP_HEADER] = (newValue.groupId !== undefined);
			self.classes('is-group-header', self[IS_GROUP_HEADER]);
			if (self[IS_GROUP_HEADER]) {
				self[renderGroupHeader]();
			}
			else {
				self[renderRow]();
			}

			self[CELL_RECYCLER].each((cell) => {
				cell.data(newValue);
			});

			self.onClick(self.onClick(), true);
		}
	}),

	/**
	 * @method columns
	 * @member module:GridRow
	 * @instance
	 * @arg {Object[]} newColumns
	 * @returns {this}
	 */
	columns(newColumns) {
		const self = this;

		self[COLUMNS] = newColumns;
		if (self.data().groupId === undefined) {
			self[renderRow]();
		}

		return self;
	},

	/**
	 * @method isSelectable
	 * @member module:GridRow
	 * @instance
	 * @arg {Boolean} isSelectable
	 * @returns {Boolean|this}
	 */
	isSelectable: method.boolean({
		set() {
			this[setClickEvent]();
		}
	}),

	/**
	 * @method isSelected
	 * @member module:GridRow
	 * @instance
	 * @arg {Boolean} newIsSelected
	 * @returns {Boolean|this}
	 */
	isSelected: method.boolean({
		set(isSelected) {
			this.classes('selected', isSelected);

			this[CELL_RECYCLER].each((cell) => {
				cell.isSelected(isSelected);
			});
		}
	}),

	/**
	 * @method isIndeterminate
	 * @member module:GridRow
	 * @instance
	 * @arg {Boolean} newIsSelected
	 * @returns {Boolean|this}
	 */
	isIndeterminate: method.boolean({
		set(newValue) {
			if (this[GROUP_HEADING]) {
				this[GROUP_HEADING].isIndeterminate(newValue);
			}
		}
	}),

	onMouseEnter: method.function({
		set(newValue) {
			const self = this;

			self.set(MOUSE_ENTER_EVENT, () => {
				self.onMouseEnter()(self.data(), self);
			}, newValue);
		},
		other: undefined
	}),

	onMouseLeave: method.function({
		set(newValue) {
			const self = this;

			self.set(MOUSE_LEAVE_EVENT, () => {
				self.onMouseLeave()(self.data(), self);
			}, newValue);
		},
		other: undefined
	}),

	/**
	 * @method onClick
	 * @member module:GridRow
	 * @instance
	 * @arg {Function} onClickCallback
	 * @returns {Function|this}
	 */
	onClick: method.function({
		set(newValue) {
			const self = this;

			self[setClickEvent]();
			self[CELL_RECYCLER].each((cell) => {
				cell.onRowClick(newValue);
			});
		},
		other: undefined
	}),

	onSelectRow: method.function(),

	onSelectGroup: method.function(),

	onExpandCollapseGroup: method.function(),

	wordWrap: method.function()
});
