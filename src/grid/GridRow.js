import { defer } from 'async-agent';
import {
	applySettings,
	HUNDRED_PERCENT,
	methodArray,
	methodBoolean,
	methodFunction,
	methodInteger,
	methodObject,
	methodString,
	PIXELS
} from 'type-enforcer-ui';
import Control from '../Control.js';
import ControlRecycler from '../ControlRecycler.js';
import controlTypes from '../controlTypes.js';
import Heading from '../elements/Heading.js';
import { CLICK_EVENT, MOUSE_DOWN_EVENT } from '../utility/domConstants.js';
import setDefaults from '../utility/setDefaults.js';
import GridCell from './GridCell.js';
import { COLUMN_TYPES } from './gridConstants.js';
import './GridRow.less';

const COLUMN_GROUP_WIDTH = 32;
const CLICKABLE_CLASS = 'clickable';

const GROUP_HEADING = Symbol();
const CELL_RECYCLER = Symbol();
const CURRENT_AVAILABLE_WIDTH = Symbol();
const IS_GROUP_HEADER = Symbol();
const IS_CLICK_EVENT_SET = Symbol();
const INDENT_WIDTH = Symbol();

const renderCells = Symbol();
const hideCells = Symbol();
const renderGroupHeading = Symbol();
const hideGroupHeading = Symbol();
const resetRowWidth = Symbol();
const calculateCellWidth = Symbol();
const setClickEvent = Symbol();
const refresh = Symbol();

/**
 * Controls the display of one row in the grid control
 *
 * @class GridRow
 * @extends Control
 *
 * @param {object} settings - Accepts all control settings plus:
 */
export default class GridRow extends Control {
	constructor(settings = {}) {
		super(setDefaults({
			type: controlTypes.GRID_ROW
		}, settings));

		const self = this;
		self[CURRENT_AVAILABLE_WIDTH] = 0;
		self[INDENT_WIDTH] = 0;
		self[IS_GROUP_HEADER] = false;
		self[IS_CLICK_EVENT_SET] = false;

		self.classes('grid-row');

		self[CELL_RECYCLER] = new ControlRecycler()
			.control(GridCell)
			.defaultSettings({
				onSelect(isChecked, event) {
					if (self.onSelect()) {
						self.isSelected(!self.isSelected());
						self.onSelect()(self.id(), self.isSelected(), false, event);
					}
				}
			});

		applySettings(self, settings);

		self.onRemove(() => {
			self[CELL_RECYCLER].remove();
		});
	}

	/**
	 * Render the contents of a normal row.
	 */
	[renderCells]() {
		const self = this;

		self[hideGroupHeading]();

		if (self.rowData().cells) {
			self.columns().forEach((column, index) => {
				const cell = self[CELL_RECYCLER].getControlAtIndex(index, true);
				const cellData = self.rowData().cells[column.id] || {};

				if (cellData.classes !== undefined) {
					cell.resetClasses();
				}

				applySettings(cell, {
					container: self,
					width: self[calculateCellWidth](index),
					isEnabled: self.isEnabled(),
					dataType: column.type,
					content: {
						...cellData,
						columnButtons: column.buttons
					},
					rowData: self.rowData(),
					wordWrap: self.wordWrap(),
					textAlign: column.align,
					isSelected: self.isSelected(),
					classes: cellData.classes || ''
				});
			});

			self[CELL_RECYCLER].each((cell, index) => {
				if (index >= self.columns().length) {
					cell.container(null);
				}
			});
		}
	}

	/**
	 * Remove the contents of a normal row.
	 */
	[hideCells]() {
		const self = this;

		self.removeClass(CLICKABLE_CLASS);

		self[CELL_RECYCLER].discardAllControls();
	}

	/**
	 * Render the contents of a group header.
	 */
	[renderGroupHeading]() {
		const self = this;
		const doRenderCheckBox = !!self.columns().find((column) => column.type === COLUMN_TYPES.CHECKBOX);

		self[hideCells]();

		if (!self[GROUP_HEADING]) {
			self[GROUP_HEADING] = new Heading({
				container: self,
				width: HUNDRED_PERCENT,
				classes: 'grid-group-header',
				isExpandable: true,
				shouldMainClickExpand: true,
				stopPropagation: true
			});
		}

		self[GROUP_HEADING]
			.isDisplayed(true)
			.data(self.rowData())
			.onExpand(self.onExpandCollapseGroup())
			.onSelect(self.onSelectGroup())
			.isExpanded(!self.rowData().isCollapsed)
			.showCheckbox(doRenderCheckBox)
			.isSelectable(doRenderCheckBox)
			.isSelected(self.isSelected())
			.isIndeterminate(self.isIndeterminate())
			.title(self.rowData().title)
			.subTitle(self.rowData().childCount + ' ' + (self.rowData().footerSuffix || 'items'))
			.image(self.rowData().image ? (self.rowData().image(self.rowData()) || '') : '')
			.buttons(self.rowData().buttons, true);

		defer(() => self[GROUP_HEADING].resize());
	}

	/**
	 * Remove the contents of a group header.
	 */
	[hideGroupHeading]() {
		const self = this;

		if (self[GROUP_HEADING]) {
			self[GROUP_HEADING].isDisplayed(false);
		}
	}

	/**
	 * Reset the row width. Takes in to account group depth.
	 */
	[resetRowWidth]() {
		const self = this;
		self.width(self[CURRENT_AVAILABLE_WIDTH] - self[INDENT_WIDTH]);
	}

	/**
	 * Calculate the width of a cell at a given index.
	 *
	 * @param cellIndex
	 */
	[calculateCellWidth](cellIndex) {
		const self = this;
		let width = self.columns()[cellIndex].currentWidth || 0;

		if (cellIndex === 0 && self.columns()[0].type !== COLUMN_TYPES.CHECKBOX ||
			cellIndex === 1 && self.columns()[0].type === COLUMN_TYPES.CHECKBOX) {
			width -= self[INDENT_WIDTH];
		}

		return width + PIXELS;
	}

	/**
	 * Sets or removes the click events for the row.
	 */
	[setClickEvent]() {
		const self = this;
		const doSetClickEvent = Boolean(self.onSelect());

		self.classes(CLICKABLE_CLASS, doSetClickEvent);

		if (doSetClickEvent) {
			if (!self[IS_CLICK_EVENT_SET]) {
				self.on(CLICK_EVENT, (event) => {
						if (self.onSelect()) {
							self.isSelected(!self.isSelected());
							self.onSelect()(self.id(), self.isSelected(), false, event);
						}
					})
					.on(MOUSE_DOWN_EVENT, (event) => event.preventDefault());
				self[IS_CLICK_EVENT_SET] = true;
			}
		}
		else {
			self.off(CLICK_EVENT)
				.off(MOUSE_DOWN_EVENT);
			self[IS_CLICK_EVENT_SET] = false;
		}
	}

	[refresh]() {
		const self = this;

		self.classes('is-group-header', self[IS_GROUP_HEADER]);
		if (self[IS_GROUP_HEADER]) {
			self[renderGroupHeading]();
		}
		else {
			self[renderCells]();
		}
	}
}

Object.assign(GridRow.prototype, {
	/**
	 * Update the widths of all cells in this row to corresponding values stored in the Array "columns".
	 *
	 * @method updateWidth
	 * @memberOf GridRow
	 * @instance
	 * @param {number} availableWidth
	 * @returns {this}
	 */
	updateWidth(availableWidth) {
		const self = this;

		self[CURRENT_AVAILABLE_WIDTH] = availableWidth;
		self[resetRowWidth]();

		if (!self[IS_GROUP_HEADER]) {
			self[CELL_RECYCLER].each((cell, index) => {
				if (index < self.columns().length) {
					cell.width(self[calculateCellWidth](index));
				}
			});
		}

		return self;
	},

	/**
	 * @method rowData
	 * @memberOf GridRow
	 * @instance
	 * @param {boolean} newData
	 * @returns {boolean|this}
	 */
	rowData: methodObject({
		init: {},
		set(rowData) {
			const self = this;

			self[CELL_RECYCLER].each((cell) => {
				cell.rowData(rowData);
			});

			self[refresh]();
		}
	}),

	rowId: methodString({
		set(id) {
			this[IS_GROUP_HEADER] = !id;
			this[refresh]();
		}
	}),

	groupId: methodInteger({
		set(groupId) {
			this[IS_GROUP_HEADER] = groupId > 0;
			this[refresh]();
		}
	}),

	indentLevel: methodInteger({
		min: 0,
		set(indentLevel) {
			const self = this;

			self[INDENT_WIDTH] = indentLevel * COLUMN_GROUP_WIDTH;
			self.margin('0 0 0 ' + self[INDENT_WIDTH] + PIXELS);
			self[resetRowWidth]();
		}
	}),

	/**
	 * @method columns
	 * @memberOf GridRow
	 * @instance
	 * @param {object[]} newColumns
	 * @returns {this}
	 */
	columns: methodArray({
		set: refresh
	}),

	/**
	 * @method isSelected
	 * @memberOf GridRow
	 * @instance
	 * @param {boolean} newIsSelected
	 * @returns {boolean|this}
	 */
	isSelected: methodBoolean({
		set(isSelected) {
			this.classes('selected', isSelected);

			this[CELL_RECYCLER].each((cell) => {
				cell.isSelected(isSelected);
			});
		}
	}),

	/**
	 * @method isIndeterminate
	 * @memberOf GridRow
	 * @instance
	 * @param {boolean} newIsSelected
	 * @returns {boolean|this}
	 */
	isIndeterminate: methodBoolean({
		set(newValue) {
			if (this[GROUP_HEADING]) {
				this[GROUP_HEADING].isIndeterminate(newValue);
			}
		}
	}),

	onSelect: methodFunction({
		set: setClickEvent,
		other: undefined
	}),

	onSelectGroup: methodFunction({
		other: undefined
	}),

	onExpandCollapseGroup: methodFunction(),

	wordWrap: methodFunction()
});
