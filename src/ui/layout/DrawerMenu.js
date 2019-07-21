import { defer } from 'async-agent';
import { AUTO, DockPoint, enforce, HUNDRED_PERCENT, method } from 'type-enforcer';
import uuid from 'uuid/v4';
import { IS_DESKTOP } from '../../utility/browser';
import collectionHelper from '../../utility/collectionHelper';
import dom from '../../utility/dom';
import objectHelper from '../../utility/objectHelper';
import windowResize from '../../utility/windowResize';
import Control from '../Control';
import controlTypes from '../controlTypes';
import BackDrop from '../elements/BackDrop';
import Button from '../elements/Button';
import Div from '../elements/Div';
import Tree from '../forms/Tree';
import { MENU_ICON } from '../icons';
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
		settings.width = enforce.cssSize(settings.width, AUTO, true);
		settings.isMenuOpen = enforce.boolean(settings.isMenuOpen, IS_DESKTOP);

		super(settings);

		const self = this;
		self.addClass('drawer-menu-container');

		const strings = settings.localizedStrings || {};

		self[MENU_BUTTON] = new Button({
			container: self.element(),
			classes: 'header-button',
			label: strings.menu,
			icon: MENU_ICON,
			onClick: function() {
				self[toggleMenu]();
			}
		});

		objectHelper.applySettings(self, settings);

		self.onResize(() => {
			let treeHeight = 0;
			if (self[DRAWER].isOpen()) {
				treeHeight = self[DRAWER].borderHeight() - dom.get.margins.height(self[TREE]);
				if (self[HEADER]) {
					treeHeight -= dom.get.outerHeight(self[HEADER_CONTAINER]);
				}
				if (self[FOOTER]) {
					treeHeight -= dom.get.outerHeight(self[FOOTER]);
				}
				self[TREE].height(treeHeight);
			}
		});

		self.onRemove(() => {
			if (self[DRAWER]) {
				self[DRAWER].remove();
				self[DRAWER] = null;
			}
			self[MENU_BUTTON].remove();
			self[MENU_BUTTON] = null;
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
				classes: 'self[DRAWER]-menu-header'
			});
			self[HEADER] = new headerControl({
				container: self[HEADER_CONTAINER],
				...headerSettings
			});
		}

		if (menuItems) {
			self[TREE] = new Tree({
				container: self[DRAWER],
				width: HUNDRED_PERCENT,
				branches: menuItems,
				isMultiSelect: false,
				onSelect: function(item) {
					const onSelect = self.onSelect();

					if (onSelect) {
						item = self.menuItems().find((menuItem) => menuItem.ID === item);
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

		self.resize();
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
	icon: method.string({
		init: MENU_ICON,
		set: function(icon) {
			this[MENU_BUTTON].icon(icon);
		}
	}),

	onMenuSlide: method.queue(),

	isMenuOpen: method.boolean({
		set: function(isMenuOpen) {
			const self = this;

			if (self[DRAWER] && isMenuOpen !== self[DRAWER].isOpen()) {
				defer(() => {
					self[toggleMenu]();
				});
			}
		},
		get: function() {
			return this[DRAWER] ? this[DRAWER].isOpen() : false;
		}
	}),

	onSelect: method.function(),

	menuContainer: method.element({
		set: function(menuContainer) {
			const self = this;

			self[DRAWER] = new Drawer({
				container: menuContainer,
				classes: 'drawer-menu',
				width: '18rem',
				maxWidth: '80vmin',
				isAnimated: !IS_DESKTOP,
				dock: self.drawerDock().primary(),
				overlap: !IS_DESKTOP,
				onOpen: () => {
					if (!IS_DESKTOP) {
						self[BACKDROP] = new BackDrop({
							container: self.menuContainer(),
							prepend: self[DRAWER].element(),
							onRemove: () => {
								self[DRAWER].isOpen(false);
							}
						});
					}
					self[buildMenu]();

					if (IS_DESKTOP) {
						windowResize.trigger();
					}

					self.onMenuSlide().trigger(null, [true]);
				},
				onClose: () => {
					if (self[BACKDROP]) {
						self[BACKDROP].remove();
						self[BACKDROP] = null;
					}
					self[clearMenu]();

					if (IS_DESKTOP) {
						windowResize.trigger();
					}

					self.onMenuSlide().trigger(null, [false]);
				},
				onRemove: () => {
					self[clearMenu]();
				}
			});

			self[DRAWER].isOpen(true);
		}
	}),

	headerControl: method.function(),

	headerSettings: method.object(),

	menuItems: method.array({
		set: function(menuItems) {
			const self = this;
			collectionHelper.eachChild(menuItems, (item) => {
				item.ID = item.ID || uuid();
			});

			if (self[DRAWER].isOpen()) {
				self[TREE].branches(menuItems);
			}
		}
	}),

	footerContent: method.array(),

	drawerDock: method.dockPoint({
		init: new DockPoint('LEFT'),
		set: function(drawerDock) {
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
	focus: () => {
		this[MENU_BUTTON].isFocused(true);
	},

	/**
	 * See if this control has focus.
	 * @method isFocused
	 * @member module:DrawerMenu
	 * @instance
	 * @returns {Boolean}
	 */
	isFocused: (isFocused) => {
		const self = this;

		if (self) {
			if (isFocused !== undefined) {
				self[MENU_BUTTON].isFocused(isFocused);

				return self;
			}

			return self[MENU_BUTTON].isFocused() || (self[DRAWER] ? dom.hasActive(self[DRAWER]) : false);
		}
	}
});
