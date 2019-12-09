import { defer } from 'async-agent';
import {
	applySettings,
	AUTO,
	DockPoint,
	enforceBoolean,
	enforceCssSize,
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
import uuid from 'uuid/v4';
import Control from '../Control';
import controlTypes from '../controlTypes';
import BackDrop from '../elements/BackDrop';
import Button from '../elements/Button';
import Div from '../elements/Div';
import Tree from '../forms/Tree';
import { MENU_ICON } from '../icons';
import { IS_DESKTOP } from '../utility/browser';
import collectionHelper from '../utility/collectionHelper';
import locale from '../utility/locale';
import Drawer from './Drawer';
import './DrawerMenu.less';
import Toolbar from './Toolbar';

const MENU_BUTTON = Symbol();
const BACKDROP = Symbol();
const DRAWER = Symbol();
const HEADER_CONTAINER = Symbol();
const HEADER = Symbol();
const TREE = Symbol();
const FOOTER = Symbol();

const toggleMenu = Symbol();
const buildMenu = Symbol();
const clearMenu = Symbol();

/**
 * Display a main drawer menu.
 *
 * @module DrawerMenu
 * @constructor
 *
 * @arg {Object} settings
 */
export default class DrawerMenu extends Control {
	constructor(settings = {}) {
		settings.type = settings.type || controlTypes.DRAWER_MENU;
		settings.width = enforceCssSize(settings.width, AUTO, true);
		settings.isMenuOpen = enforceBoolean(settings.isMenuOpen, IS_DESKTOP);

		super(settings);

		const self = this;
		self.addClass('drawer-menu-container');

		self[MENU_BUTTON] = new Button({
			container: self,
			classes: 'header-button',
			label: settings.label !== undefined ? settings.label : locale.get('menu'),
			icon: MENU_ICON,
			onClick() {
				self[toggleMenu]();
			}
		});

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
		let menuItems = self.menuItems();
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

		if (menuItems.length) {
			self[TREE] = new Tree({
				container: self[DRAWER],
				width: HUNDRED_PERCENT,
				branches: menuItems,
				isMultiSelect: false,
				onSelect(item) {
					const onSelect = self.onSelect();

					if (onSelect) {
						item = self.menuItems().find((menuItem) => menuItem.id === item);
						onSelect(item);
					}

					if (!IS_DESKTOP) {
						self[DRAWER].isOpen(false);
					}
				}
			});
		}

		if (footerContent.length) {
			self[FOOTER] = new Toolbar({
				container: self[DRAWER],
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
				isOpen: true,
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
			collectionHelper.eachChild(menuItems, (item) => {
				item.id = item.id || uuid();
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
		init: new DockPoint('LEFT'),
		set(drawerDock) {
			if (this[DRAWER]) {
				this[DRAWER].dock(drawerDock);
			}
		}
	}),

	/**
	 * Set focus on the text input element.
	 * @method focus
	 * @member module:DrawerMenu
	 * @instance
	 */
	focus() {
		this[MENU_BUTTON].isFocused(true);
	},

	/**
	 * See if this control has focus.
	 * @method isFocused
	 * @member module:DrawerMenu
	 * @instance
	 * @returns {Boolean}
	 */
	isFocused(isFocused) {
		const self = this;

		if (self) {
			if (isFocused !== undefined) {
				self[MENU_BUTTON].isFocused(isFocused);

				return self;
			}

			return self[MENU_BUTTON].isFocused() || (self[DRAWER] ? self[DRAWER].isFocused() : false);
		}
	}
});
