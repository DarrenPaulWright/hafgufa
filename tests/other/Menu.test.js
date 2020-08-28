import { assert } from 'type-enforcer';
import { Menu } from '../../index.js';
import TestUtil from '../TestUtil.js';

describe('Menu', () => {
	const testUtil = new TestUtil(Menu);
	testUtil.run({
		skipTests: ['container', 'element', 'id', 'height', 'width', 'onResize', 'stopPropagation'],
		mainCssClass: 'menu',
		extraSettings: {
			menuItems: [{
				id: '1',
				title: 'test'
			}],
			delay: 0,
			fade: false
		},
		autoFocus: true
	});

	describe('MenuItems', () => {
		testUtil.testMethod({
			methodName: 'menuItems',
			defaultValue: [],
			testValue: [{
				id: 'test',
				title: 'test'
			}],
			secondTestValue: [{
				id: 'test 2',
				title: 'test 2'
			}]
		});

		it('should have one menu item if one is provided', () => {
			testUtil.control = new Menu({
				menuItems: [{
					id: 'test',
					title: 'test'
				}]
			});

			assert.is(testUtil.count('.heading', true), 1);
		});

		it('should have three menu items if three are provided', () => {
			testUtil.control = new Menu({
				menuItems: [{
					id: 'test',
					title: 'test'
				}, {
					id: 'test2',
					title: 'test 2'
				}, {
					id: 'test3',
					title: 'test 3'
				}]
			});

			assert.is(testUtil.count('.heading', true), 3);
		});

		it('should have a selected item if one is set to isSelected', () => {
			testUtil.control = new Menu({
				menuItems: [{
					id: 'test',
					title: 'test'
				}, {
					id: 'test2',
					title: 'test 2',
					isSelectable: true,
					isSelected: true
				}, {
					id: 'test3',
					title: 'test 3'
				}]
			});

			assert.is(testUtil.count('.checkbox.checked', true), 1);
		});

		it('should call settings.onSelect if a menuItem is clicked', () => {
			let testValue = '';

			testUtil.control = new Menu({
				onSelect(item) {
					testValue = item;
				},
				menuItems: [{
					id: 'test',
					title: 'test'
				}, {
					id: 'test2',
					title: 'test 2'
				}, {
					id: 'test3',
					title: 'test 3'
				}]
			});

			testUtil.simulateClick(testUtil.nth('.heading', 1, true));

			assert.is(testValue, 'test2');
		});

		it('should remove itself when a menu item is clicked', () => {
			testUtil.control = new Menu({
				onSelect() {
				},
				menuItems: [{
					id: 'test',
					title: 'test'
				}, {
					id: 'test2',
					title: 'test 2'
				}, {
					id: 'test3',
					title: 'test 3'
				}]
			});

			testUtil.simulateClick(testUtil.nth('.heading', 1, true));

			assert.is(testUtil.count('.context-menu'), 0);
		});

		it('should NOT remove itself if settings.keepMenuOpen is true and a menu item is clicked', () => {
			let testValue = 0;

			testUtil.control = new Menu({
				onSelect() {
					testValue++;
				},
				keepMenuOpen: true,
				isMultiSelect: true,
				menuItems: [{
					id: 'test',
					title: 'test'
				}, {
					id: 'test2',
					title: 'test 2'
				}, {
					id: 'test3',
					title: 'test 3'
				}]
			});

			testUtil.simulateClick(testUtil.nth('.heading .checkbox', 1, true));

			assert.is(testUtil.count('.menu', true), 1);
			assert.is(testValue, 1);

			testUtil.simulateClick(testUtil.nth('.heading .checkbox', 0, true));

			assert.is(testUtil.count('.menu', true), 1);
			assert.is(testValue, 2);

			testUtil.control.resize(true);
			testUtil.simulateClick(testUtil.nth('.heading .checkbox', 2, true));

			assert.is(testUtil.count('.menu', true), 1);
			assert.is(testValue, 3);
		});

		it('should NOT remove itself if menuItem.keepMenuOpen is true and a menu item is clicked', () => {
			testUtil.control = new Menu({
				onSelect() {
				},
				menuItems: [{
					id: 'test',
					title: 'test'
				}, {
					id: 'test2',
					title: 'test 2',
					keepMenuOpen: true
				}, {
					id: 'test3',
					title: 'test 3'
				}]
			});

			testUtil.simulateClick(testUtil.nth('.heading', 1, true));

			assert.is(testUtil.count('.menu', true), 1);
		});
	});
});
