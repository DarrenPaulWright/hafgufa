import { debounce } from 'async-agent';
import { method, PrivateVars } from 'type-enforcer';
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

const _ = new PrivateVars();

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
			const _self = _.set(this);

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
						.isDisplayed(!self.isActionButtonAutoHide() || !!self.value().length)
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
					const container = containerCallback();

					if (container) {
						const containerHeight = container.borderHeight();
						const containerWidth = container.borderWidth();
						let rightContainerWidth = 0;

						if (_self.rightContainer) {
							_self.rightContainer.css({
								top: container.element().offsetTop,
								height: containerHeight,
								right: Math.max(0, width - containerWidth - dom.get.left(container.element()))
							});
							rightContainerWidth = _self.rightContainer.borderWidth();

							if (_self.countControl) {
								_self.countControl.css(LINE_HEIGHT, containerHeight);
							}
						}

						container.css(PADDING_RIGHT, rightContainerWidth);
					}
				});
		}

		[addRightContainer]() {
			const _self = _.set(this);

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
