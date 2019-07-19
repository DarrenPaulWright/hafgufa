import { defer } from 'async-agent';
import moment from 'moment';
import { AUTO, DockPoint, enforce, method } from 'type-enforcer';
import Popup from '../../ui/layout/Popup';
import objectHelper from '../../utility/objectHelper';
import controlTypes from '../controlTypes';
import Calendar from '../display/Calendar';
import Button from '../elements/Button';
import TextInput from '../forms/TextInput';
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
		settings.width = enforce.cssSize(settings.width, AUTO, true);

		super(settings);

		const self = this;
		self[IS_FOCUSED] = false;
		self.addClass('date-input');

		self[DATE_INPUT] = new TextInput({
			container: self,
			width: '6rem',
			onChange: () => self[onDateInputChange],
			onFocus: () => {
				self[IS_FOCUSED] = true;

				self[buildDatePicker]();

				if (settings.onFocus) {
					settings.onFocus(self);
				}
			},
			onBlur: () => {
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

		objectHelper.applySettings(self, settings);

		self.onRemove(() => {
			self[DATE_INPUT].remove();

			if (self[NOW_BUTTON]) {
				self[NOW_BUTTON].remove();
			}
		});
	}

	[buildDatePicker]() {
		const self = this;

		if (self.showDatePicker() && !self[POPUP]) {
			let newDate = moment(self[DATE_INPUT].value(), DATE_FORMAT, true);
			const isSelected = newDate.isValid();

			if (!isSelected) {
				newDate = moment();
			}

			self[POPUP] = new Popup({
				classes: 'date-input-popup',
				anchor: self[DATE_INPUT].element(),
				anchorDockPoint: DockPoint.POINTS.BOTTOM_CENTER,
				popupDockPoint: DockPoint.POINTS.TOP_CENTER,
				content: [{
					control: Calendar,
					month: newDate.month(),
					year: newDate.year(),
					width: CALENDAR_WIDTH,
					height: CALENDAR_HEIGHT,
					onDateSelected: function(newValue) {
						self[DATE_INPUT].value(newValue.format(DATE_FORMAT));
						self[POPUP].remove();
					},
					navButtonClass: 'icon-button',
					selectedDate: isSelected ? moment(newDate) : undefined
				}],
				onRemove: () => {
					self[POPUP] = null;
				},
				hideOnEscapeKey: true
			});
		}
	}

	[onDateInputChange](newValue) {
		const self = this;
		const newDate = moment(newValue.value, DATE_FORMAT, true);

		if (newDate.isValid() || newValue.value === '') {
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
	value: function(newValue) {
		const self = this;

		if (arguments.length) {
			newValue = moment(newValue);
			self[DATE_INPUT].value(newValue.isValid() ? newValue.format(DATE_FORMAT) : '');

			return self;
		}

		const value = moment(self[DATE_INPUT].value(), DATE_FORMAT, true);

		return {
			date: value.toDate(),
			text: value.isValid() ? value.format(DATE_FORMAT) : ''
		};
	},

	focus: () => {
		this[DATE_INPUT].isFocused(true);
	},

	showNowButton: method.boolean({
		set: function(showNowButton) {
			const self = this;

			if (showNowButton) {
				self[NOW_BUTTON] = new Button({
					container: self,
					label: 'Now',
					onClick: () => {
						self.value(moment().toISOString())
							.triggerChange();
					}
				});
			}
			else if (self[NOW_BUTTON]) {
				self[NOW_BUTTON].remove();
			}
		}
	}),

	showDatePicker: method.boolean({
		init: true
	}),

	isFocused: (isFocused) => {
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
