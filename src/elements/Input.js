import { applySettings, Enum, methodAny, methodEnum } from 'type-enforcer-ui';
import controlTypes from '../controlTypes.js';
import {
	INPUT_TYPE,
	INPUT_TYPE_CHECKBOX,
	INPUT_TYPE_FILE,
	INPUT_TYPE_PASSWORD,
	INPUT_TYPE_RADIO,
	INPUT_TYPE_TEXT
} from '../utility/domConstants.js';
import setDefaults from '../utility/setDefaults.js';
import Control from './../Control.js';

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
 * @class
 *
 * @param {object} settings
 * @param {string} [settings.type]
 */
export default class Input extends Control {
	constructor(settings = {}) {
		super(setDefaults({
			type: controlTypes.INPUT,
			element: 'input'
		}, settings));

		applySettings(this, settings);
	}

	click() {
		this.element.click();

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
	 * @param {string|element} inputType
	 *
	 * @returns {string|this}
	 */
	inputType: methodEnum({
		enum: AVAILABLE_TYPES,
		set(inputType) {
			this.attr(INPUT_TYPE, inputType);
		}
	}),

	value: methodAny({
		set(value) {
			this.element.value = value;
		},
		get() {
			return this.element.value;
		}
	})
});
