import {
	applySettings,
	AUTO,
	HUNDRED_PERCENT,
	methodArray,
	methodBoolean,
	methodFunction,
	methodQueue,
	PIXELS
} from 'type-enforcer-ui';
import Control from '../Control.js';
import controlTypes from '../controlTypes.js';
import VirtualList from '../layout/VirtualList.js';
import FocusMixin from '../mixins/FocusMixin.js';
import assign from '../utility/assign.js';
import locale from '../utility/locale.js';
import setDefaults from '../utility/setDefaults.js';
import './GridColumnBlock.less';
import GridHeader from './GridHeader.js';
import GridRow from './GridRow.js';

const GRID_HEADER = Symbol();
const VIRTUAL_LIST = Symbol();
const RENDERED_WIDTH = Symbol();

const updateRow = Symbol();

/**
 * Handles the view of the {@link Grid}.
 *
 * @class GridColumnBlock
 * @mixes FocusMixin
 * @extends Control
 *
 * @param {object} settings - Same settings as {@link Grid}
 */
export default class GridColumnBlock extends FocusMixin(Control) {
	constructor(settings = {}) {
		super(setDefaults({
			type: controlTypes.GRID_COLUMN_BLOCK
		}, settings, {
			FocusMixin: assign(settings.FocusMixin, {
				mainControl: new VirtualList({
					height: settings.isAutoHeight ? AUTO : HUNDRED_PERCENT,
					isFocusable: true,
					isVirtualized: settings.isVirtualized,
					emptyContentMessage: locale.get('noItemsToDisplay'),
					itemControl: GridRow,
					extraRenderedItemsRatio: 1,
					itemDefaultSettings: {
						wordWrap: settings.wordWrap,
						onSelect: settings.onSelect,
						onSelectGroup: settings.onSelectGroup,
						onExpandCollapseGroup: settings.onExpandCollapseGroup
					},
					onItemRender(rowControl, rowData) {
						self[updateRow](rowControl, rowData);
					},
					onNearEnd() {
						self.onNearBottom().trigger();
					}
				})
			})
		}));

		const self = this;
		self[RENDERED_WIDTH] = 0;
		self.classes('grid-column-block');

		self[GRID_HEADER] = new GridHeader({
			container: self.element,
			onSort: settings.onSort,
			onSelectAllGroups: settings.onSelectAllGroups,
			onFilter: settings.onFilter,
			onGetFilterData: settings.onGetFilterData,
			onColumnChange: settings.onColumnChange
		});

		self[VIRTUAL_LIST] = settings.FocusMixin.mainControl;
		self[VIRTUAL_LIST].container(self.element);

		applySettings(self, settings, [], ['rows']);

		self.onResize((width, height) => {
				if (self[GRID_HEADER]) {
					self[GRID_HEADER].scrollbarWidth(self[VIRTUAL_LIST].element.offsetWidth - self[VIRTUAL_LIST].element.clientWidth);
					self[RENDERED_WIDTH] = self[GRID_HEADER].desiredWidth(width);
					self[GRID_HEADER].width(self[RENDERED_WIDTH]);
					self[VIRTUAL_LIST].width(self[RENDERED_WIDTH]);

					self[VIRTUAL_LIST].getRenderedControls().forEach((rowControl) => {
						rowControl.columns(self[GRID_HEADER].columns());
						rowControl.updateWidth(self[RENDERED_WIDTH]);
					});

					if (self.height().isAuto) {
						self[VIRTUAL_LIST].height(AUTO);
					}
					else {
						self[VIRTUAL_LIST].height((height - self[GRID_HEADER].borderHeight()) + PIXELS);
					}
				}
			})
			.onRemove(() => {
				self[VIRTUAL_LIST].remove();
				self[VIRTUAL_LIST] = null;
				self[GRID_HEADER].remove();
				self[GRID_HEADER] = null;
			});
	}

	[updateRow](rowControl, rowData) {
		const self = this;

		rowControl
			.rowData(rowData)
			.rowId(rowData.id || '')
			.onSelect(self.onSelect())
			.isSelected(rowData.groupId ? false : rowData.isSelected || false)
			.isIndeterminate(rowData.isIndeterminate || false)
			.classes(rowData.classes || '')
			.updateWidth(self[RENDERED_WIDTH])
			.isEnabled(rowData.disabled || !(rowData.groupId && rowData.childCount === 0 && self.isFiltered()))
			.indentLevel(rowData.depth || 0)
			.groupId(rowData.groupId || 0)
			.columns(self[GRID_HEADER].columns() || {});
	}
}

Object.assign(GridColumnBlock.prototype, {
	/**
	 * @method columns
	 * @memberOf GridColumnBlock
	 * @instance
	 * @param {Array} [columns]
	 * @returns {Array|this}
	 */
	columns: methodArray({
		set(columns) {
			this[GRID_HEADER].columns(columns);
			this.resize(true);
		}
	}),

	/**
	 * @method selectableColumns
	 * @memberOf GridColumnBlock
	 * @instance
	 * @param {Array} [selectableColumns]
	 * @returns {Array|this}
	 */
	selectableColumns: methodArray({
		set(newValue) {
			this[GRID_HEADER].selectableColumns(newValue, true);
		}
	}),

	/**
	 * @method isAllRowsSelected
	 * @memberOf GridColumnBlock
	 * @instance
	 * @param {boolean} [isAllRowsSelected]
	 * @returns {boolean|this}
	 */
	isAllRowsSelected: methodBoolean({
		set(newValue) {
			this[GRID_HEADER].isAllRowsSelected(newValue);
		}
	}),

	/**
	 * @method isSomeRowsSelected
	 * @memberOf GridColumnBlock
	 * @instance
	 * @param {boolean} [isSomeRowsSelected]
	 * @returns {boolean|this}
	 */
	isSomeRowsSelected: methodBoolean({
		set(newValue) {
			this[GRID_HEADER].isSomeRowsSelected(newValue);
		}
	}),

	/**
	 * Delete all the rows currently displayed and build new ones. If no new rows are provided, show the empty contents
	 * message.
	 *
	 * @method rows
	 * @memberOf GridColumnBlock
	 * @instance
	 * @param {object} newRows - This is the final result of {@link Grid#sort}
	 */
	rows(newRows) {
		const self = this;

		self[VIRTUAL_LIST].itemData(newRows);
		self[GRID_HEADER].updateFilters();
		self.resize(true);

		return self;
	},

	/**
	 * Auto-scroll to a row.
	 *
	 * @method scrollToRowIndex
	 * @memberOf GridColumnBlock
	 * @instance
	 * @param {number} rowIndex - index of a row that is currently displayed
	 */
	scrollToRowIndex(rowIndex) {
		this[VIRTUAL_LIST].scrollToIndex(rowIndex);
	},

	/**
	 * @method isFiltered
	 * @memberOf GridColumnBlock
	 * @instance
	 * @param {boolean} [newIsFiltered]
	 * @returns {boolean|this}
	 */
	isFiltered: methodBoolean(),

	onSelect: methodFunction({
		set(onSelect) {
			this[VIRTUAL_LIST].getRenderedControls().forEach((control) => {
				control.onSelect(onSelect);
			});
		},
		other: undefined
	}),

	onNearBottom: methodQueue(),

	refresh() {
		this[VIRTUAL_LIST].getRenderedControls().forEach((control) => {
			control.refresh();
		});
	}
});
