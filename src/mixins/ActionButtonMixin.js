import { debounce, defer } from 'async-agent';
import { methodBoolean, methodFunction, methodString, PrivateVars } from 'type-enforcer-ui';
import Button from '../elements/Button.js';
import Div from '../elements/Div.js';
import Span from '../elements/Span.js';
import { CLEAR_ICON } from '../icons.js';
import {
	LINE_HEIGHT,
	PADDING_RIGHT,
	POSITION,
	RELATIVE,
	TAB_INDEX,
	TAB_INDEX_DISABLED
} from '../utility/domConstants.js';
import './ActionButtonMixin.less';

const _ = new PrivateVars();

const refreshActionButton = Symbol();
const addRightContainer = Symbol();

/**
 * Adds an action button and count text.
 *
 * @module ActionButtonAddon
 * @constructor
 *
 * @param {Function} Base - The class to extend
 */
export default function(Base) {
	class ActionButtonMixin extends Base {
		constructor(settings = {}) {
			super(settings);

			const self = this;
			const _self = _.set(this);
			const containerCallback = settings.ActionButtonMixin.container;

			self[refreshActionButton] = debounce(() => {
				const isIconButton = self.actionButtonIcon() === CLEAR_ICON && self.actionButtonLabel() === '';

				if ((self.actionButtonIcon() || self.actionButtonLabel()) && self.borderWidth() > 40 && (!self.rows || self.rows() === 1)) {
					if (!_self.actionButton) {
						_self.actionButton = new Button({
							isDisplayed: false,
							classes: 'icon-button',
							iconSize: Button.ICON_SIZES.NORMAL
						});
						self[addRightContainer]().append(_self.actionButton);
					}

					_self.actionButton
						.isDisplayed(!self.isActionButtonAutoHide() || self.value().length !== 0)
						.isEnabled(self.isActionButtonEnabled())
						.icon(self.actionButtonIcon())
						.label(self.actionButtonLabel())
						.onClick(self.actionButtonOnClick())
						.attr(TAB_INDEX, TAB_INDEX_DISABLED)
						.classes('form-button', !isIconButton)
						.classes('icon-button', isIconButton);
				}
				else if (_self.actionButton) {
					_self.actionButton.remove();
					_self.actionButton = null;
				}

				self.resize(true);
			});

			self.css(POSITION, RELATIVE)
				.onChange(() => {
					self[refreshActionButton]();
				})
				.onResize((width) => {
					defer(() => {
						const container = containerCallback();

						if (container) {
							const containerHeight = container.borderHeight();
							const containerWidth = container.borderWidth();
							let rightContainerWidth = 0;

							if (_self.rightContainer) {
								_self.rightContainer.css({
									top: container.element.offsetTop,
									height: containerHeight,
									right: Math.max(0, width - containerWidth - container.element.offsetLeft)
								});
								rightContainerWidth = _self.rightContainer.borderWidth();

								if (_self.countControl) {
									_self.countControl.css(LINE_HEIGHT, containerHeight);
								}
							}

							container.css(PADDING_RIGHT, rightContainerWidth);
						}
					});
				});
		}

		[addRightContainer]() {
			const _self = _(this);

			if (!_self.rightContainer) {
				_self.rightContainer = new Div({
					container: this,
					classes: 'action-button-container'
				});
			}

			return _self.rightContainer;
		}
	}

	Object.assign(ActionButtonMixin.prototype, {
		/**
		 * @method actionButtonIcon
		 * @member module:ActionButtonAddon
		 * @instance
		 *
		 * @param {string} [actionButton]
		 *
		 * @returns {string|this}
		 */
		actionButtonIcon: methodString({
			set: refreshActionButton
		}),

		/**
		 * @method actionButtonLabel
		 * @member module:ActionButtonAddon
		 * @instance
		 *
		 * @param {string} [actionButton]
		 *
		 * @returns {string|this}
		 */
		actionButtonLabel: methodString({
			set: refreshActionButton
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
		actionButtonOnClick: methodFunction({
			set: refreshActionButton
		}),

		/**
		 * @method isActionButtonAutoHide
		 * @member module:ActionButtonAddon
		 * @instance
		 *
		 * @param {boolean} [isActionButtonAutoHide]
		 *
		 * @returns {boolean|this}
		 */
		isActionButtonAutoHide: methodBoolean({
			init: true,
			set: refreshActionButton
		}),

		/**
		 * @method isActionButtonEnabled
		 * @member module:ActionButtonAddon
		 * @instance
		 *
		 * @param {boolean} [isActionButtonEnabled]
		 *
		 * @returns {boolean|this}
		 */
		isActionButtonEnabled: methodBoolean({
			init: true,
			set: refreshActionButton
		}),

		/**
		 * Adds text on the right side of the input element
		 *
		 * @method countText
		 * @member module:ActionButtonAddon
		 * @instance
		 *
		 * @param {string} [countText]
		 *
		 * @returns {string|this}
		 */
		countText: methodString({
			set(countText) {
				const self = this;
				const _self = _(self);

				if (countText) {
					if (!_self.countControl) {
						_self.countControl = new Span({
							classes: 'text-input-count'
						});
						self[addRightContainer]().prepend(_self.countControl);
					}
					_self.countControl.text(countText);
				}
				else if (_self.countControl) {
					_self.countControl.remove();
					_self.countControl = null;
				}

				self.resize(true);
			}
		})

	});

	return ActionButtonMixin;
}
