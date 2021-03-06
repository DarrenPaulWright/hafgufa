import { applySettings, AUTO, methodBoolean, methodString } from 'type-enforcer-ui';
import controlTypes from '../controlTypes.js';
import { LEFT, TEXT_ALIGN, WIDTH } from '../utility/domConstants.js';
import setDefaults from '../utility/setDefaults.js';
import './Description.less';
import FormControl from './FormControl.js';

const COLUMNS_CLASS = 'columns';

/**
 * Display a description or other text. This control doesn't accept user input.
 *
 * @class Description
 * @extends FormControl
 *
 * @param {object} settings - Accepts all control and FormControl settings plus:
 * @param {string} [settings.description] - The default description to display
 * @param {number} [settings.textWidth] - The width of the description text (not the control width)
 */
export default class Description extends FormControl {
	constructor(settings = {}) {
		super(setDefaults({
			type: controlTypes.DESCRIPTION
		}, settings));

		const self = this;
		self.addClass('description');

		applySettings(self, settings);
	}
}

Object.assign(Description.prototype, {
	/**
	 * @method value
	 * @memberOf Description
	 * @instance
	 * @param {string} [value]
	 * @returns {string|this}
	 */
	value: methodString({
		set(value) {
			this.contentContainer.element.innerHTML = value;
		}
	}),

	/**
	 * @method textWidth
	 * @memberOf Description
	 * @instance
	 * @param {string} [newTextWidth]
	 * @returns {string|this}
	 */
	textWidth: methodString({
		init: AUTO,
		set(newValue) {
			this.contentContainer.css(WIDTH, newValue);
		}
	}),

	/**
	 * @method align
	 * @memberOf Description
	 * @instance
	 * @param {string} [newAlign] - Applys directly to the css property text-align.
	 * @returns {string|this}
	 */
	align: methodString({
		init: LEFT,
		set(newValue) {
			this.contentContainer.css(TEXT_ALIGN, newValue);
		}
	}),

	/**
	 * @method isColumns
	 * @memberOf Description
	 * @instance
	 *
	 * @param {boolean} [isColumns]
	 *
	 * @returns {boolean|this}
	 */
	isColumns: methodBoolean({
		set(isColumns) {
			this.classes(COLUMNS_CLASS, isColumns);
		}
	}),

	/**
	 * @method isFocused
	 * @memberOf Description
	 * @instance
	 * @returns {boolean} - Always returns false.
	 */
	isFocused() {
		return false;
	}
});
