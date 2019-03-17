import dom from '../../utility/dom';
import { LABEL } from '../../utility/domConstants';
import objectHelper from '../../utility/objectHelper';
import controlTypes from '../controlTypes';
import Control from './../Control';
import { method } from 'type-enforcer';

/**
 * <p>Display a label element.</p>
 *
 * @class Label
 * @extends Control
 * @constructor
 *
 * @param {Object} settings
 * @param {String} [settings.text]
 */
export default class Label extends Control {
	constructor(settings = {}) {
		settings.element = dom.buildNew('', LABEL);
		settings.skipWindowResize = true;

		super(controlTypes.LABEL, settings);

		objectHelper.applySettings(this, settings);
	}
}

Object.assign(Label.prototype, {
	/**
	 * Set or get the label content.
	 *
	 * @method content
	 * @member module:Label
	 * @instance
	 *
	 * @param {string|element} content
	 *
	 * @returns {string|element|this}
	 */
	content: method.string({
		set: function(text) {
			dom.content(this, text);
		}
	})
});
