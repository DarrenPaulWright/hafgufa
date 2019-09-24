import { wait } from 'async-agent';
import { assert } from 'chai';
import { Menu } from '../../../src';
import TestUtil from '../../TestUtil';
import ControlTests from '../ControlTests';

describe('Menu', () => {
	const testUtil = new TestUtil(Menu);
	const controlTests = new ControlTests(Menu, testUtil, {
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

	controlTests.run(['container', 'element', 'id', 'height', 'width', 'onResize', 'stopPropagation']);

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

			return wait()
				.then(() => {
					assert.equal(testUtil.count('.heading', true), 1);
				});
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

			return wait()
				.then(() => {
					assert.equal(testUtil.count('.heading', true), 3);
				});
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

			return wait()
				.then(() => {
					assert.equal(testUtil.count('.checkbox.checked', true), 1);
				});
		});

		it('should call settings.onSelect if a menuItem is clicked', () => {
			let testVar = '';

			testUtil.control = new Menu({
				onSelect(item) {
					testVar = item;
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

			return wait()
				.then(() => {
					testUtil.simulateClick(testUtil.nth('.heading', 1, true));

					assert.equal(testVar, 'test2');
				});
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

			return wait()
				.then(() => {
					testUtil.simulateClick(testUtil.nth('.heading', 1, true));

					assert.equal(testUtil.count('.context-menu'), 0);
				});
		});

		it.skip('should NOT remove itself if settings.keepMenuOpen is true and a menu item is clicked', () => {
			testUtil.control = new Menu({
				onSelect() {
				},
				keepMenuOpen: true,
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

			return wait()
				.then(() => {
					testUtil.simulateClick(testUtil.nth('.heading', 1, true));

					assert.equal(testUtil.count('.menu'), 1);
				});
		});

		it.skip('should NOT remove itself if menuItem.keepMenuOpen is true and a menu item is clicked', () => {
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

			return wait()
				.then(() => {
					testUtil.simulateClick(testUtil.nth('.heading', 1, true));

					assert.equal(testUtil.count('.menu'), 1);
				});
		});
	});
});
