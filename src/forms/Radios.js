import shortid from 'shortid';
import { applySettings, AUTO, enforceCssSize, HUNDRED_PERCENT, method } from 'type-enforcer-ui';
import controlTypes from '../controlTypes';
import Radio from '../elements/Radio';
import { ORIENTATION } from '../uiConstants';
import FormControl from './FormControl';
import './Radios.less';

const RADIOS = Symbol();
const NAME = Symbol();

/**
 * Display a list of radio controls.
 *
 * @module Radio
 * @extends FormControl
 * @constructor
 *
 * @arg {Object}  settings
 */
export default class Radios extends FormControl {
	constructor(settings = {}) {
		settings.type = settings.type || controlTypes.RADIO;
		settings.width = enforceCssSize(settings.width, AUTO, true);

		super(settings);

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
	 * @arg {Array|String} [value]
	 * @returns {Array|String|this}
	 */
	value: method.string({
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

	values: method.array({
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
