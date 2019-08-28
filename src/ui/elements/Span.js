import { applySettings, method } from 'type-enforcer';
import dom from '../../utility/dom';
import { SPAN } from '../../utility/domConstants';
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
		settings.element = dom.buildNew('', SPAN);
		settings.skipWindowResize = true;

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
	text: method.string({
		set(text) {
			dom.content(this, text);
		}
	})
});
