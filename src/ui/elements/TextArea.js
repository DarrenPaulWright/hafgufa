import { applySettings, method } from 'type-enforcer';
import { ROWS } from '../../utility/domConstants';
import controlTypes from '../controlTypes';
import Control from './../Control';

/**
 * Display a textarea element.
 *
 * @class TextArea
 * @extends Control
 * @constructor
 *
 * @arg {Object} settings
 * @arg {String} [settings.rows]
 */
export default class TextArea extends Control {
	constructor(settings = {}) {
		settings.type = settings.type || controlTypes.TEXT_AREA;
		settings.element = 'textarea';
		settings.skipWindowResize = true;

		super(settings);

		applySettings(this, settings);
	}
}

Object.assign(TextArea.prototype, {
	/**
	 * Set or get the rows.
	 *
	 * @method rows
	 * @member module:TextArea
	 * @instance
	 *
	 * @arg {int} rows
	 *
	 * @returns {int|this}
	 */
	rows: method.integer({
		set(rows) {
			this.attr(ROWS, rows);
		}
	}),

	value: method.any({
		set(value) {
			this.element().value = value;
		},
		get() {
			return this.element().value;
		}
	}),

	focus() {
		this.element().focus();
	}
});
