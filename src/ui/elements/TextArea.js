import { applySettings, method } from 'type-enforcer';
import dom from '../../utility/dom';
import { ROWS, TEXT_AREA } from '../../utility/domConstants';
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
		settings.element = dom.buildNew('', TEXT_AREA);
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
		set: function(rows) {
			this.attr(ROWS, rows);
		}
	}),

	value: method.any({
		set: function(value) {
			this.element().value = value;
		},
		get: function() {
			return this.element().value;
		}
	}),

	focus: function() {
		this.element().focus();
	}
});
