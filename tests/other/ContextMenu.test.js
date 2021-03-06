import { assert } from 'type-enforcer';
import { CONTEXT_MENU_EVENT, ContextMenu } from '../../index.js';
import TestUtil from '../TestUtil.js';

describe('ContextMenu', () => {
	const testUtil = new TestUtil(ContextMenu);
	testUtil.run({
		skipTests: ['container', 'element', 'id', 'height', 'width', 'onResize', 'stopPropagation'],
		mainCssClass: 'context-menu',
		settings: {
			menuItems: [{
				id: '1',
				title: 'test'
			}, {
				id: '2',
				title: 'test 2'
			}],
			delay: 0,
			fade: false
		},
		autoFocus: true
	});

	describe('.menuItems', () => {
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

			testUtil.trigger(testUtil.container.element, CONTEXT_MENU_EVENT);
			testUtil.trigger(testUtil.container.element, CONTEXT_MENU_EVENT);

			assert.is(testUtil.count('.context-menu'), 0);
		});
	});
});
