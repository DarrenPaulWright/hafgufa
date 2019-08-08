import { assert } from 'chai';
import { ProgressBar } from '../../../src/';
import query from '../../query';
import TestUtil from '../../TestUtil';
import ControlHeadingMixinTests from '../mixins/ControlHeadingMixinTests';

const testUtil = new TestUtil(ProgressBar);
const controlHeadingMixinTests = new ControlHeadingMixinTests(ProgressBar, testUtil, {
	mainCssClass: 'progress'
});

describe('ProgressBar', () => {
	controlHeadingMixinTests.run();

	describe('.steps', () => {
		testUtil.testMethod({
			methodName: 'steps',
			defaultSettings: {
				container: window.testContainer
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
			window.control = new ProgressBar({
				container: window.testContainer,
				steps: [{}, {}, {}, {}]
			});

			assert.equal(query.count('.subtitle'), 0);
		});

		it('should have subtitles if provided', () => {
			window.control = new ProgressBar({
				container: window.testContainer,
				steps: [{
					subTitle: 'test subtitle'
				}, {}, {}, {}]
			});

			assert.equal(query.first('.subtitle').textContent, 'test subtitle');
		});

		it('should have class "large" if any subTitles are set', () => {
			window.control = new ProgressBar({
				container: window.testContainer,
				steps: [{
					subTitle: 'test subtitle'
				}, {}, {}, {}]
			});

			assert.equal(query.count('.large'), 1);
		});

		it('should only have three steps rendered if three steps are set twice', () => {
			window.control = new ProgressBar({
				container: window.testContainer,
				steps: [{}, {}, {}]
			});

			window.control.steps([{}, {}, {}]);

			assert.equal(query.count('.step'), 3);
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
			window.control = new ProgressBar({
				container: window.testContainer,
				steps: [{}, {}, {}, {}],
				currentStep: 2
			});

			assert.equal(query.nth('.step', 1), query.first('.step.completed'));
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
			window.control = new ProgressBar({
				container: window.testContainer,
				steps: [{}, {}, {}, {}],
				showBigNumbers: true
			});

			assert.equal(query.count('i'), 12);
		});

		it('should have class "large" if showBigNumbers is true and no subTitles are set', () => {
			window.control = new ProgressBar({
				container: window.testContainer,
				steps: [{}, {}, {}, {}],
				showBigNumbers: true
			});

			assert.equal(query.count('.large'), 1);
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
			window.control = new ProgressBar({
				container: window.testContainer,
				steps: [{}, {}, {}, {}],
				showInlineNumbers: true
			});

			assert.equal(query.first('span').textContent, '1');
		});

		it('should have a div with text 1: when showInlineNumbers is true and a step is set with a title', () => {
			window.control = new ProgressBar({
				container: window.testContainer,
				steps: [{
					title: 'test'
				}, {}, {}, {}],
				showInlineNumbers: true
			});

			assert.equal(query.first('span').textContent, '1: test');
		});
	});
});
