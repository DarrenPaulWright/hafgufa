import { applySettings, methodString } from 'type-enforcer-ui';
import controlTypes from '../controlTypes';
import setDefaults from '../utility/setDefaults.js';
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
		super(setDefaults({
			type: controlTypes.LABEL,
			element: 'label'
		}, settings));

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
	content: methodString({
		set(text) {
			this.element.innerHTML = text;
		}
	})
});
