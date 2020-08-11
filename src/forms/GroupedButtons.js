import shortid from 'shortid';
import {
	applySettings,
	AUTO,
	castArray,
	enforceArray,
	enforceInteger,
	HUNDRED_PERCENT,
	isArray,
	methodAny,
	methodArray,
	methodBoolean,
	methodEnum
} from 'type-enforcer-ui';
import ControlRecycler from '../ControlRecycler.js';
import controlTypes from '../controlTypes.js';
import Button from '../elements/Button.js';
import Div from '../elements/Div.js';
import { ORIENTATION } from '../uiConstants.js';
import assign from '../utility/assign.js';
import { HEIGHT, TAB_INDEX, TAB_INDEX_DISABLED, TAB_INDEX_ENABLED, WIDTH } from '../utility/domConstants.js';
import MultiItemFocus from '../utility/MultiItemFocus.js';
import setDefaults from '../utility/setDefaults.js';
import FormControl from './FormControl.js';
import './GroupedButtons.less';

const BUTTON_RECYCLER = Symbol();
const SHADOW_RECYCLER = Symbol();
const SHADOW_CONTAINER = Symbol();
const MULTI_ITEM_FOCUS = Symbol();

const onButtonClick = Symbol();
const getButtonWidthSetting = Symbol();
const buildButton = Symbol();
const setAllButtonToggles = Symbol();
const setGroupShadows = Symbol();
const setFocusIndex = Symbol();

/**
 * Visually groups buttons together
 *
 * @class GroupedButtons
 * @extends FormControl
 * @mixes FocusMixin
 *
 * @param {object} settings - Accepts all control and FormControl options plus:
 */
export default class GroupedButtons extends FormControl {
	constructor(settings = {}) {
		const buttonContainer = new Div({
			classes: 'grouped-buttons-wrapper'
		});

		super(setDefaults({
			type: controlTypes.GROUPED_BUTTONS,
			width: AUTO,
			buttons: []
		}, settings, {
			contentContainer: buttonContainer,
			FocusMixin: assign(settings.FocusMixin, {
				mainControl: buttonContainer,
				setFocus() {
					self[MULTI_ITEM_FOCUS].first();
				}
			})
		}));

		const self = this;
		self.addClass('grouped-buttons');

		self[SHADOW_CONTAINER] = new Div({
			container: self.contentContainer,
			classes: 'shadows'
		});

		self[MULTI_ITEM_FOCUS] = new MultiItemFocus(self.contentContainer)
			.onSetFocus((index) => {
				self[setFocusIndex](index);
			});

		self[BUTTON_RECYCLER] = new ControlRecycler()
			.control(Button)
			.defaultSettings({
				classes: 'form-button'
			});

		self[SHADOW_RECYCLER] = new ControlRecycler()
			.control(Div)
			.defaultSettings({
				classes: 'shadow'
			});

		applySettings(self, settings);

		self
			.onRemove(() => {
				self[MULTI_ITEM_FOCUS].remove();
			})
			.onResize(() => {
				const CURRENT_ORIENTATION = (self.orientation() === ORIENTATION.VERTICAL) ? WIDTH : HEIGHT;
				const CURRENT_ORIENTATION_READ = (CURRENT_ORIENTATION === WIDTH) ? 'borderWidth' : 'borderHeight';
				let maxSize = 0;

				self.contentContainer.css(CURRENT_ORIENTATION, AUTO);
				self[BUTTON_RECYCLER].each((control) => {
					maxSize = Math.max(maxSize, control[CURRENT_ORIENTATION_READ]());
				});
				if (CURRENT_ORIENTATION === WIDTH) {
					maxSize += self.contentContainer.paddingWidth;
				}
				else {
					maxSize += self.contentContainer.paddingHeight;
				}
				self.contentContainer.css(CURRENT_ORIENTATION, maxSize);
				self[setGroupShadows]();
			});
	}

	/**
	 * Button click callback. Manages selection state.
	 *
	 * @private
	 *
	 * @param button
	 * @param event
	 */
	[onButtonClick](button, event) {
		const self = this;
		const buttonData = self.buttons().find((item) => item.id === button.id());
		let currentValue;

		self[MULTI_ITEM_FOCUS].current(buttonData);

		if (!self.isMultiSelect()) {
			self.value(button.id());
			self[setAllButtonToggles]();
		}
		else {
			self.value(enforceArray(self.value(), []));
			currentValue = self.value();
			if (button.isSelected()) {
				currentValue.push(button.id());
			}
			else {
				currentValue.splice(currentValue.indexOf(button.id()), 1);
			}
			self.value(currentValue.reduce((result, item) => {
				if (!result.includes(item)) {
					result.push(item);
				}
				return result;
			}, []));
		}

		if (buttonData.onClick) {
			buttonData.onClick.call(button, event);
		}
		self.triggerChange();
	}

	/**
	 * Get the appropriate width for each button.
	 *
	 * @function getButtonWidthSetting
	 */
	[getButtonWidthSetting]() {
		return this.orientation() === ORIENTATION.VERTICAL ? HUNDRED_PERCENT : AUTO;
	}

	/**
	 * Build a single button and add it to the DOM at a specific location
	 *
	 * @private
	 *
	 * @param settings
	 * @param doSaveData
	 * @param insertIndex
	 */
	[buildButton](settings, doSaveData, insertIndex) {
		const self = this;
		const button = self[BUTTON_RECYCLER].getRecycledControl();
		const currentButtons = self.buttons();

		settings.id = settings.id ? settings.id.toString() : shortid.generate();

		applySettings(button, {
			...settings,
			container: self.contentContainer,
			isSelectable: self.isSelectable(),
			width: self[getButtonWidthSetting](),
			onClick(event) {
				self[onButtonClick](this, event);
			}
		});

		insertIndex = Math.min(enforceInteger(insertIndex, currentButtons.length), currentButtons.length);

		if (insertIndex < currentButtons.length) {
			self.contentContainer.insertAt(button, insertIndex + 1);
		}
		else {
			self.contentContainer.append(button);
		}

		if (doSaveData) {
			currentButtons.splice(insertIndex, 0, settings);
		}
		self[MULTI_ITEM_FOCUS].length(currentButtons.length);
	}

	/**
	 * Set the toggled state of all buttons based on the current value.
	 */
	[setAllButtonToggles]() {
		const self = this;
		const currentValue = self.value() || [];
		let isSelected;

		self[BUTTON_RECYCLER].each((button, index) => {
			if (self.isMultiSelect()) {
				isSelected = currentValue.includes(button.id());
			}
			else {
				isSelected = currentValue === button.id();
			}

			if (button.isSelected() !== isSelected) {
				button.isSelected(isSelected);
			}

			button.attr(TAB_INDEX, index === 0 ? TAB_INDEX_ENABLED : TAB_INDEX_DISABLED);
		});

		self.resize(true);
	}

	[setGroupShadows]() {
		const self = this;
		const shadows = [];
		let control;
		const CURRENT_ORIENTATION = (self.orientation() === ORIENTATION.VERTICAL) ? WIDTH : HEIGHT;
		const CURRENT_ORIENTATION_READ = (CURRENT_ORIENTATION === WIDTH) ? 'borderHeight' : 'borderWidth';

		self.buttons().forEach((buttonData) => {
			control = self[BUTTON_RECYCLER].getControl(buttonData.id);
			const isSelected = control.isSelected();

			if (!shadows.length || shadows[shadows.length - 1].isSelected !== isSelected) {
				shadows.push({
					isSelected,
					size: control[CURRENT_ORIENTATION_READ]()
				});
			}
			else {
				shadows[shadows.length - 1].size += control[CURRENT_ORIENTATION_READ]();
			}
		});

		self[SHADOW_RECYCLER].discardAllControls();
		shadows.forEach((shadow) => {
			self[SHADOW_RECYCLER].getRecycledControl()
				.container(self[SHADOW_CONTAINER])
				.width(CURRENT_ORIENTATION === HEIGHT ? shadow.size + 'px' : HUNDRED_PERCENT)
				.height(CURRENT_ORIENTATION === WIDTH ? shadow.size + 'px' : HUNDRED_PERCENT)
				.classes('shadow', !shadow.isSelected);
		});
	}

	/**
	 * Sets focus on the current focus Button.
	 *
	 * @param {number} index
	 */
	[setFocusIndex](index) {
		if (this.buttons().length >= index + 1) {
			this[BUTTON_RECYCLER].getControl(this.buttons()[index].id)
				.isFocused(true);
		}
	}
}

Object.assign(GroupedButtons.prototype, {
	/**
	 * @method value
	 * @memberOf GroupedButtons
	 * @instance
	 * @param {Array|string} [value]
	 * @returns {Array|string|this}
	 */
	value: methodAny({
		enforce(newValue) {
			if (this.isMultiSelect()) {
				return castArray(newValue);
			}

			return isArray(newValue) ? newValue[0] : newValue;
		},
		set: setAllButtonToggles
	}),

	/**
	 * Add a single button to this control
	 *
	 * @method addButton
	 * @memberOf GroupedButtons
	 * @instance
	 *
	 * @param {object} buttonSettings
	 * @param {number.int}    [insertIndex]
	 *
	 * @returns {this}
	 */
	addButton(buttonSettings, insertIndex) {
		const self = this;

		if (buttonSettings) {
			self[buildButton](buttonSettings, true, insertIndex);
			self[setAllButtonToggles]();
		}

		return self;
	},

	/**
	 * Remove a single button from this control
	 *
	 * @method removeButton
	 * @memberOf GroupedButtons
	 * @instance
	 * @param {string} id
	 * @returns {this}
	 */
	removeButton(id) {
		const self = this;
		const buttons = self.buttons();

		self[BUTTON_RECYCLER].discardControl(id);
		buttons.splice(buttons.findIndex((button) => button.id === id), 1);
		self[setAllButtonToggles]();

		return self;
	},

	/**
	 * Remove all the buttons from this control
	 *
	 * @method removeAllButtons
	 * @memberOf GroupedButtons
	 * @instance
	 * @returns {this}
	 */
	removeAllButtons() {
		return this.buttons([]);
	},

	/**
	 * Get a previously added button by id
	 *
	 * @method getButton
	 * @memberOf GroupedButtons
	 * @instance
	 * @param {string}    id
	 * @returns {object}
	 */
	getButton(id) {
		return this[BUTTON_RECYCLER].getControl(id);
	},

	/**
	 * The buttons in this control.
	 *
	 * @method buttons
	 * @memberOf GroupedButtons
	 * @instance
	 * @param {Array} [buttons]
	 * @returns {Array|this}
	 */
	buttons: methodArray({
		set(buttons) {
			const self = this;

			self[BUTTON_RECYCLER].discardAllControls();
			buttons.forEach((button) => self[buildButton](button, false));
			self[setAllButtonToggles]();
		}
	}),

	/**
	 * Gets the total number of rendered buttons in this control
	 *
	 * @method totalButtons
	 * @memberOf GroupedButtons
	 * @instance
	 * @returns {number.int}
	 */
	totalButtons() {
		return this.buttons().length;
	},

	/**
	 * Determines whether the buttons in this control can be toggled.
	 * If false then buttons do not maintain state, this control will have no value,
	 * but each button will still fire click callbacks.
	 *
	 * @method isSelectable
	 * @memberOf GroupedButtons
	 * @instance
	 * @param {boolean} [isSelectable]
	 * @returns {boolean|this}
	 */
	isSelectable: methodBoolean({
		init: true,
		set(isSelectable) {
			this[BUTTON_RECYCLER].each((control) => {
				control.isSelectable(isSelectable);
			});
		}
	}),

	/**
	 * Determines whether multiple buttons can be toggled at the same time or not.
	 *
	 * @method isMultiSelect
	 * @memberOf GroupedButtons
	 * @instance
	 * @param {boolean} [isMultiSelect]
	 * @returns {boolean|this}
	 */
	isMultiSelect: methodBoolean({
		set() {
			this.value(this.value());
		}
	}),

	/**
	 * The layout direction of the buttons. Use GroupedButtons.ORIENTATION to set.
	 *
	 * @method orientation
	 * @memberOf GroupedButtons
	 * @instance
	 * @param {string} [orientation]
	 * @returns {string|this}
	 */
	orientation: methodEnum({
		init: ORIENTATION.HORIZONTAL,
		enum: ORIENTATION,
		set(newValue) {
			const self = this;

			self.classes('vertical', newValue === ORIENTATION.VERTICAL);
			self[BUTTON_RECYCLER].each((control) => {
				control.width(self[getButtonWidthSetting]());
			});
		}
	})
});

GroupedButtons.ORIENTATION = ORIENTATION;
