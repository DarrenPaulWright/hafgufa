import { applySettings, AUTO, methodBoolean, methodString } from 'type-enforcer-ui';
import controlTypes from '../controlTypes';
import { LEFT, TEXT_ALIGN, WIDTH } from '../utility/domConstants';
import './Description.less';
import FormControl from './FormControl';

const COLUMNS_CLASS = 'columns';

/**
 * Display a description or other text. This control doesn't accept user input.
 *
 * @class Description
 * @extends FormControl
 * @constructor
 *
 * @arg {Object}  settings                    - Accepts all control and FormControl settings plus:
 * @arg {String}  [settings.description]      - The default description to display
 * @arg {Number}  [settings.textWidth]        - The width of the description text (not the control width)
 */
export default class Description extends FormControl {
	constructor(settings = {}) {
		settings.type = settings.type || controlTypes.DESCRIPTION;
		super(settings);

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
	 * @arg {String} [value]
	 * @returns {String|this}
	 */
	value: methodString({
		set(value) {
			this.contentContainer.element().innerHTML = value;
		}
	}),

	/**
	 * @method textWidth
	 * @member module:Description
	 * @instance
	 * @arg {String} [newTextWidth]
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
	 * @arg {String} [newAlign] - Applys directly to the css property text-align.
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
	 * @arg {boolean} [isColumns]
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
