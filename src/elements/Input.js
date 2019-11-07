import { applySettings, Enum, method } from 'type-enforcer-ui';
import controlTypes from '../controlTypes';
import {
	INPUT_TYPE,
	INPUT_TYPE_CHECKBOX,
	INPUT_TYPE_FILE,
	INPUT_TYPE_PASSWORD,
	INPUT_TYPE_RADIO,
	INPUT_TYPE_TEXT
} from '../utility/domConstants';
import Control from './../Control';

const AVAILABLE_TYPES = new Enum({
	INPUT_TYPE_FILE,
	INPUT_TYPE_CHECKBOX,
	INPUT_TYPE_PASSWORD,
	INPUT_TYPE_RADIO,
	INPUT_TYPE_TEXT
});

/**
 * Display an input element.
 *
 * @class Input
 * @extends Control
 * @constructor
 *
 * @arg {Object} settings
 * @arg {String} [settings.type]
 */
export default class Input extends Control {
	constructor(settings = {}) {
		settings.type = settings.type || controlTypes.INPUT;
		settings.element = 'input';

		super(settings);

		applySettings(this, settings);
	}

	click() {
		this.element().click();

		return this;
	}
}

Object.assign(Input.prototype, {

	/**
	 * The input type
	 *
	 * @method inputType
	 * @member module:Input
	 * @instance
	 *
	 * @arg {string|element} inputType
	 *
	 * @returns {string|this}
	 */
	inputType: method.enum({
		enum: AVAILABLE_TYPES,
		set(inputType) {
			this.attr(INPUT_TYPE, inputType);
		}
	}),

	value: method.any({
		set(value) {
			this.element().value = value;
		},
		get() {
			return this.element().value;
		}
	})
});
