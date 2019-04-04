import { AUTO, HUNDRED_PERCENT, method, NONE } from 'type-enforcer';
import dom from '../../utility/dom';
import { DISPLAY, HEIGHT } from '../../utility/domConstants';
import windowResize from '../../utility/windowResize';
import Heading, { HEADING_LEVELS } from '../elements/Heading';

const SINGLE_LINE_CLASS = 'single-line';
const CAN_COLLAPSE_CLASS = 'can-collapse';
const COLLAPSED_CLASS = 'collapsed';

const HEADING = Symbol();

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

			self.onResize(() => {
				let titleContainerHeight = 0;

				if (self[HEADING]) {
					self[HEADING].resize();

					if (self.height().isPercent) {
						titleContainerHeight = self[HEADING].height();
						dom.css(self.contentContainer(), HEIGHT, self.height() - titleContainerHeight);
					}
				}
			});

			self.onRemove(() => {
				if (self[HEADING]) {
					self[HEADING].remove();
				}
			});
		}
	}

	Object.assign(ControlHeadingMixin.prototype, {
		headingLevel: method.enum({
			enum: HEADING_LEVELS,
			init: HEADING_LEVELS.FIVE,
			set: function(level) {
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
			set: function(newValue) {
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
			set: function(isCollapsed) {
				const self = this;

				self.classes(COLLAPSED_CLASS, isCollapsed);

				if (!self.canCollapse() && isCollapsed) {
					self.isCollapsed(false);
				}
				else if (self[HEADING] && self.canCollapse()) {
					dom.css(self.contentContainer(), DISPLAY, isCollapsed ? NONE : null);
					self[HEADING].isExpanded(!isCollapsed);
					if (!isCollapsed) {
						windowResize.trigger();
					}
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
			set: function(title) {
				const self = this;
				const showHeading = !!title;

				if (showHeading) {
					if (!self[HEADING]) {
						let originalElement = self.element();
						const initialClasses = self.classes();

						self.element(dom.buildNew());
						self.classes(initialClasses);

						self[HEADING] = new Heading({
							container: self.element(),
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

						dom.appendTo(self.element(), originalElement);
						dom.removeClass(originalElement, initialClasses);
						self.contentContainer(originalElement);
					}

					self[HEADING].title(title);
				}
				else {
					if (self[HEADING]) {
						self[HEADING].remove();
						self[HEADING] = null;

						self.element(self.contentContainer());
					}
					self.contentContainer(self.element());
				}

				self.classes('has-heading', showHeading);
				self.contentWidthContainer(self.contentContainer());
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
			set: function(subTitle) {
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
			set: function(error) {
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
			set: function(headingIcon) {
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
			set: function(headingImage) {
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
			set: function(headingButtons) {
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
			set: function(newValue) {
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
		getHeading: function() {
			return this[HEADING];
		},

		/**
		 * Get or Set the content container element
		 * @method contentContainer
		 * @member module:ControlHeadingAddon
		 * @instance
		 * @returns {Object}
		 */
		contentContainer: method.element(),

		/**
		 * Get or Set which container to use to determine where to place the error message if you need something other than
		 * the full width.
		 * @method contentWidthContainer
		 * @member module:ControlHeadingAddon
		 * @instance
		 * @arg {Object} [newContainer]
		 */
		contentWidthContainer: method.element(),

		/**
		 * See if this control has focus.
		 * @method isFocused
		 * @member module:ControlHeadingAddon
		 * @instance
		 * @returns {Boolean}
		 */
		isFocused: function() {
			dom.hasActive(this.contentContainer());
		}
	});

	return ControlHeadingMixin;
}
