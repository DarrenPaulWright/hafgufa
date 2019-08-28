import { select } from 'd3';
import { findIndex, groupBy, remove, union } from 'lodash';
import { clone, forOwn, isEmpty } from 'object-agent';
import { applySettings, AUTO, DockPoint, isArray, isObject, method } from 'type-enforcer';
import { byKey } from '../../../src/utility/sortBy';
import collectionHelper from '../../utility/collectionHelper';
import { CLICK_EVENT, WINDOW } from '../../utility/domConstants';
import locale from '../../utility/locale';
import softDelete from '../../utility/softDelete';
import controlTypes from '../controlTypes';
import Dialog from '../layout/Dialog';
import FocusMixin from '../mixins/FocusMixin';
import Menu from '../other/Menu';
import FormControl from './FormControl';
import GroupedButtons from './GroupedButtons';

const POPUP_BUTTON_ID = 'picker-popup-button';
const POPUP_BUTTON_CLASS = 'popup-button';
const FILTER_THRESHOLD = 8;
const RANK_KEY = 'rank';
const GROUP_KEY = 'group';

const GROUPED_BUTTONS = Symbol();
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
 * @constructor
 *
 * @arg {Object} settings
 */
export default class Picker extends FocusMixin(FormControl) {
	constructor(settings = {}) {
		const groupedButtons = new GroupedButtons({
			width: AUTO,
			stopPropagation: true,
			isMultiSelect: true
		});

		settings.type = settings.type || controlTypes.PICKER;
		settings.FocusMixin = settings.FocusMixin || {};
		settings.FocusMixin.mainControl = groupedButtons;
		settings.FocusMixin.getFocus = () => {
			return (!!self[GROUPED_BUTTONS] && self[GROUPED_BUTTONS].isFocused()) || (self[MENU] && self[MENU].isFocused()) || false;
		};

		super(settings);

		const self = this;
		self[SELECTED_ITEMS] = [];
		self[FLATTENED_ITEMS_LIST] = [];
		self[FLATTENED_ITEMS_OBJECT] = {};
		self[PREFERRED_ITEMS_LIST] = [];
		self[ARE_ALL_SELECTED_ITEMS_ACCOUNTED_FOR] = true;
		self[MAX_BUTTON_WIDTH] = 0;

		self[GROUPED_BUTTONS] = groupedButtons;
		self[GROUPED_BUTTONS].container(self.contentContainer());

		self.defaultButtonText(locale.get('select'));
		self.emptyButtonText(locale.get('empty'));
		self.contentWidthContainer(self[GROUPED_BUTTONS].element());

		self.onResize(() => {
			const newMaxButtonWidth = self.borderWidth() - (self.singleLine() ? self.getHeading().borderWidth() : 0);

			if (newMaxButtonWidth !== self[MAX_BUTTON_WIDTH] || self[MAX_BUTTON_WIDTH] === 0) {
				self[MAX_BUTTON_WIDTH] = newMaxButtonWidth;
				if (self.width().isAuto) {
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
			self[GROUPED_BUTTONS].remove();
			self[GROUPED_BUTTONS] = null;
			self[PREFERRED_ITEMS_LIST].length = 0;
			self.options([]);
		});
	}

	/**
	 * Iterates through two sets of values and determines if they are the same.
	 *
	 * @function areValuesEqual
	 *
	 * @arg {Object} values1
	 * @arg {Object} values2
	 *
	 * @returns {Boolean}
	 */
	static [areValuesEqual](values1, values2) {
		if (values1.length !== values2.length) {
			return false;
		}
		for (let itemIndex = 0; itemIndex < values1.length; itemIndex++) {
			if (values1[itemIndex].ID !== values2[itemIndex].ID) {
				return false;
			}
		}

		return true;
	}

	/**
	 * Iterates through two sets of options and determines if they are the same.
	 * @function areOptionsEqual
	 * @arg {Object} options1
	 * @arg {Object} options2
	 * @returns {Boolean}
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
			else {
				if (!options2.children[childIndex] ||
					options1.children[childIndex].ID !== options2.children[childIndex].ID ||
					options1.children[childIndex].isEnabled !== options2.children[childIndex].isEnabled) {
					return false;
				}
			}
		}

		return true;
	}

	/**
	 * Update the selected Items with all the data from the available options.
	 * @arg   {Array}    newValue
	 * @returns {Object[]}
	 */
	[updateSelectedItems](newValue) {
		const self = this;
		let newItem;
		const newItems = [];
		self[ARE_ALL_SELECTED_ITEMS_ACCOUNTED_FOR] = true;

		if (isArray(newValue) && (newValue[0] || newValue[0] === 0) && newValue[0] !== '') {
			for (let valueIndex = 0; valueIndex < newValue.length; valueIndex++) {
				newItem = self[getItem](newValue[valueIndex].ID || newValue[valueIndex]);

				if (newItem.ID) {
					newItems.push(newItem);
				}
				else {
					if (newValue[valueIndex].ID) {
						newItems.push(newValue[valueIndex]);
					}
					else {
						newItems.push({
							ID: newValue[valueIndex]
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
			newItem = self[getItem](preferredItem.ID, preferredItem.title);
			if (newItem && !isEmpty(newItem)) {
				self[PREFERRED_ITEMS_LIST].push(newItem);
			}
		});

		if (self.showAll()) {
			self[FLATTENED_ITEMS_LIST].forEach((item) => {
				if (!self[PREFERRED_ITEMS_LIST].find((preferredItem) => preferredItem.ID === item.ID)) {
					self[PREFERRED_ITEMS_LIST].push(item);
				}
			});
		}

		self[preMeasurePreferredButtons]();
	}

	/**
	 * Iterates through the options and determines if anything is multiselect.
	 * @function processNewOptions
	 * @arg {Object} values
	 */
	[processNewOptions](values) {
		const self = this;
		let rankedItems;

		self[HAS_MULTI_SELECT] = false;
		self[HAS_VISIBLE_MULTI_SELECT] = false;
		self[FLATTENED_ITEMS_LIST] = [];
		self[FLATTENED_ITEMS_OBJECT] = {};

		collectionHelper.eachChild(values, (item) => {
			if (values.isMultiSelect) {
				self[HAS_MULTI_SELECT] = true;
				self[HAS_VISIBLE_MULTI_SELECT] = true;
			}
			item.isMultiSelect = self[HAS_MULTI_SELECT];
			item.ID = item.ID ? item.ID.toString() : (self[FLATTENED_ITEMS_LIST].length + 1).toString();
			item.group = item.group || '';
			self[FLATTENED_ITEMS_LIST].push(item);
			self[FLATTENED_ITEMS_OBJECT][item.ID] = item;
		}, {
			onEachParent(parent) {
				if (parent.isMultiSelect) {
					self[HAS_MULTI_SELECT] = true;
				}
			}
		});

		self[SELECTED_ITEMS] = self[updateSelectedItems](self[SELECTED_ITEMS]);

		rankedItems = clone(self[FLATTENED_ITEMS_LIST].filter((item) => item[RANK_KEY]));

		if (rankedItems) {
			rankedItems.sort(byKey(RANK_KEY));
		}

		if (rankedItems.length) {
			self.preferred(clone(rankedItems));
			rankedItems.length = 0;
		}
		else {
			self[buildPreferredItemsList]();
		}
	}

	/**
	 * Check to see if a particular option is selected
	 * @function checkSelected
	 * @arg {String} ID - An option's ID value
	 */
	[checkSelected](ID) {
		return !!this[SELECTED_ITEMS].find((item) => item.ID === ID);
	}

	[prepPreferredItemButton](button, settings) {
		const self = this;
		const isSelected = self[checkSelected](settings.ID);
		let label = settings.title || '';
		label += settings.subTitle ? ' ' + settings.subTitle : '';

		button
			.image(settings.image || '')
			.icon(settings.icon || '')
			.label(label)
			.isSelected(isSelected)
			.classes('multi-select', self[HAS_VISIBLE_MULTI_SELECT] && settings.isMultiSelect)
			.removeClass(POPUP_BUTTON_CLASS)
			.isEnabled(isSelected || settings.isEnabled);

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

				self[GROUPED_BUTTONS].addButton({
					ID: preferredItem.ID,
					onClick(...args) {
						self[onButtonClick](...args);
					}
				});
				currentButton = self[GROUPED_BUTTONS].getButton(preferredItem.ID);
				self[prepPreferredItemButton](currentButton, preferredItem);
			}

			for (itemCount = 0; itemCount < itemsToMeasure; itemCount++) {
				preferredItem = self[PREFERRED_ITEMS_LIST][itemCount];
				currentButton = self[GROUPED_BUTTONS].getButton(preferredItem.ID);
				preferredItem.renderWidth = currentButton.borderWidth();
			}

			self[GROUPED_BUTTONS].removeAllButtons();
			self[MAX_BUTTON_WIDTH] = 0;
			self.resize(true);
		}
	}

	[onButtonClick](button) {
		const self = this;
		const buttonID = button.ID();

		if (buttonID === POPUP_BUTTON_ID) {
			self[toggleMenu]();
		}
		else {
			self[toggleSelectedItem](buttonID);
			select(WINDOW).dispatch(CLICK_EVENT);
		}
	}

	/**
	 * Layout the buttons in the grouped buttons area
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
				self[GROUPED_BUTTONS].addButton({
					ID: POPUP_BUTTON_ID,
					classes: POPUP_BUTTON_CLASS,
					onClick(...args) {
						self[onButtonClick](...args);
					}
				});
				self[POPUP_BUTTON] = self[GROUPED_BUTTONS].getButton(POPUP_BUTTON_ID);
				self[POPUP_BUTTON].removeClass('multi-select');
			}

			self[POPUP_BUTTON].isEnabled(true);

			if (self[GROUPED_BUTTONS].isFocused()) {
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
				if (visibleSelectedItems.length === 0 || findIndex(visibleSelectedItems, {
					ID: item.ID
				}) === -1) {
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
			self[GROUPED_BUTTONS].removeButton(id);
			totalButtonWidth -= width;
		};

		const canRemovePopupButton = () => {
			return self[GROUPED_BUTTONS].totalButtons() > self[FLATTENED_ITEMS_LIST].length &&
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
			self[GROUPED_BUTTONS].addButton({
				ID: settings.ID,
				onClick(...args) {
					self[onButtonClick](...args);
				}
			}, index);

			currentButton = self[GROUPED_BUTTONS].getButton(settings.ID);
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
					removeButton(preferredItem.ID, preferredItem.renderWidth);

					if (self[GROUPED_BUTTONS].totalButtons() === 0) {
						if (self[SELECTED_ITEMS].length) {
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
			self[GROUPED_BUTTONS].removeAllButtons();
			self[POPUP_BUTTON] = null;

			addPopupButton();

			if (totalButtonWidth > 0) {
				self[PREFERRED_ITEMS_LIST].some(buildPreferredButton);

				if (self[FLATTENED_ITEMS_LIST].length === 0) {
					if (!self.onAdd()) {
						self[POPUP_BUTTON].isEnabled(false);
					}
				}
				else if (self[GROUPED_BUTTONS].totalButtons() > self[FLATTENED_ITEMS_LIST].length) {
					removePopupButton();
				}
			}

			values = visibleSelectedItems.map((item) => item.ID);

			if (!(self[POPUP_BUTTON] && !self[MENU] && !isPopupButtonSelected)) {
				values.push(POPUP_BUTTON_ID);
			}
			self[GROUPED_BUTTONS].value(values);

			if (self[MENU]) {
				self[MENU].menuItems(self[mapMenuItems]());
			}
		}
	}

	/**
	 * Saves an item to the selected items list, removes any other items that aren't within a multiselect area.
	 * @function toggleSelectedItem
	 */
	[toggleSelectedItem](itemID, skipUpdate = false) {
		const self = this;
		const toggleItem = self[getItem](itemID);
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
					if (item.ID === itemToUnselect.ID) {
						self[SELECTED_ITEMS].splice(count, 1);
						button = self[GROUPED_BUTTONS].getButton(item.ID);
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
			else {
				if (item.ID === toggleItem.ID) {
					if (self[checkSelected](item.ID)) {
						isSelected = true;
						if (self.canUnselect()) {
							unselectItem(item);
						}
					}
					isFound = true;
				}
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
	 * Finds an option given that option's ID
	 * @function getItem
	 * @arg {String} itemID - The ID of an option
	 * @arg {String} itemTitle - The title property of an option
	 * @returns {Object} - An option.
	 */
	[getItem](itemID, itemTitle) {
		const self = this;
		let output;

		if (itemID !== undefined) {
			output = self[FLATTENED_ITEMS_OBJECT][itemID];
		}
		else {
			output = self[FLATTENED_ITEMS_LIST].find((item) => item.title === itemTitle);
		}

		return output || {};
	}

	[mapMenuItems](optionsParent, level = 0) {
		const self = this;
		let groups = false;
		let rows = [];

		const hasSelectedItems = (group) => {
			for (let index = 0; index < group.length; index++) {
				if (self[checkSelected](group[index].ID)) {
					return true;
				}
			}
		};

		optionsParent = optionsParent || self.options();

		if (optionsParent) {
			optionsParent.children = optionsParent.children.filter((value) => !!value.title || value.children);

			optionsParent.children.forEach((item) => {
				if (item.group) {
					groups = true;
				}

				if (item.children) {
					rows = union(rows, self[mapMenuItems](item, level + 1));
				}
				else {
					item.isSelectable = optionsParent.isMultiSelect;
					item.isSelected = self[checkSelected](item.ID);
					item.isEnabled = item.isSelected || item.isEnabled;
					rows.push(item);
				}
			});
		}

		if (groups && !level) {
			groups = groupBy(rows, GROUP_KEY);
			rows = [];

			forOwn(groups, (group, key) => {
				rows.push({
					ID: key,
					title: key,
					isSelectable: false,
					children: group,
					isExpanded: hasSelectedItems(group)
				});
			});
		}

		return rows.map((row) => ({
			ID: row.ID,
			title: row.title,
			subTitle: row.subTitle,
			isSelected: row.isSelected,
			isSelectable: row.isSelectable
		}));
	}

	/**
	 * If the popup exists, hide it. Otherwise show it.
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
	 * @function showMenu
	 */
	[showMenu]() {
		const self = this;

		if (!self.isRemoved && self[POPUP_BUTTON]) {
			self[POPUP_BUTTON].isSelected(true);

			self[MENU] = new Menu({
				minWidth: 160,
				anchor: self[POPUP_BUTTON].element(),
				anchorDockPoint: DockPoint.POINTS.BOTTOM_LEFT,
				popupDockPoint: DockPoint.POINTS.TOP_LEFT,
				keepMenuOpen: true,
				canFilter: self[FLATTENED_ITEMS_LIST].length >= FILTER_THRESHOLD,
				canFilterSelectedOnly: self.canFilterSelectedOnly(),
				canSelectAll: self.canSelectAll(),
				onAdd: self.onAdd() ? (...args) => self[addNewItem](...args) : null,
				onEdit: self.onEdit(),
				onDelete: self.onDelete() ? (...args) => self[deleteItem](...args) : null,
				onSelect(itemID) {
					if (isArray(itemID)) {
						itemID.forEach((ID, index) => {
							self[toggleSelectedItem](ID, index < itemID.length - 1);
						});
					}
					else {
						self[toggleSelectedItem](itemID);
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
				ID: newItem,
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
		let options = self.options();
		let wasSelected = false;

		softDelete({
			title: item.title + ' deleted',
			value: options,
			onDo() {
				self[hideMenu]();

				if (self[checkSelected](item.ID)) {
					wasSelected = true;
					self[toggleSelectedItem](options.children[0].ID);
				}

				remove(options.children, (option) => option.ID === item.ID);

				self.options(options, true);
			},
			onUndo(originalOptions) {
				self.options(originalOptions);
				if (wasSelected) {
					self[toggleSelectedItem](item);
				}
			},
			onCommit() {
				self.onDelete().call(self, item);
			}
		});
	}

	/**
	 * Show the dialog when the add/edit button is clicked
	 * @function showDialog
	 */
	[showDialog](itemID, newTitle) {
		const self = this;

		self[DIALOG] = new Dialog({
			title: (itemID ? locale.get('edit') : locale.get('add')) + ' ' + self.title(),
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

		self.onBuildDialogContents().call(self, self[DIALOG], itemID, newTitle);
		self[DIALOG].resize();
	}
}

Object.assign(Picker.prototype, {
	// dataSource: method.object({
	// 	init: {},
	// 	before(oldValue) {
	// 		if (oldValue) {
	// 			if (dataSourceOnChangeID) {
	// 				oldValue.store.offChange(dataSourceOnChangeID);
	// 				dataSourceOnChangeID = null;
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
	// 					item.isEnabled = !disabledItems.includes(item.ID);
	// 					return item;
	// 				});
	// 				if (newPreferred) {
	// 					newPreferred = newPreferred.map((item) => {
	// 						item.isEnabled = !disabledItems.includes(item.ID);
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
	// 				dataSourceOnChangeID = dataSource.uniqueBy(newValue, (options) => {
	// 					optionsStore = options;
	// 					mapOptions();
	// 				});
	// 			}
	// 			else {
	// 				dataSourceOnChangeID = dataSource.optionsAndPreferred(newValue, (options, preferred) => {
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
	 * @method options
	 * @member module:Picker
	 * @instance
	 * @arg {Object} newOptions - See initial input options.
	 * @returns {Object|this}
	 */
	options: method.any({
		init: {
			isMultiSelect: false,
			children: []
		},
		enforce(newOptions, oldOptions) {
			if (isArray(newOptions)) {
				newOptions = {
					isMultiSelect: false,
					children: newOptions
				};
				return newOptions;
			}
			if (isObject(newOptions)) {
				return newOptions;
			}
			return oldOptions;
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
	 * @method preferred
	 * @member module:Picker
	 * @instance
	 * @arg {Array} preferred - Prioritized array of option ID's.
	 * @returns {Array|this}
	 */
	preferred: method.array({
		set() {
			this[buildPreferredItemsList]();
		}
	}),

	/**
	 * Callback that is called after the options method is called.
	 * @method onOptionsChange
	 * @member module:Picker
	 * @instance
	 * @arg {Function} [callback]
	 * @returns {Function|this}
	 */
	onOptionsChange: method.function(),

	/**
	 * Get or set the value of this control
	 *
	 * @method value
	 * @member module:Picker
	 * @instance
	 *
	 * @arg {String|Array} [newValue]      - Can be a comma delimited string of values or an array of values.
	 * @arg {Boolean} [isForcedSave=false] - Normally this control won't save a new value if it has focus, a 'true'
	 *     value here will override this functionality and save anyway.
	 *
	 * @returns {Boolean|String} - If a new value doesn't match an option then 'false' is returned. If no value is
	 *     provided then the current value is returned.
	 */
	value(newValue, isForcedSave) {
		const self = this;

		if (typeof newValue !== 'undefined') {
			if (typeof newValue === 'string') {
				newValue = newValue.split(',');
			}
			else if (!(newValue instanceof Array)) {
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
		else {
			return clone(self[SELECTED_ITEMS]);
		}
	},

	/**
	 * Get the width of the grouped buttons.
	 * @method getContentWidth
	 * @member module:Picker
	 * @instance
	 */
	getContentWidth() {
		return this[GROUPED_BUTTONS].borderWidth();
	},

	/**
	 * Selects all options
	 * @method selectAll
	 * @member module:Picker
	 * @instance
	 */
	selectAll() {
		const self = this;

		if (self[HAS_MULTI_SELECT]) {
			self[SELECTED_ITEMS] = [];

			collectionHelper.eachChild(self.options().children, (item) => {
				if (item.isMultiSelect) {
					self[SELECTED_ITEMS].push(item);
				}
			});

			self[setSelectedItems](self[SELECTED_ITEMS]);
		}
	},

	/**
	 * Unselects all selected options
	 * @method unselectAll
	 * @member module:Picker
	 * @instance
	 */
	unselectAll() {
		if (this[SELECTED_ITEMS].length > 0) {
			this[setSelectedItems]([]);
		}
	},

	/**
	 * Determines if a selected value can be unselected.
	 *
	 * @method canUnselect
	 * @member module:Picker
	 * @instance
	 * @arg {Boolean} canUnselect
	 * @returns {Boolean|this}
	 */
	canUnselect: method.boolean({
		init: true
	}),

	/**
	 * Text to display on the popup button if no items are selected or showSelectedItems is false
	 *
	 * @method defaultButtonText
	 * @member module:Picker
	 * @instance
	 *
	 * @arg {string} defaultButtonText
	 *
	 * @returns {string|this}
	 */
	defaultButtonText: method.string({
		set() {
			this[updateGroupedButtonsLayout]();
		}
	}),

	/**
	 * Icon to display on the popup button if no items are selected or showSelectedItems is false
	 *
	 * @method defaultButtonIcon
	 * @member module:Picker
	 * @instance
	 *
	 * @arg {string} defaultButtonIcon
	 *
	 * @returns {string|this}
	 */
	defaultButtonIcon: method.string({
		set() {
			this[updateGroupedButtonsLayout]();
		}
	}),

	/**
	 * Text to display in the popup button if there are no options
	 *
	 * @method emptyButtonText
	 * @member module:Picker
	 * @instance
	 *
	 * @arg {string} emptyButtonText
	 *
	 * @returns {string|this}
	 */
	emptyButtonText: method.string({
		set() {
			this[updateGroupedButtonsLayout]();
		}
	}),

	/**
	 * If true then shows the selected items on the popup button
	 *
	 * @method showSelectedItems
	 * @member module:Picker
	 * @instance
	 *
	 * @arg {Boolean} showSelectedItems
	 *
	 * @returns {Boolean|this}
	 */
	showSelectedItems: method.boolean({
		init: true
	}),

	showAll: method.boolean({
		set() {
			this[buildPreferredItemsList]();
		}
	}),

	/**
	 * If true then a checkbox is shown in the popup that allows to filter the items to see only selected ones.
	 *
	 * @method canFilterSelectedOnly
	 * @member module:Picker
	 * @instance
	 *
	 * @arg {Boolean} canFilterSelectedOnly
	 *
	 * @returns {Boolean|this}
	 */
	canFilterSelectedOnly: method.boolean(),

	canSelectAll: method.boolean(),

	onAdd: method.function(),

	onEdit: method.function(),

	onDelete: method.function(),

	onBuildDialogContents: method.function({
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

	onRemoveDialogContents: method.function()
});
