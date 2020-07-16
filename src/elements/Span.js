import { applySettings, methodString } from 'type-enforcer-ui';
import controlTypes from '../controlTypes.js';
import setDefaults from '../utility/setDefaults.js';
import Control from './../Control.js';

/**
 * Display a span element.
 *
 * @class Span
 * @extends Control
 * @constructor
 *
 * @param {Object} settings
 * @param {String} [settings.text]
 */
export default class Span extends Control {
	constructor(settings = {}) {
		super(setDefaults({
			type: controlTypes.SPAN,
			element: 'span'
		}, settings));

		applySettings(this, settings);
	}
}

Object.assign(Span.prototype, {
	/**
	 * Set or get the span text.
	 *
	 * @method text
	 * @member module:Span
	 * @instance
	 *
	 * @param {string|element} content
	 *
	 * @returns {string|element|this}
	 */
	text: methodString({
		set(text) {
			this.element.textContent = text;
		}
	}),
	/**
	 * Set or get the span HTML.
	 *
	 * @method html
	 * @member module:Span
	 * @instance
	 *
	 * @param {string|element} content
	 *
	 * @returns {string|element|this}
	 */
	html: methodString({
		set(text) {
			this.element.innerHTML = text;
		}
	})
});
