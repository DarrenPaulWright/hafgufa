import { applySettings, enforceString, Enum, method } from 'type-enforcer-ui';
import Control, { CHILD_CONTROLS } from '../Control';
import controlTypes from '../controlTypes';
import FocusMixin from '../mixins/FocusMixin';
import MouseMixin from '../mixins/MouseMixin';
import OnClickMixin from '../mixins/OnClickMixin';
import { ALT, INPUT_TYPE, TITLE } from '../utility/domConstants';
import './Button.less';
import Icon, { ICON_SIZES } from './Icon';
import Image from './Image';
import Span from './Span';

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
 * @arg {Object} settings
 */
export default class Button extends MouseMixin(FocusMixin(OnClickMixin(Control))) {
	constructor(settings = {}) {
		settings.type = settings.type || controlTypes.BUTTON;
		settings.label = enforceString(settings.label, '');
		settings.classes = settings.classes || DEFAULT_CLASS;
		settings.element = 'button';

		super(settings);

		const self = this;

		self.attr(INPUT_TYPE, 'button');

		applySettings(self, settings);
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
	 * @arg {anything} [value]
	 * @returns {*|this}
	 */
	value: method.any(),

	/**
	 * Set the button label.
	 * @method label
	 * @member module:Button
	 * @instance
	 * @arg {String} newLabel - A none-HTML string
	 * @returns {String|this}
	 */
	label: method.string({
		init: undefined,
		set(label) {
			if ((this.icon() || this.image()) && !label) {
				this[CHILD_CONTROLS].remove(LABEL_ID);
			}
			else {
				this.alt(label === DEFAULT_LABEL ? '' : label);

				if (!this[CHILD_CONTROLS].get(LABEL_ID)) {
					new Span({
						container: this,
						id: LABEL_ID
					});
				}
				this[CHILD_CONTROLS].get(LABEL_ID).text(label || DEFAULT_LABEL);
			}
		}
	}),

	/**
	 * Set the button alt text.
	 * @method alt
	 * @member module:Button
	 * @instance
	 * @arg {String} newTitle - A none-HTML string
	 * @returns {this}
	 */
	alt: method.string({
		set(newValue) {
			this.attr(ALT, newValue)
				.attr(TITLE, newValue);
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
	 * @arg {String} newSrc - URL for an image.
	 *
	 * @returns {String|this}
	 */
	icon: method.string({
		set(newValue) {
			if (!newValue) {
				this[CHILD_CONTROLS].remove(ICON_ID);
			}
			else {
				this.image('');

				if (!this[CHILD_CONTROLS].get(ICON_ID)) {
					new Icon({
						container: this,
						id: ICON_ID,
						size: this.iconSize()
					});
				}

				this[CHILD_CONTROLS].get(ICON_ID).icon(newValue)
					.size(this.iconSize());

				if (this.iconPosition() === ICON_POSITIONS.LEFT ||
					this.iconPosition() === ICON_POSITIONS.TOP) {
					this.element().insertBefore(this[CHILD_CONTROLS].get(ICON_ID).element(), this.element().firstChild);
				}
				else {
					this.element().appendChild(this[CHILD_CONTROLS].get(ICON_ID).element());
				}
			}

			this.label(this.label(), true);
		}
	}),

	/**
	 * @method iconSize
	 * @member module:Button
	 * @instance
	 * @arg {String} [iconSize]
	 * @returns {String|this}
	 */
	iconSize: method.enum({
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
	 * @arg {String} [iconPosition]
	 * @returns {String|this}
	 */
	iconPosition: method.enum({
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
	 * @arg {String} newSrc - URL for an image.
	 *
	 * @returns {String|this}
	 */
	image: method.string({
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
					this.element()
						.insertBefore(this[CHILD_CONTROLS].get(IMAGE_ID).element(), this.element().firstChild);
				}
				else {
					this.element().appendChild(this[CHILD_CONTROLS].get(IMAGE_ID).element());
				}
			}

			this.label(this.label(), true);
		}
	}),

	/**
	 * Sets or gets the current toggleable state.
	 * @method isSelectable
	 * @member module:Button
	 * @instance
	 * @arg {Boolean} [newisSelectable]
	 * @returns {Boolean|this}
	 */
	isSelectable: method.boolean({
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
	 * @arg {Boolean} [newisSelected]
	 *
	 * @returns {Boolean|this}
	 */
	isSelected: method.boolean({
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
