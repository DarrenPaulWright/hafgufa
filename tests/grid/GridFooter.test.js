import { assert } from 'type-enforcer';
import GridFooter from '../../src/grid/GridFooter.js';
import TestUtil from '../TestUtil.js';

describe('GridFooter', () => {
	const testUtil = new TestUtil(GridFooter);
	testUtil.run({
		mainCssClass: 'grid-footer'
	});

	describe('Init', () => {
		it('should have a div with class grid-footer-left', () => {
			testUtil.control = new GridFooter({
				container: testUtil.container
			});

			assert.is(testUtil.count('.grid-footer-left'), 1);
		});

		it('should have a div with class grid-footer-right', () => {
			testUtil.control = new GridFooter({
				container: testUtil.container
			});

			assert.is(testUtil.count('.grid-footer-right'), 1);
		});
	});

	describe('.countSuffix', () => {
		testUtil.testMethod({
			methodName: 'countSuffix',
			defaultValue: 'items',
			testValue: 'tests',
			secondTestValue: 'blah'
		});

		it('should have a string "9 things" when countSuffix is set to "things" and count is 9', () => {
			testUtil.control = new GridFooter({
				container: testUtil.container,
				filterCount: 7,
				count: 9,
				countSuffix: 'things'
			});

			assert.is(testUtil.first('.grid-footer-right').textContent, '7 of 9 things');
		});
	});

	describe('.count', () => {
		testUtil.testMethod({
			methodName: 'count',
			defaultValue: 0,
			testValue: 3,
			secondTestValue: 1234
		});

		it('should have a string "0 items" when count is not set', () => {
			testUtil.control = new GridFooter({
				container: testUtil.container
			});

			assert.is(testUtil.first('.grid-footer-right').textContent, '0 items');
		});

		it('should have a string "9 items" when count is set to 9', () => {
			testUtil.control = new GridFooter({
				container: testUtil.container,
				filterCount: 9,
				count: 9
			});

			assert.is(testUtil.first('.grid-footer-right').textContent, '9 items');
		});
	});

	describe('.groupSuffixes', () => {
		testUtil.testMethod({
			methodName: 'groupSuffixes',
			defaultValue: [],
			testValue: ['groups'],
			secondTestValue: ['first', 'second']
		});

		it('should have a string "0 groups" when groupSuffixes is set to "groups"', () => {
			testUtil.control = new GridFooter({
				container: testUtil.container,
				groupSuffixes: ['groups']
			});

			assert.is(testUtil.first('.grid-footer-right').textContent, ' 0 groups • 0 items');
		});
	});

	describe('.groupCounts', () => {
		testUtil.testMethod({
			methodName: 'groupCounts',
			defaultValue: [],
			testValue: [4],
			secondTestValue: [4, 3, 6]
		});

		it('should have a string "9 groups" when groupSuffixes is set to "groups" and groupCounts is 9', () => {
			testUtil.control = new GridFooter({
				container: testUtil.container,
				groupSuffixes: ['groups'],
				groupCounts: [9]
			});

			assert.is(testUtil.first('.grid-footer-right').textContent, ' 9 groups • 0 items');
		});
	});

	describe('.onCollapseAllGroups', () => {
		it('should have two buttons when showExpandCollapseButtons is called', () => {
			testUtil.control = new GridFooter({
				container: testUtil.container
			});

			testUtil.control.showExpandCollapseButtons();

			assert.is(testUtil.count('.icon-button'), 2);
		});

		it('should have two buttons when showExpandCollapseButtons is called twice', () => {
			testUtil.control = new GridFooter({
				container: testUtil.container
			});

			testUtil.control.showExpandCollapseButtons();
			testUtil.control.showExpandCollapseButtons();

			assert.is(testUtil.count('.icon-button'), 2);
		});

		it('should call onCollapseAllGroups with false when the expand all button is clicked', () => {
			let testValue = null;

			testUtil.control = new GridFooter({
				container: testUtil.container,
				onCollapseAllGroups(doCollapse) {
					testValue = doCollapse;
				}
			});

			testUtil.control.showExpandCollapseButtons();
			testUtil.simulateClick(testUtil.nth('.icon-button', 0));

			assert.is(testValue === false, true);
		});

		it('should call onCollapseAllGroups with true when the collapse all button is clicked', () => {
			let testValue = null;

			testUtil.control = new GridFooter({
				container: testUtil.container,
				onCollapseAllGroups(doCollapse) {
					testValue = doCollapse;
				}
			});

			testUtil.control.showExpandCollapseButtons();
			testUtil.simulateClick(testUtil.nth('.icon-button', 1));

			assert.is(testValue === true, true);
		});

		it('should not throw an error when the expand all button is clicked', () => {
			testUtil.control = new GridFooter({
				container: testUtil.container
			});

			assert.notThrows(() => {
				testUtil.control.showExpandCollapseButtons();
				testUtil.simulateClick(testUtil.nth('.icon-button', 0));
			});
		});

		it('should not throw an error when the collapse all button is clicked', () => {
			testUtil.control = new GridFooter({
				container: testUtil.container
			});

			assert.notThrows(() => {
				testUtil.control.showExpandCollapseButtons();
				testUtil.simulateClick(testUtil.nth('.icon-button', 1));
			});
		});
	});
});
