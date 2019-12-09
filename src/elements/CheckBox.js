import { applySettings, methodBoolean } from 'type-enforcer-ui';
import controlTypes from '../controlTypes';
import { INPUT_TYPE_CHECKBOX } from '../utility/domConstants';
import './CheckBox.less';
import Radio, { INPUT } from './Radio';

/**
 * A single checkbox with label.
 *
 * @class CheckBox
 * @extends Radio
 * @constructor
 *
 * @arg {Object} settings
 */
export default class CheckBox extends Radio {
	constructor(settings = {}) {
		settings.type = settings.type || controlTypes.CHECKBOX;

		super(settings);

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
