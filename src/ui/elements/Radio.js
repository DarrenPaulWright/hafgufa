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
				self.isChecked(!self.isChecked());
			});

		if (settings.type === controlTypes.RADIO) {
			self.addClass('radio');
			this[INPUT].inputType(INPUT_TYPE_RADIO);
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
			this[INPUT].element().checked = isChecked;
			this.classes('checked', isChecked);

			if (this.onChange()) {
				this.onChange().call(this, isChecked);
			}

			if (this.isIndeterminate && isChecked) {
				this.isIndeterminate(false);
			}
		}
	}),
	onChange: method.function()
});
