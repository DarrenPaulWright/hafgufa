import { applySettings, methodBoolean } from 'type-enforcer-ui';
import controlTypes from '../controlTypes.js';
import { INPUT_TYPE_CHECKBOX } from '../utility/domConstants.js';
import setDefaults from '../utility/setDefaults.js';
import './CheckBox.less';
import Radio, { INPUT } from './Radio.js';

/**
 * A single checkbox with label.
 *
 * @class CheckBox
 * @extends Radio
 * @class
 *
 * @param {object} settings
 */
export default class CheckBox extends Radio {
	constructor(settings = {}) {
		super(setDefaults({
			type: controlTypes.CHECKBOX
		}, settings));

		if (this.type === controlTypes.CHECKBOX) {
			this.addClass('checkbox');
			this[INPUT].inputType(INPUT_TYPE_CHECKBOX);
			applySettings(this, settings);
		}
	}
}

Object.assign(CheckBox.prototype, {
	isIndeterminate: methodBoolean({
		set(isIndeterminate) {
			this[INPUT].element.indeterminate = isIndeterminate;
			this.classes('indeterminate', isIndeterminate);

			if (isIndeterminate) {
				this.isChecked(false);
			}
		}
	})
});
