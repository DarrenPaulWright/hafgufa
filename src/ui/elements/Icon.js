import dom from '../../utility/dom';
import objectHelper from '../../utility/objectHelper';
import controlTypes from '../controlTypes';
import './Icon.less';
import { Enum, method } from 'type-enforcer';
import Control from '../Control';

const ELEMENT = 'i';
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
				dom.appendNewTo(element, CORE_CLASSES, ELEMENT),
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
 * @param {Object} settings
 */
export default class Icon extends Control {
	constructor(settings = {}) {
		settings.element = dom.buildNew(CORE_CLASSES + ' icon-lg', ELEMENT);
		settings.skipWindowResize = true;

		super(controlTypes.ICON, settings);

		const self = this;

		self.element(settings.element);
		objectHelper.applySettings(self, settings);

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
	 * @param {String} newIcon
	 * @returns {String|this}
	 */
	icon: method.string({
		before: function(oldValue) {
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
		set: function(newValue) {
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
	 * @param {String} newSize - Use Icon ICON_SIZES
	 * @returns {String|this}
	 */
	size: method.enum({
		enum: ICON_SIZES,
		init: ICON_SIZES.LARGE,
		before: function(oldValue) {
			this.removeClass('icon-' + oldValue);
		},
		set: function(newValue) {
			this.addClass('icon-' + newValue);
		}
	})

});
