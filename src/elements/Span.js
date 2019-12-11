import { applySettings, methodString } from 'type-enforcer-ui';
import controlTypes from '../controlTypes';
import Control from './../Control';

/**
 * Display a span element.
 *
 * @class Span
 * @extends Control
 * @constructor
 *
 * @arg {Object} settings
 * @arg {String} [settings.text]
 */
export default class Span extends Control {
	constructor(settings = {}) {
		settings.type = settings.type || controlTypes.SPAN;
		settings.element = 'span';

		super(settings);

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
	 * @arg {string|element} content
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
	 * @arg {string|element} content
	 *
	 * @returns {string|element|this}
	 */
	html: methodString({
		set(text) {
			this.element.innerHTML = text;
		}
	})
});
