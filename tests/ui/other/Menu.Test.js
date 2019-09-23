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
				ID: '1',
				title: 'test'
			}],
			delay: 0,
			fade: false
		},
		autoFocus: true
	});

	controlTests.run(['container', 'element', 'ID', 'height', 'width', 'onResize', 'stopPropagation']);

	describe('MenuItems', () => {
		testUtil.testMethod({
			methodName: 'menuItems',
			defaultValue: [],
			testValue: [{
				ID: 'test',
				title: 'test'
			}],
			secondTestValue: [{
				ID: 'test 2',
				title: 'test 2'
			}]
		});

		it('should have one menu item if one is provided', () => {
			testUtil.control = new Menu({
				menuItems: [{
					ID: 'test',
					title: 'test'
				}]
			});

			return wait()
				.then(() => {
					assert.equal(document.querySelectorAll('.heading').length, 1);
				});
		});

		it('should have three menu items if three are provided', () => {
			testUtil.control = new Menu({
				menuItems: [{
					ID: 'test',
					title: 'test'
				}, {
					ID: 'test2',
					title: 'test 2'
				}, {
					ID: 'test3',
					title: 'test 3'
				}]
			});

			return wait()
				.then(() => {
					assert.equal(document.querySelectorAll('.heading').length, 3);
				});
		});

		it('should have a selected item if one is set to isSelected', () => {
			testUtil.control = new Menu({
				menuItems: [{
					ID: 'test',
					title: 'test'
				}, {
					ID: 'test2',
					title: 'test 2',
					isSelectable: true,
					isSelected: true
				}, {
					ID: 'test3',
					title: 'test 3'
				}]
			});

			return wait()
				.then(() => {
					assert.equal(document.querySelectorAll('.checkbox.checked').length, 1);
				});
		});

		it('should call settings.onSelect if a menuItem is clicked', () => {
			let testVar = '';

			testUtil.control = new Menu({
				onSelect(item) {
					testVar = item;
				},
				menuItems: [{
					ID: 'test',
					title: 'test'
				}, {
					ID: 'test2',
					title: 'test 2'
				}, {
					ID: 'test3',
					title: 'test 3'
				}]
			});

			return wait()
				.then(() => {
					testUtil.simulateClick(document.querySelectorAll('.heading')[1]);

					assert.equal(testVar, 'test2');
				});
		});

		it('should remove itself when a menu item is clicked', () => {
			testUtil.control = new Menu({
				onSelect() {
				},
				menuItems: [{
					ID: 'test',
					title: 'test'
				}, {
					ID: 'test2',
					title: 'test 2'
				}, {
					ID: 'test3',
					title: 'test 3'
				}]
			});

			return wait()
				.then(() => {
					testUtil.simulateClick(document.querySelectorAll('.heading')[1]);

					assert.equal(document.querySelectorAll('.context-menu').length, 0);
				});
		});

		it.skip('should NOT remove itself if settings.keepMenuOpen is true and a menu item is clicked', () => {
			testUtil.control = new Menu({
				onSelect() {
				},
				keepMenuOpen: true,
				menuItems: [{
					ID: 'test',
					title: 'test'
				}, {
					ID: 'test2',
					title: 'test 2'
				}, {
					ID: 'test3',
					title: 'test 3'
				}]
			});

			return wait()
				.then(() => {
					testUtil.simulateClick(document.querySelectorAll('.heading')[1]);

					assert.equal(document.querySelectorAll('.menu').length, 1);
				});
		});

		it.skip('should NOT remove itself if menuItem.keepMenuOpen is true and a menu item is clicked', () => {
			testUtil.control = new Menu({
				onSelect() {
				},
				menuItems: [{
					ID: 'test',
					title: 'test'
				}, {
					ID: 'test2',
					title: 'test 2',
					keepMenuOpen: true
				}, {
					ID: 'test3',
					title: 'test 3'
				}]
			});

			return wait()
				.then(() => {
					testUtil.simulateClick(document.querySelectorAll('.heading')[1]);

					assert.equal(document.querySelectorAll('.menu').length, 1);
				});
		});
	});
});
