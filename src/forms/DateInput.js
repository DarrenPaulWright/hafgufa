import { defer } from 'async-agent';
import moment from 'moment';
import { applySettings, AUTO, DockPoint, enforceCssSize, enforceDate, methodBoolean } from 'type-enforcer-ui';
import controlTypes from '../controlTypes';
import Calendar from '../display/Calendar';
import Button from '../elements/Button';
import TextInput from '../forms/TextInput';
import Popup from '../layout/Popup';
import FormControl from './FormControl';

const CALENDAR_WIDTH = '14rem';
const CALENDAR_HEIGHT = '12.25rem';
const DATE_FORMAT = 'MM/DD/YYYY';

const buildDatePicker = Symbol();
const onDateInputChange = Symbol();

const DATE_INPUT = Symbol();
const NOW_BUTTON = Symbol();
const IS_FOCUSED = Symbol();
const POPUP = Symbol();

/**
 * Display date and/or time fields with corresponding smart pickers.
 * @module DateInput
 * @extends FormControl
 * @constructor
 *
 * @arg {Object} settings - Accepts all control and FormControl settings plus:
 */
export default class DateInput extends FormControl {
	constructor(settings = {}) {
		settings.type = settings.type || controlTypes.DATE;
		settings.width = enforceCssSize(settings.width, AUTO, true);

		super(settings);

		const self = this;
		self[IS_FOCUSED] = false;
		self.addClass('date-input');

		self[DATE_INPUT] = new TextInput({
			container: self,
			width: '7.4rem',
			onChange(value) {
				self[onDateInputChange](value);
			},
			onFocus() {
				self[IS_FOCUSED] = true;

				self[buildDatePicker]();

				if (settings.onFocus) {
					settings.onFocus(self);
				}
			},
			onBlur() {
				self[IS_FOCUSED] = false;

				if (settings.onBlur) {
					defer(() => {
						if (!self[IS_FOCUSED]) {
							settings.onBlur(self);
						}
					});
				}
			},
			stopPropagation: true
		});

		applySettings(self, settings);
	}

	[buildDatePicker]() {
		const self = this;

		if (self.showDatePicker() && !self[POPUP]) {
			let newDate = moment(self.value());
			const isSelected = newDate.isValid();

			if (!isSelected) {
				newDate = moment();
			}

			self[POPUP] = new Popup({
				anchor: self[DATE_INPUT].getInput().element,
				anchorDockPoint: DockPoint.POINTS.BOTTOM_CENTER,
				popupDockPoint: DockPoint.POINTS.TOP_CENTER,
				content: [{
					control: Calendar,
					margin: '0.25rem',
					month: newDate.month(),
					year: newDate.year(),
					width: CALENDAR_WIDTH,
					height: CALENDAR_HEIGHT,
					onDateSelected(value) {
						self[DATE_INPUT].value(value.format(DATE_FORMAT));
						self[onDateInputChange](value);
					},
					navButtonClass: 'icon-button',
					selectedDate: newDate.toDate()
				}],
				onRemove() {
					self[POPUP] = null;
				},
				hideOnEscapeKey: true
			});
		}
	}

	[onDateInputChange](value) {
		const self = this;
		const newDate = moment(new Date(value));

		if (newDate.isValid() || value === '') {
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
	value(newValue) {
		const self = this;

		if (arguments.length) {
			newValue = enforceDate(newValue, '', true);
			self[DATE_INPUT].value(moment(newValue).format(DATE_FORMAT));

			return self;
		}

		return new Date(self[DATE_INPUT].value());
	},

	focus() {
		this[DATE_INPUT].isFocused(true);
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
					}
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

	isFocused(isFocused) {
		const self = this;

		if (self) {
			if (isFocused !== undefined) {
				self[DATE_INPUT].isFocused(isFocused);

				return self;
			}

			return self[IS_FOCUSED];
		}
	}
});
