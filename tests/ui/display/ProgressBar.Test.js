import { assert } from 'chai';
import { ProgressBar } from '../../../src';
import TestUtil from '../../TestUtil';
import ControlHeadingMixinTests from '../mixins/ControlHeadingMixinTests';

describe('ProgressBar', () => {
	const testUtil = new TestUtil(ProgressBar);
	const controlHeadingMixinTests = new ControlHeadingMixinTests(ProgressBar, testUtil, {
		mainCssClass: 'progress'
	});

	controlHeadingMixinTests.run();

	describe('.steps', () => {
		testUtil.testMethod({
			methodName: 'steps',
			defaultSettings: {
				container: testUtil.container
			},
			defaultValue: [],
			testValue: [{
				title: 'test'
			}],
			secondTestValue: [{
				title: 'another'
			}]
		});

		it('should not have a subtitle container if no subtitles are provided', () => {
			testUtil.control = new ProgressBar({
				container: testUtil.container,
				steps: [{}, {}, {}, {}]
			});

			assert.equal(testUtil.count('.subtitle'), 0);
		});

		it('should have subtitles if provided', () => {
			testUtil.control = new ProgressBar({
				container: testUtil.container,
				steps: [{
					subTitle: 'test subtitle'
				}, {}, {}, {}]
			});

			assert.equal(testUtil.first('.subtitle').textContent, 'test subtitle');
		});

		it('should have class "large" if any subTitles are set', () => {
			testUtil.control = new ProgressBar({
				container: testUtil.container,
				steps: [{
					subTitle: 'test subtitle'
				}, {}, {}, {}]
			});

			assert.equal(testUtil.count('.large'), 1);
		});

		it('should only have three steps rendered if three steps are set twice', () => {
			testUtil.control = new ProgressBar({
				container: testUtil.container,
				steps: [{}, {}, {}]
			});

			testUtil.control.steps([{}, {}, {}]);

			assert.equal(testUtil.count('.step'), 3);
		});
	});

	describe('.currentStep', () => {
		testUtil.testMethod({
			methodName: 'currentStep',
			defaultValue: 1,
			testValue: 3,
			secondTestValue: 7
		});

		it('should set a "completed" class on the last completed step', () => {
			testUtil.control = new ProgressBar({
				container: testUtil.container,
				steps: [{}, {}, {}, {}],
				currentStep: 2
			});

			assert.equal(testUtil.nth('.step', 1), testUtil.first('.step.completed'));
		});
	});

	describe('.showBigNumbers', () => {
		testUtil.testMethod({
			methodName: 'showBigNumbers',
			defaultValue: false,
			testValue: true,
			secondTestValue: false
		});

		it('should have a div with class "number-container" when showBigNumbers is true and a step is set', () => {
			testUtil.control = new ProgressBar({
				container: testUtil.container,
				steps: [{}, {}, {}, {}],
				showBigNumbers: true
			});

			assert.equal(testUtil.count('i'), 8);
		});

		it('should have class "large" if showBigNumbers is true and no subTitles are set', () => {
			testUtil.control = new ProgressBar({
				container: testUtil.container,
				steps: [{}, {}, {}, {}],
				showBigNumbers: true
			});

			assert.equal(testUtil.count('.large'), 1);
		});
	});

	describe('.showInlineNumbers', () => {
		testUtil.testMethod({
			methodName: 'showInlineNumbers',
			defaultValue: false,
			testValue: true,
			secondTestValue: false
		});

		it('should have a div with text 1 when showInlineNumbers is true and a step is set without a title', () => {
			testUtil.control = new ProgressBar({
				container: testUtil.container,
				steps: [{}, {}, {}, {}],
				showInlineNumbers: true
			});

			assert.equal(testUtil.first('span').textContent, '1');
		});

		it('should have a div with text 1: when showInlineNumbers is true and a step is set with a title', () => {
			testUtil.control = new ProgressBar({
				container: testUtil.container,
				steps: [{
					title: 'test'
				}, {}, {}, {}],
				showInlineNumbers: true
			});

			assert.equal(testUtil.first('span').textContent, '1: test');
		});
	});
});
