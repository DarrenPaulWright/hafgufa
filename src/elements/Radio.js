import { applySettings, method } from 'type-enforcer-ui';
import controlTypes from '../controlTypes';
import { CLICK_EVENT, INPUT_TYPE_RADIO } from '../utility/domConstants';
import Div from './Div';
import Input from './Input';
import Label from './Label';
import './Radio.less';

export const INPUT = Symbol();
const CONTAINER = Symbol();

/**
 * A single radio button with label.
 *
 * @class Radio
 * @extends Label
 * @constructor
 *
 * @arg {Object} settings
 */
export default class Radio extends Label {
	constructor(settings = {}) {
		settings.type = settings.type || controlTypes.RADIO;

		super(settings);

		const self = this;

		self[INPUT] = new Input({
			container: self
		})
			.on(CLICK_EVENT, (event) => {
				event.stopPropagation();
				const isChecked = !self.isChecked();

				self.isChecked(isChecked);
				self.onChange().trigger(null, [isChecked, event]);
			});

		if (self.type === controlTypes.RADIO) {
			self.addClass('radio');
			self[INPUT].inputType(INPUT_TYPE_RADIO);
			applySettings(self, settings);
		}
	}

	content(content) {
		if (arguments.length) {
			if (!this[CONTAINER]) {
				this[CONTAINER] = new Div({
					container: this
				});
			}
			this[CONTAINER].content(content);
		}

		return this;
	}
}

Object.assign(Radio.prototype, {
	name: method.string({
		set(name) {
			this[INPUT].attr('name', name);
		}
	}),
	value: method.string({
		set(value) {
			this[INPUT].attr('value', value);
		}
	}),
	isChecked: method.boolean({
		set(isChecked) {
			const self = this;

			self[INPUT].element().checked = isChecked;
			self.classes('checked', isChecked);

			if (self.isIndeterminate && isChecked) {
				self.isIndeterminate(false);
			}
		}
	}),
	onChange: method.queue()
});
