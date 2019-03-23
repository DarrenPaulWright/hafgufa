import { assert } from 'chai';
import { IsWorking } from '../../../src';
import query from '../../query';
import TestUtil from '../../TestUtil';
import ControlBaseTests from '../ControlBaseTests';

const testUtil = new TestUtil(IsWorking);
const controlBaseTests = new ControlBaseTests(IsWorking, testUtil, {
	mainCssClass: 'is-working',
	extraSettings: {
		delay: 0
	}
});

const BASE_SETTINGS = {
	fade: false,
	delay: 0
};

describe('IsWorking', () => {

	controlBaseTests.run(['width', 'classes', 'onResize']);

	describe('InitialLayout', () => {
		it('should have a div with a css class called is-working', () => {
			window.control = new IsWorking(Object.assign({}, BASE_SETTINGS, {
				container: window.testContainer
			}));

			assert.equal(query.count('.is-working'), 1);
		});
	});

	describe('VariableHeights', () => {
		it('should have a large animation container by default', () => {
			window.control = new IsWorking(Object.assign({}, BASE_SETTINGS, {
				container: window.testContainer,
				height: '20rem',
				width: '20rem',
				delay: 0
			}));

			assert.equal(query.count('.is-working'), 1);
		});

		it('should have a medium animation container if the height of the control is less than 200', () => {
			window.control = new IsWorking(Object.assign({}, BASE_SETTINGS, {
				container: window.testContainer,
				height: '14rem',
				width: '20rem',
				delay: 0
			}));

			assert.equal(query.count('.is-working.medium'), 1);
		});

		it('should have a medium animation container if the width of the control is less than 200', () => {
			window.control = new IsWorking(Object.assign({}, BASE_SETTINGS, {
				container: window.testContainer,
				height: '20rem',
				width: '14rem',
				delay: 0
			}));

			assert.equal(query.count('.is-working.medium'), 1);
		});

		it('should have a small animation container if the height of the control is less than 100', () => {
			window.control = new IsWorking(Object.assign({}, BASE_SETTINGS, {
				container: window.testContainer,
				height: '7rem',
				width: '20rem',
				delay: 0
			}));

			assert.equal(query.count('.is-working.small'), 1);
		});

		it('should have a small animation container if the width of the control is less than 100', () => {
			window.control = new IsWorking(Object.assign({}, BASE_SETTINGS, {
				container: window.testContainer,
				height: '20rem',
				width: '7rem',
				delay: 0
			}));

			assert.equal(query.count('.is-working.small'), 1);
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
			window.control = new IsWorking({
				container: window.testContainer,
				label: testLabel
			});

			assert.equal(document.querySelector('label').textContent, testLabel);
		});

		it('should have a label in the DOM when a label method is called', () => {
			window.control = new IsWorking({
				container: window.testContainer
			})
				.label(testLabel);

			assert.equal(document.querySelector('label').textContent, testLabel);
		});

		it('should update the label when the label method is called', () => {
			window.control = new IsWorking({
				container: window.testContainer,
				label: testLabel
			});

			window.control.label(testLabel2);

			assert.equal(document.querySelector('label').textContent, testLabel2);
		});

		it('should not have a label if the label is set to an empty string', () => {
			window.control = new IsWorking({
				container: window.testContainer,
				label: testLabel
			})
				.label('');

			assert.equal(document.querySelectorAll('label').length, 0);
		});
	});
});
