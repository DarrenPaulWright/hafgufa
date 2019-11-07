import { assert } from 'chai';
import Moment from 'moment';
import { Calendar } from '../..';
import ControlTests from '../ControlTests';
import TestUtil from '../TestUtil';

describe('Calendar', () => {
	const testUtil = new TestUtil(Calendar);
	const controlBaseTests = new ControlTests(Calendar, testUtil);

	controlBaseTests.run();

	describe('Month', () => {
		testUtil.testMethod({
			methodName: 'month',
			defaultValue: new Moment().month(),
			testValue: 11,
			secondTestValue: 0
		});

		it('should return 11 when month is set to anything higher than 11', () => {
			testUtil.control = new Calendar()
				.month(20);

			assert.equal(testUtil.control.month(), 11);
		});

		it('should return 0 when month is set to anything lower than 0', () => {
			testUtil.control = new Calendar()
				.month(-3);

			assert.equal(testUtil.control.month(), 0);
		});

		it('should change the selected value of the month picker when month is set', () => {
			testUtil.control = new Calendar({
				container: testUtil.container
			});

			testUtil.control.month(0);

			assert.equal(testUtil.first('.grouped-buttons .form-button > span').textContent, 'Jan');
		});

		it('should display a different number of buttons with class "different-month" when month is changed to a month with a different length', () => {
			let initialLength;

			testUtil.control = new Calendar({
				container: testUtil.container
			});

			testUtil.control.month(0);
			initialLength = testUtil.count('.different-month');

			testUtil.control.month(1);

			assert.notEqual(testUtil.count('.different-month'), initialLength);
		});

		it('should select the same month when the user de-selects the current month in the month picker', () => {
			testUtil.control = new Calendar({
				container: testUtil.container,
				month: 3
			});

			testUtil.simulateClick(testUtil.first('.grouped-buttons .form-button'));
			testUtil.simulateClick(testUtil.nth('.popup .heading', 3));

			assert.equal(testUtil.control.month(), 3);
		});

		it('should set the month to the next month when the next month button is clicked', () => {
			testUtil.control = new Calendar({
				container: testUtil.container,
				month: 6
			});

			testUtil.simulateClick(testUtil.first('.calendar-header .next-button'));

			assert.equal(testUtil.control.month(), 7);
		});

		it('should set the month to the previous month when the previous month button is clicked', () => {
			testUtil.control = new Calendar({
				container: testUtil.container,
				month: 6
			});

			testUtil.simulateClick(testUtil.first('.calendar-header .prev-button'));

			assert.equal(testUtil.control.month(), 5);
		});

		it('should set the month to january when the month is already december and the next month button is clicked', () => {
			testUtil.control = new Calendar({
				container: testUtil.container,
				month: 11
			});

			testUtil.simulateClick(testUtil.first('.calendar-header .next-button'));

			assert.equal(testUtil.control.month(), 0);
		});

		it('should set the month to december when the month is already january and the previous month button is clicked', () => {
			testUtil.control = new Calendar({
				container: testUtil.container,
				month: 0
			});

			testUtil.simulateClick(testUtil.first('.calendar-header .prev-button'));

			assert.equal(testUtil.control.month(), 11);
		});

		it('should set the year to the next year when the month is already december and the next month button is clicked', () => {
			testUtil.control = new Calendar({
				container: testUtil.container,
				month: 11,
				year: 2000
			});

			testUtil.simulateClick(testUtil.first('.calendar-header .next-button'));

			assert.equal(testUtil.control.year(), 2001);
		});

		it('should set the year to the previous year when the month is already january and the previous month button is clicked', () => {
			testUtil.control = new Calendar({
				container: testUtil.container,
				month: 0,
				year: 2000
			});

			testUtil.simulateClick(testUtil.first('.calendar-header .prev-button'));

			assert.equal(testUtil.control.year(), 1999);
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
			testUtil.control = new Calendar({
				container: testUtil.container
			});

			testUtil.control.year(2000);

			assert.equal(testUtil.last('.grouped-buttons .form-button > span').textContent, '2000');
		});

		it('should select the same year when the user de-selects the current year in the year picker', () => {
			testUtil.control = new Calendar({
				container: testUtil.container,
				year: 2018
			});

			testUtil.simulateClick(testUtil.last('.grouped-buttons .form-button'));
			testUtil.simulateClick(testUtil.first('.popup .heading.selected'));

			assert.equal(testUtil.control.year(), 2018);
		});
	});

	describe('OnDateSelected', () => {
		it('should execute the onDateSelected callback when a day is clicked', () => {
			let testVar = '';

			testUtil.control = new Calendar({
				container: testUtil.container,
				onDateSelected() {
					testVar = 'test';
				}
			});

			assert.equal(testVar, '');

			testUtil.simulateClick(testUtil.nth('.day-button', 10));

			assert.equal(testVar, 'test');
		});

		it('should show the next month when a day on the next month is clicked', () => {
			testUtil.control = new Calendar({
				container: testUtil.container
			});

			testUtil.simulateClick(testUtil.nth('.day-button', 40));

			assert.isTrue((testUtil.control.month() === Moment().month() + 1) || (testUtil.control.month() === 0));
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

			testUtil.control = new Calendar({
				container: testUtil.container
			})
				.selectedDate(testDate.toDate());

			assert.equal(testUtil.count('.day-button.selected'), 1);
		});

		it('should NOT have a div with class "selected" when selectedDate is set to a date in a different month', () => {
			const testDate = new Moment();

			testDate.year(testDate.year() + 1);

			testUtil.control = new Calendar({
				container: testUtil.container
			})
				.selectedDate(testDate.toDate());

			assert.equal(testUtil.count('.day-button.selected'), 0);
		});

		it('should remember the selected date after navigating to a different month and back', () => {
			const testDate = new Moment();

			testUtil.control = new Calendar({
				container: testUtil.container
			})
				.selectedDate(testDate.toDate());

			testUtil.control.year(testUtil.control.year() + 1);
			testUtil.control.year(testUtil.control.year() - 1);

			assert.equal(testUtil.count('.day-button.selected'), 1);
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
			testUtil.control = new Calendar({
				container: testUtil.container
			});

			assert.equal(testUtil.count('.heading'), 7);
		});

		it('should have "weekday" div with the text "Sun" in the first div', () => {
			testUtil.control = new Calendar({
				container: testUtil.container
			});

			assert.equal(testUtil.first('.heading').textContent, 'Sun');
		});

		it('should change the format of weekdays when weekdayFormat is set', () => {
			testUtil.control = new Calendar({
				container: testUtil.container,
				weekdayFormat: 'dd'
			});

			assert.equal(testUtil.first('.heading').textContent, 'Su');
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
			testUtil.control = new Calendar({
				container: testUtil.container,
				monthFormat: 'MMMM'
			});
			testUtil.control.month(0);

			assert.equal(testUtil.first('.grouped-buttons .form-button > span').textContent, 'January');
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
			testUtil.control = new Calendar({
				yearRangePast: -20
			});

			assert.equal(testUtil.control.yearRangePast(), 0);
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
			testUtil.control = new Calendar({
				yearRangeFuture: -20
			});

			assert.equal(testUtil.control.yearRangeFuture(), 0);
		});

		it('should have the correct number of range years in the year picker when yearRangeFuture is set', () => {
			// testUtil.control = new Calendar({
			// 	container: testUtil.container,
			// 	yearRangeFuture: 20
			// });
			//
			// testUtil.last('.grouped-buttons .form-button').focus();
			// testUtil.last('.grouped-buttons .form-button').click();
			//
			// return wait(1000)
			// 	.then(() => {
			// 		assert.equal(testUtil.count('.popup'), 1);
			// 		assert.equal(testUtil.count('.popup .form-button'), testUtil.control.yearRangePast() + 21);
			// 	});
		});

		it('should set the last year in the year picker to the current year plus yearRangeFuture', () => {
			// testUtil.control = new Calendar({
			// 	container: testUtil.container,
			// 	yearRangeFuture: 20
			// });
			//
			// testUtil.last('.grouped-buttons').click();
			//
			// return wait(1000)
			// 	.then(() => {
			// 		assert.equal(testUtil.last('.popup .form-button span').text(), testUtil.control.year() + 20);
			// 	});
		});

		it('should change the year to whatever future year is selected in the year picker');
	});

	it('should have a "today" class on the appropriate month');
});
