import { event } from 'd3';
import keyCodes from 'keyCodes';
import { AUTO, DockPoint, enforce, HUNDRED_PERCENT, isArray, method } from 'type-enforcer';
import uuid from 'uuid/v4';
import dom from '../../utility/dom';
import { KEY_DOWN_EVENT } from '../../utility/domConstants';
import objectHelper from '../../utility/objectHelper';
import { filteredTitle } from '../../utility/sortBy';
import stringHelper from '../../utility/stringHelper';
import controlTypes from '../controlTypes';
import CheckBox from '../elements/CheckBox';
import TextInput from '../forms/TextInput';
import Tree from '../forms/Tree';
import { ADD_ICON, DELETE_ICON, EDIT_ICON } from '../icons';
import Container from '../layout/Container';
import Popup from '../layout/Popup';
import './Menu.less';

const MAX_POPUP_HEIGHT = 600;
const MIN_POPUP_WIDTH = 140;
const MAX_POPUP_WIDTH = 600;

const eachChild = function(collection, onEachChild, settings = {}) {
	let isCancelled = false;
	const childProperty = enforce.string(settings.childProperty, 'children');
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
const HEADER_ID = 'menuHeaderID';
const TREE_ID = 'menuTreeID';
const FILTER_ID = 'menuFilterID';
const SELECTED_ONLY_ID = 'menuSelectedOnlyID';
const SELECT_ALL_ID = 'selectAllID';
const SELECT_ALL_VALUE = 'selectAll';

const buildHeader = Symbol();
const setRowCount = Symbol();
const setAddButton = Symbol();
const addItemButtons = Symbol();
const getFilteredContent = Symbol();
const filterItems = Symbol();

const STRINGS = Symbol();
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
		let tree = new Tree({
			ID: TREE_ID,
			width: AUTO
		});

		settings = Object.assign({
			type: controlTypes.MENU,
			anchor: Popup.MOUSE,
			maxHeight: MAX_POPUP_HEIGHT,
			minWidth: MIN_POPUP_WIDTH,
			maxWidth: MAX_POPUP_WIDTH
		}, settings, {
			anchorDockPoint: enforce.enum(settings.anchorDockPoint, DockPoint.POINTS, DockPoint.POINTS.BOTTOM_RIGHT),
			popupDockPoint: enforce.enum(settings.popupDockPoint, DockPoint.POINTS, DockPoint.POINTS.TOP_LEFT),
			canTrackMouse: enforce.boolean(settings.canTrackMouse, false),
			hideOnEscapeKey: enforce.boolean(settings.hideOnEscapeKey, true),
			focusMixin: {
				mainControl: tree
			}
		});

		super(settings);

		const self = this;
		self[STRINGS] = settings.localizedStrings || {};
		self.addClass(MENU_CLASS);
		self.width(AUTO);

		objectHelper.applySettings(tree, {
			onSelect: (item) => {
				if (self.onSelect()) {
					self.onSelect()(item);
				}
				item = self.menuItems().find((menuItem) => menuItem.ID === item);
				if (!item || !(settings.keepMenuOpen || item.keepMenuOpen)) {
					self.remove();
				}
			},
			emptyContentMessage: self[STRINGS].noMatchingItems,
			maxHeight: self.maxHeight(),
			minWidth: self.minWidth(),
			maxWidth: self.maxWidth(),
			isMultiSelect: self.isMultiSelect(),
			onLayoutChange: () => {
				self.resize(true);
			},
			onRemove: () => {
				self[STRINGS] = null;
			}
		});

		self.content(tree);
		tree = null;

		self.onResize(() => {
			self
				.width(self.get(TREE_ID).borderWidth())
				.get(TREE_ID)
				.fitHeightToContents()
				.height(self.borderHeight() - (self.get(HEADER_ID) ? dom.get.height(self.get(HEADER_ID)) : 0));
		});

		objectHelper.applySettings(self, settings);

		if (self.canFilter()) {
			self.get(FILTER_ID).focus();
		}
		else {
			self.get(TREE_ID).focus();
		}
	}

	[buildHeader]() {
		if (!this.get(HEADER_ID)) {
			this.prepend({
				ID: HEADER_ID,
				control: Container,
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
				.actionButtonLabel(self[STRINGS].add)
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
				ID: item.ID,
				title: item.title
			};
			item.buttons.push({
				icon: EDIT_ICON,
				alt: self[STRINGS].edit,
				onClick: (data) => {
					self.onEdit()(data);
				}
			});
		}

		if (self.onDelete()) {
			item.data = {
				ID: item.ID,
				title: item.title
			};
			item.buttons.push({
				icon: DELETE_ICON,
				alt: self[STRINGS].delete,
				onClick: (data) => {
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

				if (stringHelper.isEachInString(currentFilter, filterString)) {
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
			.value(menuItems.map((item) => item.isSelected ? item.ID : null).filter(Boolean));

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
		enforce: function(newValue, oldValue) {
			if (!isArray(newValue)) {
				return oldValue;
			}

			newValue.forEach((value) => {
				if (!value.ID) {
					value.ID = uuid();
				}
			});

			return newValue;
		},
		set: function() {
			this[filterItems]();
		}
	}),

	isMultiSelect: method.boolean({
		set: function(isMultiSelect) {
			if (this.get(TREE_ID)) {
				this.get(TREE_ID).isMultiSelect(isMultiSelect);
			}
		}
	}),

	canFilter: method.boolean({
		set: function(canFilter) {
			const self = this;

			if (canFilter) {
				self[buildHeader]();

				self.get(HEADER_ID).prepend({
					ID: FILTER_ID,
					control: TextInput,
					width: HUNDRED_PERCENT,
					placeholder: self[STRINGS].filter,
					value: self.currentFilter(),
					onChange: (newValue) => {
						self.currentFilter(newValue.value);
					}
				});

				self.get(FILTER_ID)
					.on(KEY_DOWN_EVENT, () => {
						if (event.keyCode === keyCodes('down')) {
							event.preventDefault();
							if (!self.get(TREE_ID).isFocused()) {
								self.get(TREE_ID).focus();
							}
						}
					});

				self[setAddButton]();
				self[setRowCount](self.menuItems().length);
				self.resize(true);
			}
		}
	}),

	currentFilter: method.string({
		set: function(currentFilter) {
			if (this.canFilter()) {
				this.get(FILTER_ID)
					.value(currentFilter);
			}
			this[filterItems]();
		}
	}),

	canFilterSelectedOnly: method.boolean({
		set: function(canFilterSelectedOnly) {
			const self = this;

			if (canFilterSelectedOnly) {
				self[buildHeader]();

				self.get(HEADER_ID).append({
					ID: SELECTED_ONLY_ID,
					control: CheckBox,
					width: HUNDRED_PERCENT,
					isChecked: self.isFilteredSelectedOnly(),
					onChange: (isChecked) => {
						self.isFilteredSelectedOnly(isChecked);
					},
					content: self[STRINGS].showSelectedItems
				});

				self.resize(true);
			}
		}
	}),

	isFilteredSelectedOnly: method.boolean({
		set: function(isFilteredSelectedOnly) {
			if (this.canFilterSelectedOnly()) {
				this.get(SELECTED_ONLY_ID)
					.isChecked(isFilteredSelectedOnly);
			}
			this[filterItems]();
		}
	}),

	canSelectAll: method.boolean({
		set: function(canSelectAll) {
			const self = this;

			if (canSelectAll) {
				self[buildHeader]();

				self.get(HEADER_ID).append({
					ID: SELECT_ALL_ID,
					control: CheckBox,
					width: HUNDRED_PERCENT,
					isChecked: self[ARE_ALL_SELECTED],
					onChange: (isChecked) => {
						const changedItems = [];

						eachChild(self.menuItems(), (item) => {
							if (item.isSelectable && item.isSelected !== isChecked) {
								item.isSelected = isChecked;
								changedItems.push(item.ID);
							}
						});

						if (changedItems.length && self.onSelect()) {
							self.onSelect()(changedItems);
						}

						self[filterItems]();
					},
					content: self[STRINGS].selectAll
				});

				self.resize(true);
			}
		}
	}),

	onAdd: method.function({
		set: function() {
			this.canFilter(true);
			this[setAddButton]();
		}
	}),

	onEdit: method.function(),

	onDelete: method.function()
});
