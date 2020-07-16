import { methodFunction, methodString } from 'type-enforcer-ui';
import controlTypes from '../controlTypes.js';
import { CLICK_EVENT } from '../utility/domConstants.js';

const HAS_CLICK_EVENT = Symbol();

const HTTP = 'http://';
const HTTPS = 'https://';
const NEW_TAB = '_blank';
const MAIL_TO = 'mailto:';

const addClickEvent = Symbol();

const buildLink = (url) => {
	const link = {
		target: '',
		url: ''
	};

	if (url) {
		if (url.includes('@')) {
			link.url = MAIL_TO + url;
		}
		else {
			link.target = NEW_TAB;
			link.url = url;
			if (!url.includes(HTTP) && !url.includes(HTTPS)) {
				link.url = HTTP + link.url;
			}
		}
	}

	return link;
};

/**
 * Adds onClick, click, and url methods to a control
 *
 * @module OnClickMixin
 * @constructor
 */
export default (Base) => {
	class OnClickMixin extends Base {
		[addClickEvent]() {
			const self = this;

			const clickHandler = (event) => {
				let url = self.url();

				if (self.isSelectable && self.isSelectable()) {
					self.isSelected(!self.isSelected());
				}

				if (self.onClick()) {
					self.onClick()(event);
				}

				if (self.type !== controlTypes.HYPERLINK && url) {
					const link = buildLink(url);
					window.open(link.url, link.target);
				}
			};

			if (!self[HAS_CLICK_EVENT]) {
				self.on(CLICK_EVENT, clickHandler);
				self[HAS_CLICK_EVENT] = true;
			}
		}

		/**
		 * Issue a click event on this control.
		 *
		 * @method click
		 * @member module:OnClickAddon
		 * @instance
		 *
		 * @returns {this}
		 */
		click() {
			return this.trigger(CLICK_EVENT);
		}
	}

	Object.assign(OnClickMixin.prototype, {
		/**
		 * The url to navigate to.
		 * If an @ is in the string then it is treated like an email, otherwise automatically adds http:// when clicked if not provided.
		 *
		 * @method url
		 * @member module:OnClickAddon
		 * @instance
		 *
		 * @param {string|element} content
		 *
		 * @returns {string|element|this}
		 */
		url: methodString({
			set(url) {
				const self = this;

				self[addClickEvent]();
				if (self.text) {
					self.text(self.text(), true);
				}

				if (self.type === controlTypes.HYPERLINK) {
					const link = buildLink(url);

					self.element.target = link.target;
					self.element.href = link.url;
				}
			}
		}),

		/**
		 * An onClick callback.
		 *
		 * @method onClick
		 * @member module:OnClickAddon
		 * @instance
		 * @param {Function} [callback]
		 * @returns {Function|this}
		 */
		onClick: methodFunction({
			set: addClickEvent,
			other: null
		})
	});

	return OnClickMixin;
};
