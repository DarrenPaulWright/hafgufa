import { AUTO, enforce, HUNDRED_PERCENT, method } from 'type-enforcer';
import { IS_PHONE } from '../../utility/browser';
import dom from '../../utility/dom';
import objectHelper from '../../utility/objectHelper';
import windowResize from '../../utility/windowResize';
import Control from '../Control';
import controlTypes from '../controlTypes';
import Button from '../elements/Button';
import Tags from '../forms/Tags';
import { SEARCH_ICON } from '../icons';
import Container from '../layout/Container';
import './SearchBar.less';

const STRINGS = Symbol();
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
 * @module SearchBar
 * @constructor
 *
 * @arg {Object} settings                           -
 */
export default class SearchBar extends Control {
	constructor(settings = {}) {
		settings.type = settings.type || controlTypes.SEARCH_BAR;
		settings.width = enforce.cssSize(settings.width, AUTO, true);

		super(settings);

		const self = this;

		self[STRINGS] = settings.localizedStrings || {};
		self[IS_SEARCH_BAR_OPEN] = false;

		self.addClass('align-right search-bar-header');

		if (IS_PHONE) {
			self[MENU_BUTTON] = new Button({
				container: self.element(),
				classes: 'header-button',
				label: settings.isCompact ? null : self[STRINGS].search,
				icon: SEARCH_ICON,
				isSelectable: true,
				onClick: function() {
					self[toggleSearchBar]();
				}
			});
		}
		else {
			self[buildSearchBar](self.element(), '20rem');
		}

		objectHelper.applySettings(self, settings);

		self.onResize(() => {
			if (self[SEARCH_BAR]) {
				self[TAGS].width(self[SEARCH_BAR].innerWidth() - 1);
			}
		});

		self.onRemove(() => {
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
			self[SEARCH_BAR_CONTAINER] = new Container({
				classes: 'search-bar-container',
				css: {
					top: dom.get.outerHeight(self.container())
				}
			});
			dom.appendBefore(self.container(), self[SEARCH_BAR_CONTAINER]);

			self[SEARCH_BAR] = new Container({
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
			container: container,
			breakOnSpaces: self.breakOnSpaces(),
			placeholder: self[STRINGS].search,
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
	suggestions: method.array({
		set: function(suggestions) {
			if (this[TAGS]) {
				this[TAGS].suggestions(suggestions);
			}
		}
	}),

	/**
	 * @method onChange
	 * @member module:SearchBar
	 * @instance
	 * @arg {function} [callback]
	 * @returns {queue}
	 */
	onChange: method.queue(),

	/**
	 * Get the search bar container, if it exists
	 *
	 * @method searchBarContainer
	 * @member module:SearchBar
	 * @instance
	 *
	 * @returns {object}
	 */
	searchBarContainer: function() {
		return this[SEARCH_BAR_CONTAINER];
	},

	countText: method.string({
		set: function(countText) {
			if (this[TAGS]) {
				this[TAGS].countText(countText);
			}
		}
	}),

	/**
	 * @method hideSearchBar
	 * @member module:SearchBar
	 * @instance
	 */
	hideSearchBar: function() {
		const self = this;

		if (self[IS_SEARCH_BAR_OPEN]) {
			self[clearSearchBar]();
			self[SEARCH_BAR].remove();
			self[SEARCH_BAR] = null;
			windowResize.trigger();
		}

		self[IS_SEARCH_BAR_OPEN] = false;
	},

	/**
	 * Set focus on the text input element.
	 * @method focus
	 * @member module:SearchBar
	 * @instance
	 */
	focus: function() {
		this[MENU_BUTTON].isFocused(true);
	},

	/**
	 * See if this control has focus.
	 * @method isFocused
	 * @member module:SearchBar
	 * @instance
	 * @returns {Boolean}
	 */
	isFocused: function() {
		return dom.hasActive(this[SEARCH_BAR]) || this[MENU_BUTTON] ? this[MENU_BUTTON].isFocused() : false;
	},

	breakOnSpaces: method.boolean({
		init: true,
		set: function(breakOnSpaces) {
			if (this[TAGS]) {
				this[TAGS].breakOnSpaces(breakOnSpaces);
			}
		}
	})

});
