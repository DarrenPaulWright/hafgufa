import { method } from 'type-enforcer';
import { CLICK_EVENT } from '../../utility/domConstants';
import controlTypes from '../controlTypes';

const HAS_CLICK_EVENT = Symbol();

const HTTP = 'http://';
const HTTPS = 'https://';
const NEW_TAB = '_blank';
const MAIL_TO = 'mailto:';

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

const addClickEvent = function() {
	const self = this;

	const clickHandler = () => {
		let url = self.url();

		if (self.isSelectable && self.isSelectable()) {
			self.isSelected(!self.isSelected());
		}

		if (self.onClick()) {
			self.onClick()(self);
		}

		if (self.type() !== controlTypes.HYPERLINK && url) {
			const link = buildLink(url);
			window.open(link.url, link.target);
		}
	};

	if (!self[HAS_CLICK_EVENT]) {
		self.on(CLICK_EVENT, clickHandler);
		self[HAS_CLICK_EVENT] = true;
	}
};

/**
 * Adds onClick, click, and url methods to a control
 *
 * @module OnClickMixin
 * @constructor
 */
export default (Base) => {
	class OnClickMixin extends Base {

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
			this.elementD3().dispatch(CLICK_EVENT);

			return this;
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
		 * @arg {string|element} content
		 *
		 * @returns {string|element|this}
		 */
		url: method.string({
			set(url) {
				addClickEvent.call(this);
				if (this.text) {
					this.text(this.text(), true);
				}

				if (this.type() === controlTypes.HYPERLINK) {
					const link = buildLink(url);

					this.element().target = link.target;
					this.element().href = link.url;
				}
			}
		}),

		/**
		 * An onClick callback.
		 *
		 * @method onClick
		 * @member module:OnClickAddon
		 * @instance
		 * @arg {Function} [callback]
		 * @returns {Function|this}
		 */
		onClick: method.function({
			set() {
				addClickEvent.call(this);
			},
			other: null
		})
	});

	return OnClickMixin;
};
