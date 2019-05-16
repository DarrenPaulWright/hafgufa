import { event } from 'd3';
import { method } from 'type-enforcer';
import { CONTEXT_MENU_EVENT } from '../../utility/domConstants';
import ContextMenu from '../other/ContextMenu';

const CONTEXT_MENU = Symbol();

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
			this.onRemove(() => {
				self[removeMenu]();
			});
		}

		[removeMenu]() {
			if (this[CONTEXT_MENU]) {
				this[CONTEXT_MENU].remove();
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
			set: function(contextMenu) {
				const self = this;
				const hasMenu = contextMenu && contextMenu.length;

				self.set(CONTEXT_MENU_EVENT, () => {
					event.preventDefault();

					self[removeMenu]();

					self[CONTEXT_MENU] = new ContextMenu({
						menuItems: self.contextMenu(),
						onSelect: (item) => {
							if (self.onContextMenuChange()) {
								self.onContextMenuChange()(item);
							}
						},
						onRemove: () => {
							self[CONTEXT_MENU] = null;
						}
					});
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
