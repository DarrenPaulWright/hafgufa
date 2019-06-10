import { AUTO, enforce, enforceInteger, HUNDRED_PERCENT, isArray, method } from 'type-enforcer';
import uuid from 'uuid/v4';
import dom from '../../utility/dom';
import { HEIGHT, TAB_INDEX, TAB_INDEX_DISABLED, TAB_INDEX_ENABLED, WIDTH } from '../../utility/domConstants';
import MultiItemFocus from '../../utility/MultiItemFocus';
import objectHelper from '../../utility/objectHelper';
import ControlRecycler from '../ControlRecycler';
import controlTypes from '../controlTypes';
import Button from '../elements/Button';
import Div from '../elements/Div';
import FocusMixin from '../mixins/FocusMixin';
import { ORIENTATION } from '../uiConstants';
import FormControl from './FormControl';
import './GroupedButtons.less';

const BUTTON_RECYCLER = Symbol();
const SHADOW_RECYCLER = Symbol();
const BUTTON_CONTAINER = Symbol();
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
 * @constructor
 *
 * @arg {Object} settings - Accepts all control and FormControl options plus:
 */
export default class GroupedButtons extends FocusMixin(FormControl) {
	constructor(settings = {}) {
		let buttonContainer = new Div({
			classes: 'grouped-buttons-wrapper'
		});
		settings.type = settings.type || controlTypes.GROUPED_BUTTONS;
		settings.width = enforce.cssSize(settings.width, AUTO, true);
		settings.FocusMixin = settings.FocusMixin || {};
		settings.FocusMixin.mainControl = buttonContainer;
		settings.FocusMixin.setFocus = () => {
			self[MULTI_ITEM_FOCUS].first();
		};
		settings.buttons = settings.buttons || [];

		super(settings);

		const self = this;
		self.addClass('grouped-buttons');

		self[BUTTON_CONTAINER] = buttonContainer;
		self[BUTTON_CONTAINER].container(self);
		buttonContainer = null;

		self[SHADOW_CONTAINER] = new Div({
			container: self[BUTTON_CONTAINER],
			classes: 'shadows'
		});
		self[SHADOW_CONTAINER].removeClass('container clearfix');

		self[MULTI_ITEM_FOCUS] = new MultiItemFocus(self[BUTTON_CONTAINER].element())
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

		objectHelper.applySettings(self, settings);

		self
			.onRemove(() => {
				self[BUTTON_RECYCLER].remove();
				self[SHADOW_RECYCLER].remove();
				self[MULTI_ITEM_FOCUS].remove();
				self[BUTTON_CONTAINER].remove();
			})
			.onResize(() => {
				const CURRENT_ORIENTATION = (self.orientation() === ORIENTATION.VERTICAL) ? WIDTH : HEIGHT;
				const CURRENT_ORIENTATION_READ = (CURRENT_ORIENTATION === WIDTH) ? 'borderWidth' : 'borderHeight';
				let maxSize = 0;

				self[BUTTON_CONTAINER].css(CURRENT_ORIENTATION, AUTO);
				self[BUTTON_RECYCLER].each((control) => {
					maxSize = Math.max(maxSize, control[CURRENT_ORIENTATION_READ]());
				});
				maxSize += dom.get.paddings[CURRENT_ORIENTATION](self[BUTTON_CONTAINER]);
				self[BUTTON_CONTAINER].css(CURRENT_ORIENTATION, maxSize);
				self[setGroupShadows]();
			});
	}

	/**
	 * Button click callback. Manages selection state.
	 * @function onButtonClick
	 */
	[onButtonClick](button) {
		const self = this;
		let buttonData = self.buttons().find((item) => item.ID === button.ID());
		let currentValue;

		self[MULTI_ITEM_FOCUS].current(buttonData);

		if (!self.isMultiSelect()) {
			self.value(button.ID());
			self[setAllButtonToggles]();
		}
		else {
			self.value(enforce.array(self.value(), []));
			currentValue = self.value();
			if (button.isSelected()) {
				currentValue.push(button.ID());
			}
			else {
				currentValue.splice(currentValue.indexOf(button.ID()), 1);
			}
			self.value(currentValue.reduce((result, item) => {
				if (!result.includes(item)) {
					result.push(item);
				}
				return result;
			}, []));
		}

		if (buttonData.onClick) {
			buttonData.onClick(button);
		}
		self.triggerChange();
	}

	/**
	 * Get the appropriate width for each button.
	 * @function getButtonWidthSetting
	 */
	[getButtonWidthSetting]() {
		return this.orientation() === ORIENTATION.VERTICAL ? HUNDRED_PERCENT : AUTO;
	}

	/**
	 * Build a single button and add it to the DOM at a specific location
	 * @function buildButton
	 */
	[buildButton](settings, doSaveData, insertIndex) {
		const self = this;
		const button = self[BUTTON_RECYCLER].getRecycledControl();
		const currentButtons = self.buttons();

		if (!settings.ID) {
			settings.ID = settings.id || uuid();
			delete settings.id;
		}
		settings.ID = settings.ID.toString();

		objectHelper.applySettings(button, {
			...settings,
			container: self[BUTTON_CONTAINER],
			isSelectable: self.isSelectable(),
			width: self[getButtonWidthSetting](),
			onClick: (button) => self[onButtonClick](button)
		});

		insertIndex = Math.min(enforceInteger(insertIndex, currentButtons.length), currentButtons.length);

		if (insertIndex < currentButtons.length) {
			dom.appendBefore(self[BUTTON_CONTAINER].element().children[insertIndex], button);
		}
		else {
			dom.appendTo(self[BUTTON_CONTAINER], button);
		}

		if (doSaveData) {
			currentButtons.splice(insertIndex, 0, settings);
		}
		self[MULTI_ITEM_FOCUS].length(currentButtons.length);
	}

	/**
	 * Set the toggled state of all buttons based on the current value.
	 * @function setAllButtonToggles
	 */
	[setAllButtonToggles]() {
		const self = this;
		const currentValue = self.value();

		self[BUTTON_RECYCLER].each((button, index) => {
			button.isSelected(self.isMultiSelect() ? (currentValue && currentValue.includes(button.ID())) : (currentValue === button.ID()));
			button.attr(TAB_INDEX, index === 0 ? TAB_INDEX_ENABLED : TAB_INDEX_DISABLED);
		});

		self.resize();
	}

	[setGroupShadows]() {
		const self = this;
		const shadows = [];
		let control;
		const CURRENT_ORIENTATION = (self.orientation() === ORIENTATION.VERTICAL) ? WIDTH : HEIGHT;
		const CURRENT_ORIENTATION_READ = (CURRENT_ORIENTATION === WIDTH) ? 'borderHeight' : 'borderWidth';

		self.buttons().forEach((buttonData) => {
			control = self[BUTTON_RECYCLER].getControl(buttonData.ID);
			const isSelected = control.isSelected();

			if (!shadows.length || shadows[shadows.length - 1].isSelected !== isSelected) {
				shadows.push({
					isSelected: isSelected,
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
	 * Sets focus on the current focus Button
	 * @function setFocusIndex
	 */
	[setFocusIndex](index) {
		if (this.buttons().length >= index + 1) {
			this[BUTTON_RECYCLER].getControl(this.buttons()[index].ID)
				.focus();
		}
	}
}

Object.assign(GroupedButtons.prototype, {
	/**
	 * @method value
	 * @member module:GroupedButtons
	 * @instance
	 * @arg {Array|String} [value]
	 * @returns {Array|String|this}
	 */
	value: method.any({
		set: function(newValue) {
			const self = this;
			if (self.isMultiSelect()) {
				self.value(enforce.array(newValue, [newValue]));
			}
			else {
				self.value(isArray(newValue) ? newValue[0] : newValue);
			}
			self[setAllButtonToggles]();
		}
	}),

	/**
	 * Add a single button to this control
	 *
	 * @method addButton
	 * @member module:GroupedButtons
	 * @instance
	 *
	 * @arg {Object} buttonSettings
	 * @arg {Int}    [insertIndex]
	 *
	 * @returns {this}
	 */
	addButton: function(buttonSettings, insertIndex) {
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
	 * @member module:GroupedButtons
	 * @instance
	 * @arg {String} ID
	 * @returns {this}
	 */
	removeButton: function(ID) {
		const self = this;
		const buttons = self.buttons();

		self[BUTTON_RECYCLER].discardControl(ID);
		buttons.splice(buttons.findIndex((button) => button.ID === ID), 1);
		self[setAllButtonToggles]();

		return self;
	},

	/**
	 * Remove all the buttons from this control
	 *
	 * @method removeAllButtons
	 * @member module:GroupedButtons
	 * @instance
	 * @returns {this}
	 */
	removeAllButtons: function() {
		return this.buttons([]);
	},

	/**
	 * Get a previously added button by ID
	 *
	 * @method getButton
	 * @member module:GroupedButtons
	 * @instance
	 * @arg {String}    ID
	 * @returns {Object}
	 */
	getButton: function(ID) {
		return this[BUTTON_RECYCLER].getControl(ID);
	},

	/**
	 * The buttons in this control.
	 *
	 * @method buttons
	 * @member module:GroupedButtons
	 * @instance
	 * @arg {Array} [buttons]
	 * @returns {Array|this}
	 */
	buttons: method.array({
		set: function(buttons) {
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
	 * @member module:GroupedButtons
	 * @instance
	 * @returns {Int}
	 */
	totalButtons: function() {
		return this.buttons().length;
	},

	/**
	 * Determines whether the buttons in this control can be toggled.
	 * If false then buttons do not maintain state, this control will have no value,
	 * but each button will still fire click callbacks.
	 *
	 * @method isSelectable
	 * @member module:GroupedButtons
	 * @instance
	 * @arg {Boolean} [isSelectable]
	 * @returns {Boolean|this}
	 */
	isSelectable: method.boolean({
		init: true,
		set: function(isSelectable) {
			this[BUTTON_RECYCLER].each((control) => {
				control.isSelectable(isSelectable);
			});
		}
	}),

	/**
	 * Determines whether multiple buttons can be toggled at the same time or not.
	 *
	 * @method isMultiSelect
	 * @member module:GroupedButtons
	 * @instance
	 * @arg {Boolean} [isMultiSelect]
	 * @returns {Boolean|this}
	 */
	isMultiSelect: method.boolean({
		set: function() {
			this.value(this.value());
		}
	}),

	/**
	 * The layout direction of the buttons. Use GroupedButtons.ORIENTATION to set.
	 *
	 * @method orientation
	 * @member module:GroupedButtons
	 * @instance
	 * @arg {String} [orientation]
	 * @returns {String|this}
	 */
	orientation: method.enum({
		init: ORIENTATION.HORIZONTAL,
		enum: ORIENTATION,
		set: function(newValue) {
			const self = this;

			self.classes('vertical', newValue === ORIENTATION.VERTICAL);
			self[BUTTON_RECYCLER].each((control) => {
				control.width(self[getButtonWidthSetting]());
			});
		}
	})
});

GroupedButtons.ORIENTATION = ORIENTATION;
