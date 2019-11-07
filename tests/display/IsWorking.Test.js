import { assert } from 'chai';
import { IsWorking } from '../..';
import ControlTests from '../ControlTests';
import TestUtil from '../TestUtil';

describe('IsWorking', () => {
	const testUtil = new TestUtil(IsWorking);
	const controlTests = new ControlTests(IsWorking, testUtil, {
		mainCssClass: 'is-working',
		extraSettings: {
			delay: 0
		}
	});

	const BASE_SETTINGS = {
		fade: false,
		delay: 0
	};

	controlTests.run(['width', 'classes', 'onResize']);

	describe('InitialLayout', () => {
		it('should have a div with a css class called is-working', () => {
			testUtil.control = new IsWorking({
				...BASE_SETTINGS,
				container: testUtil.container
			});

			assert.equal(testUtil.count('.is-working'), 1);
		});
	});

	describe('VariableHeights', () => {
		it('should have a large animation container by default', () => {
			testUtil.control = new IsWorking({
				...BASE_SETTINGS,
				container: testUtil.container,
				height: '20rem',
				width: '20rem',
				delay: 0
			});

			assert.equal(testUtil.count('.is-working'), 1);
		});

		it('should have a medium animation container if the height of the control is less than 200', () => {
			testUtil.control = new IsWorking({
				...BASE_SETTINGS,
				container: testUtil.container,
				height: '14rem',
				width: '20rem',
				delay: 0
			});

			assert.equal(testUtil.count('.is-working.medium'), 1);
		});

		it('should have a medium animation container if the width of the control is less than 200', () => {
			testUtil.control = new IsWorking({
				...BASE_SETTINGS,
				container: testUtil.container,
				height: '20rem',
				width: '14rem',
				delay: 0
			});

			assert.equal(testUtil.count('.is-working.medium'), 1);
		});

		it('should have a small animation container if the height of the control is less than 100', () => {
			testUtil.control = new IsWorking({
				...BASE_SETTINGS,
				container: testUtil.container,
				height: '7rem',
				width: '20rem',
				delay: 0
			});

			assert.equal(testUtil.count('.is-working.small'), 1);
		});

		it('should have a small animation container if the width of the control is less than 100', () => {
			testUtil.control = new IsWorking({
				...BASE_SETTINGS,
				container: testUtil.container,
				height: '20rem',
				width: '7rem',
				delay: 0
			});

			assert.equal(testUtil.count('.is-working.small'), 1);
		});
	});

	describe('Label', () => {
		const testLabel = 'loading';
		const testLabel2 = 'done';

		testUtil.testMethod({
			methodName: 'label',
			defaultValue: '',
			testValue: 'loading'
		});

		it('should have a label in the DOM when a label option is set', () => {
			testUtil.control = new IsWorking({
				container: testUtil.container,
				label: testLabel
			});

			assert.equal(testUtil.first('label').textContent, testLabel);
		});

		it('should have a label in the DOM when a label method is called', () => {
			testUtil.control = new IsWorking({
				container: testUtil.container
			})
				.label(testLabel);

			assert.equal(testUtil.first('label').textContent, testLabel);
		});

		it('should update the label when the label method is called', () => {
			testUtil.control = new IsWorking({
				container: testUtil.container,
				label: testLabel
			});

			testUtil.control.label(testLabel2);

			assert.equal(testUtil.first('label').textContent, testLabel2);
		});

		it('should not have a label if the label is set to an empty string', () => {
			testUtil.control = new IsWorking({
				container: testUtil.container,
				label: testLabel
			})
				.label('');

			assert.equal(testUtil.count('label'), 0);
		});
	});
});
