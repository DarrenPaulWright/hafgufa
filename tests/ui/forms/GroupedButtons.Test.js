import { assert } from 'chai';
import { GroupedButtons } from '../../../src';
import TestUtil from '../../TestUtil';
import FormControlTests from './FormControlTests';

describe('GroupedButtons', () => {
	const testUtil = new TestUtil(GroupedButtons);
	const formControlTests = new FormControlTests(GroupedButtons, testUtil, {
		mainCssClass: 'grouped-buttons',
		extraSettings: {
			buttons: [{
				ID: '1',
				label: 'test'
			}, {
				ID: '2',
				label: 'test2'
			}]
		},
		focusableElement: 'button'
	});

	formControlTests.run([], ['focus']);

	describe('.addButton', () => {
		it('should add a button to the DOM when addButton is called', () => {
			testUtil.control = new GroupedButtons({
				container: testUtil.container,
				ID: 'first'
			})
				.addButton({
					ID: 'one',
					label: 'test'
				});

			assert.equal(testUtil.count('button'), 1);
		});

		it('should add two buttons to the DOM when addButton is called twice', () => {
			const control2 = new GroupedButtons({
				container: testUtil.container,
				ID: 'second'
			});
			control2
				.addButton({
					ID: 'two',
					label: 'test 1'
				})
				.addButton({
					ID: 'three',
					label: 'test 2'
				});

			assert.equal(testUtil.count('button'), 2);
			testUtil.control = control2;
		});
	});
});
