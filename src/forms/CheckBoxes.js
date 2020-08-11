import { applySettings, AUTO, castArray, HUNDRED_PERCENT, methodAny, methodArray } from 'type-enforcer-ui';
import controlTypes from '../controlTypes.js';
import CheckBox from '../elements/CheckBox.js';
import { ORIENTATION } from '../uiConstants.js';
import assign from '../utility/assign.js';
import setDefaults from '../utility/setDefaults.js';
import './CheckBoxes.less';
import FormControl from './FormControl.js';

const CHECK_BOXES = Symbol();

/**
 * Display a list of check boxes.
 *
 * @class CheckBox
 *
 * @param {object} settings
 */
export default class CheckBoxes extends FormControl {
	constructor(settings = {}) {
		super(setDefaults({
			type: controlTypes.CHECKBOX,
			width: AUTO
		}, settings, {
			FocusMixin: assign(settings.FocusMixin, {
				setFocus() {
					self[CHECK_BOXES][0].isFocused(true);
				}
			})
		}));

		const self = this;
		self[CHECK_BOXES] = [];
		self.addClass('checkboxes');

		applySettings(self, settings, [], ['value']);
	}
}

Object.assign(CheckBoxes.prototype, {
	/**
	 * @method value
	 * @memberOf CheckBox
	 * @instance
	 * @param {Array|string} [value]
	 * @returns {Array|string|this}
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
