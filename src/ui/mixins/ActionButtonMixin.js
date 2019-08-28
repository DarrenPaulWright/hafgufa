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
import Span from '../elements/Span';
import { CLEAR_ICON } from '../icons';
import Container from '../layout/Container';
import './ActionButtonMixin.less';

const RIGHT_CONTAINER = Symbol();
const RIGHT_CONTAINER_WIDTH = Symbol();
const ACTION_BUTTON = Symbol();
const COUNT_CONTROL = Symbol();

const addRightContainer = Symbol();
const measureRightContainerWidth = Symbol();

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
			self[RIGHT_CONTAINER_WIDTH] = 0;

			self.css(POSITION, RELATIVE);

			self.onChange(() => {
				self.refreshActionButton();
			});

			self.onResize(() => {
				const container = containerCallback();

				if (container) {
					const height = container.borderHeight();
					const width = container.borderWidth();

					if (self[RIGHT_CONTAINER]) {
						self[RIGHT_CONTAINER].css({
							top: container.element().offsetTop,
							height: height,
							right: self.borderWidth() - width - dom.get.left(container.element())
						});
					}

					if (self[COUNT_CONTROL]) {
						self[COUNT_CONTROL].css(LINE_HEIGHT, height);
					}

					container.css(PADDING_RIGHT, self[RIGHT_CONTAINER_WIDTH]);
				}
			});

			self.onRemove(() => {
				if (self[RIGHT_CONTAINER]) {
					self[RIGHT_CONTAINER].remove();
					self[RIGHT_CONTAINER] = null;
				}
			});
		}

		[addRightContainer]() {
			if (!this[RIGHT_CONTAINER]) {
				this[RIGHT_CONTAINER] = new Container({
					container: this,
					classes: 'action-button-container',
					removeClass: 'container'
				});
			}
			return this[RIGHT_CONTAINER];
		}

		[measureRightContainerWidth]() {
			this[RIGHT_CONTAINER_WIDTH] = this[RIGHT_CONTAINER] ? this[RIGHT_CONTAINER].borderWidth() : 0;
			this.resize();
		}
	}

	Object.assign(ActionButtonMixin.prototype, {

		refreshActionButton: debounce(function() {
			const self = this;
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
					.classes('action-button', !isIconButton)
					.classes('icon-button', isIconButton);
				self.resize();
			}
			else if (self[ACTION_BUTTON]) {
				self[ACTION_BUTTON].remove();
				self[ACTION_BUTTON] = null;
			}
			self[measureRightContainerWidth]();
		}),

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
			init: CLEAR_ICON,
			set() {
				this.refreshActionButton();
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
				this.refreshActionButton();
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
			init() {
				this.value('').triggerChange();
			},
			set() {
				this.refreshActionButton();
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
				this.refreshActionButton();
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
				this.refreshActionButton();
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
				self[measureRightContainerWidth]();
			}
		})

	});

	return ActionButtonMixin;
}
