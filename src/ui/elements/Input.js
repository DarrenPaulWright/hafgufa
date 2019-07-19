import { Enum, method } from 'type-enforcer';
import dom from '../../utility/dom';
import {
	INPUT,
	INPUT_TYPE,
	INPUT_TYPE_CHECKBOX,
	INPUT_TYPE_FILE,
	INPUT_TYPE_PASSWORD,
	INPUT_TYPE_RADIO,
	INPUT_TYPE_TEXT
} from '../../utility/domConstants';
import objectHelper from '../../utility/objectHelper';
import controlTypes from '../controlTypes';
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
		settings.element = dom.buildNew('', INPUT);
		settings.skipWindowResize = true;

		super(settings);

		objectHelper.applySettings(this, settings);
	}

	focus() {
		this.element().focus();

		return this;
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
		set: function(inputType) {
			this.attr(INPUT_TYPE, inputType);
		}
	}),

	value: method.any({
		set: function(value) {
			this.element().value = value;
		},
		get: function() {
			return this.element().value;
		}
	})
});
