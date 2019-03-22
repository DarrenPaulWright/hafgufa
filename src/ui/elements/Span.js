import dom from '../../utility/dom';
import { SPAN } from '../../utility/domConstants';
import objectHelper from '../../utility/objectHelper';
import controlTypes from '../controlTypes';
import Control from './../Control';
import { method } from 'type-enforcer';

/**
 * <p>Display a span element.</p>
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
		settings.element = dom.buildNew('', SPAN);
		settings.skipWindowResize = true;

		super(controlTypes.SPAN, settings);

		objectHelper.applySettings(this, settings);
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
		set: function(text) {
			dom.content(this, text);
		}
	})
});
