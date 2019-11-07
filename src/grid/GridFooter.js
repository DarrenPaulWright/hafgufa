import { applySettings, method } from 'type-enforcer-ui';
import Control from '../Control';
import controlTypes from '../controlTypes';
import Button from '../elements/Button';
import Div from '../elements/Div';
import { COMPRESS_ICON, EXPAND_ICON } from '../icons';
import locale from '../utility/locale';
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
 * @module GridFooter
 * @constructor
 *
 * @arg {Object} settings
 */
export default class GridFooter extends Control {
	constructor(settings = {}) {
		settings.type = settings.type || controlTypes.GRID_FOOTER;

		super(settings);

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
	 * @method showExpandCollapseButtons
	 * @member module:GridFooter
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
	 * @member module:GridFooter
	 * @instance
	 * @arg {String} [countSuffix]
	 * @returns {String|this}
	 */
	countSuffix: method.string({
		init: 'items',
		set() {
			this[setCountString]();
		}
	}),

	/**
	 * @method count
	 * @member module:GridFooter
	 * @instance
	 * @arg {String} [count]
	 * @returns {String|this}
	 */
	count: method.integer({
		init: 0,
		set: setCountString
	}),

	/**
	 * @method groupSuffixes
	 * @member module:GridFooter
	 * @instance
	 * @arg {String} [groupSuffixes]
	 * @returns {String|this}
	 */
	groupSuffixes: method.array({
		init: [],
		set: setCountString
	}),

	/**
	 * @method groupCounts
	 * @member module:GridFooter
	 * @instance
	 * @arg {String} [groupCounts]
	 * @returns {String|this}
	 */
	groupCounts: method.array({
		set: setCountString
	}),

	/**
	 * @method onCollapseAllGroups
	 * @member module:GridFooter
	 * @instance
	 * @arg {Function} [onCollapseAllGroups]
	 * @returns {Function|this}
	 */
	onCollapseAllGroups: method.function({
		other: undefined
	})
});
