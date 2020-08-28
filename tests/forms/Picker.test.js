import { clone } from 'object-agent';
import { assert } from 'type-enforcer';
import { HUNDRED_PERCENT } from 'type-enforcer-ui';
import { Picker } from '../../index.js';
import TestUtil from '../TestUtil.js';

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

	testUtil.run({
		extraSettings: {
			width: HUNDRED_PERCENT,
			showAll: true,
			defaultButtonText: 'asdf',
			options: clone(testOptions)
		},
		focusableElement: '.form-button',
		extraTests: {
			focus: true,
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
		}
	});

	describe('.value', () => {
		it('should set the value when an item is clicked in the menu', () => {
			let testValue = 0;

			testUtil.control = new Picker({
				container: testUtil.container,
				options: {
					isMultiSelect: true,
					children: clone(testOptions)
				},
				onChange() {
					testValue++;
				}
			});

			testUtil.simulateClick(testUtil.first('.popup-button'));
			testUtil.simulateClick(testUtil.nth('.popup .heading .checkbox', 2, true));

			assert.is(testUtil.control.value().length, 1);
			assert.is(testUtil.control.value()[0].id, '3');
			assert.is(testValue, 1);
		});
	});

	describe('.showAll', () => {
		it('should render three buttons if three options are set and showAll is true', () => {
			testUtil.control = new Picker({
				container: testUtil.container,
				showAll: true,
				options: clone(testOptions)
			});

			assert.is(testUtil.count('.form-button'), 3);
		});
	});

	describe('.preferred', () => {
		it('should return [] when the preferred option is not set', () => {
			testUtil.control = new Picker({
				container: testUtil.container
			});

			assert.equal(testUtil.control.preferred(), []);
		});

		it('should return [] when the preferred option is set to []', () => {
			testUtil.control = new Picker({
				container: testUtil.container,
				preferred: []
			});

			assert.equal(testUtil.control.preferred(), []);
		});

		it('should return an array of objects when the preferred option is set and no options are set', () => {
			testUtil.control = new Picker({
				container: testUtil.container,
				preferred: testValue
			});

			assert.equal(testUtil.control.preferred(), testValue);
		});

		it('should return [] when the preferred method is set to []', () => {
			testUtil.control = new Picker({
				container: testUtil.container
			})
				.preferred([]);

			assert.equal(testUtil.control.preferred(), []);
		});

		it('should return an array of objects when the preferred method is set and no options are set', () => {
			testUtil.control = new Picker({
				container: testUtil.container
			})
				.preferred(testValue);

			assert.equal(testUtil.control.preferred(), testValue);
		});

		it('should return an array of objects when the preferred method is set and options are set', () => {
			testUtil.control = new Picker({
				container: testUtil.container,
				options: clone(testOptions),
				preferred: testValue
			});

			assert.equal(testUtil.control.preferred()[0].id, '1');
		});

		it('should return an array of objects when the preferred method is set twice and options are set', () => {
			testUtil.control = new Picker({
				container: testUtil.container,
				options: clone(testOptions),
				preferred: testValue
			});
			testUtil.control.preferred(testValue2);

			assert.equal(testUtil.control.preferred()[0].id, '2');
		});
	});
});
