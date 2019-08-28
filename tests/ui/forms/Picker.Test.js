import { assert } from 'chai';
import { clone } from 'object-agent';
import { HUNDRED_PERCENT } from 'type-enforcer';
import { Picker } from '../../../src';
import query from '../../query';
import TestUtil from '../../TestUtil';
import FormControlTests from './FormControlTests';

const testUtil = new TestUtil(Picker);

const testValue = [{
	ID: '1'
}];
const testValue2 = [{
	ID: '2'
}];
const testOptions = [{
	ID: '1',
	title: 'first'
}, {
	ID: '2',
	title: 'second'
}, {
	ID: '3',
	title: 'third'
}];

const formControlTests = new FormControlTests(Picker, testUtil, {
	extraSettings: {
		width: HUNDRED_PERCENT,
		showAll: true,
		defaultButtonText: 'asdf',
		options: clone(testOptions)
	},
	focusableElement: '.form-button'
});

describe('Picker', () => {

	formControlTests.run([], ['focus'], {
		onChange: {
			buildControl() {
				window.control = new Picker({
					container: window.testContainer,
					showAll: true,
					options: clone(testOptions)
				});
			},
			validValue: 'first',
			setValueViaDom() {
				testUtil.simulateClick(query.first('.form-button'));
			},
			skipSameValue: true
		}
	});

	describe('.showAll', () => {
		it('should render three buttons if three options are set and showAll is true', () => {
			window.control = new Picker({
				container: window.testContainer,
				showAll: true,
				options: clone(testOptions)
			});

			assert.equal(query.count('.form-button'), 3);
		});
	});

	describe('.preferred', () => {
		it('should return [] when the preferred option is not set', () => {
			window.control = new Picker({
				container: window.testContainer
			});

			assert.deepEqual(window.control.preferred(), []);
		});

		it('should return [] when the preferred option is set to []', () => {
			window.control = new Picker({
				container: window.testContainer,
				preferred: []
			});

			assert.deepEqual(window.control.preferred(), []);
		});

		it('should return an array of objects when the preferred option is set and no options are set', () => {
			window.control = new Picker({
				container: window.testContainer,
				preferred: testValue
			});

			assert.deepEqual(window.control.preferred(), testValue);
		});

		it('should return [] when the preferred method is set to []', () => {
			window.control = new Picker({
				container: window.testContainer
			})
				.preferred([]);

			assert.deepEqual(window.control.preferred(), []);
		});

		it('should return an array of objects when the preferred method is set and no options are set', () => {
			window.control = new Picker({
				container: window.testContainer
			})
				.preferred(testValue);

			assert.deepEqual(window.control.preferred(), testValue);
		});

		it('should return an array of objects when the preferred method is set and options are set', () => {
			window.control = new Picker({
				container: window.testContainer,
				options: clone(testOptions),
				preferred: testValue
			});

			assert.deepEqual(window.control.preferred()[0].ID, '1');
		});

		it('should return an array of objects when the preferred method is set twice and options are set', () => {
			window.control = new Picker({
				container: window.testContainer,
				options: clone(testOptions),
				preferred: testValue
			});
			window.control.preferred(testValue2);

			assert.deepEqual(window.control.preferred()[0].ID, '2');
		});
	});
});
