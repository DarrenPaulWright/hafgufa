import { BODY, CLICK_EVENT, CONTEXT_MENU_EVENT } from '../utility/domConstants.js';
import setDefaults from '../utility/setDefaults.js';
import './ContextMenu.less';
import Menu from './Menu.js';

const CONTEXT_MENU_CLASS = 'context-menu';

/**
 * Builds a context menu
 *
 * @class ContextMenu
 * @extends Menu
 *
 * @param {object} settings - All the settings for Popup plus the following:
 * @param {object} settings.menuItems - see Tree.branches
 */
export default class ContextMenu extends Menu {
	constructor(settings = {}) {
		let isInit = false;

		super(setDefaults({ minWidth: 160 }, settings));

		const self = this;
		const onContextMenu = () => {
			if (isInit) {
				self.remove();
			}
			isInit = true;
		};

		BODY.addEventListener(CONTEXT_MENU_EVENT, onContextMenu);
		BODY.addEventListener(CLICK_EVENT, onContextMenu);

		self.addClass(CONTEXT_MENU_CLASS)
			.onRemove(() => {
				BODY.removeEventListener(CONTEXT_MENU_EVENT, onContextMenu);
				BODY.removeEventListener(CLICK_EVENT, onContextMenu);
			});
	}
}
