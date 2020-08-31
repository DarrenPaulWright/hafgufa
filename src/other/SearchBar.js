import {
	applySettings,
	AUTO,
	HUNDRED_PERCENT,
	methodArray,
	methodBoolean,
	methodQueue,
	methodString
} from 'type-enforcer-ui';
import Control from '../Control.js';
import controlTypes from '../controlTypes.js';
import Button from '../elements/Button.js';
import Div from '../elements/Div.js';
import Tags from '../forms/Tags.js';
import { SEARCH_ICON } from '../icons.js';
import { IS_PHONE } from '../utility/browser.js';
import locale from '../utility/locale.js';
import setDefaults from '../utility/setDefaults.js';
import './SearchBar.less';

const MENU_BUTTON = Symbol();
const SEARCH_BAR = Symbol();
const SEARCH_BAR_CONTAINER = Symbol();
const TAGS = Symbol();
const IS_SEARCH_BAR_OPEN = Symbol();

const toggleSearchBar = Symbol();
const showSearchBar = Symbol();
const buildSearchBar = Symbol();
const clearSearchBar = Symbol();

/**
 * Display a search button that shows or hides a search bar.
 *
 * @class SearchBar
 * @extends Control
 *
 * @param {object} settings
 */
export default class SearchBar extends Control {
	constructor(settings = {}) {
		super(setDefaults({
			type: controlTypes.SEARCH_BAR,
			width: AUTO
		}, settings));

		const self = this;

		self[IS_SEARCH_BAR_OPEN] = false;

		self.addClass('align-right search-bar-header');

		if (IS_PHONE) {
			self[MENU_BUTTON] = new Button({
				container: self.element,
				classes: 'header-button',
				label: settings.isCompact ? null : locale.get('search'),
				icon: SEARCH_ICON,
				isSelectable: true,
				onClick() {
					self[toggleSearchBar]();
				}
			});
		}
		else {
			self[buildSearchBar](self.element, '20rem');
		}

		applySettings(self, settings);

		self.onResize(() => {
				if (self[SEARCH_BAR]) {
					self[TAGS].width(self[SEARCH_BAR].innerWidth() - 1);
				}
			})
			.onRemove(() => {
				self[clearSearchBar]();
				if (self[SEARCH_BAR_CONTAINER]) {
					self[SEARCH_BAR_CONTAINER].remove();
					self[SEARCH_BAR_CONTAINER] = null;
				}
				if (self[SEARCH_BAR]) {
					self[SEARCH_BAR].remove();
					self[SEARCH_BAR] = null;
				}
				if (self[MENU_BUTTON]) {
					self[MENU_BUTTON].remove();
					self[MENU_BUTTON] = null;
				}
			});
	}

	[toggleSearchBar]() {
		if (this[IS_SEARCH_BAR_OPEN]) {
			this.hideSearchBar();
		}
		else {
			this[showSearchBar]();
		}
	}

	[showSearchBar]() {
		const self = this;

		if (!self[IS_SEARCH_BAR_OPEN]) {
			self[SEARCH_BAR_CONTAINER] = new Div({
				container: self.container().parentNode,
				prepend: self.container(),
				classes: 'search-bar-container',
				css: {
					top: self.container().offsetHeight
				}
			});

			self[SEARCH_BAR] = new Div({
				container: self[SEARCH_BAR_CONTAINER],
				classes: 'search-bar'
			});

			self[buildSearchBar](self[SEARCH_BAR], HUNDRED_PERCENT);
			self[TAGS].isFocused(true);
		}

		self[IS_SEARCH_BAR_OPEN] = true;
	}

	[buildSearchBar](container, tagsWidth) {
		const self = this;

		self[clearSearchBar]();

		const onSearch = () => {
			self.onChange().trigger(null, [self[TAGS].value()]);
		};

		self[TAGS] = new Tags({
			container,
			breakOnSpaces: self.breakOnSpaces(),
			placeholder: locale.get('search'),
			suggestions: self.suggestions(),
			actionButtonIcon: SEARCH_ICON,
			isActionButtonAutoHide: false,
			actionButtonOnClick: onSearch,
			width: tagsWidth,
			onChange: onSearch
		});

		self.resize();
	}

	[clearSearchBar]() {
		if (this[TAGS]) {
			this[TAGS].remove();
			this[TAGS] = null;
		}
	}
}

Object.assign(SearchBar.prototype, {
	suggestions: methodArray({
		set(suggestions) {
			if (this[TAGS]) {
				this[TAGS].suggestions(suggestions);
			}
		}
	}),

	/**
	 * @method onChange
	 * @memberOf SearchBar
	 * @instance
	 * @param {Function} [callback]
	 * @returns {queue}
	 */
	onChange: methodQueue(),

	/**
	 * Get the search bar container, if it exists
	 *
	 * @method searchBarContainer
	 * @memberOf SearchBar
	 * @instance
	 *
	 * @returns {object}
	 */
	searchBarContainer() {
		return this[SEARCH_BAR_CONTAINER];
	},

	countText: methodString({
		set(countText) {
			if (this[TAGS]) {
				this[TAGS].countText(countText);
			}
		}
	}),

	/**
	 * @method hideSearchBar
	 * @memberOf SearchBar
	 * @instance
	 */
	hideSearchBar() {
		const self = this;

		if (self[IS_SEARCH_BAR_OPEN]) {
			self[clearSearchBar]();
			self[SEARCH_BAR].remove();
			self[SEARCH_BAR] = null;
		}

		self[IS_SEARCH_BAR_OPEN] = false;
	},

	/**
	 * Set focus on the text input element.
	 *
	 * @method focus
	 * @memberOf SearchBar
	 * @instance
	 */
	focus() {
		this[MENU_BUTTON].isFocused(true);
	},

	/**
	 * See if this control has focus.
	 *
	 * @method isFocused
	 * @memberOf SearchBar
	 * @instance
	 * @returns {boolean}
	 */
	isFocused() {
		return (this[SEARCH_BAR] ? this[SEARCH_BAR].isFocused() : false) || this[MENU_BUTTON] ? this[MENU_BUTTON].isFocused() : false;
	},

	breakOnSpaces: methodBoolean({
		init: true,
		set(breakOnSpaces) {
			if (this[TAGS]) {
				this[TAGS].breakOnSpaces(breakOnSpaces);
			}
		}
	})

});
