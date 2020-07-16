import { applySettings, Enum, methodAny, methodBoolean, methodEnum, methodString } from 'type-enforcer-ui';
import Control, { CHILD_CONTROLS } from '../Control.js';
import controlTypes from '../controlTypes.js';
import FocusMixin from '../mixins/FocusMixin.js';
import MouseMixin from '../mixins/MouseMixin.js';
import OnClickMixin from '../mixins/OnClickMixin.js';
import { INPUT_TYPE } from '../utility/domConstants.js';
import setDefaults from '../utility/setDefaults.js';
import './Button.less';
import Icon, { ICON_SIZES } from './Icon.js';
import Image from './Image.js';
import Span from './Span.js';

const SELECTED_CLASS = 'selected';
const DEFAULT_CLASS = 'form-button';
const DEFAULT_LABEL = '&nbsp;';
const LABEL_ID = 'buttonLabel';
const ICON_ID = 'buttonIcon';
const IMAGE_ID = 'buttonImage';

const ICON_POSITIONS = new Enum({
	TOP: 'top',
	RIGHT: 'right',
	BOTTOM: 'bottom',
	LEFT: 'left'
});

/**
 * Display a button.
 *
 * @class Button
 * @extends Control
 * @constructor
 *
 * @param {object} settings
 */
export default class Button extends MouseMixin(FocusMixin(OnClickMixin(Control))) {
	constructor(settings = {}) {
		super(setDefaults({
			type: controlTypes.BUTTON,
			element: 'button',
			label: '',
			classes: DEFAULT_CLASS
		}, settings));

		this.attr(INPUT_TYPE, 'button');

		applySettings(this, settings);
	}

	iconClasses(classes, performAdd) {
		return this[CHILD_CONTROLS].get(ICON_ID) ? this[CHILD_CONTROLS].get(ICON_ID)
			.classes(classes, performAdd) : this;
	}
}

Button.ICON_SIZES = ICON_SIZES;

Button.ICON_POSITIONS = ICON_POSITIONS;

Object.assign(Button.prototype, {
	/**
	 * @method value
	 * @member module:Button
	 * @instance
	 * @param {anything} [value]
	 * @returns {*|this}
	 */
	value: methodAny(),

	/**
	 * Set the button label.
	 *
	 * @method label
	 * @member module:Button
	 * @instance
	 * @param {string} newLabel - A none-HTML string
	 * @returns {string|this}
	 */
	label: methodString({
		init: undefined,
		set(label) {
			const self = this;

			if (label === '' && (self.icon() !== '' || self.image() !== '')) {
				self[CHILD_CONTROLS].remove(LABEL_ID);
			}
			else {
				self.alt(label === DEFAULT_LABEL ? '' : label);

				if (!self[CHILD_CONTROLS].get(LABEL_ID)) {
					new Span({
						container: self,
						id: LABEL_ID
					});
				}

				self[CHILD_CONTROLS].get(LABEL_ID).html(label || DEFAULT_LABEL);
			}
		}
	}),

	/**
	 * Set the button alt text.
	 *
	 * @method alt
	 * @member module:Button
	 * @instance
	 * @param {string} newTitle - A none-HTML string
	 * @returns {this}
	 */
	alt: methodString({
		set(alt) {
			this.attr({
				alt,
				title: alt
			});
		}
	}),

	/**
	 * Set the src of the image. If no image exists then this will add one. If
	 * no src is provided then this will remove the image from the DOM.
	 *
	 * @method icon
	 * @member module:Button
	 * @instance
	 *
	 * @param {string} newSrc - URL for an image.
	 *
	 * @returns {string|this}
	 */
	icon: methodString({
		set(newValue) {
			const self = this;

			if (newValue === '') {
				self[CHILD_CONTROLS].remove(ICON_ID);
			}
			else {
				self.image('');

				if (!self[CHILD_CONTROLS].get(ICON_ID)) {
					new Icon({
						container: self,
						id: ICON_ID,
						size: self.iconSize()
					});
				}

				self[CHILD_CONTROLS].get(ICON_ID).icon(newValue)
					.size(self.iconSize());

				if (self.iconPosition() === ICON_POSITIONS.LEFT ||
					self.iconPosition() === ICON_POSITIONS.TOP) {
					self.element.insertBefore(self[CHILD_CONTROLS].get(ICON_ID).element, self.element.firstChild);
				}
				else {
					self.element.appendChild(self[CHILD_CONTROLS].get(ICON_ID).element);
				}
			}

			self.label(self.label(), true);
		}
	}),

	/**
	 * @method iconSize
	 * @member module:Button
	 * @instance
	 * @param {string} [iconSize]
	 * @returns {string|this}
	 */
	iconSize: methodEnum({
		init: ICON_SIZES.LARGE,
		enum: ICON_SIZES,
		set(newValue) {
			if (this[CHILD_CONTROLS].get(ICON_ID)) {
				this[CHILD_CONTROLS].get(ICON_ID).size(newValue);
			}
		}
	}),

	/**
	 * @method iconPosition
	 * @member module:Button
	 * @instance
	 * @param {string} [iconPosition]
	 * @returns {string|this}
	 */
	iconPosition: methodEnum({
		init: ICON_POSITIONS.LEFT,
		enum: ICON_POSITIONS,
		set(newValue) {
			this.classes('icon-top-bottom', newValue === ICON_POSITIONS.TOP || newValue === ICON_POSITIONS.BOTTOM);
			this.classes('icon-right', newValue === ICON_POSITIONS.RIGHT);

			this.icon(this.icon(), true);
			this.image(this.image(), true);
		}
	}),

	/**
	 * Set the src of the image. If no image exists then this will add one. If
	 * no src is provided then this will remove the image from the DOM.
	 *
	 * @method setImage
	 * @member module:Button
	 * @instance
	 *
	 * @param {string} newSrc - URL for an image.
	 *
	 * @returns {string|this}
	 */
	image: methodString({
		set(image) {
			if (!image) {
				this[CHILD_CONTROLS].remove(IMAGE_ID);
			}
			else {
				this.icon('');

				if (!this[CHILD_CONTROLS].get(IMAGE_ID)) {
					new Image({
						container: this,
						id: IMAGE_ID
					});
				}
				this[CHILD_CONTROLS].get(IMAGE_ID).source(image);

				if (this.iconPosition() === ICON_POSITIONS.LEFT ||
					this.iconPosition() === ICON_POSITIONS.TOP) {
					this.element
						.insertBefore(this[CHILD_CONTROLS].get(IMAGE_ID).element, this.element.firstChild);
				}
				else {
					this.element.appendChild(this[CHILD_CONTROLS].get(IMAGE_ID).element);
				}
			}

			this.label(this.label(), true);
		}
	}),

	/**
	 * Sets or gets the current toggleable state.
	 *
	 * @method isSelectable
	 * @member module:Button
	 * @instance
	 * @param {boolean} [newisSelectable]
	 * @returns {boolean|this}
	 */
	isSelectable: methodBoolean({
		set(newValue) {
			if (!newValue) {
				this.isSelected(false);
			}
		}
	}),

	/**
	 * Sets or gets the current toggle state.
	 * Setting this method does not fire the onClick event.
	 *
	 * @method isSelected
	 * @member module:Button
	 * @instance
	 *
	 * @param {boolean} [newisSelected]
	 *
	 * @returns {boolean|this}
	 */
	isSelected: methodBoolean({
		set(newValue) {
			if (newValue && !this.isSelectable()) {
				this.isSelected(false);
			}
			else {
				this.classes(SELECTED_CLASS, newValue);
			}
		}
	})
});
