import { applySettings, methodBoolean, methodQueue, methodString } from 'type-enforcer-ui';
import controlTypes from '../controlTypes.js';
import FocusMixin from '../mixins/FocusMixin.js';
import assign from '../utility/assign.js';
import { CLICK_EVENT, INPUT_TYPE_RADIO } from '../utility/domConstants.js';
import setDefaults from '../utility/setDefaults.js';
import Div from './Div.js';
import Input from './Input.js';
import Label from './Label.js';
import './Radio.less';

export const INPUT = Symbol();
const CONTAINER = Symbol();

/**
 * A single radio button with label.
 *
 * @class Radio
 * @mixes FocusMixin
 * @extends Label
 *
 * @param {object} settings
 */
export default class Radio extends FocusMixin(Label) {
	constructor(settings = {}) {
		super(setDefaults({
			type: controlTypes.RADIO
		}, settings, {
			FocusMixin: assign(settings.FocusMixin, {
				mainControl: new Input()
			})
		}));

		const self = this;

		self[INPUT] = settings.FocusMixin.mainControl
			.container(self)
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
		if (arguments.length !== 0) {
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
	name: methodString({
		set(name) {
			this[INPUT].attr('name', name);
		}
	}),
	value: methodString({
		set(value) {
			this[INPUT].attr('value', value);
		}
	}),
	isChecked: methodBoolean({
		set(isChecked) {
			const self = this;

			self[INPUT].element.checked = isChecked;
			self.classes('checked', isChecked);

			if (self.isIndeterminate && isChecked) {
				self.isIndeterminate(false);
			}
		}
	}),
	onChange: methodQueue()
});
