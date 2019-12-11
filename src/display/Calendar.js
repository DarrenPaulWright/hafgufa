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
import { applySettings, AUTO, methodDate, methodFunction, methodInteger, methodString } from 'type-enforcer-ui';
import Control from '../Control';
import controlTypes from '../controlTypes';
import Button from '../elements/Button';
import Div from '../elements/Div';
import Heading, { HEADING_LEVELS } from '../elements/Heading';
import Picker from '../forms/Picker';
import { NEXT_ICON, PREVIOUS_ICON } from '../icons';
import './Calendar.less';

const DAYS_IN_A_WEEK = 7;
const WEEKS_IN_A_MONTH = 6;
const MONTHS_IN_A_YEAR = 12;
const DAY_CLASS = 'day-button';
const WEEKEND_CLASS = ' weekend';
const TODAY_CLASS = ' today';
const DIFFERENT_MONTH_CLASS = ' different-month';
const MONTH_PICKER_ID = ' monthPicker';
const YEAR_PICKER_ID = ' yearPicker';

const gotoPreviousMonth = Symbol();
const gotoNextMonth = Symbol();
const buildMonthOptions = Symbol();
const buildYearOptions = Symbol();
const buildHeader = Symbol();
const buildWeekDays = Symbol();
const onClickDay = Symbol();
const buildDays = Symbol();

const HEADER = Symbol();
const WEEKDAYS = Symbol();
const DAYS = Symbol();

/**
 * Display a calendar layout of a month.
 * @module Calendar
 * @extends Control
 * @constructor
 *
 * @arg {Object} settings - Accepts all control settings plus:
 */
export default class Calendar extends Control {
	constructor(settings = {}) {
		settings.type = settings.type || controlTypes.CALENDAR;

		super(settings);

		const self = this;
		self.addClass('calendar');

		self[buildHeader]();
		self[buildWeekDays]();

		applySettings(self, settings);

		if (self[DAYS] === undefined) {
			self[buildDays]();
		}

		self.onResize((width, height) => {
			const dayWidth = Math.floor(width / DAYS_IN_A_WEEK);
			const dayHeight = Math.floor((height - self[HEADER].borderHeight() - self[WEEKDAYS][0].borderHeight()) / WEEKS_IN_A_MONTH);

			self[WEEKDAYS].forEach((weekday) => {
				weekday.width(dayWidth);
			});
			self[DAYS].forEach((button) => {
				button.width(dayWidth)
					.height(dayHeight);
			});
		});
	}

	/**
	 * Sets the month to the previous month. Wraps to the previous year if appropriate.
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
	 * @function buildMonthOptions
	 */
	[buildMonthOptions]() {
		const self = this;

		return fill(MONTHS_IN_A_YEAR, (month) => ({
			id: month.toString(),
			title: formatDate(new Date().setMonth(month), self.monthFormat())
		}));
	}

	/**
	 * Builds picker options for the year picker based on the current year range options
	 * @function buildYearOptions
	 */
	[buildYearOptions]() {
		const self = this;

		return fill(self.yearRangePast() + self.yearRangeFuture() + 1, (yearOffset) => {
			const year = (self.year() + (self.yearRangeFuture() - yearOffset)).toString();
			return {
				id: year,
				title: year
			};
		});
	}

	/**
	 * Builds the header controls (month pickers and year picker)
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
					icon: PREVIOUS_ICON,
					onClick() {
						self[gotoPreviousMonth]();
					},
					classes: 'icon-button prev-button'
				}, {
					control: Button,
					icon: NEXT_ICON,
					onClick() {
						self[gotoNextMonth]();
					},
					classes: 'icon-button next-button'
				}, {
					control: Picker,
					id: MONTH_PICKER_ID,
					width: AUTO,
					options: self[buildMonthOptions](),
					onChange(newValue) {
						if (newValue.length) {
							self.month(parseInt(newValue[0].id, 10));
						}
					},
					value: self.month()
				}, {
					control: Picker,
					id: YEAR_PICKER_ID,
					width: AUTO,
					options: self[buildYearOptions](),
					onChange(newValue) {
						if (newValue.length) {
							self.year(parseInt(newValue[0].id, 10));
						}
					},
					value: self.year()
				}]
			});
		}
	}

	/**
	 * Builds the weekday display (Sun, Mon, Tue...)
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
	 * @function onClickDay
	 * @arg   {Button} button
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
	 * @function buildDays
	 */
	[buildDays]() {
		const self = this;
		let classes;
		const isFirstRun = self[DAYS] === undefined;
		const selectedDate = self.selectedDate();
		const todayDate = new Date();
		let currentDay = new Date();

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
				.value(new Date(currentDay));

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
	 * @arg {Int} newMonth - Accepts 0 to 11
	 * @returns {Int|this}
	 */
	month: methodInteger({
		init: new Date().getMonth(),
		set(month) {
			const self = this;
			self[buildDays]();
			if (self[HEADER]) {
				self[HEADER].get(MONTH_PICKER_ID).value(month);
			}
		},
		min: 0,
		max: 11
	}),

	/*
	 * Get or Set the currently displayed year
	 * @method year
	 * @member module:Calendar
	 * @instance
	 * @arg {Int} newYear
	 * @returns {Int|this}
	 */
	year: methodInteger({
		init: new Date().getFullYear(),
		set(year) {
			const self = this;
			self[buildDays]();
			if (self[HEADER]) {
				self[HEADER].get(YEAR_PICKER_ID)
					.options(self[buildYearOptions]())
					.value(year);
			}
		}
	}),

	/*
	 * Get or Set a callback that gets executed when the user clicks on a day button
	 * @method onDateSelected
	 * @member module:Calendar
	 * @instance
	 * @arg {Function} newOnDateSelected
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
	 * @arg {Date} newSelectedDate
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
	 * @arg {String} newWeekdayFormat - Default is 'EEE'
	 *
	 * @returns {String|this}
	 */
	weekdayFormat: methodString({
		init: 'EEE',
		set() {
			const self = this;
			self[buildWeekDays]();
			self.resize();
		}
	}),

	/*
	 * The format string for months
	 * @method monthFormat
	 * @member module:Calendar
	 * @instance
	 * @arg {String} newMonthFormat - Default is 'MMM'
	 * @returns {String|this}
	 */
	monthFormat: methodString({
		init: 'MMM',
		set() {
			const self = this;
			if (self[HEADER]) {
				self[HEADER].get(MONTH_PICKER_ID).options([]).options(self[buildMonthOptions]());
			}
		}
	}),

	/*
	 * Get or Set the number of past years to display in the year picker
	 * @method yearRangePast
	 * @member module:Calendar
	 * @instance
	 * @arg {Int} newYearRangePast - Minimum value is 0
	 * @returns {Int|this}
	 */
	yearRangePast: methodInteger({
		init: 100,
		set() {
			const self = this;
			if (self[HEADER]) {
				self[HEADER].get(YEAR_PICKER_ID)
					.options(self[buildYearOptions]());
			}
		},
		min: 0
	}),

	/*
	 * Get or Set the number of future years to display in the year picker
	 * @method yearRangeFuture
	 * @member module:Calendar
	 * @instance
	 * @arg {Int} newYearRangeFuture - Minimum value is 0
	 * @returns {Int|this}
	 */
	yearRangeFuture: methodInteger({
		init: 10,
		set() {
			const self = this;
			if (self[HEADER]) {
				self[HEADER].get(YEAR_PICKER_ID)
					.options(self[buildYearOptions]());
			}
		},
		min: 0
	})
});
