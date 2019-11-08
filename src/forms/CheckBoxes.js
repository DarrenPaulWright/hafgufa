import {
	applySettings,
	AUTO,
	castArray,
	enforceCssSize,
	HUNDRED_PERCENT,
	methodAny,
	methodArray
} from 'type-enforcer-ui';
import controlTypes from '../controlTypes';
import CheckBox from '../elements/CheckBox';
import { ORIENTATION } from '../uiConstants';
import './CheckBoxes.less';
import FormControl from './FormControl';

const CHECK_BOXES = Symbol();

/**
 * Display a list of check boxes.
 *
 * @module CheckBox
 * @constructor
 *
 * @arg {Object} settings
 */
export default class CheckBoxes extends FormControl {
	constructor(settings = {}) {
		settings.type = settings.type || controlTypes.CHECKBOX;
		settings.width = enforceCssSize(settings.width, AUTO, true);

		super(settings);

		const self = this;
		self[CHECK_BOXES] = [];
		self.addClass('checkboxes');

		applySettings(self, settings, [], ['value']);
	}
}

Object.assign(CheckBoxes.prototype, {
	/**
	 * @method value
	 * @member module:CheckBox
	 * @instance
	 * @arg {Array|String} [value]
	 * @returns {Array|String|this}
	 */
	value: methodAny({
		enforce(value) {
			return castArray(value);
		},
		init: [],
		set(value) {
			this[CHECK_BOXES].forEach((checkbox) => {
				checkbox.isChecked(value.includes(checkbox.value()));
			});
		},
		get() {
			return this[CHECK_BOXES]
				.map((checkbox) => checkbox.isChecked() ? checkbox.value() : false)
				.filter(Boolean);
		}
	}),

	values: methodArray({
		before() {
			const self = this;

			self[CHECK_BOXES].forEach((checkbox) => {
				checkbox.remove();
			});
			self[CHECK_BOXES].length = 0;
		},
		set(values) {
			const self = this;

			self[CHECK_BOXES] = values.map((settings) => {
				return new CheckBox({
					...settings,
					container: self,
					width: HUNDRED_PERCENT
				})
					.onChange(() => {
						self.triggerChange();
					});
			});
		}
	})
});

CheckBoxes.ORIENTATION = ORIENTATION;
