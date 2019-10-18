import { applySettings, method } from 'type-enforcer';
import controlTypes from '../controlTypes';
import Control from './../Control';

/**
 * Display a label element.
 *
 * @class Label
 * @extends Control
 * @constructor
 *
 * @arg {Object} settings
 * @arg {String} [settings.text]
 */
export default class Label extends Control {
	constructor(settings = {}) {
		settings.type = settings.type || controlTypes.LABEL;
		settings.element = 'label';

		super(settings);

		if (this.type === controlTypes.LABEL) {
			applySettings(this, settings);
		}
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
	 * @arg {string|element} content
	 *
	 * @returns {string|element|this}
	 */
	content: method.string({
		set(text) {
			this.element().innerHTML = text;
		}
	})
});
