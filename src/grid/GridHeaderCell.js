import { applySettings, methodArray, methodBoolean, methodEnum, methodFunction, methodString } from 'type-enforcer-ui';
import Control from '../Control.js';
import controlTypes from '../controlTypes.js';
import CheckBox from '../elements/CheckBox.js';
import Heading, { HEADING_LEVELS } from '../elements/Heading.js';
import Picker from '../forms/Picker.js';
import Tags from '../forms/Tags.js';
import TextInput from '../forms/TextInput.js';
import { NONE_ICON, SORT_AMOUNT_ASC_ICON, SORT_AMOUNT_DESC_ICON } from '../icons.js';
import ContextMenuMixin from '../mixins/ContextMenuMixin.js';
import { CLICK_EVENT, MARGIN_LEFT } from '../utility/domConstants.js';
import locale from '../utility/locale.js';
import setDefaults from '../utility/setDefaults.js';
import {
	COLUMN_TYPES,
	CONTEXT_MENU_COLUMN_PREFIX,
	CONTEXT_MENU_SORT_PREFIX,
	FILTER_TYPES,
	SORT_TYPES
} from './gridConstants.js';
import './GridHeaderCell.less';

const OR_SEPARATOR = ' OR ';

const HEADING = Symbol();
const FILTER_CONTROL = Symbol();
const FILTER_CONTROL_2 = Symbol();
const CHECKBOX = Symbol();
const IGNORE_EVENTS = Symbol();
const DO_SORT_CALLBACK = Symbol();

const buildDropDownFilter = Symbol();
const buildAutoCompleteFilter = Symbol();
const setFilterValue = Symbol();
const buildNumberFilter = Symbol();
const setNumberFilterValue = Symbol();
const applyOrFilter = Symbol();
const applyMinMaxFilter = Symbol();
const addCheckBox = Symbol();
const setCheckBoxValue = Symbol();
const setContextMenu = Symbol();
const onContextMenuChange = Symbol();
const removeControls = Symbol();

/**
 * Handles the layout of a single grid header cell control
 *
 * @class GridHeaderCell
 * @mixes ContextMenuMixin
 * @extends Control
 *
 * @param {object} settings
 */
export default class GridHeaderCell extends ContextMenuMixin(Control) {
	constructor(settings = {}) {
		super(setDefaults({
			type: controlTypes.GRID_HEADER_CELL
		}, settings));

		const self = this;
		self[IGNORE_EVENTS] = false;
		self[DO_SORT_CALLBACK] = false;

		self.addClass('grid-header-cell');

		self[HEADING] = new Heading({
			container: self,
			level: HEADING_LEVELS.FIVE,
			canWrap: true
		});

		applySettings(self, settings, [], ['filter']);

		if (self.selectableColumns().length === 0) {
			self[setContextMenu]();
		}

		self.onContextMenuChange((itemId) => self[onContextMenuChange](itemId));

		self.onResize(() => {
			let newWidth;

			if (self[FILTER_CONTROL]) {
				if (self.dataType() === COLUMN_TYPES.NUMBER) {
					newWidth = Math.floor((self.innerWidth() - 6) / 2);
					self[FILTER_CONTROL].width(newWidth);
					self[FILTER_CONTROL_2]
						.width(newWidth)
						.css(MARGIN_LEFT, 4);
				}
				else {
					self[FILTER_CONTROL].resize();
				}
			}
		});
	}

	/**
	 * Build a picker control and add it to the cell
	 *
	 * @function buildDropDownFilter
	 */
	[buildDropDownFilter]() {
		const self = this;

		self[FILTER_CONTROL] = new Picker({
			container: self.element,
			defaultButtonText: locale.get('filter'),
			canSelectAll: true,
			onChange(newValue) {
				self[applyOrFilter](newValue.map((item) => item.id));
			}
		});

		self.updateFilter();
		self[setFilterValue]();
	}

	/**
	 * Build a tag control and add it to the cell
	 *
	 * @function buildAutoCompleteFilter
	 */
	[buildAutoCompleteFilter]() {
		const self = this;

		self[FILTER_CONTROL] = new Tags({
			container: self.element,
			onChange(newValue) {
				if (!self[IGNORE_EVENTS]) {
					self[applyOrFilter](newValue);
				}
			},
			placeholder: locale.get('filter')
		});
		self.updateFilter();
		self[setFilterValue]();
	}

	[setFilterValue]() {
		const self = this;

		self[IGNORE_EVENTS] = true;
		self[FILTER_CONTROL].value(self.filter().split(OR_SEPARATOR));
		self[IGNORE_EVENTS] = false;
	}

	/**
	 * Build two text controls for min and max and add it to the cell
	 *
	 * @function buildNumberFilter
	 */
	[buildNumberFilter]() {
		const self = this;

		self[FILTER_CONTROL] = new TextInput({
			container: self.element,
			placeholder: 'min',
			width: '3rem',
			onChange() {
				self[applyMinMaxFilter]();
			}
		});
		self[FILTER_CONTROL_2] = new TextInput({
			container: self.element,
			placeholder: 'max',
			width: '3rem',
			onChange() {
				self[applyMinMaxFilter]();
			}
		});
		self[setNumberFilterValue](self.filter());
	}

	[setNumberFilterValue](value) {
		const self = this;
		const getNumericValue = (value) => (value && value !== 'undefined') ? value : '';

		value = value.split(',');

		self[FILTER_CONTROL].value(getNumericValue(value[0]));
		self[FILTER_CONTROL_2].value(getNumericValue(value[1]));
	}

	/**
	 * Apply a filter to the grid
	 *
	 * @param values
	 */
	[applyOrFilter](values) {
		const self = this;

		self.filter(values.join(OR_SEPARATOR), self.id(), self.dataType());
	}

	[applyMinMaxFilter]() {
		const self = this;

		if (self[FILTER_CONTROL].value() || self[FILTER_CONTROL_2].value()) {
			self.filter(self[FILTER_CONTROL].value() + ',' + self[FILTER_CONTROL_2].value());
		}
		else {
			self.filter('');
		}
	}

	/**
	 * Build a checkbox and add it to the cell
	 *
	 * @function addCheckBox
	 */
	[addCheckBox]() {
		const self = this;

		self[CHECKBOX] = new CheckBox({
			container: self.element,
			width: '1rem',
			stopPropagation: true,
			onChange(isChecked) {
				if (!self[IGNORE_EVENTS] && self.onSelect()) {
					self.onSelect()(isChecked);
				}
			}
		});
		self[setCheckBoxValue]();
	}

	[setCheckBoxValue]() {
		const self = this;

		self[IGNORE_EVENTS] = true;
		if (self.dataType() === COLUMN_TYPES.CHECKBOX) {
			if (self.isSomeRowsSelected()) {
				self[CHECKBOX].isIndeterminate(true);
			}
			else {
				self[CHECKBOX].isChecked(self.isAllRowsSelected(), true);
			}
		}
		self[IGNORE_EVENTS] = false;
	}

	/**
	 * Build the context menu for this cell.
	 *
	 * @function setContextMenu
	 */
	[setContextMenu]() {
		const self = this;
		let menuOptions = [];

		if (self.canSort()) {
			menuOptions = [{
				id: CONTEXT_MENU_SORT_PREFIX + SORT_TYPES.ASC,
				title: 'Sort ' + self.title() + ' ascending',
				icon: SORT_AMOUNT_ASC_ICON,
				isSelectable: false,
				classes: ''
			}, {
				id: CONTEXT_MENU_SORT_PREFIX + SORT_TYPES.DESC,
				title: 'Sort ' + self.title() + ' descending',
				icon: SORT_AMOUNT_DESC_ICON,
				isSelectable: false,
				classes: ''
			}, {
				id: CONTEXT_MENU_SORT_PREFIX + SORT_TYPES.NONE,
				title: 'No sort',
				icon: NONE_ICON,
				isSelectable: false,
				classes: self.selectableColumns().length ? 'separator' : ''
			}];
		}

		menuOptions = menuOptions.concat(self.selectableColumns()
			.map((column) => !column.title ? null : {
				id: CONTEXT_MENU_COLUMN_PREFIX + column.id,
				title: column.title,
				isSelectable: true,
				isSelected: !column.isHidden,
				classes: '',
				keepMenuOpen: true
			})
			.filter(Boolean));

		self.contextMenu(menuOptions);
	}

	[onContextMenuChange](itemId) {
		const self = this;

		if (itemId.includes(CONTEXT_MENU_SORT_PREFIX)) {
			itemId = itemId.replace(CONTEXT_MENU_SORT_PREFIX, '');
			self.sortDirection(itemId);
		}
		else {
			itemId = itemId.replace(CONTEXT_MENU_COLUMN_PREFIX, '');
			self.onColumnChange()(itemId);
		}
	}

	[removeControls]() {
		const self = this;

		if (self[CHECKBOX]) {
			self[CHECKBOX].remove();
			self[CHECKBOX] = null;
		}
		if (self[FILTER_CONTROL]) {
			self[FILTER_CONTROL].remove();
			self[FILTER_CONTROL] = null;
		}
		if (self[FILTER_CONTROL_2]) {
			self[FILTER_CONTROL_2].remove();
			self[FILTER_CONTROL_2] = null;
		}
	}
}

Object.assign(GridHeaderCell.prototype, {
	/**
	 * @method title
	 * @memberOf GridHeaderCell
	 * @instance
	 *
	 * @param {string} [title]
	 *
	 * @returns {string|this}
	 */
	title: methodString({
		set(title) {
			this[HEADING].title(title);
		}
	}),

	/**
	 * @method dataType
	 * @memberOf GridHeaderCell
	 * @instance
	 * @param {string} [dataType]
	 * @returns {string|this}
	 */
	dataType: methodEnum({
		init: COLUMN_TYPES.NONE,
		enum: COLUMN_TYPES,
		set(newValue) {
			const self = this;

			self[removeControls]();

			if (newValue === COLUMN_TYPES.CHECKBOX) {
				self[HEADING].isDisplayed(false);
				self[addCheckBox]();
			}
			else {
				self[HEADING].isDisplayed(true);
			}

			self.classes('checkbox-cell', newValue === COLUMN_TYPES.CHECKBOX);
		}
	}),

	/**
	 * @method canSort
	 * @memberOf GridHeaderCell
	 * @instance
	 * @param {boolean} [canSort]
	 * @returns {boolean|this}
	 */
	canSort: methodBoolean({
		set(canSort) {
			const self = this;

			self[HEADING]
				.set(CLICK_EVENT, () => {
					self[DO_SORT_CALLBACK] = true;
					switch (self.sortDirection()) {
						case SORT_TYPES.NONE:
							self.sortDirection(SORT_TYPES.ASC);
							break;
						case SORT_TYPES.ASC:
							self.sortDirection(SORT_TYPES.DESC);
							break;
						default:
							self.sortDirection(SORT_TYPES.NONE);
							break;
					}
					self[DO_SORT_CALLBACK] = false;
				}, canSort)
				.classes('sortable', canSort);
		}
	}),

	/**
	 * @method sortDirection
	 * @memberOf GridHeaderCell
	 * @instance
	 * @param {string} [sortDirection]
	 * @returns {string|this}
	 */
	sortDirection: methodEnum({
		init: SORT_TYPES.NONE,
		enum: SORT_TYPES,
		set(sortDirection) {
			const self = this;

			self[HEADING].classes('sort-asc', self.canSort() && sortDirection === SORT_TYPES.ASC)
				.classes('sort-desc', self.canSort() && sortDirection === SORT_TYPES.DESC);

			if (self[DO_SORT_CALLBACK] && self.onSort()) {
				self.onSort()(self);
			}
		}
	}),

	/**
	 * @method filterType
	 * @memberOf GridHeaderCell
	 * @instance
	 * @param {string} [filterType]
	 * @returns {string|this}
	 */
	filterType: methodEnum({
		init: FILTER_TYPES.NONE,
		enum: FILTER_TYPES,
		set(filterType) {
			const self = this;

			self[removeControls]();

			switch (filterType) {
				case FILTER_TYPES.AUTO_COMPLETE:
					self[buildAutoCompleteFilter]();
					break;
				case FILTER_TYPES.NUMBER:
					self[buildNumberFilter]();
					break;
				case FILTER_TYPES.DROPDOWN:
				case FILTER_TYPES.DATE:
					self[buildDropDownFilter]();
					break;
			}
		}
	}),

	/**
	 * @method filter
	 * @memberOf GridHeaderCell
	 * @instance
	 * @param {string} [filter]
	 * @returns {string|this}
	 */
	filter: methodString({
		set(newValue) {
			const self = this;

			if (self[FILTER_CONTROL]) {
				self[IGNORE_EVENTS] = true;
				if (self.filterType() === FILTER_TYPES.NUMBER) {
					self[setNumberFilterValue](newValue);
				}
				else {
					self[setFilterValue](newValue);
				}
				self[IGNORE_EVENTS] = false;
			}

			if (self.onFilter()) {
				self.onFilter()(newValue, self.id());
			}
		}
	}),

	/**
	 * @method selectableColumns
	 * @memberOf GridHeaderCell
	 * @instance
	 * @param {Array} [selectableColumns]
	 * @returns {Array|this}
	 */
	selectableColumns: methodArray({
		set: setContextMenu
	}),

	/**
	 * @method isAllRowsSelected
	 * @memberOf GridHeaderCell
	 * @instance
	 * @param {boolean} [isAllRowsSelected]
	 * @returns {boolean|this}
	 */
	isAllRowsSelected: methodBoolean({
		set: setCheckBoxValue
	}),

	/**
	 * @method isSomeRowsSelected
	 * @memberOf GridHeaderCell
	 * @instance
	 * @param {boolean} [isSomeRowsSelected]
	 * @returns {boolean|this}
	 */
	isSomeRowsSelected: methodBoolean({
		set: setCheckBoxValue
	}),

	onGetFilterOptions: methodFunction(),

	onColumnChange: methodFunction(),

	onSort: methodFunction(),

	onFilter: methodFunction(),

	onSelect: methodFunction(),

	updateFilter() {
		const self = this;

		if (self.onGetFilterOptions() && self[FILTER_CONTROL]) {
			switch (self.filterType()) {
				case FILTER_TYPES.AUTO_COMPLETE:
					self.onGetFilterOptions()(self.filterType(), self.id(), (items) => {
						self[FILTER_CONTROL].suggestions(items.reduce((result, value) => {
							return result.concat(value.split(' '));
						}, []));
					});
					break;
				case FILTER_TYPES.DROPDOWN:
				case FILTER_TYPES.DATE:
					self.onGetFilterOptions()(self.filterType(), self.id(), (items) => {
						self[FILTER_CONTROL].options({
							isMultiSelect: self.filterType() !== FILTER_TYPES.DATE,
							children: items
						});
					});
					break;
			}
		}
	}
});
