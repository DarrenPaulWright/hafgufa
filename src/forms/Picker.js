import { Collection, compare } from 'hord';
import { clone, isEmpty } from 'object-agent';
import { isString } from 'type-enforcer';
import {
	applySettings,
	AUTO,
	DockPoint,
	enforceBoolean,
	isArray,
	isObject,
	methodAny,
	methodArray,
	methodBoolean,
	methodFunction,
	methodString
} from 'type-enforcer-ui';
import controlTypes from '../controlTypes.js';
import Dialog from '../layout/Dialog.js';
import Menu from '../other/Menu.js';
import assign from '../utility/assign.js';
import { CLICK_EVENT, WINDOW } from '../utility/domConstants.js';
import locale from '../utility/locale.js';
import setDefaults from '../utility/setDefaults.js';
import softDelete from '../utility/softDelete.js';
import FormControl from './FormControl.js';
import GroupedButtons from './GroupedButtons.js';

const POPUP_BUTTON_ID = 'picker-popup-button';
const POPUP_BUTTON_CLASS = 'popup-button';
const FILTER_THRESHOLD = 8;
const RANK_KEY = 'rank';
const GROUP_KEY = 'group';

const MENU = Symbol();
const POPUP_BUTTON = Symbol();
const HAS_MULTI_SELECT = Symbol();
const HAS_VISIBLE_MULTI_SELECT = Symbol();
const SELECTED_ITEMS = Symbol();
const FLATTENED_ITEMS_LIST = Symbol();
const FLATTENED_ITEMS_OBJECT = Symbol();
const PREFERRED_ITEMS_LIST = Symbol();
const ARE_ALL_SELECTED_ITEMS_ACCOUNTED_FOR = Symbol();
const POPUP_BUTTON_WIDTH = Symbol();
const MAX_BUTTON_WIDTH = Symbol();
const POTENTIAL_NEW_VALUE = Symbol();
const DIALOG = Symbol();

const areValuesEqual = Symbol();
const updateSelectedItems = Symbol();
const buildPreferredItemsList = Symbol();
const areOptionsEqual = Symbol();
const processNewOptions = Symbol();
const checkSelected = Symbol();
const prepPreferredItemButton = Symbol();
const preMeasurePreferredButtons = Symbol();
const onButtonClick = Symbol();
const updateGroupedButtonsLayout = Symbol();
const toggleSelectedItem = Symbol();
const setSelectedItems = Symbol();
const getItem = Symbol();
const mapMenuItems = Symbol();
const toggleMenu = Symbol();
const showMenu = Symbol();
const hideMenu = Symbol();
const addNewItem = Symbol();
const deleteItem = Symbol();
const showDialog = Symbol();

/**
 * A control with a dropdown selector that can also add preferred items in a grouped buttons style control
 *
 * @class Picker
 * @extends FormControl
 *
 * @param {object} settings
 */
export default class Picker extends FormControl {
	constructor(settings = {}) {
		const groupedButtons = new GroupedButtons({
			width: AUTO,
			stopPropagation: true,
			isMultiSelect: true
		});

		super(setDefaults({
			type: controlTypes.PICKER
		}, settings, {
			contentContainer: groupedButtons,
			FocusMixin: assign(settings.FocusMixin, {
				mainControl: groupedButtons,
				getFocus() {
					return (!!self.contentContainer && self.contentContainer.isFocused()) || (self[MENU] && self[MENU].isFocused()) || false;
				}
			})
		}));

		const self = this;
		self[SELECTED_ITEMS] = [];
		self[FLATTENED_ITEMS_LIST] = [];
		self[FLATTENED_ITEMS_OBJECT] = {};
		self[PREFERRED_ITEMS_LIST] = [];
		self[ARE_ALL_SELECTED_ITEMS_ACCOUNTED_FOR] = true;
		self[MAX_BUTTON_WIDTH] = 0;

		self.defaultButtonText(locale.get('select'));
		self.emptyButtonText(locale.get('empty'));

		self.onResize((width) => {
			const newMaxButtonWidth = width - (self.singleLine() ? self.getHeading().borderWidth() : 0);

			if (newMaxButtonWidth !== self[MAX_BUTTON_WIDTH] || self[MAX_BUTTON_WIDTH] === 0) {
				self[MAX_BUTTON_WIDTH] = newMaxButtonWidth;
				if (!self.width().isAuto) {
					if (self[POPUP_BUTTON]) {
						self[POPUP_BUTTON].maxWidth(self[MAX_BUTTON_WIDTH]);
					}
				}
				self[updateGroupedButtonsLayout]();
			}
		});

		applySettings(self, settings, ['changeDelay']);

		self.onRemove(() => {
			if (self[DIALOG]) {
				self[DIALOG].remove();
			}
			self[hideMenu]();

			// self.dataSource({});
			self[PREFERRED_ITEMS_LIST].length = 0;
			self.options([]);
		});
	}

	/**
	 * Iterates through two sets of values and determines if they are the same.
	 *
	 * @function areValuesEqual
	 *
	 * @param {object} values1
	 * @param {object} values2
	 *
	 * @returns {boolean}
	 */
	static [areValuesEqual](values1, values2) {
		if (values1.length !== values2.length) {
			return false;
		}
		for (let itemIndex = 0; itemIndex < values1.length; itemIndex++) {
			if (values1[itemIndex].id !== values2[itemIndex].id) {
				return false;
			}
		}

		return true;
	}

	/**
	 * Iterates through two sets of options and determines if they are the same.
	 *
	 * @function areOptionsEqual
	 * @param {object} options1
	 * @param {object} options2
	 * @returns {boolean}
	 */
	static [areOptionsEqual](options1, options2) {
		if (!options1 || !options2) {
			return false;
		}
		if (!options1.children && options2.children) {
			return false;
		}
		if (options1.children && !options2.children) {
			return false;
		}
		if (options1.children && options2.children && options1.children.length !== options2.children.length) {
			return false;
		}
		for (let childIndex = 0; childIndex < options1.children.length; childIndex++) {
			if (options1.children[childIndex].children ||
				(options2.children[childIndex] && options2.children[childIndex].children)) {
				if (!Picker[areOptionsEqual](options1.children[childIndex], options2.children[childIndex])) {
					return false;
				}
			}
			else if (!options2.children[childIndex] ||
				options1.children[childIndex].id !== options2.children[childIndex].id ||
				options1.children[childIndex].isEnabled !== options2.children[childIndex].isEnabled) {
				return false;
			}
		}

		return true;
	}

	/**
	 * Update the selected Items with all the data from the available options.
	 *
	 * @param {Array}    newValue
	 * @returns {object[]}
	 */
	[updateSelectedItems](newValue) {
		const self = this;
		let newItem;
		const newItems = [];

		self[ARE_ALL_SELECTED_ITEMS_ACCOUNTED_FOR] = true;

		if (isArray(newValue) && (newValue[0] || newValue[0] === 0) && newValue[0] !== '') {
			for (let valueIndex = 0; valueIndex < newValue.length; valueIndex++) {
				newItem = self[getItem](newValue[valueIndex].id || newValue[valueIndex]);

				if (newItem.id) {
					newItems.push(newItem);
				}
				else {
					if (newValue[valueIndex].id) {
						newItems.push(newValue[valueIndex]);
					}
					else {
						newItems.push({
							id: newValue[valueIndex]
						});
					}
					self[ARE_ALL_SELECTED_ITEMS_ACCOUNTED_FOR] = false;
				}
			}
		}

		return newItems;
	}

	[buildPreferredItemsList]() {
		const self = this;
		let newItem;
		self[PREFERRED_ITEMS_LIST].length = 0;

		self.preferred().forEach((preferredItem) => {
			newItem = self[getItem](preferredItem.id, preferredItem.title);
			if (newItem && !isEmpty(newItem)) {
				self[PREFERRED_ITEMS_LIST].push(newItem);
			}
		});

		if (self.showAll() === true) {
			self[FLATTENED_ITEMS_LIST].forEach((item) => {
				if (!self[PREFERRED_ITEMS_LIST].find((preferredItem) => preferredItem.id === item.id)) {
					self[PREFERRED_ITEMS_LIST].push(item);
				}
			});
		}

		if (self.preferred().length > 1 || self.showAll() === true) {
			self[preMeasurePreferredButtons]();
		}
	}

	/**
	 * Iterates through the options and determines if anything is multiselect.
	 *
	 * @function processNewOptions
	 * @param {object} values
	 */
	[processNewOptions](values) {
		const self = this;
		let rankedItems;

		self[HAS_MULTI_SELECT] = false;
		self[HAS_VISIBLE_MULTI_SELECT] = false;
		self[FLATTENED_ITEMS_LIST] = [];
		self[FLATTENED_ITEMS_OBJECT] = {};

		new Collection(values.children).eachChild((item) => {
			if (values.isMultiSelect) {
				self[HAS_MULTI_SELECT] = true;
				self[HAS_VISIBLE_MULTI_SELECT] = true;
			}
			item.isMultiSelect = self[HAS_MULTI_SELECT];
			item.id = item.id ? item.id.toString() : (self[FLATTENED_ITEMS_LIST].length + 1).toString();
			item.group = item.group || '';
			self[FLATTENED_ITEMS_LIST].push(item);
			self[FLATTENED_ITEMS_OBJECT][item.id] = item;
		}, {
			onParent(parent) {
				if (parent.isMultiSelect) {
					self[HAS_MULTI_SELECT] = true;
				}
			}
		});

		self[SELECTED_ITEMS] = self[updateSelectedItems](self[SELECTED_ITEMS]);

		rankedItems = clone(self[FLATTENED_ITEMS_LIST].filter((item) => item[RANK_KEY]));

		if (rankedItems) {
			rankedItems.sort(compare(RANK_KEY));
		}

		if (rankedItems.length !== 0) {
			self.preferred(clone(rankedItems));
			rankedItems.length = 0;
		}
		else {
			self[buildPreferredItemsList]();
		}
	}

	/**
	 * Check to see if a particular option is selected
	 *
	 * @function checkSelected
	 * @param {string} id - An option's id value
	 */
	[checkSelected](id) {
		return !!this[SELECTED_ITEMS].find((item) => item.id === id);
	}

	[prepPreferredItemButton](button, settings) {
		const self = this;
		const isSelected = self[checkSelected](settings.id);
		let label = settings.title || '';
		label += settings.subTitle ? ' ' + settings.subTitle : '';

		button
			.image(settings.image || '')
			.icon(settings.icon || '')
			.tooltip(settings.tooltip || '')
			.tooltipDockPoint(DockPoint.POINTS.BOTTOM_CENTER)
			.label(label)
			.isSelected(isSelected)
			.classes('multi-select', self[HAS_VISIBLE_MULTI_SELECT] && settings.isMultiSelect)
			.removeClass(POPUP_BUTTON_CLASS)
			.isEnabled(isSelected || settings.isEnabled || true);

		return isSelected;
	}

	[preMeasurePreferredButtons]() {
		const self = this;
		const itemsToMeasure = Math.min(5, self[PREFERRED_ITEMS_LIST].length);
		let preferredItem;
		let currentButton;
		let itemCount;

		if (!self.isRemoved) {
			for (itemCount = 0; itemCount < itemsToMeasure; itemCount++) {
				preferredItem = self[PREFERRED_ITEMS_LIST][itemCount];

				self.contentContainer.addButton({
					id: preferredItem.id,
					onClick() {
						self[onButtonClick](this);
					}
				});
				currentButton = self.contentContainer.getButton(preferredItem.id);
				self[prepPreferredItemButton](currentButton, preferredItem);
			}

			for (itemCount = 0; itemCount < itemsToMeasure; itemCount++) {
				preferredItem = self[PREFERRED_ITEMS_LIST][itemCount];
				currentButton = self.contentContainer.getButton(preferredItem.id);
				preferredItem.renderWidth = currentButton.borderWidth();
			}

			self.contentContainer.removeAllButtons();
			self[MAX_BUTTON_WIDTH] = 0;
			self.resize(true);
		}
	}

	[onButtonClick](button) {
		const self = this;
		const buttonId = button.id();

		if (buttonId === POPUP_BUTTON_ID) {
			self[toggleMenu]();
		}
		else {
			self[toggleSelectedItem](buttonId);
			WINDOW.dispatchEvent(new Event(CLICK_EVENT));
		}
	}

	/**
	 * Layout the buttons in the grouped buttons area
	 *
	 * @function updateGroupedButtonsLayout
	 */
	[updateGroupedButtonsLayout]() {
		const self = this;
		let currentButton;
		let totalButtonWidth = 0;
		let popupText = '';
		let popupIcon = '';
		let isPopupButtonSelected = false;
		const visibleSelectedItems = [];
		let isSelected;
		let values;

		const addPopupButton = () => {
			if (!self[POPUP_BUTTON]) {
				self.contentContainer.addButton({
					id: POPUP_BUTTON_ID,
					classes: POPUP_BUTTON_CLASS,
					onClick() {
						self[onButtonClick](this);
					}
				});
				self[POPUP_BUTTON] = self.contentContainer.getButton(POPUP_BUTTON_ID);
				self[POPUP_BUTTON].removeClass('multi-select');
			}

			self[POPUP_BUTTON].isEnabled(true);

			if (self.contentContainer.isFocused()) {
				self[POPUP_BUTTON].isFocused(true);
			}

			popupText = self.showSelectedItems() ? buildPopupButtonLabel() : self.defaultButtonText();
			popupIcon = self.showSelectedItems() ? buildPopupButtonIcon() : self.defaultButtonIcon();

			if (popupText.length === 0) {
				if (self[FLATTENED_ITEMS_LIST].length === 0 && self.emptyButtonText()) {
					popupText = self.emptyButtonText();
				}
				else if (self.defaultButtonText()) {
					popupText = self.defaultButtonText();
				}
			}

			setPopupButtonLabel(popupText, popupIcon);
		};

		const buildPopupButtonLabel = () => {
			let popupText = '';

			self[SELECTED_ITEMS].forEach((item) => {
				if (visibleSelectedItems.length === 0 || visibleSelectedItems.findIndex((selectedItem) => selectedItem.id === item.id) === -1) {
					isPopupButtonSelected = true;
					if (popupText.length > 0) {
						popupText += ', ';
					}
					popupText += item.title;
					if (item.subTitle) {
						popupText += ' ' + item.subTitle;
					}
				}
			});

			return popupText;
		};

		const buildPopupButtonIcon = () => {
			let popupIcon = '';

			if (self[SELECTED_ITEMS].length === 1) {
				popupIcon = self[SELECTED_ITEMS][0].icon;
			}

			return popupIcon;
		};

		const setPopupButtonLabel = (label, newIcon) => {
			self[POPUP_BUTTON]
				.label(label)
				.icon(newIcon);
			self[POPUP_BUTTON_WIDTH] = self[POPUP_BUTTON].borderWidth();
			totalButtonWidth += self[POPUP_BUTTON_WIDTH];
		};

		const removePopupButton = () => {
			removeButton(POPUP_BUTTON_ID, self[POPUP_BUTTON_WIDTH]);
			self[POPUP_BUTTON] = null;
		};

		const removeButton = (id, width) => {
			self.contentContainer.removeButton(id);
			totalButtonWidth -= width;
		};

		const canRemovePopupButton = () => {
			return self.contentContainer.totalButtons() > self[FLATTENED_ITEMS_LIST].length &&
				totalButtonWidth - self[POPUP_BUTTON_WIDTH] <= self[MAX_BUTTON_WIDTH];
		};

		const registerSelectedButton = (settings) => {
			if (settings) {
				visibleSelectedItems.push(settings);
			}
			else {
				visibleSelectedItems.length = 0;
			}
			totalButtonWidth -= self[POPUP_BUTTON_WIDTH];
			setPopupButtonLabel(buildPopupButtonLabel());
		};

		const buildPreferredButton = (settings, index) => {
			self.contentContainer.addButton({
				id: settings.id,
				onClick() {
					self[onButtonClick](this);
				}
			}, index);

			currentButton = self.contentContainer.getButton(settings.id);
			isSelected = self[prepPreferredItemButton](currentButton, settings);

			if (!settings.renderWidth) {
				settings.renderWidth = currentButton.borderWidth();
			}
			totalButtonWidth += settings.renderWidth;

			if (isSelected) {
				registerSelectedButton(settings);
			}

			if (visibleSelectedItems.length === self[SELECTED_ITEMS].length) {
				isPopupButtonSelected = false;
			}

			if (self[POPUP_BUTTON].label() === self.defaultButtonText()) {
				totalButtonWidth -= self[POPUP_BUTTON_WIDTH];
				setPopupButtonLabel('');
			}

			return checkTotalWidth(settings);
		};

		const checkTotalWidth = (preferredItem) => {
			if (totalButtonWidth > self[MAX_BUTTON_WIDTH]) {
				if (canRemovePopupButton()) {
					removePopupButton();
				}
				else {
					removeButton(preferredItem.id, preferredItem.renderWidth);

					if (self.contentContainer.totalButtons() === 0) {
						if (self[SELECTED_ITEMS].length !== 0) {
							registerSelectedButton();
						}
						else if (self[POPUP_BUTTON].label() === '' && self.defaultButtonText()) {
							setPopupButtonLabel(self.defaultButtonText());
						}
					}
				}
				return true;
			}
			return false;
		};

		if (!self.isRemoved) {
			self.contentContainer.removeAllButtons();
			self[POPUP_BUTTON] = null;

			addPopupButton();

			if (totalButtonWidth > 0) {
				self[PREFERRED_ITEMS_LIST].some(buildPreferredButton);

				if (self[FLATTENED_ITEMS_LIST].length === 0) {
					if (!self.onAdd()) {
						self[POPUP_BUTTON].isEnabled(false);
					}
				}
				else if (self.contentContainer.totalButtons() > self[FLATTENED_ITEMS_LIST].length) {
					removePopupButton();
				}
			}

			values = visibleSelectedItems.map((item) => item.id);

			if (!(self[POPUP_BUTTON] && !self[MENU] && !isPopupButtonSelected)) {
				values.push(POPUP_BUTTON_ID);
			}
			self.contentContainer.value(values);

			if (self[MENU]) {
				self[MENU].menuItems(self[mapMenuItems]());
			}
		}
	}

	/**
	 * Saves an item to the selected items list, removes any other items that aren't within a multiselect area.
	 *
	 * @param itemId
	 * @param skipUpdate
	 */
	[toggleSelectedItem](itemId, skipUpdate = false) {
		const self = this;
		const toggleItem = self[getItem](itemId);
		let isSelected = false;

		const unselectItem = (itemToUnselect, itemToSkip) => {
			let button;

			if (itemToUnselect.children) {
				itemToUnselect.children.forEach((child) => {
					if (itemToSkip) {
						if (child !== itemToSkip) {
							unselectItem(child, itemToSkip);
						}
					}
					else {
						unselectItem(child);
					}
				});
			}
			else {
				self[SELECTED_ITEMS].forEach((item, count) => {
					if (item.id === itemToUnselect.id) {
						self[SELECTED_ITEMS].splice(count, 1);
						button = self.contentContainer.getButton(item.id);
						if (button) {
							button.isSelected(false);
						}
						return false;
					}
				});
			}
		};

		const checkItems = (item) => {
			let isFound = false;

			if (item.children) {
				item.children.forEach((child) => {
					isFound = checkItems(child);
					if (isFound) {
						if (!item.isMultiSelect) {
							unselectItem(item, child);
						}
						return false;
					}
				});
			}
			else if (item.id === toggleItem.id) {
				if (self[checkSelected](item.id)) {
					isSelected = true;
					if (self.canUnselect()) {
						unselectItem(item);
					}
				}
				isFound = true;
			}

			return isFound;
		};

		checkItems(self.options());

		if (!isSelected) {
			self[SELECTED_ITEMS].push(toggleItem);
		}

		if (!skipUpdate) {
			self[setSelectedItems](self[SELECTED_ITEMS]);
		}
	}

	[setSelectedItems](items) {
		const self = this;

		self[SELECTED_ITEMS] = items;

		self[SELECTED_ITEMS].sort((a, b) => a.displayOrder - b.displayOrder);

		self[updateGroupedButtonsLayout]();

		self.triggerChange();
	}

	/**
	 * Finds an option given that option's id
	 *
	 * @function getItem
	 * @param {string} itemId - The id of an option
	 * @param {string} itemTitle - The title property of an option
	 * @returns {object} - An option.
	 */
	[getItem](itemId, itemTitle) {
		const self = this;
		let output;

		if (itemId !== undefined) {
			output = self[FLATTENED_ITEMS_OBJECT][itemId];
		}
		else {
			output = self[FLATTENED_ITEMS_LIST].find((item) => item.title === itemTitle);
		}

		return output || {};
	}

	[mapMenuItems](optionsParent, level = 0) {
		const self = this;
		let isGrouped = false;
		let rows = [];

		const hasSelectedItems = (group) => {
			for (let index = 0; index < group.length; index++) {
				if (self[checkSelected](group[index].id)) {
					return true;
				}
			}
		};

		optionsParent = optionsParent || self.options();

		if (optionsParent) {
			optionsParent.children = optionsParent.children.filter((value) => !!value.title || value.children);

			optionsParent.children.forEach((item) => {
				if (item.group) {
					isGrouped = true;
				}

				if (item.children) {
					self[mapMenuItems](item, level + 1).forEach((subItem) => {
						if (rows.findIndex((row) => row.id === subItem.id) === -1) {
							rows.push(subItem);
						}
					});
				}
				else {
					item.isSelectable = optionsParent.isMultiSelect;
					item.isSelected = self[checkSelected](item.id);
					item.isEnabled = item.isSelected || item.isEnabled;
					rows.push(item);
				}
			});
		}

		if (isGrouped && !level) {
			rows = new Collection(rows).nest({ parentKey: GROUP_KEY });
			rows.eachChild(() => {
			}, {
				onParent(group) {
					group.isSelected = false;
					group.isExpanded = hasSelectedItems(group.children);
				}
			});
		}

		return rows.map((row) => ({
			...row,
			isEnabled: enforceBoolean(row.isEnabled, true)
		}));
	}

	/**
	 * If the popup exists, hide it. Otherwise show it.
	 *
	 * @function toggleMenu
	 */
	[toggleMenu]() {
		const self = this;

		if (self[MENU]) {
			self[hideMenu]();
		}
		else {
			self[showMenu]();
		}
	}

	/**
	 * Show the popup.
	 *
	 * @function showMenu
	 */
	[showMenu]() {
		const self = this;

		if (!self.isRemoved && self[POPUP_BUTTON]) {
			self[POPUP_BUTTON].isSelected(true);

			self[MENU] = new Menu({
				minWidth: 160,
				anchor: self[POPUP_BUTTON],
				anchorDockPoint: DockPoint.POINTS.BOTTOM_LEFT,
				popupDockPoint: DockPoint.POINTS.TOP_LEFT,
				keepMenuOpen: true,
				canFilter: self[FLATTENED_ITEMS_LIST].length >= FILTER_THRESHOLD,
				canFilterSelectedOnly: self.canFilterSelectedOnly(),
				canSelectAll: self.canSelectAll(),
				onAdd: self.onAdd() ? (...args) => self[addNewItem](...args) : null,
				onEdit: self.onEdit(),
				onDelete: self.onDelete() ? (...args) => self[deleteItem](...args) : null,
				onSelect(itemId) {
					if (isArray(itemId)) {
						itemId.forEach((id, index) => {
							self[toggleSelectedItem](id, index < itemId.length - 1);
						});
					}
					else {
						self[toggleSelectedItem](itemId);
					}

					if (!self[HAS_MULTI_SELECT]) {
						self[hideMenu]();
					}
				},
				onRemove() {
					self[MENU] = null;
					self[updateGroupedButtonsLayout]();

					if (self[POPUP_BUTTON] && self.isFocused()) {
						self[POPUP_BUTTON].isFocused(true);
					}
				},
				onBlur() {
					self[hideMenu]();
				},
				menuItems: self[mapMenuItems]()
			});
		}
	}

	/**
	 * Tell the popup to prepare to be removed.
	 *
	 * @function hideMenu
	 */
	[hideMenu]() {
		if (this[MENU]) {
			this[MENU].remove();
		}
	}

	[addNewItem](newItem) {
		const self = this;

		if (!self.onBuildDialogContents()) {
			const options = self.options();
			options.children.push({
				id: newItem,
				title: newItem
			});
			self.options(options, true)
				.value(newItem, true);
			self.triggerChange();
		}
		self[hideMenu]();
		self.onAdd()(newItem);
	}

	[deleteItem](item) {
		const self = this;
		const options = self.options();
		let wasSelected = false;

		softDelete({
			title: item.title + ' deleted',
			value: options,
			onDo() {
				self[hideMenu]();

				if (self[checkSelected](item.id)) {
					wasSelected = true;
					self[toggleSelectedItem](options.children[0].id);
				}

				options.children = options.children.filter((option) => option.id === item.id);

				self.options(options, true);
			},
			onUndo(originalOptions) {
				self.options(originalOptions);
				if (wasSelected) {
					self[toggleSelectedItem](item);
				}
			},
			onCommit() {
				self.onDelete()(item);
			}
		});
	}

	/**
	 * Show the dialog when the add/edit button is clicked.
	 *
	 * @param itemId
	 * @param newTitle
	 */
	[showDialog](itemId, newTitle) {
		const self = this;

		self[DIALOG] = new Dialog({
			title: (itemId ? locale.get('edit') : locale.get('add')) + ' ' + self.title(),
			width: '40rem',
			footer: {
				buttons: [{
					label: locale.get('done'),
					onClick() {
						if (self.onRemoveDialogContents()) {
							self.onRemoveDialogContents()();
						}
						self[DIALOG].remove();
					}
				}]
			}
		});

		self.onBuildDialogContents()(self[DIALOG], itemId, newTitle);
		self[DIALOG].resize();
	}
}

Object.assign(Picker.prototype, {
	// dataSource: methodObject({
	// 	init: {},
	// 	before(oldValue) {
	// 		if (oldValue) {
	// 			if (dataSourceOnChangeId) {
	// 				oldValue.store.offChange(dataSourceOnChangeId);
	// 				dataSourceOnChangeId = null;
	// 			}
	// 			if (disableItemsOnChangeId) {
	// 				oldValue.disableItemsStore.offChange(disableItemsOnChangeId);
	// 				disableItemsOnChangeId = null;
	// 			}
	// 		}
	// 	},
	// 	set(newValue) {
	// 		let optionsStore;
	// 		let preferredStore;
	// 		let disabledItems;
	//
	// 		const mapOptions = () => {
	// 			let newOptions = optionsStore;
	// 			let newPreferred = preferredStore;
	//
	// 			if (disabledItems) {
	// 				newOptions = newOptions.map((item) => {
	// 					item.isEnabled = !disabledItems.includes(item.id);
	// 					return item;
	// 				});
	// 				if (newPreferred) {
	// 					newPreferred = newPreferred.map((item) => {
	// 						item.isEnabled = !disabledItems.includes(item.id);
	// 						return item;
	// 					});
	// 				}
	// 			}
	//
	// 			self.options({
	// 				isMultiSelect: !!newValue.isMultiSelect,
	// 				children: newOptions
	// 			});
	// 			if (newPreferred) {
	// 				self.preferred(newPreferred);
	// 			}
	// 		};
	//
	// 		if (newValue.store) {
	// 			if (newValue.key) {
	// 				dataSourceOnChangeId = dataSource.uniqueBy(newValue, (options) => {
	// 					optionsStore = options;
	// 					mapOptions();
	// 				});
	// 			}
	// 			else {
	// 				dataSourceOnChangeId = dataSource.optionsAndPreferred(newValue, (options, preferred) => {
	// 					optionsStore = options;
	// 					preferredStore = preferred;
	// 					mapOptions();
	// 				});
	// 			}
	// 		}
	//
	// 		if (newValue.disableItemsStore) {
	// 			disableItemsOnChangeId = newValue.disableItemsStore.onChange(() => {
	// 				newValue.disableItemsStore.get()
	// 					.then((items) => {
	// 						const disableKey = newValue.disableItemsKey || newValue.disableItemsStore.idKey();
	//
	// 						disabledItems = items.map((item) => item[disableKey]);
	// 						disabledItems = disabledItems.concat(newValue.disableItems);
	// 						mapOptions();
	// 					});
	// 			});
	// 		}
	// 		else {
	// 			disabledItems = newValue.disableItems;
	// 		}
	// 	}
	// }),

	/**
	 * Set or reset the options.
	 *
	 * @method options
	 * @memberOf Picker
	 * @instance
	 * @param {object} newOptions - See initial input options.
	 * @returns {object|this}
	 */
	options: methodAny({
		init: {
			isMultiSelect: false,
			children: []
		},
		enforce(newOptions, oldOptions) {
			if (isArray(newOptions)) {
				return {
					isMultiSelect: false,
					children: newOptions
				};
			}
			return isObject(newOptions) ? newOptions : oldOptions;
		},
		compare(newOptions, oldOptions) {
			return !Picker[areOptionsEqual](newOptions, oldOptions);
		},
		set(options) {
			const self = this;

			self[processNewOptions](options);

			if (self[POPUP_BUTTON]) {
				self[POPUP_BUTTON].isEnabled(true);
			}
			self[updateGroupedButtonsLayout]();

			if (self.onOptionsChange()) {
				self.onOptionsChange()();
			}

			if (self[POTENTIAL_NEW_VALUE]) {
				self.value(self[POTENTIAL_NEW_VALUE], true);
			}
		}
	}),

	/**
	 * Set which items get displayed in the grouped buttons.
	 *
	 * @method preferred
	 * @memberOf Picker
	 * @instance
	 * @param {Array} preferred - Prioritized array of option id's.
	 * @returns {Array|this}
	 */
	preferred: methodArray({
		set: buildPreferredItemsList
	}),

	/**
	 * Callback that is called after the options method is called.
	 *
	 * @method onOptionsChange
	 * @memberOf Picker
	 * @instance
	 * @param {Function} [callback]
	 * @returns {Function|this}
	 */
	onOptionsChange: methodFunction(),

	/**
	 * Get or set the value of this control.
	 *
	 * @method value
	 * @memberOf Picker
	 * @instance
	 *
	 * @param {string|Array} [newValue] - Can be a comma delimited string of values or an array of values.
	 * @param {boolean} [isForcedSave=false] - Normally this control won't save a new value if it has focus, a 'true'
	 * value here will override this functionality and save anyway.
	 *
	 * @returns {boolean|string} - If a new value doesn't match an option then 'false' is returned. If no value is
	 * provided then the current value is returned.
	 */
	value(newValue, isForcedSave) {
		const self = this;

		if (newValue !== undefined) {
			if (isString(newValue)) {
				newValue = newValue.split(',');
			}
			else if (!(isArray(newValue))) {
				newValue = [newValue];
			}

			const newItems = self[updateSelectedItems](newValue);

			if (!self[ARE_ALL_SELECTED_ITEMS_ACCOUNTED_FOR]) {
				self[POTENTIAL_NEW_VALUE] = newValue;
			}
			else {
				self[POTENTIAL_NEW_VALUE] = null;
			}

			if (self[ARE_ALL_SELECTED_ITEMS_ACCOUNTED_FOR] &&
				(!self.isFocused() || isForcedSave) &&
				!Picker[areValuesEqual](self[SELECTED_ITEMS], newItems)) {
				self[SELECTED_ITEMS] = newItems;

				self[updateGroupedButtonsLayout]();

				self.triggerChange(true, self.isFocused() || !isForcedSave, false);
			}

			return self[ARE_ALL_SELECTED_ITEMS_ACCOUNTED_FOR];
		}

		return clone(self[SELECTED_ITEMS]);
	},

	/**
	 * Get the width of the grouped buttons.
	 *
	 * @method getContentWidth
	 * @memberOf Picker
	 * @instance
	 */
	getContentWidth() {
		return this.contentContainer.borderWidth();
	},

	/**
	 * Selects all options
	 *
	 * @method selectAll
	 * @memberOf Picker
	 * @instance
	 */
	selectAll() {
		const self = this;

		if (self[HAS_MULTI_SELECT]) {
			self[SELECTED_ITEMS] = [];

			new Collection(self.options().children).eachChild((item) => {
				if (item.isMultiSelect) {
					self[SELECTED_ITEMS].push(item);
				}
			});

			self[setSelectedItems](self[SELECTED_ITEMS]);
		}
	},

	/**
	 * Unselects all selected options
	 *
	 * @method unselectAll
	 * @memberOf Picker
	 * @instance
	 */
	unselectAll() {
		if (this[SELECTED_ITEMS].length > 0) {
			this[setSelectedItems]([]);
		}

		return this;
	},

	/**
	 * Determines if a selected value can be unselected.
	 *
	 * @method canUnselect
	 * @memberOf Picker
	 * @instance
	 * @param {boolean} canUnselect
	 * @returns {boolean|this}
	 */
	canUnselect: methodBoolean({
		init: true
	}),

	/**
	 * Text to display on the popup button if no items are selected or showSelectedItems is false
	 *
	 * @method defaultButtonText
	 * @memberOf Picker
	 * @instance
	 *
	 * @param {string} defaultButtonText
	 *
	 * @returns {string|this}
	 */
	defaultButtonText: methodString({
		set: updateGroupedButtonsLayout
	}),

	/**
	 * Icon to display on the popup button if no items are selected or showSelectedItems is false
	 *
	 * @method defaultButtonIcon
	 * @memberOf Picker
	 * @instance
	 *
	 * @param {string} defaultButtonIcon
	 *
	 * @returns {string|this}
	 */
	defaultButtonIcon: methodString({
		set: updateGroupedButtonsLayout
	}),

	/**
	 * Text to display in the popup button if there are no options
	 *
	 * @method emptyButtonText
	 * @memberOf Picker
	 * @instance
	 *
	 * @param {string} emptyButtonText
	 *
	 * @returns {string|this}
	 */
	emptyButtonText: methodString({
		set: updateGroupedButtonsLayout
	}),

	/**
	 * If true then shows the selected items on the popup button
	 *
	 * @method showSelectedItems
	 * @memberOf Picker
	 * @instance
	 *
	 * @param {boolean} showSelectedItems
	 *
	 * @returns {boolean|this}
	 */
	showSelectedItems: methodBoolean({
		init: true
	}),

	showAll: methodBoolean({
		set: buildPreferredItemsList
	}),

	/**
	 * If true then a checkbox is shown in the popup that allows to filter the items to see only selected ones.
	 *
	 * @method canFilterSelectedOnly
	 * @memberOf Picker
	 * @instance
	 *
	 * @param {boolean} canFilterSelectedOnly
	 *
	 * @returns {boolean|this}
	 */
	canFilterSelectedOnly: methodBoolean(),

	canSelectAll: methodBoolean(),

	onAdd: methodFunction(),

	onEdit: methodFunction(),

	onDelete: methodFunction(),

	onBuildDialogContents: methodFunction({
		set() {
			const self = this;

			self.onAdd((newItem) => {
				self[showDialog](null, newItem);
			});
			self.onEdit((item) => {
				self[showDialog](item);
			});
		}
	}),

	onRemoveDialogContents: methodFunction()
});
