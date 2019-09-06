import { applySettings, AUTO, castArray, enforce, HUNDRED_PERCENT, method } from 'type-enforcer';
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
		settings.width = enforce.cssSize(settings.width, AUTO, true);

		super(settings);

		const self = this;
		self[CHECK_BOXES] = [];
		self.addClass('checkboxes');

		applySettings(self, settings, [], ['value']);

		self.onRemove(() => {
			self.values([]);
		});
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
	value: method.any({
		enforce(value) {
			return castArray(value);
		},
		init: [],
		set(value) {
			this[CHECK_BOXES].forEach((checkbox) => {
				checkbox.isChecked(value.includes(checkbox.name()));
			});
		},
		get() {
			return this[CHECK_BOXES]
				.map((checkbox) => checkbox.isChecked() ? checkbox.value() : false)
				.filter(Boolean);
		}
	}),

	values: method.array({
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
				const checkbox = new CheckBox({
					...settings,
					container: self.contentContainer(),
					width: HUNDRED_PERCENT
				});
				checkbox.onChange(() => {
					self.triggerChange();
				});

				return checkbox;
			});
		}
	})
});

CheckBoxes.ORIENTATION = ORIENTATION;
