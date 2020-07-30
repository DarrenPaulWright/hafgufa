import { defer } from 'async-agent';
import { Collection } from 'hord';
import shortid from 'shortid';
import {
	applySettings,
	AUTO,
	DockPoint,
	HUNDRED_PERCENT,
	methodArray,
	methodBoolean,
	methodDockPoint,
	methodElement,
	methodFunction,
	methodObject,
	methodQueue,
	methodString
} from 'type-enforcer-ui';
import Control from '../Control.js';
import controlTypes from '../controlTypes.js';
import BackDrop from '../elements/BackDrop.js';
import Button from '../elements/Button.js';
import Div from '../elements/Div.js';
import Tree from '../forms/Tree.js';
import { MENU_ICON } from '../icons.js';
import FocusMixin from '../mixins/FocusMixin.js';
import assign from '../utility/assign.js';
import { IS_DESKTOP } from '../utility/browser.js';
import locale from '../utility/locale.js';
import setDefaults from '../utility/setDefaults.js';
import Drawer from './Drawer.js';
import './DrawerMenu.less';

const MENU_BUTTON = Symbol();
const BACKDROP = Symbol();
const DRAWER = Symbol();
const HEADER_CONTAINER = Symbol();
const HEADER = Symbol();
const TREE = Symbol();
const FOOTER = Symbol();
const SELECTED = Symbol();

const toggleMenu = Symbol();
const buildMenu = Symbol();
const clearMenu = Symbol();

/**
 * Display a main drawer menu.
 *
 * @module DrawerMenu
 * @class
 *
 * @param {object} settings
 */
export default class DrawerMenu extends FocusMixin(Control) {
	constructor(settings = {}) {
		const menuButton = new Button({
			classes: 'header-button',
			label: settings.label !== undefined ? settings.label : locale.get('menu'),
			icon: MENU_ICON,
			onClick() {
				self[toggleMenu]();
			}
		});

		super(setDefaults({
			type: controlTypes.DRAWER_MENU,
			width: AUTO,
			isMenuOpen: IS_DESKTOP
		}, settings, {
			FocusMixin: assign(settings.FocusMixin, {
				mainControl: menuButton
			})
		}));

		const self = this;
		self.addClass('drawer-menu-container');

		self[MENU_BUTTON] = menuButton.container(self);

		applySettings(self, settings, [], ['menuContainer', 'isMenuOpen']);

		self.onRemove(() => {
			if (self[DRAWER]) {
				self[DRAWER].remove();
				self[DRAWER] = null;
			}
		});
	}

	[toggleMenu]() {
		const self = this;

		if (!self.isRemoved) {
			self[DRAWER].isOpen(!self[DRAWER].isOpen());
		}
	}

	[buildMenu]() {
		const self = this;
		const menuItems = self.menuItems();
		const headerControl = self.headerControl();
		const headerSettings = self.headerSettings();
		const footerContent = self.footerContent();

		self[clearMenu]();

		if (headerControl) {
			self[HEADER_CONTAINER] = new Div({
				container: self[DRAWER],
				classes: 'drawer-menu-header'
			});
			self[HEADER] = new headerControl({
				container: self[HEADER_CONTAINER],
				...headerSettings
			});
		}

		if (menuItems.length !== 0) {
			self[TREE] = new Tree({
				container: self[DRAWER],
				width: HUNDRED_PERCENT,
				branches: menuItems,
				onSelect(id) {
					self.select(id);
				},
				value: [self[SELECTED]]
			});
		}

		if (footerContent.length !== 0) {
			self[FOOTER] = new Div({
				container: self[DRAWER],
				classes: 'footer',
				content: footerContent,
				width: HUNDRED_PERCENT
			});
		}

		self[DRAWER].resize(true);
	}

	[clearMenu]() {
		const self = this;

		if (self[HEADER]) {
			self[HEADER].remove();
			self[HEADER] = null;
			self[HEADER_CONTAINER].remove();
			self[HEADER_CONTAINER] = null;
		}
		if (self[TREE]) {
			self[TREE].remove();
			self[TREE] = null;
		}
		if (self[FOOTER]) {
			self[FOOTER].remove();
			self[FOOTER] = null;
		}
	}
}

Object.assign(DrawerMenu.prototype, {
	icon: methodString({
		init: MENU_ICON,
		set(icon) {
			this[MENU_BUTTON].icon(icon);
		}
	}),

	onMenuSlide: methodQueue(),

	isMenuOpen: methodBoolean({
		set(isMenuOpen) {
			const self = this;

			if (self[DRAWER] && isMenuOpen !== self[DRAWER].isOpen()) {
				defer(() => {
					self[toggleMenu]();
				});
			}
		},
		get() {
			return this[DRAWER] ? this[DRAWER].isOpen() : false;
		}
	}),

	onSelect: methodFunction(),

	select(id) {
		const self = this;

		if (self[SELECTED] !== id) {
			const onSelect = self.onSelect();

			self[SELECTED] = id;

			if (self[TREE]) {
				self[TREE].value([id]);
			}

			if (onSelect) {
				const item = self.menuItems().find((menuItem) => menuItem.id === id);
				onSelect(item);
			}

			if (!IS_DESKTOP) {
				self[DRAWER].isOpen(false);
			}
		}
	},

	unSelect() {
		const self = this;

		self[SELECTED] = null;

		if (self[TREE]) {
			self[TREE].value([]);
		}
	},

	menuContainer: methodElement({
		set(menuContainer) {
			const self = this;

			self[DRAWER] = new Drawer({
				container: menuContainer,
				classes: 'drawer-menu',
				width: '18rem',
				maxWidth: '80vmin',
				isAnimated: !IS_DESKTOP,
				dock: self.drawerDock().primary(),
				overlap: !IS_DESKTOP,
				isOpen: false,
				onOpen() {
					defer(() => {
						if (!IS_DESKTOP) {
							self[BACKDROP] = new BackDrop({
								container: self.menuContainer(),
								prepend: self[DRAWER].element,
								onRemove() {
									self[DRAWER].isOpen(false);
								}
							});
						}
						self[buildMenu]();
					});

					self.onMenuSlide().trigger(null, [true]);
				},
				onClose() {
					if (self[BACKDROP]) {
						self[BACKDROP].remove();
						self[BACKDROP] = null;
					}
					self[clearMenu]();

					self.onMenuSlide().trigger(null, [false]);
				},
				onResize(width, height) {
					if (this.isOpen() && (self[TREE] || self[HEADER_CONTAINER])) {
						if (self[TREE]) {
							height -= self[TREE].marginHeight;

							if (self[HEADER_CONTAINER]) {
								height -= self[HEADER_CONTAINER].outerHeight();
							}
						}
						if (self[FOOTER]) {
							height -= self[FOOTER].outerHeight();
						}

						if (self[TREE]) {
							self[TREE].maxHeight(height);
						}
						else if (self[HEADER_CONTAINER]) {
							self[HEADER_CONTAINER].height(height - self[HEADER_CONTAINER].marginHeight);
						}
					}
				},
				onRemove() {
					self[clearMenu]();
				}
			});
		}
	}),

	headerControl: methodFunction(),

	headerSettings: methodObject(),

	menuItems: methodArray({
		set(menuItems) {
			const self = this;

			new Collection(menuItems).eachChild((item) => {
				item.id = item.id || shortid.generate();
			});

			if (self[DRAWER] && self[DRAWER].isOpen()) {
				if (self[TREE]) {
					self[TREE].branches(menuItems);
				}
				else {
					self[buildMenu]();
				}
			}
		}
	}),

	footerContent: methodArray(),

	drawerDock: methodDockPoint({
		init: new DockPoint(DockPoint.POINTS.LEFT),
		set(drawerDock) {
			if (this[DRAWER]) {
				this[DRAWER].dock(drawerDock);
			}
		}
	})
});
