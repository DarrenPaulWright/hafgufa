import Moment from 'moment';
import { repeat } from 'object-agent';
import { applySettings, AUTO, method } from 'type-enforcer';
import Control from '../Control';
import ControlRecycler from '../ControlRecycler';
import controlTypes from '../controlTypes';
import Button from '../elements/Button';
import Div from '../elements/Div';
import Heading, { HEADING_LEVELS } from '../elements/Heading';
import Picker from '../forms/Picker';
import { NEXT_ICON, PREVIOUS_ICON } from '../icons';
import Container from '../layout/Container';
import './Calendar.less';

const DAYS_IN_A_WEEK = 7;
const WEEKS_IN_A_MONTH = 6;
const MONTHS_IN_A_YEAR = 12;
const MOMENTJS_DAY_LABEL = 'D';
const MOMENTJS_DAY = 'day';
const MOMENTJS_WEEK = 'week';
const MOMENTJS_MONTH = 'month';
const DAY_CLASS = 'day-button';
const WEEKDAYS_CLASS = 'weekdays';
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
const WEEKDAY_RECYCLER = Symbol();
const DAY_RECYCLER = Symbol();
const WEEKDAY_CONTAINER = Symbol();

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

		if (!self[DAY_RECYCLER]) {
			self[buildDays]();
		}

		self.onResize((width, height) => {
			const dayWidth = Math.floor(width / DAYS_IN_A_WEEK);
			const dayHeight = Math.floor((height - self[HEADER].borderHeight() - self[WEEKDAY_CONTAINER].borderHeight()) / WEEKS_IN_A_MONTH);

			self[WEEKDAY_RECYCLER].each((weekday) => {
				weekday.width(dayWidth);
			});
			self[DAY_RECYCLER].each((button) => {
				button.width(dayWidth);
				button.height(dayHeight);
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

		return Array.from({length: MONTHS_IN_A_YEAR}, (x, month) => ({
			id: month.toString(),
			title: new Moment().month(parseInt(month, 10)).format(self.monthFormat())
		}));
	}

	/**
	 * Builds picker options for the year picker based on the current year range options
	 * @function buildYearOptions
	 */
	[buildYearOptions]() {
		const self = this;

		return Array.from({length: (self.yearRangePast() + self.yearRangeFuture() + 1)}, (x, yearOffset) => {
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
			self[HEADER] = new Container({
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
		const date = new Moment();

		if (!self[WEEKDAY_CONTAINER]) {
			self[WEEKDAY_CONTAINER] = new Div({
				container: self,
				classes: WEEKDAYS_CLASS
			});

			self[WEEKDAY_RECYCLER] = new ControlRecycler()
				.control(Heading)
				.defaultSettings({
					container: self[WEEKDAY_CONTAINER],
					level: HEADING_LEVELS.FIVE
				});
		}

		repeat(DAYS_IN_A_WEEK, (dayIndex) => {
			self[WEEKDAY_RECYCLER]
				.getControlAtOffset(dayIndex, true)
				.title(date.day(dayIndex).format(newFormat));
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

		if (self.month() !== newDate.month()) {
			self.month(newDate.month())
				.year(newDate.year());
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
		const isFirstRun = !self[DAY_RECYCLER];
		const todayDate = new Moment();
		const currentDay = new Moment()
			.month(self.month())
			.year(self.year())
			.startOf(MOMENTJS_MONTH)
			.startOf(MOMENTJS_WEEK);

		if (!self[DAY_RECYCLER]) {
			self[DAY_RECYCLER] = new ControlRecycler()
				.control(Button)
				.defaultSettings({
					container: self,
					classes: DAY_CLASS,
					isSelectable: true,
					onClick(button) {
						self[onClickDay](button);
					}
				});
		}

		repeat(WEEKS_IN_A_MONTH * DAYS_IN_A_WEEK, (dayIndex) => {
			classes = '';
			if (isFirstRun && (currentDay.day() === 0 || currentDay.day() === 6)) {
				classes += WEEKEND_CLASS;
			}
			if (currentDay.isSame(todayDate, MOMENTJS_DAY)) {
				classes += TODAY_CLASS;
			}
			if (currentDay.month() !== self.month()) {
				classes += DIFFERENT_MONTH_CLASS;
			}

			self[DAY_RECYCLER]
				.getControlAtOffset(dayIndex, true)
				.removeClass(TODAY_CLASS + DIFFERENT_MONTH_CLASS)
				.addClass(classes)
				.isSelected(self.selectedDate() && currentDay.isSame(self.selectedDate(), MOMENTJS_DAY))
				.label(currentDay.format(MOMENTJS_DAY_LABEL))
				.value(new Moment(currentDay));

			currentDay.add(1, MOMENTJS_DAY);
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
	month: method.integer({
		init: new Moment().month(),
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
	year: method.integer({
		init: new Moment().year(),
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
	onDateSelected: method.function({
		other: undefined
	}),

	/*
	 * Get or Set the currently selected date.
	 * @method selectedDate
	 * @member module:Calendar
	 * @instance
	 * @arg {Date} newSelectedDate - Accepts js date objects or momentjs instances
	 * @returns {Date|this}
	 */
	selectedDate: method.date({
		set() {
			this[buildDays]();
		},
		other: undefined
	}),

	/*
	 * Get or Set the momentjs format string for weekdays
	 * @method weekdayFormat
	 * @member module:Calendar
	 * @instance
	 * @arg {String} newWeekdayFormat - Default is 'ddd'. See momentjs docs for more options.
	 * @returns {String|this}
	 */
	weekdayFormat: method.string({
		init: 'ddd',
		set() {
			const self = this;
			self[buildWeekDays]();
			self.resize();
		}
	}),

	/*
	 * Get or Set the momentjs format string for months
	 * @method monthFormat
	 * @member module:Calendar
	 * @instance
	 * @arg {String} newMonthFormat - Default is 'MMM'. See momentjs docs for more options.
	 * @returns {String|this}
	 */
	monthFormat: method.string({
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
	yearRangePast: method.integer({
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
	yearRangeFuture: method.integer({
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
