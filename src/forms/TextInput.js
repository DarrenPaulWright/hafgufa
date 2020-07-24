import { throttle } from 'async-agent';
import keyCodes from 'keycodes';
import {
	applySettings,
	AUTO,
	CssSize,
	HUNDRED_PERCENT,
	isInteger,
	isNumber,
	methodBoolean,
	methodCssSize,
	methodInteger,
	methodQueue,
	methodString
} from 'type-enforcer-ui';
import controlTypes from '../controlTypes.js';
import Input from '../elements/Input.js';
import Span from '../elements/Span.js';
import TextArea from '../elements/TextArea.js';
import { CLEAR_ICON } from '../icons.js';
import ActionButtonMixin from '../mixins/ActionButtonMixin.js';
import {
	INPUT_TYPE_PASSWORD,
	INPUT_TYPE_TEXT,
	KEY_UP_EVENT,
	LINE_HEIGHT,
	MAX_LENGTH,
	PLACE_HOLDER
} from '../utility/domConstants.js';
import locale from '../utility/locale.js';
import clamp from '../utility/math/clamp.js';
import setDefaults from '../utility/setDefaults.js';
import FormControl from './FormControl.js';
import './TextInput.less';

export const ON_CHANGE_DELAY = 200;
const ON_CHANGE_DELAY_LONG = 500;
const ON_CHANGE_EVENTS = 'change keypress cut paste textInput input propertychange';

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
 * @class
 *
 * @param {object} settings
 */
export default class TextInput extends ActionButtonMixin(FormControl) {
	constructor(settings = {}) {
		super(setDefaults({
			type: controlTypes.TEXT,
			width: AUTO,
			height: AUTO,
			rows: 1,
			changeDelay: (settings.rows === 1 || settings.rows === undefined) ? ON_CHANGE_DELAY : ON_CHANGE_DELAY_LONG,
			actionButtonOnClick() {
				self.value('').triggerChange().isFocused(true);
			},
			actionButtonIcon: CLEAR_ICON
		}, settings, {
			ActionButtonMixin: { container: () => self[INPUT] }
		}));

		const self = this;
		self.addClass('text-input');

		applySettings(self, settings, ['rows']);

		self.onResize(() => {
			self[positionElements]();
			self[maxRowCallback]();

			if (self.rows() > 1 && !self.height().isAuto) {
				self[INPUT].height(self.contentContainer.borderHeight());
			}
		});
	}

	/**
	 * Calculate the width of the text element if there is a prefix or suffix or textWidth
	 *
	 * @function positionElements
	 */
	[positionElements]() {
		const self = this;

		if (!self.isRemoved) {
			let baseWidth = self.innerWidth();
			const textWidth = self.textWidth() || new CssSize(self.width().isAuto ? '14em' : HUNDRED_PERCENT);

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
			const lineHeight = parseFloat(getComputedStyle(self[INPUT].element).getPropertyValue(LINE_HEIGHT)) || 0;
			const padding = self[INPUT].paddingHeight;

			if (lineHeight) {
				self[INPUT].height('1px');

				let actualRows = Math.floor(self[INPUT].element.scrollHeight / lineHeight);
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
	 * @param {number.int} [newRows]
	 * @returns {number.int|this}
	 */
	rows: methodInteger({
		set(rows) {
			const self = this;
			let oldInput = self[INPUT];

			if (rows === 1) {
				self[INPUT] = new Input({
					container: self,
					inputType: INPUT_TYPE_TEXT
				});
				self.changeDelay(ON_CHANGE_DELAY);
			}
			else {
				self[INPUT] = new TextArea({
					container: self,
					rows
				});
				self.changeDelay(ON_CHANGE_DELAY_LONG);
			}

			if (oldInput) {
				self[INPUT]
					.attr(oldInput.attr())
					.classes(oldInput.classes());
				oldInput.remove();
				oldInput = null;
			}

			self.setFocusControl(self[INPUT]);

			self[INPUT]
				.on(ON_CHANGE_EVENTS, throttle(() => {
					self[maxRowCallback]();
					self.triggerChange();
				}));
		},
		min: 1
	}),

	maxRows: methodInteger({
		set: maxRowCallback
	}),

	textWidth: methodCssSize({
		set: positionElements
	}),

	/**
	 * @method isPassword
	 * @member module:TextInput
	 * @instance
	 * @param {boolean} [newIsPassword]
	 * @returns {boolean|this}
	 */
	isPassword: methodBoolean({
		set(isPassword) {
			if (this.rows() === 1) {
				this[INPUT].inputType(isPassword ? INPUT_TYPE_PASSWORD : INPUT_TYPE_TEXT);
			}
		}
	}),

	isSoftValidation: methodBoolean({
		init: true,
		set() {
			if (this.maxLength()) {
				this.maxLength(this.maxLength(), true);
			}
		}
	}),

	/**
	 * @method minLength
	 * @member module:TextInput
	 * @instance
	 * @param {number.int} [newMinLength]
	 * @returns {number.int|this}
	 */
	minLength: methodInteger({
		other: undefined,
		set() {
			const self = this;

			self.onValidate((value, isFocused) => {
				if (isFocused === false && value !== '' && self.minLength() > value.length) {
					self.error(locale.get('invalidMinLength', {
						minLength: self.minLength()
					}));

					return true;
				}
			});
		}
	}),

	/**
	 * @method maxLength
	 * @member module:TextInput
	 * @instance
	 * @param {number.int} [newMaxLength]
	 * @returns {number.int|this}
	 */
	maxLength: methodInteger({
		set(newValue) {
			const self = this;

			self[INPUT].attr(MAX_LENGTH, (self.isSoftValidation() || !newValue) ? null : newValue);

			self.onValidate((value, isFocused) => {
				if (isFocused === false && self.maxLength() < value.length) {
					self.error(locale.get('invalidMaxLength', {
						minLength: self.maxLength()
					}));

					return true;
				}
			});
		},
		other: undefined
	}),

	/**
	 * @method minValue
	 * @member module:TextInput
	 * @instance
	 * @param {number.int} [newMinValue]
	 * @returns {number.int|this}
	 */
	minValue: methodInteger({
		other: undefined,
		set() {
			const self = this;

			self.isNumber(true)
				.onValidate((value, isFocused) => {
					if (isFocused === false && value !== '' && self.minValue() > value) {
						self.error(locale.get('invalidMinValue', {
							minValue: self.minValue()
						}));

						return true;
					}
				});
		}
	}),

	/**
	 * @method maxValue
	 * @member module:TextInput
	 * @instance
	 * @param {number.int} [newMaxValue]
	 * @returns {number.int|this}
	 */
	maxValue: methodInteger({
		other: undefined,
		set() {
			const self = this;

			self.isNumber(true)
				.onValidate((value, isFocused) => {
					if (isFocused === false && value !== '' && self.maxValue() < value) {
						self.error(locale.get('invalidMaxValue', {
							maxValue: self.maxValue()
						}));

						return true;
					}
				});
		}
	}),

	/**
	 * @method isInt
	 * @member module:TextInput
	 * @instance
	 * @param {boolean} [newMaxValue]
	 * @returns {boolean|this}
	 */
	isInt: methodBoolean({
		set() {
			const self = this;

			self.onValidate((value, isFocused) => {
				if (
					isFocused === false &&
					value !== '' &&
					self.isInt() === true &&
					!isInteger(value, true)
				) {
					self.error(locale.get('invalidInt'));

					return true;
				}
			});
		}
	}),

	/**
	 * @method isNumber
	 * @member module:TextInput
	 * @instance
	 * @param {boolean} [newMaxValue]
	 * @returns {boolean|this}
	 */
	isNumber: methodBoolean({
		set() {
			const self = this;

			self.onValidate((value, isFocused) => {
				if (
					isFocused === false &&
					value !== '' &&
					self.isNumber() === true &&
					!isNumber(value, true)
				) {
					self.error(locale.get('invalidNumber'));

					return true;
				}
			});
		}
	}),

	/**
	 * @method totalNumberDigits
	 * @member module:TextInput
	 * @instance
	 * @param {boolean} [newMaxValue]
	 * @returns {boolean|this}
	 */
	maxNumberDigits: methodInteger({
		other: undefined,
		min: 1,
		set() {
			const self = this;

			self.onValidate((value, isFocused) => {
				if (isFocused === false && value !== '') {
					const splitValue = value.split('.');
					let totalNumberDigits = splitValue[0].length;

					if (splitValue.length > 1) {
						totalNumberDigits += splitValue[1].length;
					}

					if (self.maxNumberDigits() < totalNumberDigits) {
						self.error(locale.get('invalidNumberTotalDigits', {
							maxNumberDigits: self.maxNumberDigits()
						}));

						return true;
					}
				}
			});
		}
	}),

	/**
	 * @method maxFractionDigits
	 * @member module:TextInput
	 * @instance
	 * @param {boolean} [newMaxValue]
	 * @returns {boolean|this}
	 */
	maxFractionDigits: methodInteger({
		other: undefined,
		min: 1,
		set() {
			const self = this;

			self.onValidate((value, isFocused) => {
				if (isFocused === false && value !== '') {
					if (self.maxFractionDigits() < value.split('.')[1].length) {
						self.error(locale.get('invalidNumberFractionDigits', {
							maxFractionDigits: self.maxFractionDigits()
						}));

						return true;
					}
				}
			});
		}
	}),

	/**
	 * @method placeholder
	 * @member module:TextInput
	 * @instance
	 * @param {string} [newPlaceholder]
	 * @returns {string|this}
	 */
	placeholder: methodString({
		set(newValue) {
			this[INPUT].attr(PLACE_HOLDER, newValue);
		}
	}),

	/**
	 * @method prefix
	 * @member module:TextInput
	 * @instance
	 * @param {string} [newPrefix]
	 * @returns {string|this}
	 */
	prefix: methodString({
		set(prefix) {
			const self = this;

			if (prefix) {
				if (!self[PREFIX]) {
					self[PREFIX] = new Span({
						container: self,
						prepend: true,
						classes: 'input-prefix',
						onResize() {
							self[PREFIX_WIDTH] = self[PREFIX].borderWidth();
							self[positionElements]();
						}
					});
				}
				self[PREFIX].text(prefix).resize();
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
	 * @param {string} [newPrefix]
	 * @returns {string|this}
	 */
	suffix: methodString({
		set(suffix) {
			const self = this;

			if (suffix) {
				if (!self[SUFFIX]) {
					self[SUFFIX] = new Span({
						container: self,
						classes: 'input-suffix',
						onResize() {
							self[SUFFIX_WIDTH] = self[SUFFIX].borderWidth();
							self[positionElements]();
						}
					});
				}
				self[SUFFIX].text(suffix).resize();
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
	 * @param {string} [value]
	 * @returns {string|this}
	 */
	value(value) {
		const self = this;

		if (arguments.length !== 0) {
			if (!self.isFocused()) {
				self[INPUT].value(value);
				self.triggerChange(true, true, false);
				self[maxRowCallback]();
			}

			return self;
		}

		return self[INPUT].value();
	},

	/**
	 * Get a reference to the text input element.
	 *
	 * @method getInput
	 * @member module:TextInput
	 * @instance
	 */
	getInput() {
		return this[INPUT];
	},

	/**
	 * Adds a callback that is triggered when the user hits the enter key when this control is focused
	 *
	 * @method onEnter
	 * @member module:TextInput
	 * @instance
	 * @param {Function} callback
	 * @returns {this}
	 */
	onEnter: methodQueue({
		set(queue) {
			if (queue.length === 1) {
				const self = this;

				self
					.onFocus(() => {
						self[INPUT].on(KEY_UP_EVENT, (event) => {
							if (event.keyCode === keyCodes('enter')) {
								self.onEnter().trigger();
							}
						});
					})
					.onBlur(() => {
						self[INPUT].off(KEY_UP_EVENT);
					});
			}
		}
	})
});
