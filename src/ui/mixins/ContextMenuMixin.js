import { method } from 'type-enforcer-ui';
import { CONTEXT_MENU_EVENT } from '../../utility/domConstants';
import ContextMenu from '../other/ContextMenu';

let contextMenu;
let contextMenuSource;
let contextMenuStart;

const removeMenu = Symbol();

/**
 * Adds methods for a context menu
 *
 * @module ContextMenuAddon
 * @constructor
 */
export default (Base) => {
	class ContextMenuMixin extends Base {
		constructor(settings = {}) {
			super(settings);

			const self = this;
			self.onRemove(() => {
				self[removeMenu]();
			});
		}

		[removeMenu]() {
			if (contextMenu && (contextMenuSource === this || (Date.now() - contextMenuStart) > 200)) {
				contextMenu.remove();
			}
		}
	}

	Object.assign(ContextMenuMixin.prototype, {
		/**
		 * Get or set the options for a context menu
		 *
		 * @method contextMenu
		 * @memberof ContextMenuMixin
		 * @instance
		 *
		 * @arg {Array|null} contextMenu
		 *
		 * @returns {Array|this}
		 */
		contextMenu: method.array({
			init: null,
			set(menuItems) {
				const self = this;
				const hasMenu = menuItems && menuItems.length;

				self.set(CONTEXT_MENU_EVENT, (event) => {
					event.preventDefault();

					self[removeMenu]();

					if (!contextMenu) {
						contextMenuSource = self;
						contextMenuStart = Date.now();

						contextMenu = new ContextMenu({
							menuItems: self.contextMenu(),
							onSelect(item) {
								if (self.onContextMenuChange()) {
									self.onContextMenuChange()(item);
								}
							},
							onRemove() {
								contextMenuSource = null;
								contextMenu = null;
							}
						});
					}
					else {
						const last = contextMenu.menuItems()[contextMenu.menuItems().length - 1];
						if (!last.classes) {
							last.classes = '';
						}
						last.classes += ' separator';
						contextMenu.menuItems(contextMenu.menuItems().concat(self.contextMenu()));
					}
				}, hasMenu);

				if (!hasMenu) {
					self[removeMenu]();
				}
			},
			other: null
		}),

		/**
		 * Get or set a callback function that gets called whenever a contextmenu item is clicked
		 *
		 * @method onContextMenuChange
		 * @memberof ContextMenuMixin
		 * @instance
		 *
		 * @arg {Function} onContextMenuChange
		 *
		 * @returns {Function|this}
		 */
		onContextMenuChange: method.function({
			other: undefined
		})
	});

	return ContextMenuMixin;
}
