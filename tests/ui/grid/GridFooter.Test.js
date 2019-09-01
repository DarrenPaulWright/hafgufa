import { assert } from 'chai';
import GridFooter from '../../../src/ui/grid/GridFooter';
import TestUtil from '../../TestUtil';
import ControlTests from '../ControlTests';

const testUtil = new TestUtil(GridFooter);
const controlBaseTests = new ControlTests(GridFooter, testUtil, {
	mainCssClass: 'grid-footer'
});

describe('GridFooter', () => {

	controlBaseTests.run();

	describe('Init', () => {
		it('should have a div with class grid-footer-left', () => {
			window.control = new GridFooter({
				container: window.testContainer
			});

			assert.equal(document.querySelectorAll('.grid-footer-left').length, 1);
		});

		it('should have a div with class grid-footer-right', () => {
			window.control = new GridFooter({
				container: window.testContainer
			});

			assert.equal(document.querySelectorAll('.grid-footer-right').length, 1);
		});
	});

	describe('CountSuffix', () => {
		testUtil.testMethod({
			methodName: 'countSuffix',
			defaultValue: 'items',
			testValue: 'tests',
			secondTestValue: 'blah'
		});

		it('should have a string "9 things" when countSuffix is set to "things" and count is 9', () => {
			window.control = new GridFooter({
				container: window.testContainer,
				count: 9,
				countSuffix: 'things'
			});

			assert.equal(document.querySelector('.grid-footer-right').textContent, '9 things');
		});
	});

	describe('Count', () => {
		testUtil.testMethod({
			methodName: 'count',
			defaultValue: 0,
			testValue: 3,
			secondTestValue: 1234
		});

		it('should have a string "0 items" when count is not set', () => {
			window.control = new GridFooter({
				container: window.testContainer
			});

			assert.equal(document.querySelector('.grid-footer-right').textContent, '0 items');
		});

		it('should have a string "9 items" when count is set to 9', () => {
			window.control = new GridFooter({
				container: window.testContainer,
				count: 9
			});

			assert.equal(document.querySelector('.grid-footer-right').textContent, '9 items');
		});
	});

	describe('GroupSuffixes', () => {
		testUtil.testMethod({
			methodName: 'groupSuffixes',
			defaultValue: [],
			testValue: ['groups'],
			secondTestValue: ['first', 'second']
		});

		it('should have a string "0 groups" when groupSuffixes is set to "groups"', () => {
			window.control = new GridFooter({
				container: window.testContainer,
				groupSuffixes: ['groups']
			});

			assert.equal(document.querySelector('.grid-footer-right').textContent, ' 0 groups • 0 items');
		});
	});

	describe('GroupCounts', () => {
		testUtil.testMethod({
			methodName: 'groupCounts',
			defaultValue: [],
			testValue: [4],
			secondTestValue: [4, 3, 6]
		});

		it('should have a string "9 groups" when groupSuffixes is set to "groups" and groupCounts is 9', () => {
			window.control = new GridFooter({
				container: window.testContainer,
				groupSuffixes: ['groups'],
				groupCounts: [9]
			});

			assert.equal(document.querySelector('.grid-footer-right').textContent, ' 9 groups • 0 items');
		});
	});

	describe('OnCollapseAllGroups', () => {
		testUtil.testMethod({
			methodName: 'onCollapseAllGroups',
			defaultValue: undefined,
			testValue() {
				return 1;
			},
			secondTestValue() {
				return 2;
			}
		});

		it('should have two buttons when showExpandCollapseButtons is called', () => {
			window.control = new GridFooter({
				container: window.testContainer
			});

			window.control.showExpandCollapseButtons();

			assert.equal(document.querySelectorAll('.icon-button').length, 2);
		});

		it('should have two buttons when showExpandCollapseButtons is called twice', () => {
			window.control = new GridFooter({
				container: window.testContainer
			});

			window.control.showExpandCollapseButtons();
			window.control.showExpandCollapseButtons();

			assert.equal(document.querySelectorAll('.icon-button').length, 2);
		});

		it('should call onCollapseAllGroups with false when the expand all button is clicked', () => {
			let testVar;

			window.control = new GridFooter({
				container: window.testContainer,
				onCollapseAllGroups(doCollapse) {
					testVar = doCollapse;
				}
			});

			window.control.showExpandCollapseButtons();
			testUtil.simulateClick(document.querySelectorAll('.icon-button')[0]);

			assert.isTrue(testVar === false);
		});

		it('should call onCollapseAllGroups with true when the collapse all button is clicked', () => {
			let testVar;

			window.control = new GridFooter({
				container: window.testContainer,
				onCollapseAllGroups(doCollapse) {
					testVar = doCollapse;
				}
			});

			window.control.showExpandCollapseButtons();
			testUtil.simulateClick(document.querySelectorAll('.icon-button')[1]);

			assert.isTrue(testVar === true);
		});

		it('should not throw an error when the expand all button is clicked', () => {
			let testVar;

			window.control = new GridFooter({
				container: window.testContainer
			});

			window.control.showExpandCollapseButtons();
			testUtil.simulateClick(document.querySelectorAll('.icon-button')[0]);

			assert.isTrue(testVar === undefined);
		});

		it('should not throw an error when the collapse all button is clicked', () => {
			let testVar;

			window.control = new GridFooter({
				container: window.testContainer
			});

			window.control.showExpandCollapseButtons();
			testUtil.simulateClick(document.querySelectorAll('.icon-button')[1]);

			assert.isTrue(testVar === undefined);
		});
	});
});
