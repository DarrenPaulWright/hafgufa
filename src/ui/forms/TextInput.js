import { throttle } from 'async-agent';
import { event } from 'd3';
import keyCodes from 'keycodes';
import { AUTO, CssSize, enforce, HUNDRED_PERCENT, isInteger, isNumber, method } from 'type-enforcer';
import dom from '../../utility/dom';
import replaceElement from '../../utility/dom/replaceElement';
import {
	BLUR_EVENT,
	FOCUS_EVENT,
	INPUT_TYPE_PASSWORD,
	INPUT_TYPE_TEXT,
	KEY_UP_EVENT,
	MAX_LENGTH,
	PLACE_HOLDER
} from '../../utility/domConstants';
import clamp from '../../utility/math/clamp';
import objectHelper from '../../utility/objectHelper';
import stringHelper from '../../utility/stringHelper';
import controlTypes from '../controlTypes';
import Input from '../elements/Input';
import Span from '../elements/Span';
import TextArea from '../elements/TextArea';
import ActionButtonMixin from '../mixins/ActionButtonMixin';
import FormControl from './FormControl';
import './TextInput.less';

const ON_CHANGE_DELAY = 200;
const ON_CHANGE_DELAY_LONG = 500;
const ON_CHANGE_EVENTS = 'change keypress cut paste textInput input propertychange';

const STRINGS = Symbol();
const INPUT = Symbol();
const PREFIX = Symbol();
const PREFIX_WIDTH = Symbol();
const SUFFIX = Symbol();
const SUFFIX_WIDTH = Symbol();

const positionElements = Symbol();
const maxRowCallback = Symbol();

/**
 * A text input control
 *
 * @class TextInput
 * @extends FormControl
 * @constructor
 *
 * @param {Object} settings
 */
export default class TextInput extends ActionButtonMixin(FormControl) {
	constructor(settings = {}) {
		settings.type = settings.type || controlTypes.TEXT;
		settings.width = enforce.cssSize(settings.width, AUTO, true);
		settings.height = enforce.cssSize(settings.height, AUTO, true);
		settings.rows = settings.rows || 1;
		settings.changeDelay = 'changeDelay' in settings ? settings.changeDelay : (settings.rows === 1 ? ON_CHANGE_DELAY : ON_CHANGE_DELAY_LONG);
		settings.ActionButtonMixin = {
			container: () => {
				return self[INPUT];
			}
		};

		super(settings);

		const self = this;

		self[STRINGS] = settings.localizedStrings || {};

		self.addClass('text-input');

		self.onChange(() => {
			self.validate();
		});

		objectHelper.applySettings(self, settings, null, ['rows']);

		self.onBlur(() => {
			self.validate();
		});

		self.onResize(() => {
			if (self[PREFIX]) {
				self[PREFIX].resize();
			}
			if (self[SUFFIX]) {
				self[SUFFIX].resize();
			}
			self[positionElements]();
			self[maxRowCallback]();

			if (self.rows() > 1 && !self.height().isAuto) {
				self[INPUT].height(dom.get.height(self.contentContainer()));
			}
		}, true);

		self.onRemove(() => {
			self.blur()
				.prefix('')
				.suffix('');

			self[INPUT].remove();
		});
	}

	/**
	 * Calculate the width of the text element if there is a prefix or suffix or textWidth
	 * @function positionElements
	 */
	[positionElements]() {
		const self = this;

		if (!self.isRemoved) {
			let baseWidth = self.borderWidth();
			let textWidth = self.textWidth() || new CssSize(self.width().isAuto ? '14em' : HUNDRED_PERCENT);

			if (textWidth.toString() !== HUNDRED_PERCENT) {
				if (textWidth.isFixed) {
					baseWidth = textWidth.toPixels(true);
				}
				else if (textWidth.isPercent) {
					baseWidth *= textWidth.value / 100;
				}
			}

			if (self[PREFIX_WIDTH] || self[SUFFIX_WIDTH]) {
				baseWidth -= Math.ceil(self[PREFIX_WIDTH] + self[SUFFIX_WIDTH]) + 1;
			}

			self[INPUT].width(baseWidth);
		}
	}

	[maxRowCallback]() {
		const self = this;
		const minRows = self.rows();
		const maxRows = self.maxRows();

		if (maxRows && maxRows > minRows && minRows > 1) {
			const lineHeight = dom.get.lineHeight(self[INPUT]);
			const padding = dom.get.paddings.height(self[INPUT]);

			if (lineHeight) {
				self[INPUT].height('1px');

				let actualRows = Math.floor(dom.get.scrollHeight(self[INPUT]) / lineHeight);
				actualRows = clamp(actualRows, minRows, maxRows);

				self[INPUT].height((actualRows * lineHeight) + padding);
			}
		}
	}
}

Object.assign(TextInput.prototype, {
	/**
	 * @method rows
	 * @member module:TextInput
	 * @instance
	 * @param {Int} [newRows]
	 * @returns {Int|this}
	 */
	rows: method.integer({
		set: function(rows) {
			const self = this;
			let oldInput = self[INPUT];

			if (rows === 1) {
				self[INPUT] = new Input({
					container: oldInput ? null : self,
					inputType: INPUT_TYPE_TEXT
				});
				self.changeDelay(ON_CHANGE_DELAY);
			}
			else {
				self[INPUT] = new TextArea({
					container: oldInput ? null : self,
					rows: rows
				});
				self.changeDelay(ON_CHANGE_DELAY_LONG);
			}

			if (oldInput) {
				replaceElement(oldInput.element(), self[INPUT].element());
				oldInput.remove();
				oldInput = null;
			}

			self.contentWidthContainer(self[INPUT]);

			self[INPUT]
				.on(ON_CHANGE_EVENTS, throttle(() => {
					self[maxRowCallback]();
					self.triggerChange();
				}, 0, {
					trailing: false
				}));
		},
		min: 1
	}),

	maxRows: method.integer({
		set: function() {
			this[maxRowCallback]();
		}
	}),

	textWidth: method.cssSize({
		set: function() {
			this[positionElements]();
		}
	}),

	/**
	 * @method isPassword
	 * @member module:TextInput
	 * @instance
	 * @param {Boolean} [newIsPassword]
	 * @returns {Boolean|this}
	 */
	isPassword: method.boolean({
		set: function(isPassword) {
			if (this.rows() === 1) {
				this[INPUT].inputType(isPassword ? INPUT_TYPE_PASSWORD : INPUT_TYPE_TEXT);
			}
		}
	}),

	isSoftValidation: method.boolean({
		init: true,
		set: function() {
			if (this.maxLength()) {
				this.maxLength(this.maxLength(), true);
			}
		}
	}),

	/**
	 * @method minLength
	 * @member module:TextInput
	 * @instance
	 * @param {Int} [newMinLength]
	 * @returns {Int|this}
	 */
	minLength: method.integer({
		other: undefined
	}),

	/**
	 * @method maxLength
	 * @member module:TextInput
	 * @instance
	 * @param {Int} [newMaxLength]
	 * @returns {Int|this}
	 */
	maxLength: method.integer({
		set: function(newValue) {
			this[INPUT].attr(MAX_LENGTH, (this.isSoftValidation() || !newValue) ? null : newValue);
		},
		other: undefined
	}),

	/**
	 * @method minValue
	 * @member module:TextInput
	 * @instance
	 * @param {Int} [newMinValue]
	 * @returns {Int|this}
	 */
	minValue: method.integer({
		other: undefined
	}),

	/**
	 * @method maxValue
	 * @member module:TextInput
	 * @instance
	 * @param {Int} [newMaxValue]
	 * @returns {Int|this}
	 */
	maxValue: method.integer({
		other: undefined
	}),

	/**
	 * @method isInt
	 * @member module:TextInput
	 * @instance
	 * @param {Boolean} [newMaxValue]
	 * @returns {Boolean|this}
	 */
	isInt: method.boolean(),

	/**
	 * @method isNumber
	 * @member module:TextInput
	 * @instance
	 * @param {Boolean} [newMaxValue]
	 * @returns {Boolean|this}
	 */
	isNumber: method.boolean(),

	/**
	 * @method totalNumberDigits
	 * @member module:TextInput
	 * @instance
	 * @param {Boolean} [newMaxValue]
	 * @returns {Boolean|this}
	 */
	maxNumberDigits: method.integer({
		other: undefined,
		min: 1
	}),

	/**
	 * @method maxFractionDigits
	 * @member module:TextInput
	 * @instance
	 * @param {Boolean} [newMaxValue]
	 * @returns {Boolean|this}
	 */
	maxFractionDigits: method.integer({
		other: undefined,
		min: 1
	}),

	/**
	 * @method validate
	 * @member module:TextInput
	 * @instance
	 * @returns {this}
	 */
	validate: function() {
		const self = this;
		const currentValue = self.value();
		let errorMessage = '';
		let splitValue;
		let fractionDigits = 0;
		let totalNumberDigits = 0;

		if (self[STRINGS]) {
			if (self.isRequired() && currentValue === '') {
				errorMessage = self[STRINGS].requiredField;
			}
			else if (currentValue !== '') {
				if (self.maxValue() !== undefined || self.minValue() !== undefined || self.isInt() || self.isNumber()) {
					if (!errorMessage && self.isInt() && !isInteger(currentValue, true)) {
						errorMessage = self[STRINGS].invalidInt;
					}
					else if (!errorMessage && !isNumber(currentValue, true)) {
						errorMessage = self[STRINGS].invalidNumber;
					}
					else {
						if (!errorMessage && self.maxValue() !== undefined && self.maxValue() < currentValue) {
							errorMessage = stringHelper.locStringReplace(self[STRINGS].invalidMaxValue, {
								maxValue: self.maxValue()
							});
						}
						if (!errorMessage && self.minValue() !== undefined && self.minValue() > currentValue) {
							errorMessage = stringHelper.locStringReplace(self[STRINGS].invalidMinValue, {
								minValue: self.minValue()
							});
						}

						splitValue = currentValue.split('.');
						totalNumberDigits = splitValue[0].length;

						if (splitValue.length > 1) {
							fractionDigits = splitValue[1].length;
							totalNumberDigits += fractionDigits;
						}

						if (!errorMessage && self.maxFractionDigits() !== undefined && self.maxFractionDigits() < fractionDigits) {
							errorMessage = stringHelper.locStringReplace(self[STRINGS].invalidNumberFractionDigits, {
								maxFractionDigits: self.maxFractionDigits()
							});
						}
						if (!errorMessage && self.maxNumberDigits() !== undefined && self.maxNumberDigits() < totalNumberDigits) {
							errorMessage = stringHelper.locStringReplace(self[STRINGS].invalidNumberTotalDigits, {
								maxNumberDigits: self.maxNumberDigits()
							});
						}
					}
				}
				if (!errorMessage && self.maxLength() !== undefined) {
					if (self.maxLength() < currentValue.length) {
						errorMessage = stringHelper.locStringReplace(self[STRINGS].invalidMaxLength, {
							maxLength: self.maxLength()
						});
					}
				}
				if (!errorMessage && self.minLength() !== undefined) {
					if (self.minLength() > currentValue.length) {
						errorMessage = stringHelper.locStringReplace(self[STRINGS].invalidMinLength, {
							minLength: self.minLength()
						});
					}
				}
			}
		}

		if (errorMessage === '' || !self.isFocused()) {
			self.error(errorMessage);
		}

		return self;
	},

	/**
	 * @method placeholder
	 * @member module:TextInput
	 * @instance
	 * @param {String} [newPlaceholder]
	 * @returns {String|this}
	 */
	placeholder: method.string({
		set: function(newValue) {
			this[INPUT].attr(PLACE_HOLDER, newValue);
		}
	}),

	/**
	 * @method prefix
	 * @member module:TextInput
	 * @instance
	 * @param {String} [newPrefix]
	 * @returns {String|this}
	 */
	prefix: method.string({
		set: function(prefix) {
			const self = this;

			if (prefix) {
				if (!self[PREFIX]) {
					self[PREFIX] = new Span({
						classes: 'input-prefix',
						onResize: () => {
							self[PREFIX_WIDTH] = self[PREFIX].borderWidth();
							self[positionElements]();
						}
					});
				}
				self[PREFIX].text(prefix);
				dom.prependTo(self, self[PREFIX]);
			}
			else if (self[PREFIX]) {
				self[PREFIX].remove();
				self[PREFIX] = null;
				self[PREFIX_WIDTH] = 0;
				self[positionElements]();
			}
		}
	}),

	/**
	 * @method suffix
	 * @member module:TextInput
	 * @instance
	 * @param {String} [newPrefix]
	 * @returns {String|this}
	 */
	suffix: method.string({
		set: function(suffix) {
			const self = this;

			if (suffix) {
				if (!self[SUFFIX]) {
					self[SUFFIX] = new Span({
						classes: 'input-suffix',
						onResize: () => {
							self[SUFFIX_WIDTH] = self[SUFFIX].borderWidth();
							self[positionElements]();
						}
					});
				}
				self[SUFFIX].text(suffix);
				dom.appendTo(self, self[SUFFIX]);
			}
			else if (self[SUFFIX]) {
				self[SUFFIX].remove();
				self[SUFFIX] = null;
				self[SUFFIX_WIDTH] = 0;
				self[positionElements]();
			}
		}
	}),

	/**
	 * @method value
	 * @member module:TextInput
	 * @instance
	 * @param {String} [newValue]
	 * @returns {String|this}
	 */
	value: function(newValue) {
		const self = this;

		if (arguments.length) {
			if (!self.isFocused()) {
				self[INPUT].value(newValue);
				self.refreshActionButton();
				self.triggerChange(true, true, false);
				self[maxRowCallback]();
			}

			return self;
		}

		return self[INPUT].value();
	},

	/**
	 * Get a reference to the text input element.
	 * @method getInput
	 * @member module:TextInput
	 * @instance
	 */
	getInput: function() {
		return this[INPUT].element();
	},

	/**
	 * Set focus on the text input element.
	 * @method focus
	 * @member module:TextInput
	 * @instance
	 */
	focus: function() {
		const self = this;

		if (self.rows() === 1) {
			self[INPUT].focus();
		}
		else {
			if (self[INPUT].setSelectionRange) {
				self[INPUT].focus();
				self[INPUT].setSelectionRange(0, 0);
				self[INPUT].scrollTop = 0;
			}
			else if (self[INPUT].createTextRange) {
				let range = self[INPUT].createTextRange();
				range.moveStart('character', 0);
				range.select();
				self[INPUT].scrollTop = 0;
			}
			else {
				self[INPUT].focus();
			}
		}

		return self;
	},

	/**
	 * Remove focus from this control if it is focused.
	 * @method blur
	 * @member module:ControlBase
	 * @instance
	 * @returns {this}
	 */
	blur: function() {
		if (this.isFocused()) {
			this[INPUT].blur();
		}

		return this;
	},

	/**
	 * See if this control has focus.
	 * @method isFocused
	 * @member module:TextInput
	 * @instance
	 * @returns {Boolean}
	 */
	isFocused: function() {
		return dom.isActive(this[INPUT].element());
	},

	/**
	 * Adds a callback that is triggered when the control gets focus
	 * @method onFocus
	 * @member module:TextInput
	 * @instance
	 * @param {Function} callback
	 * @returns {this}
	 */
	onFocus: method.queue({
		set: function(queue) {
			if (queue.length === 1) {
				const self = this;

				self[INPUT].on(FOCUS_EVENT, () => {
					if (!self.isRemoved) {
						self.onFocus().trigger(null, [self]);
					}
				});
			}
		}
	}),

	/**
	 * Adds a callback that is triggered when the control loses focus
	 * @method onBlur
	 * @member module:TextInput
	 * @instance
	 * @param {Function} callback
	 * @returns {this}
	 */
	onBlur: method.queue({
		set: function(queue) {
			if (queue.length === 1) {
				const self = this;

				self[INPUT].on(BLUR_EVENT, () => {
					if (!self.isRemoved) {
						self.onBlur().trigger(null, [self]);
					}
				});
			}
		}
	}),

	/**
	 * Adds a callback that is triggered when the user hits the enter key when this control is focused
	 * @method onEnter
	 * @member module:TextInput
	 * @instance
	 * @param {Function} callback
	 * @returns {this}
	 */
	onEnter: method.queue({
		set: function(queue) {
			if (queue.length === 1) {
				const self = this;

				self.onFocus(() => {
					self[INPUT].on(KEY_UP_EVENT, () => {
						if (event.keyCode === keyCodes('enter')) {
							self.onEnter().trigger(null, [self]);
						}
					});
				});
				self.onBlur(() => {
					self[INPUT].off(KEY_UP_EVENT);
				});
			}
		}
	})
});
