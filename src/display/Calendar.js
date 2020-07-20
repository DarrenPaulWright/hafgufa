import {
	addDays,
	format as formatDate,
	isSameDay,
	isWeekend,
	setDay,
	setMonth,
	setYear,
	startOfMonth,
	startOfWeek
} from 'date-fns';
import { fill, repeat } from 'object-agent';
import { applySettings } from 'type-enforcer';
import { AUTO, methodDate, methodFunction, methodInteger, methodString } from 'type-enforcer-ui';
import Control from '../Control.js';
import controlTypes from '../controlTypes.js';
import Button from '../elements/Button.js';
import Div from '../elements/Div.js';
import Heading, { HEADING_LEVELS } from '../elements/Heading.js';
import Picker from '../forms/Picker.js';
import { NEXT_ICON, PREVIOUS_ICON } from '../icons.js';
import setDefaults from '../utility/setDefaults.js';
import './Calendar.less';

const DAYS_IN_A_WEEK = 7;
const WEEKS_IN_A_MONTH = 6;
const MONTHS_IN_A_YEAR = 12;
const DAY_CLASS = 'day-button';
const WEEKEND_CLASS = ' weekend';
const TODAY_CLASS = ' today';
const DIFFERENT_MONTH_CLASS = ' different-month';
const PREV_BUTTON_ID = 'prev-month';
const NEXT_BUTTON_ID = 'next-month';
const MONTH_PICKER_ID = ' monthPicker';
const YEAR_PICKER_ID = ' yearPicker';

const gotoPreviousMonth = Symbol();
const gotoNextMonth = Symbol();
const buildMonthOptions = Symbol();
const buildYearOptions = Symbol();
const buildHeader = Symbol();
const updateHeader = Symbol();
const buildWeekDays = Symbol();
const onClickDay = Symbol();
const buildDays = Symbol();
const updateRange = Symbol();
const range = Symbol();

const HEADER = Symbol();
const WEEKDAYS = Symbol();
const DAYS = Symbol();

/**
 * Display a calendar layout of a month.
 *
 * @module Calendar
 * @extends Control
 * @class
 *
 * @param {object} settings - Accepts all control settings plus:
 */
export default class Calendar extends Control {
	constructor(settings = {}) {
		super(setDefaults({
			type: controlTypes.CALENDAR
		}, settings));

		const self = this;
		self.addClass('calendar');

		self[range] = {};

		self[buildHeader]();
		self[buildWeekDays]();

		self.onResize((width, height) => {
			const dayWidth = Math.floor(width / DAYS_IN_A_WEEK);
			const dayHeight = Math.floor((height - self[HEADER].borderHeight() - self[WEEKDAYS][0].borderHeight()) / WEEKS_IN_A_MONTH);

			self[WEEKDAYS].forEach((weekday) => {
				weekday.width(dayWidth);
			});

			if (self[DAYS] !== undefined) {
				self[DAYS].forEach((button) => {
					button.width(dayWidth)
						.height(dayHeight);
				});
			}
		});

		applySettings(self, settings, ['onResize', 'minDate', 'maxDate']);

		if (self[DAYS] === undefined) {
			self[buildDays]();
		}
	}

	/**
	 * Sets the month to the previous month. Wraps to the previous year if appropriate.
	 *
	 * @function gotoPreviousMonth
	 */
	[gotoPreviousMonth]() {
		const self = this;

		if (self.month() > 0) {
			self.month(self.month() - 1);
		}
		else {
			self.month(11);
			self.year(self.year() - 1);
		}
	}

	/**
	 * Sets the month to the next month. Wraps to the next year if appropriate.
	 *
	 * @function gotoNextMonth
	 */
	[gotoNextMonth]() {
		const self = this;

		if (self.month() < 11) {
			self.month(self.month() + 1);
		}
		else {
			self.month(0);
			self.year(self.year() + 1);
		}
	}

	/**
	 * Builds picker options for the month picker formatted according to the monthFormat option
	 *
	 * @function buildMonthOptions
	 */
	[buildMonthOptions]() {
		const self = this;

		if (self[HEADER] !== undefined) {
			const year = self.year();
			const data = new Date();
			const format = self.monthFormat();

			self[HEADER].get(MONTH_PICKER_ID)
				.options([])
				.options(fill(MONTHS_IN_A_YEAR, (month) => ({
					id: month.toString(),
					title: formatDate(data.setMonth(month), format),
					isEnabled: (
						self[range].minYear === undefined ||
						self[range].minYear < year ||
						self[range].minMonth <= month
					) && (
						self[range].maxYear === undefined ||
						self[range].maxYear > year ||
						self[range].maxMonth >= month
					)
				})))
				.value(self.month());
		}
	}

	/**
	 * Builds picker options for the year picker based on the current year range options
	 *
	 * @function buildYearOptions
	 */
	[buildYearOptions]() {
		const self = this;

		if (self[HEADER]) {
			const year = self.year();
			let yearRangePast = self.yearRangePast();
			let yearRangeFuture = self.yearRangeFuture();

			if (self[range].minYear !== undefined) {
				yearRangePast = year - self[range].minYear;
			}

			if (self[range].maxYear !== undefined) {
				yearRangeFuture = self[range].maxYear - year;
			}

			self[HEADER].get(YEAR_PICKER_ID)
				.options(fill(yearRangePast + yearRangeFuture + 1, (yearOffset) => {
					const year = (self.year() + (yearRangeFuture - yearOffset)).toString();
					return {
						id: year,
						title: year
					};
				}))
				.value(self.year());
		}
	}

	/**
	 * Builds the header controls (month pickers and year picker)
	 *
	 * @function buildHeader
	 */
	[buildHeader]() {
		const self = this;

		if (!self[HEADER]) {
			self[HEADER] = new Div({
				container: self,
				classes: 'calendar-header',
				content: [{
					control: Button,
					id: PREV_BUTTON_ID,
					icon: PREVIOUS_ICON,
					onClick() {
						self[gotoPreviousMonth]();
					},
					classes: 'icon-button prev-button'
				}, {
					control: Button,
					id: NEXT_BUTTON_ID,
					icon: NEXT_ICON,
					onClick() {
						self[gotoNextMonth]();
					},
					classes: 'icon-button next-button'
				}, {
					control: Picker,
					id: MONTH_PICKER_ID,
					width: AUTO,
					onChange(newValue) {
						if (newValue.length !== 0) {
							self.month(parseInt(newValue[0].id, 10));
						}
						self.isFocused(true);
					},
					value: self.month()
				}, {
					control: Picker,
					id: YEAR_PICKER_ID,
					width: AUTO,
					onChange(newValue) {
						if (newValue.length !== 0) {
							self.year(parseInt(newValue[0].id, 10));
						}
						self.isFocused(true);
					},
					value: self.year()
				}]
			});
		}

		self[updateHeader]();
	}

	[updateHeader]() {
		const self = this;

		if (self[HEADER]) {
			const year = self.year();
			const month = self.month();

			self[buildMonthOptions]();
			self[buildYearOptions]();

			self[HEADER].get(PREV_BUTTON_ID)
				.isEnabled(self[range].minYear === undefined ||
					self[range].minYear < year ||
					self[range].minMonth < month);
			self[HEADER].get(NEXT_BUTTON_ID)
				.isEnabled(self[range].maxYear === undefined ||
					self[range].maxYear > year ||
					self[range].maxMonth > month);
		}
	}

	[updateRange]() {
		const self = this;
		const minDate = self.minDate();
		const maxDate = self.maxDate();

		self[range] = {
			minDate,
			maxDate,
			minMonth: minDate === undefined ? 0 : minDate.getMonth(),
			maxMonth: maxDate === undefined ? 11 : maxDate.getMonth()
		};

		if (minDate !== undefined) {
			self[range].minYear = minDate.getFullYear();
		}

		if (maxDate !== undefined) {
			self[range].maxYear = maxDate.getFullYear();
		}

		self[updateHeader]();
	}

	/**
	 * Builds the weekday display (Sun, Mon, Tue...)
	 *
	 * @function buildWeekDays
	 */
	[buildWeekDays]() {
		const self = this;
		const newFormat = self.weekdayFormat();
		const date = new Date();

		if (self[WEEKDAYS] === undefined) {
			self[WEEKDAYS] = fill(DAYS_IN_A_WEEK, () => {
				return new Heading({
					container: self,
					level: HEADING_LEVELS.FIVE
				});
			});
		}

		self[WEEKDAYS].forEach((control, dayIndex) => {
			control.title(formatDate(setDay(date, dayIndex), newFormat));
		});
	}

	/**
	 * The callback function when a day button gets clicked. Sets the selected date and updates the appropriate UI.
	 *
	 * @function onClickDay
	 * @param {Button} button
	 */
	[onClickDay](button) {
		const self = this;
		const newDate = button.value();

		self.selectedDate(newDate);

		if (self.month() !== newDate.getMonth()) {
			self.month(newDate.getMonth())
				.year(newDate.getFullYear());
		}

		if (self.onDateSelected()) {
			self.onDateSelected()(newDate);
		}
	}

	/**
	 * Builds all the buttons for the days.
	 *
	 * @function buildDays
	 */
	[buildDays]() {
		const self = this;
		const isFirstRun = self[DAYS] === undefined;
		const selectedDate = self.selectedDate();
		const todayDate = new Date();
		let currentDay = new Date();
		let classes = '';

		currentDay = setMonth(currentDay, self.month());
		currentDay = setYear(currentDay, self.year());
		currentDay = startOfWeek(startOfMonth(currentDay));

		if (self[DAYS] === undefined) {
			self[DAYS] = fill(WEEKS_IN_A_MONTH * DAYS_IN_A_WEEK, () => {
				return new Button({
					container: self,
					classes: DAY_CLASS,
					isSelectable: true,
					onClick() {
						self[onClickDay](this);
					}
				});
			});
		}

		repeat(WEEKS_IN_A_MONTH * DAYS_IN_A_WEEK, (dayIndex) => {
			classes = '';

			if (isFirstRun && isWeekend(currentDay)) {
				classes += WEEKEND_CLASS;
			}
			if (isSameDay(currentDay, todayDate)) {
				classes += TODAY_CLASS;
			}
			if (currentDay.getMonth() !== self.month()) {
				classes += DIFFERENT_MONTH_CLASS;
			}

			self[DAYS][dayIndex]
				.classes(TODAY_CLASS + DIFFERENT_MONTH_CLASS, false)
				.classes(classes)
				.isSelected(selectedDate !== undefined && isSameDay(currentDay, selectedDate))
				.label(currentDay.getDate() + '')
				.value(new Date(currentDay))
				.isEnabled((self[range].minDate === undefined || self[range].minDate <= currentDay) &&
					(self[range].maxDate === undefined || self[range].maxDate >= currentDay));

			currentDay = addDays(currentDay, 1);
		});

		if (isFirstRun) {
			self.resize();
		}
	}
}

Object.assign(Calendar.prototype, {
	/*
	 * Get or Set the currently displayed month
	 * @method month
	 * @member module:Calendar
	 * @instance
	 * @param {Int} newMonth - Accepts 0 to 11
	 * @returns {Int|this}
	 */
	month: methodInteger({
		init: new Date().getMonth(),
		set() {
			this[buildDays]();
			this[updateHeader]();
		},
		min: 0,
		max: 11
	}),

	/*
	 * Get or Set the currently displayed year
	 * @method year
	 * @member module:Calendar
	 * @instance
	 * @param {Int} newYear
	 * @returns {Int|this}
	 */
	year: methodInteger({
		init: new Date().getFullYear(),
		set() {
			this[buildDays]();
			this[updateHeader]();
		}
	}),

	/*
	 * Get or Set a callback that gets executed when the user clicks on a day button
	 * @method onDateSelected
	 * @member module:Calendar
	 * @instance
	 * @param {Function} newOnDateSelected
	 * @returns {Function|this}
	 */
	onDateSelected: methodFunction({
		other: undefined
	}),

	/*
	 * Get or Set the currently selected date.
	 * @method selectedDate
	 * @member module:Calendar
	 * @instance
	 * @param {Date} newSelectedDate
	 * @returns {Date|this}
	 */
	selectedDate: methodDate({
		set: buildDays,
		other: undefined
	}),

	/*
	 * The format string for weekdays
	 *
	 * @method weekdayFormat
	 * @member module:Calendar
	 * @instance
	 *
	 * @param {String} newWeekdayFormat - Default is 'EEE'
	 *
	 * @returns {String|this}
	 */
	weekdayFormat: methodString({
		init: 'EEE',
		set() {
			this[buildWeekDays]();
			this.resize();
		}
	}),

	/*
	 * The format string for months
	 * @method monthFormat
	 * @member module:Calendar
	 * @instance
	 * @param {String} newMonthFormat - Default is 'MMM'
	 * @returns {String|this}
	 */
	monthFormat: methodString({
		init: 'MMM',
		set: buildMonthOptions
	}),

	/*
	 * Get or Set the number of past years to display in the year picker
	 * @method yearRangePast
	 * @member module:Calendar
	 * @instance
	 * @param {Int} newYearRangePast - Minimum value is 0
	 * @returns {Int|this}
	 */
	yearRangePast: methodInteger({
		init: 100,
		set: buildYearOptions,
		min: 0
	}),

	/*
	 * Get or Set the number of future years to display in the year picker
	 * @method yearRangeFuture
	 * @member module:Calendar
	 * @instance
	 * @param {Int} newYearRangeFuture - Minimum value is 0
	 * @returns {Int|this}
	 */
	yearRangeFuture: methodInteger({
		init: 10,
		set: buildYearOptions,
		min: 0
	}),

	minDate: methodDate({
		set: updateRange
	}),

	maxDate: methodDate({
		set: updateRange
	})
});
