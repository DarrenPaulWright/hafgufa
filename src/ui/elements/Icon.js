import { applySettings, Enum, method } from 'type-enforcer';
import dom from '../../utility/dom';
import Control from '../Control';
import controlTypes from '../controlTypes';
import TooltipMixin from '../mixins/TooltipMixin';
import './Icon.less';

const CORE_CLASSES = 'icon';
const SUB_ICON_CLASS = ' sub-icon';
const INVERSE_CLASS = ' inverse';
const TEXT_CLASS = ' text';
const FONT_AWESOME_CLASS_PREFIX = 'fa-';
const MAIN_SEPARATOR = ';';
const SUB_SEPARATOR = ':';
const SUB_SEPARATOR_START = '[';
const SUB_SEPARATOR_END = ']';
const CHAR_REGEX = /[a-zA-Z0-9]/;

export const ICON_SIZES = new Enum({
	NORMAL: '1x',
	LARGE: 'lg',
	TWO_TIMES: '2x',
	THREE_TIMES: '3x',
	FOUR_TIMES: '4x',
	FIVE_TIMES: '5x'
});

const iconClass = (name) => FONT_AWESOME_CLASS_PREFIX + name;

const buildIcon = (element, name, separator = MAIN_SEPARATOR, classes = '') => {
	if (name.indexOf(SUB_SEPARATOR_START) === 0) {
		name = name.substring(name.indexOf(SUB_SEPARATOR_START) + 1, name.indexOf(SUB_SEPARATOR_END));

		dom.addClass(element, SUB_ICON_CLASS);
		buildIcon(element, name, SUB_SEPARATOR);
	}
	else if (name.includes(separator)) {
		name.split(separator).forEach((subIcon, index) => {
			buildIcon(
				dom.appendNewTo(element, CORE_CLASSES, 'i'),
				subIcon,
				SUB_SEPARATOR,
				index > 0 ? INVERSE_CLASS : ''
			);
		});
	}
	else if (name.length === 1 && CHAR_REGEX.test(name)) {
		dom.content(element, name);
		dom.addClass(element, TEXT_CLASS + classes);
	}
	else if (name.length === 1) {
		dom.content(element, name);
		dom.addClass(element, classes);
	}
	else {
		dom.addClass(element, iconClass(name) + classes);
	}
};

/**
 * Builds a font-awesome icon
 * @class Icon
 * @extends Control
 * @constructor
 *
 * @arg {Object} settings
 */
export default class Icon extends TooltipMixin(Control) {
	constructor(settings = {}) {
		settings.type = settings.type || controlTypes.ICON;
		settings.element = 'i';

		super(settings);

		const self = this;
		self.addClass(CORE_CLASSES + ' icon-lg');

		self.element(settings.element);
		applySettings(self, settings);

		self.onRemove(() => {
			self.icon(null);
		});
	}
}

Object.assign(Icon.prototype, {
	/**
	 * Set the icon.
	 * Icons can be interpolated using bracket syntax:
	 * 'circle;plus' - a circle with a smaller plus inside
	 * 'cog;[circle:plus-circle]' - a cog icon with a circle sub-icon with a plus inside
	 * @method icon
	 * @member module:Icon
	 * @instance
	 * @arg {String} newIcon
	 * @returns {String|this}
	 */
	icon: method.string({
		before(oldValue) {
			if (oldValue) {
				if (oldValue.includes(MAIN_SEPARATOR)) {
					dom.empty(this);
				}
				else if (oldValue.length === 1) {
					dom.empty(this);
				}
				else {
					this.removeClass(iconClass(oldValue));
				}
			}
		},
		set(newValue) {
			if (newValue) {
				buildIcon(this.element(), newValue);
			}
		},
		other: null
	}),

	/**
	 * Set the icon size
	 * @method size
	 * @member module:Icon
	 * @instance
	 * @arg {String} newSize - Use Icon ICON_SIZES
	 * @returns {String|this}
	 */
	size: method.enum({
		enum: ICON_SIZES,
		init: ICON_SIZES.LARGE,
		before(oldValue) {
			this.removeClass('icon-' + oldValue);
		},
		set(newValue) {
			this.addClass('icon-' + newValue);
		}
	})

});
