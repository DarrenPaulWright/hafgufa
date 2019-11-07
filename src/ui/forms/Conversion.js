import { applySettings, enforceInteger, Enum, method } from 'type-enforcer-ui';
import { TAB_INDEX, TAB_INDEX_DISABLED } from '../../utility/domConstants';
import locale from '../../utility/locale';
import round from '../../utility/math/round';
import controlTypes from '../controlTypes';
import FocusMixin from '../mixins/FocusMixin';
import FormControl from './FormControl';
import TextInput, { ON_CHANGE_DELAY } from './TextInput';

const INPUT_WIDTH = '8rem';

const FROM_TEXT_INPUT = Symbol();
const TO_TEXT_INPUT = Symbol();
const TO_FACTOR = Symbol();
const FROM_FACTOR = Symbol();
const TYPES = Symbol();
const FACTORS = Symbol();
const SUFFIXES = Symbol();

const getFactor = Symbol();
const getSuffix = Symbol();
const setValue = Symbol();

/**
 * Display a control with both Meters and Feet input fields.
 * @module Conversion
 * @extends FormControl
 * @constructor
 *
 * @arg {Object} settings                - Accepts all control and FormControl settings plus:
 * @arg {String} settings.fromType       - The unit to display in the left text field. See
 *     Conversion.CONVERSION_TYPES
 * @arg {String} settings.toType         - The unit to display in the right text field. See
 *     Conversion.CONVERSION_TYPES
 * @arg {Int}    settings.fractionDigits - Number of decimal places to display.
 */
export default class Conversion extends FocusMixin(FormControl) {
	constructor(settings = {}) {
		const fromTextInput = new TextInput({
			width: INPUT_WIDTH,
			onChange(newValue) {
				self[setValue](newValue, true);
				self.triggerChange();
			}
		});

		const toTextInput = new TextInput({
			width: INPUT_WIDTH,
			onChange(newValue) {
				self[setValue](newValue, false);
				self.triggerChange();
			}
		});
		toTextInput.getInput().attr(TAB_INDEX, TAB_INDEX_DISABLED);

		settings.type = settings.type || controlTypes.CONVERSION;
		settings.changeDelay = enforceInteger(settings.changeDelay, ON_CHANGE_DELAY);
		settings.FocusMixin = {
			...settings.FocusMixin,
			mainControl: fromTextInput,
			subControl: toTextInput,
			getFocus() {
				return self[FROM_TEXT_INPUT].isFocused() || self[TO_TEXT_INPUT].isFocused();
			}
		};

		super(settings);

		const self = this;
		self[TO_FACTOR] = 1;
		self[FROM_FACTOR] = 1;
		self[TYPES] = new Enum({
			...Conversion.CONVERSION_TYPES.LENGTH,
			...Conversion.CONVERSION_TYPES.WEIGHT,
			...Conversion.CONVERSION_TYPES.TEMPERATURE
		});
		self[FACTORS] = new Enum({
			...Conversion.CONVERSION_FACTORS.LENGTH,
			...Conversion.CONVERSION_FACTORS.WEIGHT,
			...Conversion.CONVERSION_FACTORS.TEMPERATURE
		});
		self[SUFFIXES] = new Enum({
			...Conversion.CONVERSION_SUFFIXES.LENGTH,
			...Conversion.CONVERSION_SUFFIXES.WEIGHT,
			...Conversion.CONVERSION_SUFFIXES.TEMPERATURE
		});

		self.addClass('conversion');

		self[FROM_TEXT_INPUT] = fromTextInput;
		self[FROM_TEXT_INPUT].container(self);

		self[TO_TEXT_INPUT] = toTextInput;
		self[TO_TEXT_INPUT].container(self);

		applySettings(self, settings);
	}

	[getFactor](typeString) {
		return this[FACTORS][this[TYPES].key(typeString)] || {};
	}

	[getSuffix](typeString) {
		const localizationId = this[SUFFIXES][this[TYPES].key(typeString)];

		return locale.get(localizationId);
	}

	[setValue](newValue, isFrom) {
		const self = this;
		const conversionFactor = (self[TO_FACTOR].FACTOR || self[TO_FACTOR]) / (self[FROM_FACTOR].FACTOR || self[FROM_FACTOR]);

		if (isFrom) {
			if (newValue === '') {
				self[TO_TEXT_INPUT].value('');
			}
			else {
				if (self[FROM_FACTOR].ADD_AFTER) {
					newValue -= self[FROM_FACTOR].ADD_AFTER;
				}
				newValue = newValue * conversionFactor;
				if (self[TO_FACTOR].ADD_AFTER) {
					newValue += self[TO_FACTOR].ADD_AFTER;
				}
				self[TO_TEXT_INPUT].value(round(newValue, self.fractionDigits() || 1));
			}
		}
		else {
			if (newValue === '') {
				self[FROM_TEXT_INPUT].value('');
			}
			else {
				if (self[TO_FACTOR].ADD_AFTER) {
					newValue -= self[TO_FACTOR].ADD_AFTER;
				}
				newValue = newValue / conversionFactor;
				if (self[FROM_FACTOR].ADD_AFTER) {
					newValue += self[FROM_FACTOR].ADD_AFTER;
				}
				self[FROM_TEXT_INPUT].value(round(newValue, self.fractionDigits()));
			}
		}
	}

	/**
	 * @method value
	 * @member module:Conversion
	 * @instance
	 * @arg {String} [value]
	 * @returns {String|this}
	 */
	value(value) {
		const self = this;

		if (arguments.length) {
			self[FROM_TEXT_INPUT].value(value);
			self[setValue](value, true);

			return self;
		}

		return self[FROM_TEXT_INPUT].value();
	}

	getToValue() {
		return this[TO_TEXT_INPUT].value();
	}

	triggerFromChange() {
		this[FROM_TEXT_INPUT].triggerChange();
	}

	triggerToChange() {
		this[TO_TEXT_INPUT].triggerChange();
	}

	/**
	 * @method changeDelay
	 * @member module:Conversion
	 * @instance
	 * @arg {Int} [newDelay]
	 * @returns {Int|this}
	 */
	changeDelay(newDelay) {
		const self = this;

		if (newDelay !== undefined) {
			self[FROM_TEXT_INPUT].changeDelay(newDelay);
			self[TO_TEXT_INPUT].changeDelay(newDelay);
			super.changeDelay(0);

			return self;
		}

		return self[FROM_TEXT_INPUT].changeDelay();
	}
}

Object.assign(Conversion.prototype, {
	fromType: method.string({
		set(fromType) {
			const self = this;

			self[FROM_FACTOR] = self[getFactor](fromType);
			self[FROM_TEXT_INPUT].suffix(self[getSuffix](fromType));
			self[setValue]();
		}
	}),

	toType: method.string({
		set(toType) {
			const self = this;

			self[TO_FACTOR] = self[getFactor](toType);
			self[TO_TEXT_INPUT].suffix(self[getSuffix](toType));
			self[setValue]();
		}
	}),

	fractionDigits: method.integer({
		init: 1,
		set: setValue,
		min: 0
	})

});

Conversion.CONVERSION_TYPES = {
	LENGTH: {
		FEET: 'feet',
		INCHES: 'inches',
		KILOMETER: 'kilometer',
		METERS: 'meters',
		MILLIMETERS: 'millimeters',
		MILE: 'mile'
	},
	WEIGHT: {
		GRAM: 'gram',
		KILOGRAMS: 'kilograms',
		POUNDS: 'pounds',
		OUNCE: 'ounce'
	},
	TEMPERATURE: {
		CELSIUS: 'celsius',
		FAHRENHEIT: 'fahrenheit'
	}
};

Conversion.CONVERSION_FACTORS = {
	LENGTH: {
		FEET: 3.28084,
		INCHES: 39.37,
		KILOMETER: 0.001,
		METERS: 1,
		MILLIMETERS: 1000,
		MILE: 0.000621371
	},
	WEIGHT: {
		GRAM: 1000,
		KILOGRAMS: 1,
		POUNDS: 2.20462,
		OUNCE: 35.274
	},
	TEMPERATURE: {
		CELSIUS: 1,
		FAHRENHEIT: {
			FACTOR: 1.8,
			ADD_AFTER: 32
		}
	}
};

Conversion.CONVERSION_SUFFIXES = {
	LENGTH: {
		FEET: 'feetAbbr',
		INCHES: 'inchesAbbr',
		KILOMETER: 'kilometersAbbr',
		METERS: 'metersAbbr',
		MILLIMETERS: 'millimetersAbbr',
		MILE: 'milesAbbr'
	},
	WEIGHT: {
		GRAM: 'gramsAbbr',
		KILOGRAMS: 'kilogramsAbbr',
		POUNDS: 'poundsAbbr',
		OUNCE: 'ouncesAbbr'
	},
	TEMPERATURE: {
		CELSIUS: 'celsiusAbbr',
		FAHRENHEIT: 'fahrenheitAbbr'
	}
};
