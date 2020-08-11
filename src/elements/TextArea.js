import { applySettings, methodAny, methodInteger } from 'type-enforcer-ui';
import controlTypes from '../controlTypes.js';
import { ROWS } from '../utility/domConstants.js';
import setDefaults from '../utility/setDefaults.js';
import Control from './../Control.js';

/**
 * Display a textarea element.
 *
 * @class TextArea
 * @extends Control
 *
 * @param {object} settings
 * @param {string} [settings.rows]
 */
export default class TextArea extends Control {
	constructor(settings = {}) {
		super(setDefaults({
			type: controlTypes.TEXT_AREA,
			element: 'textarea'
		}, settings));

		applySettings(this, settings);
	}
}

Object.assign(TextArea.prototype, {
	/**
	 * Set or get the rows.
	 *
	 * @method rows
	 * @memberOf TextArea
	 * @instance
	 *
	 * @param {number.int} rows
	 *
	 * @returns {number.int|this}
	 */
	rows: methodInteger({
		set(rows) {
			this.attr(ROWS, rows);
		}
	}),

	value: methodAny({
		set(value) {
			this.element.value = value;
		},
		get() {
			return this.element.value;
		}
	}),

	focus() {
		this.element.focus();
	}
});
