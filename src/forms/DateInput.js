import {
	format as formatDate,
	getHours,
	getMinutes,
	getSeconds,
	isValid,
	parse,
	setHours,
	setMinutes,
	setSeconds
} from 'date-fns';
import { applySettings, AUTO, DockPoint, enforceDate, methodBoolean, methodDate, methodString } from 'type-enforcer-ui';
import controlTypes from '../controlTypes.js';
import Calendar from '../display/Calendar.js';
import Button from '../elements/Button.js';
import TextInput from '../forms/TextInput.js';
import { CALENDAR_ICON } from '../icons.js';
import Popup from '../layout/Popup.js';
import assign from '../utility/assign.js';
import locale from '../utility/locale.js';
import setDefaults from '../utility/setDefaults.js';
import FormControl from './FormControl.js';

const CALENDAR_WIDTH = '14rem';
const CALENDAR_HEIGHT = '12.25rem';

const buildDatePicker = Symbol();
const onDateInputChange = Symbol();

const DATE_INPUT = Symbol();
const NOW_BUTTON = Symbol();
const POPUP = Symbol();

/**
 * Display date and/or time fields with corresponding smart pickers.
 *
 * @class DateInput
 * @extends FormControl
 *
 * @param {object} settings - Accepts all control and FormControl settings plus:
 */
export default class DateInput extends FormControl {
	constructor(settings = {}) {
		super(setDefaults({
			type: controlTypes.DATE,
			width: AUTO
		}, settings, {
			FocusMixin: assign(settings.FocusMixin, {
				mainControl: new TextInput({
					width: '16ch',
					onChange(value) {
						self[onDateInputChange](value);
					},
					onFocus() {
						self[buildDatePicker]();
					},
					actionButtonIcon: CALENDAR_ICON,
					isActionButtonAutoHide: false,
					actionButtonOnClick() {
						this.isFocused(false)
							.isFocused(true);
					},
					stopPropagation: true
				}),
				hasChildren: true,
				getFocus() {
					return self[DATE_INPUT].isFocused() || (self[POPUP] && self[POPUP].isFocused()) || false;
				}
			})
		}));

		const self = this;
		self.addClass('date-input')
			.onBlur(() => {
				if (self[POPUP]) {
					self[POPUP].remove();
				}
			});

		self[DATE_INPUT] = settings.FocusMixin.mainControl;
		self[DATE_INPUT].container(self);

		applySettings(self, settings);
	}

	[buildDatePicker]() {
		const self = this;

		if (self.showDatePicker() && !self[POPUP]) {
			const selectedDate = self.value();
			const initDate = isValid(selectedDate) ? selectedDate : new Date();

			self[POPUP] = new Popup({
				anchor: self[DATE_INPUT].getInput(),
				anchorDockPoint: DockPoint.POINTS.BOTTOM_CENTER,
				popupDockPoint: DockPoint.POINTS.TOP_CENTER,
				content: [{
					control: Calendar,
					margin: '0.5rem',
					month: initDate.getMonth(),
					year: initDate.getFullYear(),
					width: CALENDAR_WIDTH,
					height: CALENDAR_HEIGHT,
					onDateSelected(value) {
						const oldValue = self.value();

						if (isValid(oldValue)) {
							value = setHours(value, getHours(oldValue));
							value = setMinutes(value, getMinutes(oldValue));
							value = setSeconds(value, getSeconds(oldValue));
						}

						self[DATE_INPUT]
							.value(formatDate(value, self.dateFormat()));

						self[onDateInputChange](value);
					},
					navButtonClass: 'icon-button',
					selectedDate,
					minDate: self.minDate(),
					maxDate: self.maxDate()
				}],
				onRemove() {
					self[POPUP] = null;
				},
				hideOnEscapeKey: true,
				showArrow: true,
				margin: '0.4rem'
			});

			self[POPUP].resize(true);
		}
	}

	[onDateInputChange](value) {
		const self = this;

		if (isValid(value) || value === '') {
			if (self[POPUP]) {
				self[POPUP].remove();
			}

			self[DATE_INPUT].isFocused(true);

			self.triggerChange();
		}
		else {
			self[DATE_INPUT].isFocused(true);
		}
	}
}

Object.assign(DateInput.prototype, {
	value(value) {
		const self = this;

		if (arguments.length !== 0) {
			value = enforceDate(value, '', true);
			self[DATE_INPUT].value(value === '' ? '' : formatDate(value, self.dateFormat()));

			return self;
		}

		const output = parse(self[DATE_INPUT].value(), self.dateFormat(), new Date());

		return isValid(output) ? output : undefined;
	},

	showNowButton: methodBoolean({
		set(showNowButton) {
			const self = this;

			if (showNowButton) {
				self[NOW_BUTTON] = new Button({
					container: self,
					label: 'Now',
					onClick() {
						self.value(new Date())
							.triggerChange();
					},
					margin: '0 0 0 1ch'
				});
			}
			else if (self[NOW_BUTTON]) {
				self[NOW_BUTTON].remove();
			}
		}
	}),

	showDatePicker: methodBoolean({
		init: true
	}),

	minDate: methodDate({
		set(minDate) {
			this.onValidate((value, isFocused) => {
				if (isFocused === false && value !== undefined && value < minDate) {
					this.error(locale.get('minDateError', {
						minDate: formatDate(minDate, this.dateFormat())
					}));

					return true;
				}

				this.error('');
			});
		}
	}),

	maxDate: methodDate({
		set(maxDate) {
			this.onValidate((value, isFocused) => {
				if (isFocused === false && value !== undefined && value > maxDate) {
					this.error(locale.get('maxDateError', {
						maxDate: formatDate(maxDate, this.dateFormat())
					}));

					return true;
				}

				this.error('');
			});
		}
	}),

	dateFormat: methodString({
		init: 'MM/dd/yyyy',
		set(format) {
			this[DATE_INPUT].width(format.length + 6 + 'ch');
		}
	})
});
