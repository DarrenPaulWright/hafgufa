import { debounce } from 'async-agent';
import { method } from 'type-enforcer';
import dom from '../../utility/dom';
import {
	LINE_HEIGHT,
	PADDING_RIGHT,
	POSITION,
	RELATIVE,
	TAB_INDEX,
	TAB_INDEX_DISABLED
} from '../../utility/domConstants';
import Button from '../elements/Button';
import Div from '../elements/Div';
import Span from '../elements/Span';
import { CLEAR_ICON } from '../icons';
import './ActionButtonMixin.less';

const RIGHT_CONTAINER = Symbol();
const ACTION_BUTTON = Symbol();
const COUNT_CONTROL = Symbol();

const refreshActionButton = Symbol();
const addRightContainer = Symbol();

/**
 * Adds an action button and count text.
 * @module ActionButtonAddon
 * @constructor
 */
export default function(Base) {
	class ActionButtonMixin extends Base {
		constructor(settings = {}) {
			const containerCallback = settings.ActionButtonMixin.container;

			super(settings);

			const self = this;

			self[refreshActionButton] = debounce(() => {
				const isIconButton = self.actionButtonIcon() === CLEAR_ICON && self.actionButtonLabel() === '';

				if ((self.actionButtonIcon() || self.actionButtonLabel()) && self.borderWidth() > 40 && (!self.rows || self.rows() === 1)) {
					if (!self[ACTION_BUTTON]) {
						self[ACTION_BUTTON] = new Button({
							isDisplayed: false,
							classes: 'icon-button',
							iconSize: Button.ICON_SIZES.NORMAL
						});
						self[addRightContainer]().append(self[ACTION_BUTTON]);
					}

					self[ACTION_BUTTON]
						.isDisplayed(!self.isActionButtonAutoHide() || !!self.value().length)
						.isEnabled(self.isActionButtonEnabled())
						.icon(self.actionButtonIcon())
						.label(self.actionButtonLabel())
						.onClick(self.actionButtonOnClick())
						.attr(TAB_INDEX, TAB_INDEX_DISABLED)
						.classes('form-button', !isIconButton)
						.classes('icon-button', isIconButton);
				}
				else if (self[ACTION_BUTTON]) {
					self[ACTION_BUTTON].remove();
					self[ACTION_BUTTON] = null;
				}

				self.resize(true);
			});

			self.css(POSITION, RELATIVE)
				.onChange(() => {
					self[refreshActionButton]();
				})
				.onResize((width) => {
					const container = containerCallback();

					if (container) {
						const containerHeight = container.borderHeight();
						const containerWidth = container.borderWidth();
						let rightContainerWidth = 0;

						if (self[RIGHT_CONTAINER]) {
							self[RIGHT_CONTAINER].css({
								top: container.element().offsetTop,
								height: containerHeight,
								right: Math.max(0, width - containerWidth - dom.get.left(container.element()))
							});
							rightContainerWidth = self[RIGHT_CONTAINER].borderWidth();

							if (self[COUNT_CONTROL]) {
								self[COUNT_CONTROL].css(LINE_HEIGHT, containerHeight);
							}
						}

						container.css(PADDING_RIGHT, rightContainerWidth);
					}
				});
		}

		[addRightContainer]() {
			const self = this;

			if (!self[RIGHT_CONTAINER]) {
				self[RIGHT_CONTAINER] = new Div({
					container: self,
					classes: 'action-button-container'
				});
			}

			return self[RIGHT_CONTAINER];
		}
	}

	Object.assign(ActionButtonMixin.prototype, {
		/**
		 * @method actionButtonIcon
		 * @member module:ActionButtonAddon
		 * @instance
		 *
		 * @param {String} [actionButton]
		 *
		 * @returns {String|this}
		 */
		actionButtonIcon: method.string({
			set() {
				this[refreshActionButton]();
			}
		}),

		/**
		 * @method actionButtonLabel
		 * @member module:ActionButtonAddon
		 * @instance
		 *
		 * @param {String} [actionButton]
		 *
		 * @returns {String|this}
		 */
		actionButtonLabel: method.string({
			set() {
				this[refreshActionButton]();
			}
		}),

		/**
		 * @method actionButtonOnClick
		 * @member module:ActionButtonAddon
		 * @instance
		 *
		 * @param {Function} [actionButton]
		 *
		 * @returns {Function|this}
		 */
		actionButtonOnClick: method.function({
			set() {
				this[refreshActionButton]();
			}
		}),

		/**
		 * @method isActionButtonAutoHide
		 * @member module:ActionButtonAddon
		 * @instance
		 *
		 * @param {Boolean} [isActionButtonAutoHide]
		 *
		 * @returns {Boolean|this}
		 */
		isActionButtonAutoHide: method.boolean({
			init: true,
			set() {
				this[refreshActionButton]();
			}
		}),

		/**
		 * @method isActionButtonEnabled
		 * @member module:ActionButtonAddon
		 * @instance
		 *
		 * @param {Boolean} [isActionButtonEnabled]
		 *
		 * @returns {Boolean|this}
		 */
		isActionButtonEnabled: method.boolean({
			init: true,
			set() {
				this[refreshActionButton]();
			}
		}),

		/**
		 * Adds text on the right side of the input element
		 *
		 * @method countText
		 * @member module:ActionButtonAddon
		 * @instance
		 *
		 * @param {String} [countText]
		 *
		 * @returns {String|this}
		 */
		countText: method.string({
			set(countText) {
				const self = this;

				if (countText) {
					if (!self[COUNT_CONTROL]) {
						self[COUNT_CONTROL] = new Span({
							classes: 'text-input-count'
						});
						self[addRightContainer]().prepend(self[COUNT_CONTROL]);
					}
					self[COUNT_CONTROL].text(countText);
				}
				else if (self[COUNT_CONTROL]) {
					self[COUNT_CONTROL].remove();
					self[COUNT_CONTROL] = null;
				}

				self.resize(true);
			}
		})

	});

	return ActionButtonMixin;
}
