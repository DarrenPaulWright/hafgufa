import shortid from 'shortid';
import { applySettings, AUTO, HUNDRED_PERCENT, methodArray, methodString } from 'type-enforcer-ui';
import controlTypes from '../controlTypes.js';
import Radio from '../elements/Radio.js';
import { ORIENTATION } from '../uiConstants.js';
import setDefaults from '../utility/setDefaults.js';
import FormControl from './FormControl.js';
import './Radios.less';

const RADIOS = Symbol();
const NAME = Symbol();

/**
 * Display a list of radio controls.
 *
 * @module Radio
 * @extends FormControl
 * @class
 *
 * @param {object}  settings
 */
export default class Radios extends FormControl {
	constructor(settings = {}) {
		super(setDefaults({
			type: controlTypes.RADIO,
			width: AUTO
		}, settings));

		const self = this;
		self[RADIOS] = [];
		self[NAME] = shortid.generate();
		self.addClass('radios');

		applySettings(self, settings, [], ['value']);
	}
}

Object.assign(Radios.prototype, {
	/**
	 * @method value
	 * @member module:Radio
	 * @instance
	 * @param {Array|string} [value]
	 * @returns {Array|string|this}
	 */
	value: methodString({
		init: '',
		set(value) {
			this[RADIOS].forEach((radio) => {
				radio.isChecked(radio.value() === value);
			});
		},
		get() {
			const control = this[RADIOS].find((radio) => radio.isChecked());

			return control ? control.value() : '';
		}
	}),

	values: methodArray({
		before() {
			this[RADIOS].forEach((radio) => {
				radio.remove();
			});
			this[RADIOS].length = 0;
		},
		set(values) {
			const self = this;

			self[RADIOS] = values.map((settings) => {
				return new Radio({
					...settings,
					container: self,
					width: HUNDRED_PERCENT,
					name: self[NAME]
				})
					.onChange(() => {
						self[RADIOS].forEach((control) => {
							if (control.value() !== settings.value) {
								control.isChecked(false);
							}
						});
						self.triggerChange();
					});
			});
		}
	})
});

Radios.ORIENTATION = ORIENTATION;
