import { assert } from 'chai';
import Moment from 'moment';
import { Calendar } from '../../../src';
import query from '../../query';
import TestUtil from '../../TestUtil';
import ControlTests from '../ControlTests';

const testUtil = new TestUtil(Calendar);
const controlBaseTests = new ControlTests(Calendar, testUtil);

describe('Calendar', () => {

	controlBaseTests.run();

	describe('Month', () => {
		testUtil.testMethod({
			methodName: 'month',
			defaultValue: new Moment().month(),
			testValue: 11,
			secondTestValue: 0
		});

		it('should return 11 when month is set to anything higher than 11', () => {
			window.control = new Calendar()
				.month(20);

			assert.equal(window.control.month(), 11);
		});

		it('should return 0 when month is set to anything lower than 0', () => {
			window.control = new Calendar()
				.month(-3);

			assert.equal(window.control.month(), 0);
		});

		it('should change the selected value of the month picker when month is set', () => {
			window.control = new Calendar({
				container: window.testContainer
			});

			window.control.month(0);

			assert.equal(query.first('.grouped-buttons .form-button > span').textContent, 'Jan');
		});

		it('should display a different number of buttons with class "different-month" when month is changed to a month with a different length', () => {
			let initialLength;

			window.control = new Calendar({
				container: window.testContainer
			});

			window.control.month(0);
			initialLength = query.count('.different-month');

			window.control.month(1);

			assert.notEqual(query.count('.different-month'), initialLength);
		});

		it('should select the same month when the user de-selects the current month in the month picker', () => {
			window.control = new Calendar({
				container: window.testContainer,
				month: 3
			});

			testUtil.simulateClick(query.first('.grouped-buttons .form-button'));
			testUtil.simulateClick(query.nth('.popup .heading', 3));

			assert.equal(window.control.month(), 3);
		});

		it('should set the month to the next month when the next month button is clicked', () => {
			window.control = new Calendar({
				container: window.testContainer,
				month: 6
			});

			testUtil.simulateClick(query.first('.calendar-header .next-button'));

			assert.equal(window.control.month(), 7);
		});

		it('should set the month to the previous month when the previous month button is clicked', () => {
			window.control = new Calendar({
				container: window.testContainer,
				month: 6
			});

			testUtil.simulateClick(query.first('.calendar-header .prev-button'));

			assert.equal(window.control.month(), 5);
		});

		it('should set the month to january when the month is already december and the next month button is clicked', () => {
			window.control = new Calendar({
				container: window.testContainer,
				month: 11
			});

			testUtil.simulateClick(query.first('.calendar-header .next-button'));

			assert.equal(window.control.month(), 0);
		});

		it('should set the month to december when the month is already january and the previous month button is clicked', () => {
			window.control = new Calendar({
				container: window.testContainer,
				month: 0
			});

			testUtil.simulateClick(query.first('.calendar-header .prev-button'));

			assert.equal(window.control.month(), 11);
		});

		it('should set the year to the next year when the month is already december and the next month button is clicked', () => {
			window.control = new Calendar({
				container: window.testContainer,
				month: 11,
				year: 2000
			});

			testUtil.simulateClick(query.first('.calendar-header .next-button'));

			assert.equal(window.control.year(), 2001);
		});

		it('should set the year to the previous year when the month is already january and the previous month button is clicked', () => {
			window.control = new Calendar({
				container: window.testContainer,
				month: 0,
				year: 2000
			});

			testUtil.simulateClick(query.first('.calendar-header .prev-button'));

			assert.equal(window.control.year(), 1999);
		});
	});

	describe('Year', () => {
		testUtil.testMethod({
			methodName: 'year',
			defaultValue: Moment().year(),
			testValue: 2000,
			secondTestValue: 1996
		});

		it('should change the selected value of the year picker when year is set', () => {
			window.control = new Calendar({
				container: window.testContainer
			});

			window.control.year(2000);

			assert.equal(query.last('.grouped-buttons .form-button > span').textContent, '2000');
		});

		it('should select the same year when the user de-selects the current year in the year picker', () => {
			window.control = new Calendar({
				container: window.testContainer,
				year: 2018
			});

			testUtil.simulateClick(query.last('.grouped-buttons .form-button'));
			testUtil.simulateClick(query.first('.popup .heading.selected'));

			assert.equal(window.control.year(), 2018);
		});
	});

	describe('OnDateSelected', () => {
		testUtil.testMethod({
			methodName: 'onDateSelected',
			defaultValue: undefined,
			testValue() {
			},
			secondTestValue() {
			}
		});

		it('should execute the onDateSelected callback when a day is clicked', () => {
			let testVar = '';

			window.control = new Calendar({
				container: window.testContainer,
				onDateSelected() {
					testVar = 'test';
				}
			});

			assert.equal(testVar, '');

			testUtil.simulateClick(query.nth('.day-button', 10));

			assert.equal(testVar, 'test');
		});

		it('should show the next month when a day on the next month is clicked', () => {
			window.control = new Calendar({
				container: window.testContainer
			});

			testUtil.simulateClick(query.nth('.day-button', 40));

			assert.isTrue((window.control.month() === Moment().month() + 1) || (window.control.month() === 0));
		});
	});

	describe('SelectedDate', () => {
		testUtil.testMethod({
			methodName: 'selectedDate',
			defaultValue: undefined,
			testValue: new Date('2012-10-13'),
			secondTestValue: new Date('2040-04-23')
		});

		it('should have a div with class "selected" when selectedDate is set to a date in the current month', () => {
			const testDate = new Moment();

			window.control = new Calendar({
				container: window.testContainer
			})
				.selectedDate(testDate.toDate());

			assert.equal(query.count('.day-button.selected'), 1);
		});

		it('should NOT have a div with class "selected" when selectedDate is set to a date in a different month', () => {
			const testDate = new Moment();

			testDate.year(testDate.year() + 1);

			window.control = new Calendar({
				container: window.testContainer
			})
				.selectedDate(testDate.toDate());

			assert.equal(query.count('.day-button.selected'), 0);
		});

		it('should remember the selected date after navigating to a different month and back', () => {
			const testDate = new Moment();

			window.control = new Calendar({
				container: window.testContainer
			})
				.selectedDate(testDate.toDate());

			window.control.year(window.control.year() + 1);
			window.control.year(window.control.year() - 1);

			assert.equal(query.count('.day-button.selected'), 1);
		});
	});

	describe('WeekdayFormat', () => {
		testUtil.testMethod({
			methodName: 'weekdayFormat',
			defaultValue: 'ddd',
			testValue: 'dd',
			secondTestValue: 'dddd'
		});

		it('should have seven divs with class "weekday"', () => {
			window.control = new Calendar({
				container: window.testContainer
			});

			assert.equal(query.count('.heading'), 7);
		});

		it('should have "weekday" div with the text "Sun" in the first div', () => {
			window.control = new Calendar({
				container: window.testContainer
			});

			assert.equal(query.first('.heading').textContent, 'Sun');
		});

		it('should change the format of weekdays when weekdayFormat is set', () => {
			window.control = new Calendar({
				container: window.testContainer,
				weekdayFormat: 'dd'
			});

			assert.equal(query.first('.heading').textContent, 'Su');
		});
	});

	describe('MonthFormat', () => {
		testUtil.testMethod({
			methodName: 'monthFormat',
			defaultValue: 'MMM',
			testValue: 'MM',
			secondTestValue: 'MMMM'
		});

		it('should change the format of the months in the month picker when monthFormat is set', () => {
			window.control = new Calendar({
				container: window.testContainer,
				monthFormat: 'MMMM'
			});
			window.control.month(0);

			assert.equal(query.first('.grouped-buttons .form-button > span').textContent, 'January');
		});
	});

	describe('YearRangePast', () => {
		testUtil.testMethod({
			methodName: 'yearRangePast',
			defaultValue: 100,
			testValue: 10,
			secondTestValue: 13
		});

		it('should not allow yearRangePast to be set to negative numbers', () => {
			window.control = new Calendar({
				yearRangePast: -20
			});

			assert.equal(window.control.yearRangePast(), 0);
		});

		it('should change the year to whatever past year is selected in the year picker');
	});

	describe('YearRangeFuture', () => {
		testUtil.testMethod({
			methodName: 'yearRangeFuture',
			defaultValue: 10,
			testValue: 16,
			secondTestValue: 100
		});

		it('should not allow yearRangeFuture to be set to negative numbers', () => {
			window.control = new Calendar({
				yearRangeFuture: -20
			});

			assert.equal(window.control.yearRangeFuture(), 0);
		});

		it('should have the correct number of range years in the year picker when yearRangeFuture is set', () => {
			// window.control = new Calendar({
			// 	container: window.testContainer,
			// 	yearRangeFuture: 20
			// });
			//
			// query.last('.grouped-buttons .form-button').focus();
			// query.last('.grouped-buttons .form-button').click();
			//
			// return testUtil.delay(1000)
			// 	.then(() => {
			// 		assert.equal(query.count('.popup'), 1);
			// 		assert.equal(query.count('.popup .form-button'), window.control.yearRangePast() + 21);
			// 	});
		});

		it('should set the last year in the year picker to the current year plus yearRangeFuture', () => {
			// window.control = new Calendar({
			// 	container: window.testContainer,
			// 	yearRangeFuture: 20
			// });
			//
			// query.last('.grouped-buttons').click();
			//
			// return testUtil.delay(1000)
			// 	.then(() => {
			// 		assert.equal(query.last('.popup .form-button span').text(), window.control.year() + 20);
			// 	});
		});

		it('should change the year to whatever future year is selected in the year picker');
	});

	it('should have a "today" class on the appropriate month');
});
