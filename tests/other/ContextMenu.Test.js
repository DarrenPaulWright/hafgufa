import { assert } from 'chai';
import { CONTEXT_MENU_EVENT, ContextMenu } from '../../src';
import ControlTests from '../ControlTests';
import TestUtil from '../TestUtil';

describe('ContextMenu', () => {
	const testUtil = new TestUtil(ContextMenu);
	const controlTests = new ControlTests(ContextMenu, testUtil, {
		mainCssClass: 'context-menu'
	});

	controlTests.run(['container', 'element', 'id', 'height', 'width', 'onResize', 'stopPropagation']);

	describe('MenuItems', () => {
		it('should remove itself if a context menu is envoked elsewhere in the DOM', () => {
			testUtil.control = new ContextMenu({
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

			testUtil.trigger(testUtil.container, CONTEXT_MENU_EVENT);
			testUtil.trigger(testUtil.container, CONTEXT_MENU_EVENT);

			assert.equal(testUtil.count('.context-menu'), 0);
		});
	});
});
