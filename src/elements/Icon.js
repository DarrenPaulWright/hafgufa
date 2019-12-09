import { applySettings, Enum, methodEnum, methodString } from 'type-enforcer-ui';
import Control, { CHILD_CONTROLS } from '../Control';
import controlTypes from '../controlTypes';
import TooltipMixin from '../mixins/TooltipMixin';
import './Icon.less';

export const ICON_SIZES = new Enum({
	NORMAL: '1x',
	LARGE: 'lg',
	TWO_TIMES: '2x',
	THREE_TIMES: '3x',
	FOUR_TIMES: '4x',
	FIVE_TIMES: '5x'
});

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
		self.addClass('icon icon-lg');

		applySettings(self, settings, [], ['icon']);
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
	icon: methodString({
		before(oldValue) {
			const self = this;

			if (oldValue) {
				self[CHILD_CONTROLS].each((control) => {
					control.remove();
				});
				self.element.textContent = '';
				self.removeClass('has-stack text');
			}
		},
		set(icon) {
			const self = this;

			if (icon) {
				const stackIndex = icon.indexOf(':');
				const subIndex = icon.indexOf('[');
				let main = icon;
				let stack;
				let sub;

				if (subIndex !== -1 || stackIndex !== -1) {
					if (subIndex === -1) {
						main = icon.substring(0, stackIndex);
						stack = icon.substring(stackIndex + 1);
					}
					else if (stackIndex === -1 || stackIndex > subIndex) {
						main = icon.substring(0, subIndex);
						sub = icon.substring(subIndex + 1, icon.length - 1);
					}
					else {
						main = icon.substring(0, stackIndex);
						stack = icon.substring(stackIndex + 1, subIndex);
						sub = icon.substring(subIndex + 1, icon.length - 1);
					}
				}

				if (main.length === 1) {
					self.element.textContent = main;

					if (/[a-zA-Z0-9]/.test(main)) {
						self.addClass('text');
					}
				}
				else {
					self.addClass('fa-' + main);
				}

				if (stack) {
					self.addClass('has-stack');

					new Icon({
						container: self,
						icon: stack
					});
				}

				if (sub) {
					new Icon({
						container: self,
						icon: sub,
						classes: 'sub-icon'
					});
				}
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
	size: methodEnum({
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
