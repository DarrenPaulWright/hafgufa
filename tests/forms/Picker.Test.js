import { assert } from 'chai';
import { clone } from 'object-agent';
import { HUNDRED_PERCENT } from 'type-enforcer-ui';
import { Picker } from '../../src';
import TestUtil from '../TestUtil';
import FormControlTests from './FormControlTests';

describe('Picker', () => {
	const testUtil = new TestUtil(Picker);

	const testValue = [{
		id: '1'
	}];
	const testValue2 = [{
		id: '2'
	}];
	const testOptions = [{
		id: '1',
		title: 'first'
	}, {
		id: '2',
		title: 'second'
	}, {
		id: '3',
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

	formControlTests.run([], ['focus'], {
		onChange: {
			buildControl() {
				testUtil.control = new Picker({
					container: testUtil.container,
					showAll: true,
					options: clone(testOptions)
				});
			},
			validValue: 'first',
			setValueViaDom() {
				testUtil.simulateClick(testUtil.first('.form-button'));
			},
			skipSameValue: true
		}
	});

	describe('.showAll', () => {
		it('should render three buttons if three options are set and showAll is true', () => {
			testUtil.control = new Picker({
				container: testUtil.container,
				showAll: true,
				options: clone(testOptions)
			});

			assert.equal(testUtil.count('.form-button'), 3);
		});
	});

	describe('.preferred', () => {
		it('should return [] when the preferred option is not set', () => {
			testUtil.control = new Picker({
				container: testUtil.container
			});

			assert.deepEqual(testUtil.control.preferred(), []);
		});

		it('should return [] when the preferred option is set to []', () => {
			testUtil.control = new Picker({
				container: testUtil.container,
				preferred: []
			});

			assert.deepEqual(testUtil.control.preferred(), []);
		});

		it('should return an array of objects when the preferred option is set and no options are set', () => {
			testUtil.control = new Picker({
				container: testUtil.container,
				preferred: testValue
			});

			assert.deepEqual(testUtil.control.preferred(), testValue);
		});

		it('should return [] when the preferred method is set to []', () => {
			testUtil.control = new Picker({
				container: testUtil.container
			})
				.preferred([]);

			assert.deepEqual(testUtil.control.preferred(), []);
		});

		it('should return an array of objects when the preferred method is set and no options are set', () => {
			testUtil.control = new Picker({
				container: testUtil.container
			})
				.preferred(testValue);

			assert.deepEqual(testUtil.control.preferred(), testValue);
		});

		it('should return an array of objects when the preferred method is set and options are set', () => {
			testUtil.control = new Picker({
				container: testUtil.container,
				options: clone(testOptions),
				preferred: testValue
			});

			assert.deepEqual(testUtil.control.preferred()[0].id, '1');
		});

		it('should return an array of objects when the preferred method is set twice and options are set', () => {
			testUtil.control = new Picker({
				container: testUtil.container,
				options: clone(testOptions),
				preferred: testValue
			});
			testUtil.control.preferred(testValue2);

			assert.deepEqual(testUtil.control.preferred()[0].id, '2');
		});
	});
});
