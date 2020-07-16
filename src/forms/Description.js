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
 * @constructor
 *
 * @param {Object}  settings                    - Accepts all control and FormControl settings plus:
 * @param {String}  [settings.description]      - The default description to display
 * @param {Number}  [settings.textWidth]        - The width of the description text (not the control width)
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
	 * @member module:Description
	 * @instance
	 * @param {String} [value]
	 * @returns {String|this}
	 */
	value: methodString({
		set(value) {
			this.contentContainer.element.innerHTML = value;
		}
	}),

	/**
	 * @method textWidth
	 * @member module:Description
	 * @instance
	 * @param {String} [newTextWidth]
	 * @returns {String|this}
	 */
	textWidth: methodString({
		init: AUTO,
		set(newValue) {
			this.contentContainer.css(WIDTH, newValue);
		}
	}),

	/**
	 * @method align
	 * @member module:Description
	 * @instance
	 * @param {String} [newAlign] - Applys directly to the css property text-align.
	 * @returns {String|this}
	 */
	align: methodString({
		init: LEFT,
		set(newValue) {
			this.contentContainer.css(TEXT_ALIGN, newValue);
		}
	}),

	/**
	 * @method isColumns
	 * @member module:Description
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
	 * @member module:Description
	 * @instance
	 * @returns {Boolean} - Always returns false.
	 */
	isFocused() {
		return false;
	}
});
