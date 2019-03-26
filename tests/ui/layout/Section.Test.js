import { assert } from 'chai';
import { Section } from '../../../src';
import query from '../../query';
import TestUtil from '../../TestUtil';
import ControlHeadingMixinTests from '../mixins/ControlHeadingMixinTests';

const testUtil = new TestUtil(Section);
const controlHeadingMixinTests = new ControlHeadingMixinTests(Section, testUtil);

describe('Section', () => {

	controlHeadingMixinTests.run(['canCollapse', 'isCollapsed']);

	describe('.canCollapse', () => {
		testUtil.testMethod({
			methodName: 'canCollapse',
			defaultSettings: {
				container: window.testContainer,
				title: 'Test Title'
			},
			defaultValue: true,
			testValue: false
		});

		it('should set isCollapsed to false when canCollapse is set to false', () => {
			window.control = new Section({
				container: window.testContainer,
				title: 'Test Title',
				isCollapsed: true
			});

			window.control.canCollapse(false);

			assert.equal(window.control.isCollapsed(), false);
		});
	});

	describe('.isCollapsed', () => {
		testUtil.testMethod({
			methodName: 'isCollapsed',
			defaultSettings: {
				container: window.testContainer,
				title: 'Test Title'
			},
			defaultValue: false,
			testValue: true,
			testValueClass: 'collapsed'
		});

		it('should always return false for isCollapsed when canCollapse is false', () => {
			window.control = new Section({
				container: window.testContainer,
				title: 'Test Title',
				canCollapse: false
			});

			window.control.isCollapsed(true);

			assert.equal(window.control.isCollapsed(), false);
		});

		it('should have a heading control with a expander without class "expanded" when isCollapsed is true', () => {
			window.control = new Section({
				container: window.testContainer,
				title: 'Test Title',
				isCollapsed: true
			});

			assert.equal(query.count('.heading button'), 1);
		});

		it('should have a heading control with a expander with class "expanded" when isCollapsed is false', () => {
			window.control = new Section({
				container: window.testContainer,
				title: 'Test Title',
				isCollapsed: false
			});

			assert.equal(query.count('.heading button'), 1);
		});
	});
});
