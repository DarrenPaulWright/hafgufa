import { select } from 'd3';
import uuid from 'uuid/v4';
import { BODY, CLICK_EVENT, CONTEXT_MENU_EVENT } from '../../utility/domConstants';
import './ContextMenu.less';
import Menu from './Menu';

const CONTEXT_MENU_CLASS = 'context-menu';

/**
 * Builds a context menu
 * @module ContextMenu
 * @constructor
 *
 * @arg {Object} settings - All the settings for Popup plus the following:
 * @arg {Object} settings.menuItems - see Tree.branches
 */
export default class ContextMenu extends Menu {
	constructor(settings = {}) {
		let isInit = false;
		const id = '.' + uuid();

		settings.minWidth = settings.minWidth || 160;

		super(settings);

		const self = this;
		const onContextMenu = () => {
			if (isInit) {
				self.remove();
			}
			isInit = true;
		};
		const setEvents = (callback) => {
			select(BODY)
				.on(CONTEXT_MENU_EVENT + id, callback)
				.on(CLICK_EVENT + id, callback);
		};

		setEvents(onContextMenu);
		self.addClass(CONTEXT_MENU_CLASS)
			.onRemove(() => setEvents(null));
	}
}
