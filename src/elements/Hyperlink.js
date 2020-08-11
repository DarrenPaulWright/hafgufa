import { applySettings, methodString } from 'type-enforcer-ui';
import Control from '../Control.js';
import controlTypes from '../controlTypes.js';
import OnClickMixin from '../mixins/OnClickMixin.js';
import setDefaults from '../utility/setDefaults.js';
import './Hyperlink.less';

/**
 * Display an anchor element.
 *
 * @class Hyperlink
 * @mixes OnClickMixin
 * @extends Control
 *
 * @param {object} settings
 * @param {string} [settings.text]
 */
export default class Hyperlink extends OnClickMixin(Control) {
	constructor(settings = {}) {
		super(setDefaults({
			type: controlTypes.HYPERLINK,
			element: 'a'
		}, settings));

		applySettings(this, settings);
	}
}

Object.assign(Hyperlink.prototype, {
	/**
	 * The displayed text. This is automatically set to the url when the url is set.
	 *
	 * @method text
	 * @memberOf Hyperlink
	 * @instance
	 *
	 * @param {string|element} content
	 *
	 * @returns {string|element|this}
	 */
	text: methodString({
		set(text) {
			this.element.innerHTML = text || this.url();
		}
	})
});
