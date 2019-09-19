import { assert } from 'chai';
import { CONTEXT_MENU_EVENT, ContextMenu } from '../../../src';
import TestUtil from '../../TestUtil';
import ControlTests from '../ControlTests';

const testUtil = new TestUtil(ContextMenu);
const controlTests = new ControlTests(ContextMenu, testUtil, {
	mainCssClass: 'context-menu'
});

describe('ContextMenu', () => {

	controlTests.run(['container', 'element', 'ID', 'height', 'width', 'onResize', 'stopPropagation']);

	describe('MenuItems', () => {
		it('should remove itself if a context menu is envoked elsewhere in the DOM', () => {
			window.control = new ContextMenu({
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

			testUtil.trigger(window.testContainer, CONTEXT_MENU_EVENT);
			testUtil.trigger(window.testContainer, CONTEXT_MENU_EVENT);

			assert.equal(document.querySelectorAll('.context-menu').length, 0);
		});
	});
});
