import { applySettings, methodString } from 'type-enforcer-ui';
import controlTypes from '../controlTypes.js';
import setDefaults from '../utility/setDefaults.js';
import Control from './../Control.js';

/**
 * Display a label element.
 *
 * @class Label
 * @extends Control
 * @class
 *
 * @param {object} settings
 * @param {string} [settings.text]
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
	 * @param {string|element} content
	 *
	 * @returns {string|element|this}
	 */
	content: methodString({
		set(text) {
			this.element.innerHTML = text;
		}
	})
});
