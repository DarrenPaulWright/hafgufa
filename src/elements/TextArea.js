import { applySettings, methodAny, methodInteger } from 'type-enforcer-ui';
import controlTypes from '../controlTypes';
import { ROWS } from '../utility/domConstants';
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
