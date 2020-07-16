import { erase } from 'object-agent';
import {
	AUTO,
	HUNDRED_PERCENT,
	methodArray,
	methodBoolean,
	methodEnum,
	methodFunction,
	methodString,
	NONE
} from 'type-enforcer-ui';
import Div from '../elements/Div.js';
import Heading, { HEADING_LEVELS } from '../elements/Heading.js';
import { DISPLAY } from '../utility/domConstants.js';

const SINGLE_LINE_CLASS = 'single-line';
const CAN_COLLAPSE_CLASS = 'can-collapse';
const COLLAPSED_CLASS = 'collapsed';

const HEADING = Symbol();
export const CONTENT_CONTAINER = Symbol();

/**
 * Provides a Heading control and a content container.
 *
 * @module ControlHeadingMixin
 * @constructor
 *
 * @param {Function} Base - The class to extend
 */
export default (Base) => {
	class ControlHeadingMixin extends Base {
		constructor(settings = {}) {
			super(settings);

			const self = this;
			self.headingLevel(settings.headingLevel);
			erase(settings, 'headingLevel');
			self.title(settings.title || '');
			erase(settings, 'title');

			self[CONTENT_CONTAINER] = settings.contentContainer || new Div();
			self[CONTENT_CONTAINER].container(self.element);
			self[CONTENT_CONTAINER].removeClass('container');
			erase(settings, 'contentContainer');

			self.onResize((width, height) => {
				if (self[HEADING]) {
					self[HEADING].resize();

					if (self.height().isPercent) {
						self[CONTENT_CONTAINER].height(height - self[HEADING].outerHeight());
					}

					if (self.singleLine()) {
						self[CONTENT_CONTAINER].width(width - self[HEADING].borderWidth());
					}
				}
			});
		}

		/**
		 * The content container element
		 *
		 * @method contentContainer
		 * @member module:ControlHeadingAddon
		 * @instance
		 * @returns {object}
		 */
		get contentContainer() {
			return this[CONTENT_CONTAINER];
		}
	}

	Object.assign(ControlHeadingMixin.prototype, {
		headingLevel: methodEnum({
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
		 * @param {boolean} [newCanCollapse]
		 * @returns {boolean|this}
		 */
		canCollapse: methodBoolean({
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
		 * @param {boolean} [newIsCollapsed]
		 * @returns {boolean|this}
		 */
		isCollapsed: methodBoolean({
			set(isCollapsed) {
				const self = this;

				self.classes(COLLAPSED_CLASS, isCollapsed);

				if (!self.canCollapse() && isCollapsed) {
					self.isCollapsed(false);
				}
				else if (self[HEADING] && self.canCollapse()) {
					self[HEADING].isExpanded(!isCollapsed);
					self[CONTENT_CONTAINER]
						.css(DISPLAY, isCollapsed ? NONE : null)
						.resize(true);
				}
			}
		}),

		/**
		 * @method onCollapse
		 * @member module:ControlHeadingAddon
		 * @instance
		 * @param {Function} [newOnCollapse]
		 * @returns {Function|this}
		 */
		onCollapse: methodFunction(),

		/**
		 * Adds a title above the control
		 *
		 * @method title
		 * @member module:ControlHeadingAddon
		 * @instance
		 *
		 * @param {string} title - Plain text or html string.
		 *
		 * @returns {string|this}
		 */
		title: methodString({
			init: undefined,
			set(title) {
				const self = this;

				if (title) {
					if (!self[HEADING]) {
						self[HEADING] = new Heading({
							container: self.element,
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
		 * @param {string} subTitle - Plain text or html string.
		 *
		 * @returns {string|this}
		 */
		subTitle: methodString({
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
		 * @param {string} [error]
		 *
		 * @returns {string|this}
		 */
		error: methodString({
			set(error) {
				if (this[HEADING]) {
					this[HEADING].error(error);
				}
			}
		}),

		/**
		 * Adds an icon left of the title
		 *
		 * @method headingIcon
		 * @member module:ControlHeadingAddon
		 * @instance
		 * @param {string} headingIcon
		 */
		headingIcon: methodString({
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
		 * @param {string} headingImage
		 */
		headingImage: methodString({
			set(headingImage) {
				if (this[HEADING]) {
					this[HEADING].image(headingImage);
				}
			}
		}),

		/**
		 * Adds buttons on the right side of the heading.
		 *
		 * @method headingButtons
		 * @member module:ControlHeadingAddon
		 * @instance
		 * @param {string} headingButton
		 */
		headingButtons: methodArray({
			set(headingButtons) {
				if (this[HEADING]) {
					this[HEADING].buttons(headingButtons);
				}
			}
		}),

		/**
		 * Makes the title inline with the control
		 *
		 * @method singleLine
		 * @member module:ControlHeadingAddon
		 * @instance
		 * @param {boolean} [newSingleLine]
		 * @returns {boolean|this}
		 */
		singleLine: methodBoolean({
			set(newValue) {
				this.classes(SINGLE_LINE_CLASS, newValue);
				if (this[HEADING]) {
					this[HEADING].width(newValue ? AUTO : HUNDRED_PERCENT);
				}
			}
		}),

		/**
		 * Get the heading control
		 *
		 * @method getHeading
		 * @member module:ControlHeadingAddon
		 * @instance
		 * @returns {object}
		 */
		getHeading() {
			return this[HEADING];
		}
	});

	return ControlHeadingMixin;
}
