import { applySettings, methodArray, methodFunction, methodInteger, methodString } from 'type-enforcer-ui';
import Control from '../Control.js';
import controlTypes from '../controlTypes.js';
import Button from '../elements/Button.js';
import Div from '../elements/Div.js';
import { COMPRESS_ICON, EXPAND_ICON } from '../icons.js';
import locale from '../utility/locale.js';
import setDefaults from '../utility/setDefaults.js';
import './GridFooter.less';

const SPACER = ' • ';

const FOOTER_LEFT = Symbol();
const FOOTER_RIGHT = Symbol();
const EXPAND_ALL_BUTTON = Symbol();
const COLLAPSE_ALL_BUTTON = Symbol();

const setCountString = Symbol();

/**
 * Builds a footer for the grid control.
 *
 * @class GridFooter
 *
 * @param {object} settings
 */
export default class GridFooter extends Control {
	constructor(settings = {}) {
		super(setDefaults({
			type: controlTypes.GRID_FOOTER
		}, settings));

		const self = this;
		self.addClass('grid-footer');

		self[FOOTER_LEFT] = new Div({
			container: self,
			classes: 'grid-footer-left'
		});
		self[FOOTER_RIGHT] = new Div({
			container: self,
			classes: 'grid-footer-right'
		});

		applySettings(self, settings);

		self[setCountString]();

		self.onRemove(() => {
			if (self[EXPAND_ALL_BUTTON]) {
				self[EXPAND_ALL_BUTTON].remove();
			}
			if (self[COLLAPSE_ALL_BUTTON]) {
				self[COLLAPSE_ALL_BUTTON].remove();
			}
		});
	}

	/**
	 * Build a string of counts based on various set properties
	 *
	 * @function setCountString
	 */
	[setCountString]() {
		const self = this;
		let displayString = '';

		self.groupSuffixes().forEach((suffix, index) => {
			displayString += ' ' + (self.groupCounts()[index] || 0) + ' ' + suffix;
		});

		if (displayString !== '') {
			displayString += SPACER;
		}

		displayString += self.count() + ' ' + self.countSuffix();

		self[FOOTER_RIGHT].content(displayString);
	}
}

Object.assign(GridFooter.prototype, {
	/**
	 * Add a footer to the grid. The footer will automatically display expand all/collapse all buttons if the rows are
	 * being grouped.
	 *
	 * @method showExpandCollapseButtons
	 * @memberOf GridFooter
	 * @instance
	 */
	showExpandCollapseButtons() {
		const self = this;

		if (!self[EXPAND_ALL_BUTTON]) {
			self[EXPAND_ALL_BUTTON] = new Button({
				container: self[FOOTER_LEFT],
				icon: EXPAND_ICON,
				iconSize: Button.ICON_SIZES.NORMAL,
				classes: 'icon-button',
				label: locale.get('expandAll'),
				onClick() {
					if (self.onCollapseAllGroups()) {
						self.onCollapseAllGroups()(false);
					}
				}
			});

			self[COLLAPSE_ALL_BUTTON] = new Button({
				container: self[FOOTER_LEFT],
				icon: COMPRESS_ICON,
				iconSize: Button.ICON_SIZES.NORMAL,
				classes: 'icon-button',
				label: locale.get('collapseAll'),
				onClick() {
					if (self.onCollapseAllGroups()) {
						self.onCollapseAllGroups()(true);
					}
				}
			});
		}
	},

	/**
	 * @method countSuffix
	 * @memberOf GridFooter
	 * @instance
	 * @param {string} [countSuffix]
	 * @returns {string|this}
	 */
	countSuffix: methodString({
		init: 'items',
		set() {
			this[setCountString]();
		}
	}),

	/**
	 * @method count
	 * @memberOf GridFooter
	 * @instance
	 * @param {string} [count]
	 * @returns {string|this}
	 */
	count: methodInteger({
		init: 0,
		set: setCountString
	}),

	/**
	 * @method groupSuffixes
	 * @memberOf GridFooter
	 * @instance
	 * @param {string} [groupSuffixes]
	 * @returns {string|this}
	 */
	groupSuffixes: methodArray({
		init: [],
		set: setCountString
	}),

	/**
	 * @method groupCounts
	 * @memberOf GridFooter
	 * @instance
	 * @param {string} [groupCounts]
	 * @returns {string|this}
	 */
	groupCounts: methodArray({
		set: setCountString
	}),

	/**
	 * @method onCollapseAllGroups
	 * @memberOf GridFooter
	 * @instance
	 * @param {Function} [onCollapseAllGroups]
	 * @returns {Function|this}
	 */
	onCollapseAllGroups: methodFunction({
		other: undefined
	})
});
