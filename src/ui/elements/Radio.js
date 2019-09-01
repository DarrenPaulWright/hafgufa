import { event } from 'd3';
import { applySettings, method } from 'type-enforcer';
import { CLICK_EVENT, INPUT_TYPE_RADIO } from '../../utility/domConstants';
import controlTypes from '../controlTypes';
import Container from '../layout/Container';
import Input from './Input';
import Label from './Label';
import './Radio.less';

export const INPUT = Symbol();
const CONTAINER = Symbol();
const IS_MANUAL = Symbol();

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
			.on(CLICK_EVENT, () => {
				event.stopPropagation();
				self[IS_MANUAL] = true;
				self.isChecked(!self.isChecked());
			});

		if (settings.type === controlTypes.RADIO) {
			self.addClass('radio');
			self[INPUT].inputType(INPUT_TYPE_RADIO);
			applySettings(self, settings);
		}

		self.onRemove(() => {
			self[INPUT].remove();
			self[INPUT] = null;

			if (self[CONTAINER]) {
				self[CONTAINER].remove();
				self[CONTAINER] = null;
			}
		});
	}

	content(content) {
		if (arguments.length) {
			if (!this[CONTAINER]) {
				this[CONTAINER] = new Container({
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

			if (self[IS_MANUAL] && self.onChange()) {
				self[IS_MANUAL] = false;
				self.onChange().call(self, isChecked);
			}

			if (self.isIndeterminate && isChecked) {
				self.isIndeterminate(false);
			}
		}
	}),
	onChange: method.function()
});
