import { AUTO, HUNDRED_PERCENT, method, NONE } from 'type-enforcer-ui';
import Div from '../elements/Div';
import Heading, { HEADING_LEVELS } from '../elements/Heading';
import { DISPLAY } from '../utility/domConstants';

const SINGLE_LINE_CLASS = 'single-line';
const CAN_COLLAPSE_CLASS = 'can-collapse';
const COLLAPSED_CLASS = 'collapsed';

const HEADING = Symbol();
export const CONTENT_CONTAINER = Symbol();

/**
 * Provides a Heading control and a content container
 *
 * @module ControlHeadingMixin
 * @constructor
 */
export default (Base) => {
	class ControlHeadingMixin extends Base {
		constructor(settings = {}) {
			super(settings);

			const self = this;
			self.headingLevel(settings.headingLevel);
			delete settings.headingLevel;
			self.title(settings.title || '');
			delete settings.title;

			self[CONTENT_CONTAINER] = settings.contentContainer || new Div();
			self[CONTENT_CONTAINER].container(self.element());
			self[CONTENT_CONTAINER].removeClass('container');
			delete settings.contentContainer;

			self.onResize((width, height) => {
				if (self[HEADING]) {
					self[HEADING].resize();

					if (self.height().isPercent) {
						self[CONTENT_CONTAINER].height(height - self[HEADING].outerHeight());
					}
				}
			});
		}

		/**
		 * The content container element
		 * @method contentContainer
		 * @member module:ControlHeadingAddon
		 * @instance
		 * @returns {Object}
		 */
		get contentContainer() {
			return this[CONTENT_CONTAINER];
		}
	}

	Object.assign(ControlHeadingMixin.prototype, {
		headingLevel: method.enum({
			enum: HEADING_LEVELS,
			init: HEADING_LEVELS.FIVE,
			set(level) {
				if (this[HEADING]) {
					this[HEADING].level(level);
				}
			}
		}),

		/**
		 * @method canCollapse
		 * @member module:ControlHeadingAddon
		 * @instance
		 * @arg {Boolean} [newCanCollapse]
		 * @returns {Boolean|this}
		 */
		canCollapse: method.boolean({
			set(newValue) {
				const self = this;

				const onExpand = function() {
					const isCollapsed = !self[HEADING].isExpanded();
					self.isCollapsed(isCollapsed);
					if (self.onCollapse()) {
						self.onCollapse()(isCollapsed);
					}
				};

				if (self[HEADING]) {
					self.classes(CAN_COLLAPSE_CLASS, newValue);
					self[HEADING]
						.showExpander(newValue)
						.isExpandable(newValue)
						.onExpand(newValue ? onExpand : undefined);
					self.isCollapsed(newValue ? self.isCollapsed() : false, true);
				}
			}
		}),

		/**
		 * @method isCollapsed
		 * @member module:ControlHeadingAddon
		 * @instance
		 * @arg {Boolean} [newIsCollapsed]
		 * @returns {Boolean|this}
		 */
		isCollapsed: method.boolean({
			set(isCollapsed) {
				const self = this;

				self.classes(COLLAPSED_CLASS, isCollapsed);

				if (!self.canCollapse() && isCollapsed) {
					self.isCollapsed(false);
				}
				else if (self[HEADING] && self.canCollapse()) {
					self[CONTENT_CONTAINER].css(DISPLAY, isCollapsed ? NONE : null);
					self[HEADING].isExpanded(!isCollapsed);

					self.resize();
				}
			}
		}),

		/**
		 * @method onCollapse
		 * @member module:ControlHeadingAddon
		 * @instance
		 * @arg {function} [newOnCollapse]
		 * @returns {function|this}
		 */
		onCollapse: method.function(),

		/**
		 * Adds a title above the control
		 *
		 * @method title
		 * @member module:ControlHeadingAddon
		 * @instance
		 *
		 * @arg {string} title - Plain text or html string.
		 *
		 * @returns {string|this}
		 */
		title: method.string({
			init: undefined,
			set(title) {
				const self = this;

				if (title) {
					if (!self[HEADING]) {
						self[HEADING] = new Heading({
							container: self.element(),
							prepend: true,
							showCheckbox: false,
							showExpander: false,
							level: self.headingLevel(),
							width: HUNDRED_PERCENT,
							canWrap: true,
							subTitle: self.subTitle(),
							icon: self.headingIcon(),
							buttons: self.headingButtons(),
							singleLine: self.singleLine(),
							canCollapse: self.canCollapse()
						});
					}

					self[HEADING].title(title);
				}
				else {
					if (self[HEADING]) {
						self[HEADING].remove();
						self[HEADING] = null;
					}
				}

				self.classes('has-heading', Boolean(title));
			}
		}),

		/**
		 * Adds a status message to the right of the title, inline.
		 *
		 * @method subTitle
		 * @member module:ControlHeadingAddon
		 * @instance
		 *
		 * @arg {string} subTitle - Plain text or html string.
		 *
		 * @returns {string|this}
		 */
		subTitle: method.string({
			set(subTitle) {
				if (this[HEADING]) {
					this[HEADING].subTitle(subTitle);
				}
			}
		}),

		/**
		 * Adds a error message to the right of the title and subtitle, inline.
		 *
		 * @method error
		 * @member module:ControlHeadingAddon
		 * @instance
		 *
		 * @arg {string} [error]
		 *
		 * @returns {string|this}
		 */
		error: method.string({
			set(error) {
				if (this[HEADING]) {
					this[HEADING].error(error);
				}
			}
		}),

		/**
		 * Adds an icon left of the title
		 * @method headingIcon
		 * @member module:ControlHeadingAddon
		 * @instance
		 * @arg {String} headingIcon
		 */
		headingIcon: method.string({
			set(headingIcon) {
				if (this[HEADING]) {
					this[HEADING].icon(headingIcon);
				}
			}
		}),

		/**
		 * Adds an image to the left of the title
		 *
		 * @method headingImage
		 * @member module:ControlHeadingAddon
		 * @instance
		 *
		 * @arg {String} headingImage
		 */
		headingImage: method.string({
			set(headingImage) {
				if (this[HEADING]) {
					this[HEADING].image(headingImage);
				}
			}
		}),

		/**
		 * Adds buttons on the right side of the heading.
		 * @method headingButtons
		 * @member module:ControlHeadingAddon
		 * @instance
		 * @arg {String} headingButton
		 */
		headingButtons: method.array({
			set(headingButtons) {
				if (this[HEADING]) {
					this[HEADING].buttons(headingButtons);
				}
			}
		}),

		/**
		 * Makes the title inline with the control
		 * @method singleLine
		 * @member module:ControlHeadingAddon
		 * @instance
		 * @arg {Boolean} [newSingleLine]
		 * @returns {Boolean|this}
		 */
		singleLine: method.boolean({
			set(newValue) {
				this.classes(SINGLE_LINE_CLASS, newValue);
				if (this[HEADING]) {
					this[HEADING].width(newValue ? AUTO : HUNDRED_PERCENT);
				}
			}
		}),

		/**
		 * Get the heading control
		 * @method getHeading
		 * @member module:ControlHeadingAddon
		 * @instance
		 * @returns {Object}
		 */
		getHeading() {
			return this[HEADING];
		}
	});

	return ControlHeadingMixin;
}
