import keyCodes from 'keycodes';
import {
	applySettings,
	AUTO,
	DockPoint,
	enforceBoolean,
	enforceEnum,
	enforceString,
	HUNDRED_PERCENT,
	isArray,
	method
} from 'type-enforcer-ui';
import uuid from 'uuid/v4';
import controlTypes from '../controlTypes';
import CheckBox from '../elements/CheckBox';
import Div from '../elements/Div';
import TextInput from '../forms/TextInput';
import Tree from '../forms/Tree';
import { ADD_ICON, DELETE_ICON, EDIT_ICON } from '../icons';
import Popup from '../layout/Popup';
import { KEY_DOWN_EVENT } from '../utility/domConstants';
import locale from '../utility/locale';
import search from '../utility/search';
import { filteredTitle } from '../utility/sortBy';
import './Menu.less';

const MAX_POPUP_HEIGHT = 600;
const MIN_POPUP_WIDTH = 140;
const MAX_POPUP_WIDTH = 600;

const eachChild = function(collection, onEachChild, settings = {}) {
	let isCancelled = false;
	const childProperty = enforceString(settings.childProperty, 'children');
	let returnValue;

	const each = (innerCollection, depth, parent) => {
		if (isArray(innerCollection)) {
			for (let index = 0, length = innerCollection.length; index < length; index++) {
				isCancelled = each(innerCollection[index], depth, parent);
				if (isCancelled === false) {
					break;
				}
			}
			return isCancelled;
		}
		else {
			if (innerCollection && innerCollection[childProperty]) {
				returnValue = each(innerCollection[childProperty], depth + 1, innerCollection);
				if (settings.onEachParent) {
					settings.onEachParent(innerCollection, depth);
				}
				return returnValue;
			}
			else {
				return onEachChild(innerCollection, depth, parent);
			}
		}
	};

	each(collection, 0);
};

const MENU_CLASS = 'menu';
const FILTER_CONTAINER_CLASS = 'popup-header';
const HEADER_ID = 'menuHeaderId';
const TREE_ID = 'menuTreeId';
const FILTER_ID = 'menuFilterId';
const SELECTED_ONLY_ID = 'menuSelectedOnlyId';
const SELECT_ALL_ID = 'selectAllId';
const SELECT_ALL_VALUE = 'selectAll';

const buildHeader = Symbol();
const setRowCount = Symbol();
const setAddButton = Symbol();
const addItemButtons = Symbol();
const getFilteredContent = Symbol();
const filterItems = Symbol();
let currentMenu;

const HAS_IDENTICAL_FILTERED_ITEM = Symbol();
const ARE_ALL_SELECTED = Symbol();

/**
 * Builds a menu in a popup
 *
 * @class Menu
 * @extends Popup
 * @constructor
 *
 * @param {Object} settings
 */
export default class Menu extends Popup {
	constructor(settings = {}) {
		if (currentMenu) {
			currentMenu.remove();
		}

		let tree = new Tree({
			id: TREE_ID,
			width: AUTO
		});

		settings = {
			type: controlTypes.MENU,
			anchor: Popup.MOUSE,
			maxHeight: MAX_POPUP_HEIGHT,
			minWidth: MIN_POPUP_WIDTH,
			maxWidth: MAX_POPUP_WIDTH,
			...settings,
			anchorDockPoint: enforceEnum(settings.anchorDockPoint, DockPoint.POINTS, DockPoint.POINTS.BOTTOM_RIGHT),
			popupDockPoint: enforceEnum(settings.popupDockPoint, DockPoint.POINTS, DockPoint.POINTS.TOP_LEFT),
			canTrackMouse: enforceBoolean(settings.canTrackMouse, false),
			hideOnEscapeKey: enforceBoolean(settings.hideOnEscapeKey, true),
			FocusMixin: {
				mainControl: tree
			}
		};

		super(settings);

		const self = this;
		self.addClass(MENU_CLASS);
		self.width(AUTO);

		currentMenu = self;

		applySettings(tree, {
			onSelect(item) {
				if (self.onSelect()) {
					self.onSelect()(item);
				}
				item = self.menuItems().find((menuItem) => menuItem.id === item);
				if (!item || !(settings.keepMenuOpen || item.keepMenuOpen)) {
					self.remove();
				}
			},
			emptyContentMessage: locale.get('noMatchingItems'),
			maxHeight: settings.maxHeight,
			minWidth: settings.minWidth,
			maxWidth: settings.maxWidth,
			isMultiSelect: self.isMultiSelect(),
			onLayoutChange() {
				self.resize(true);
			}
		});

		self.content(tree)
			.onResize(() => {
				self
					.width(self.get(TREE_ID).borderWidth())
					.css('height', 'auto')
					.get(TREE_ID)
					.fitHeightToContents()
					.height(self.borderHeight() - (self.get(HEADER_ID) ? self.get(HEADER_ID).borderHeight() : 0))
					.resize(true);
			});
		tree = null;

		applySettings(self, settings);

		if (self.canFilter()) {
			self.get(FILTER_ID).isFocused(true);
		}
		else {
			self.get(TREE_ID).isFocused(true);
		}

		self.onRemove(() => {
			currentMenu = null;
		});
	}

	[buildHeader]() {
		if (!this.get(HEADER_ID)) {
			this.prepend({
				id: HEADER_ID,
				control: Div,
				classes: FILTER_CONTAINER_CLASS
			});
		}
	}

	[setRowCount](renderedRowCount) {
		const self = this;
		let countText = self.menuItems().length;

		if (countText !== renderedRowCount) {
			countText = renderedRowCount + '/' + countText;
		}

		if (self.canFilter() && !self.isRemoved) {
			self.get(FILTER_ID)
				.countText(countText + '')
				.isActionButtonEnabled(self.currentFilter() && !self[HAS_IDENTICAL_FILTERED_ITEM]);
		}
	}

	[setAddButton]() {
		const self = this;

		if (self.onAdd()) {
			self.get(FILTER_ID)
				.actionButtonIcon(ADD_ICON)
				.actionButtonLabel(locale.get('add'))
				.actionButtonOnClick(() => {
					self.onAdd()(self.currentFilter());
				});
		}
	}

	[addItemButtons](item) {
		const self = this;

		item.buttons = [];

		if (self.onEdit()) {
			item.data = {
				id: item.id,
				title: item.title
			};
			item.buttons.push({
				icon: EDIT_ICON,
				alt: locale.get('edit'),
				onClick(data) {
					self.onEdit()(data);
				}
			});
		}

		if (self.onDelete()) {
			item.data = {
				id: item.id,
				title: item.title
			};
			item.buttons.push({
				icon: DELETE_ICON,
				alt: locale.get('delete'),
				onClick(data) {
					self.onDelete()(data);
				}
			});
		}
	}

	[getFilteredContent](items) {
		const self = this;
		let filterString;
		const currentFilter = self.currentFilter();

		items = items.filter((item) => {
			if (item.children) {
				item.children = self[getFilteredContent](item.children);
				if (item.children.length) {
					return true;
				}
			}
			else {
				filterString = item.title;
				if (item.subTitle) {
					filterString += ' ' + item.subTitle;
				}

				if (currentFilter && item.title.toLowerCase() === currentFilter.toLowerCase()) {
					self[HAS_IDENTICAL_FILTERED_ITEM] = true;
				}

				if (!item.isSelected) {
					self[ARE_ALL_SELECTED] = false;
				}

				if (search.find(currentFilter, filterString)) {
					if (!self.isFilteredSelectedOnly() || item.isSelected) {
						self[addItemButtons](item);

						return true;
					}
				}
			}

			return false;
		});

		if (currentFilter) {
			filteredTitle(items, currentFilter);
		}

		return items;
	}

	[filterItems]() {
		const self = this;

		self[HAS_IDENTICAL_FILTERED_ITEM] = false;
		self[ARE_ALL_SELECTED] = true;

		let menuItems = self[getFilteredContent](self.menuItems());

		self.get(TREE_ID)
			.branches(menuItems)
			.value(menuItems.map((item) => item.isSelected ? item.id : null).filter(Boolean));

		if (self.canSelectAll()) {
			self.get(SELECT_ALL_ID).value(self[ARE_ALL_SELECTED] ? SELECT_ALL_VALUE : '');
		}

		self.resize(true);

		self[setRowCount](menuItems.length);
	}
}

Object.assign(Menu.prototype, {
	onSelect: method.function(),

	menuItems: method.array({
		enforce(newValue, oldValue) {
			if (!isArray(newValue)) {
				return oldValue;
			}

			newValue.forEach((value) => {
				if (!value.id) {
					value.id = uuid();
				}
			});

			return newValue;
		},
		set: filterItems
	}),

	isMultiSelect: method.boolean({
		set(isMultiSelect) {
			if (this.get(TREE_ID)) {
				this.get(TREE_ID).isMultiSelect(isMultiSelect);
			}
		}
	}),

	canFilter: method.boolean({
		set(canFilter) {
			const self = this;

			if (canFilter) {
				self[buildHeader]();

				self.get(HEADER_ID).prepend({
					id: FILTER_ID,
					control: TextInput,
					width: HUNDRED_PERCENT,
					placeholder: locale.get('filter'),
					value: self.currentFilter(),
					onChange(newValue) {
						self.currentFilter(newValue);
					}
				});

				self.get(FILTER_ID)
					.on(KEY_DOWN_EVENT, (event) => {
						if (event.keyCode === keyCodes('down')) {
							event.preventDefault();
							self.get(TREE_ID).isFocused(true);
						}
					});

				self[setAddButton]();
				self[setRowCount](self.menuItems().length);
				self.resize(true);
			}
		}
	}),

	currentFilter: method.string({
		set(currentFilter) {
			if (this.canFilter()) {
				this.get(FILTER_ID)
					.value(currentFilter);
			}
			this[filterItems]();
		}
	}),

	canFilterSelectedOnly: method.boolean({
		set(canFilterSelectedOnly) {
			const self = this;

			if (canFilterSelectedOnly) {
				self[buildHeader]();

				self.get(HEADER_ID).append({
					id: SELECTED_ONLY_ID,
					control: CheckBox,
					width: HUNDRED_PERCENT,
					isChecked: self.isFilteredSelectedOnly(),
					onChange(isChecked) {
						self.isFilteredSelectedOnly(isChecked);
					},
					content: locale.get('showSelectedItems')
				});

				self.resize(true);
			}
		}
	}),

	isFilteredSelectedOnly: method.boolean({
		set(isFilteredSelectedOnly) {
			if (this.canFilterSelectedOnly()) {
				this.get(SELECTED_ONLY_ID)
					.isChecked(isFilteredSelectedOnly);
			}
			this[filterItems]();
		}
	}),

	canSelectAll: method.boolean({
		set(canSelectAll) {
			const self = this;

			if (canSelectAll) {
				self[buildHeader]();

				self.get(HEADER_ID).append({
					id: SELECT_ALL_ID,
					control: CheckBox,
					width: HUNDRED_PERCENT,
					isChecked: self[ARE_ALL_SELECTED],
					onChange(isChecked) {
						const changedItems = [];

						eachChild(self.menuItems(), (item) => {
							if (item.isSelectable && item.isSelected !== isChecked) {
								item.isSelected = isChecked;
								changedItems.push(item.id);
							}
						});

						if (changedItems.length && self.onSelect()) {
							self.onSelect()(changedItems);
						}

						self[filterItems]();
					},
					content: locale.get('selectAll')
				});

				self.resize(true);
			}
		}
	}),

	onAdd: method.function({
		set() {
			this.canFilter(true);
			this[setAddButton]();
		}
	}),

	onEdit: method.function(),

	onDelete: method.function()
});
