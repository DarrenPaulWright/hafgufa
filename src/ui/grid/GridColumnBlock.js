import { applySettings, AUTO, HUNDRED_PERCENT, method, PIXELS } from 'type-enforcer';
import dom from '../../utility/dom';
import Control from '../Control';
import controlTypes from '../controlTypes';
import VirtualList from '../layout/VirtualList';
import './GridColumnBlock.less';
import GridHeader from './GridHeader';
import GridRow from './GridRow';

const GRID_HEADER = Symbol();
const VIRTUAL_LIST = Symbol();
const RENDERED_WIDTH = Symbol();

const updateRow = Symbol();

/**
 * Handles the view of the {@link module:Grid}.
 *
 * @module GridColumnBlock
 * @constructor
 *
 * @arg {Object} settings - Same settings as {@link module:Grid}
 */
export default class GridColumnBlock extends Control {
	constructor(settings = {}) {
		settings.type = settings.type || controlTypes.GRID_COLUMN_BLOCK;
		settings.rows = settings.rows || {};

		super(settings);

		const self = this;
		self[RENDERED_WIDTH] = 0;
		self.classes('grid-column-block');
		self.areRowsSelectable(Boolean(settings.rows.onClick || settings.rows.isSelectable || settings.rows.onMultiSelect));

		self[GRID_HEADER] = new GridHeader({
			container: self.element(),
			onSort: settings.onSort,
			onSelectAllGroups: settings.onSelectAllGroups,
			onFilter: settings.onFilter,
			onGetFilterData: settings.onGetFilterData,
			onColumnChange: settings.onColumnChange
		});

		self[VIRTUAL_LIST] = new VirtualList({
			container: self.element(),
			height: settings.isAutoHeight ? AUTO : HUNDRED_PERCENT,
			isVirtualized: settings.isVirtualized,
			itemSize: settings.rows.height || null,
			emptyContentMessage: settings.noItemsText || 'No items to display',
			itemControl: GridRow,
			extraRenderedItemsRatio: 1,
			itemDefaultSettings: {
				onClick: settings.rows.onClick,
				onMouseEnter: settings.rows.onMouseEnter,
				onMouseLeave: settings.rows.onMouseLeave,
				wordWrap: settings.wordWrap,
				onSelectRow: settings.onSelectRow,
				onSelectGroup: settings.onSelectGroup,
				onExpandCollapseGroup: settings.onExpandCollapseGroup
			},
			onItemRender(rowControl, rowData) {
				self[updateRow](rowControl, rowData);
			}
		});

		applySettings(self, settings);

		self.onResize(() => {
			self[GRID_HEADER].scrollbarWidth(dom.get.scrollbar.width(self[VIRTUAL_LIST]));
			self[RENDERED_WIDTH] = self[GRID_HEADER].desiredWidth(self.borderWidth());
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
				self[VIRTUAL_LIST].height((self.height() - self[GRID_HEADER].height()) + PIXELS);
			}
		}, true);

		self.onRemove(() => {
			self[VIRTUAL_LIST].remove();
			self[VIRTUAL_LIST] = null;
			self[GRID_HEADER].remove();
			self[GRID_HEADER] = null;
		});
	}

	[updateRow](rowControl, rowData) {
		const self = this;

		rowControl.data(rowData);
		rowControl
			.isSelectable(self.areRowsSelectable())
			.isSelected(rowData.isSelected || false)
			.isIndeterminate(rowData.isIndeterminate || false)
			.classes(rowData.classes || '')
			.updateWidth(self[RENDERED_WIDTH])
			.isEnabled(!(rowData.groupId && rowData.childCount === 0 && self.isFiltered()))
			.columns(self[GRID_HEADER].columns() || {});
	}
}

Object.assign(GridColumnBlock.prototype, {
	/**
	 * @method columns
	 * @member module:GridColumnBlock
	 * @instance
	 * @arg {Array} [columns]
	 * @returns {Array|this}
	 */
	columns: method.array({
		set(columns) {
			this[GRID_HEADER].columns(columns);
			this.resize();
		}
	}),

	/**
	 * @method selectableColumns
	 * @member module:GridColumnBlock
	 * @instance
	 * @arg {Array} [selectableColumns]
	 * @returns {Array|this}
	 */
	selectableColumns: method.array({
		set(newValue) {
			this[GRID_HEADER].selectableColumns(newValue, true);
		}
	}),

	/**
	 * @method isAllRowsSelected
	 * @member module:GridColumnBlock
	 * @instance
	 * @arg {Boolean} [isAllRowsSelected]
	 * @returns {Boolean|this}
	 */
	isAllRowsSelected: method.boolean({
		set(newValue) {
			this[GRID_HEADER].isAllRowsSelected(newValue);
		}
	}),

	/**
	 * @method isSomeRowsSelected
	 * @member module:GridColumnBlock
	 * @instance
	 * @arg {Boolean} [isSomeRowsSelected]
	 * @returns {Boolean|this}
	 */
	isSomeRowsSelected: method.boolean({
		set(newValue) {
			this[GRID_HEADER].isSomeRowsSelected(newValue);
		}
	}),

	/**
	 * Delete all the rows currently displayed and build new ones. If no new rows are provided, show the empty contents
	 * message.
	 * @method renderRows
	 * @member module:GridColumnBlock
	 * @instance
	 * @arg {Object} newRows - This is the final result of {@link module:Grid#sort}
	 */
	renderRows(newRows) {
		const self = this;

		self[VIRTUAL_LIST].itemData(newRows);
		self[GRID_HEADER].updateFilters();

		return self;
	},

	/**
	 * Auto-scroll to a row.
	 * @method scrollToRowIndex
	 * @member module:GridColumnBlock
	 * @instance
	 * @arg {Number} rowIndex - index of a row that is currently displayed
	 */
	scrollToRowIndex(rowIndex) {
		this[VIRTUAL_LIST].scrollToIndex(rowIndex);
	},

	/**
	 * @method isFiltered
	 * @member module:GridColumnBlock
	 * @instance
	 * @arg {Boolean} [newIsFiltered]
	 * @returns {Boolean|this}
	 */
	isFiltered: method.boolean(),

	areRowsSelectable: method.boolean()
});
