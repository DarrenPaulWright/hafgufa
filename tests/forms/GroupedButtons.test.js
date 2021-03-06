import { assert } from 'type-enforcer';
import { GroupedButtons } from '../../index.js';
import TestUtil from '../TestUtil.js';

describe('GroupedButtons', () => {
	const testUtil = new TestUtil(GroupedButtons);
	testUtil.run({
		mainCssClass: 'grouped-buttons',
		settings: {
			buttons: [{
				id: '1',
				label: 'test'
			}, {
				id: '2',
				label: 'test2'
			}]
		},
		focusableElement: 'button'
	});

	describe('.addButton', () => {
		it('should add a button to the DOM when addButton is called', () => {
			testUtil.control = new GroupedButtons({
				container: testUtil.container,
				id: 'first'
			})
				.addButton({
					id: 'one',
					label: 'test'
				});

			assert.is(testUtil.count('button'), 1);
		});

		it('should add two buttons to the DOM when addButton is called twice', () => {
			const control2 = new GroupedButtons({
				container: testUtil.container,
				id: 'second'
			});
			control2
				.addButton({
					id: 'two',
					label: 'test 1'
				})
				.addButton({
					id: 'three',
					label: 'test 2'
				});

			assert.is(testUtil.count('button'), 2);
			testUtil.control = control2;
		});
	});
});
