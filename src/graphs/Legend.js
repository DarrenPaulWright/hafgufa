import { color, select } from 'd3';
import { applySettings, methodArray, methodQueue, methodString } from 'type-enforcer-ui';
import Control from '../Control.js';
import controlTypes from '../controlTypes.js';
import d3Helper from '../utility/d3Helper.js';
import { CLICK_EVENT, HEIGHT, MOUSE_OUT_EVENT, MOUSE_OVER_EVENT, OPACITY, WIDTH } from '../utility/domConstants.js';
import setDefaults from '../utility/setDefaults.js';
import { DURATION, FADE_OPACITY, HILITE_OPACITY, START_OPACITY } from './graphConstants.js';
import './Legend.less';

const ITEM_OFFSET = 20;
const TEXT_PADDING = 6;
const PADDING = 12;
const RADIUS = 6;
const CHECKBOX_OFFSET = 20;
const COLOR_MULTIPLIER = 4.5;

const BACKGROUND = Symbol();
const TEXT = Symbol();
const TITLE = Symbol();
const ITEMS = Symbol();
const ITEM_ELEMENTS = Symbol();
const D3_COLOR = Symbol();
const UNCHECKED_ITEMS = Symbol();

const setCheckedCharacter = Symbol();
const toggleItem = Symbol();

/**
 * @class Legend
 * @extends Control
 *
 * @param {object} settings
 */
export default class Legend extends Control {
	constructor(settings = {}) {
		super(setDefaults({
			type: controlTypes.LEGEND,
			element: 'svg:g'
		}, settings));

		const self = this;
		self.addClass('legend');

		self[ITEMS] = [];
		self[ITEM_ELEMENTS] = [];
		self[UNCHECKED_ITEMS] = [];

		self[BACKGROUND] = select(self.element).append('rect')
			.classed('legend-background', true)
			.attr(WIDTH, PADDING * 2)
			.attr(HEIGHT, PADDING * 2);

		self.onMouseOverItem(() => {
			d3Helper.fade(
				self[ITEM_ELEMENTS].selectAll('.legend-dots'),
				DURATION,
				FADE_OPACITY
			);
			d3Helper.fade(select(this).select('.legend-dots'), DURATION, HILITE_OPACITY);
		});
		self.onMouseOutItem(() => {
			d3Helper.fade(
				self[ITEM_ELEMENTS].selectAll('.legend-dots'),
				DURATION,
				START_OPACITY
			);
		});

		applySettings(self, settings);

		self.onRemove(() => {
			self[BACKGROUND].remove();
			self[BACKGROUND] = null;
			if (self[TITLE]) {
				self[TITLE].remove();
				self[TITLE] = null;
			}
			if (self[TEXT]) {
				self[TEXT].remove();
				self[TEXT] = null;
			}
			if (self[ITEM_ELEMENTS]) {
				self[ITEM_ELEMENTS].remove();
				self[ITEM_ELEMENTS] = null;
			}
		});
	}

	[setCheckedCharacter](d) {
		return this[UNCHECKED_ITEMS].includes(d) ? '\uF096' : '\uF14A';
	}

	[toggleItem](d) {
		const self = this;

		if (!self[UNCHECKED_ITEMS].includes(d)) {
			self[UNCHECKED_ITEMS].push(d);
		}
		else {
			self[UNCHECKED_ITEMS] = self[UNCHECKED_ITEMS].filter((item) => item !== d);
		}
		select(this)
			.select('.legend-check')
			.html((d) => self[setCheckedCharacter](d));
		self.onSelectionChange()
			.trigger(null, [self.items()[0].items.filter((item) => !self[UNCHECKED_ITEMS].includes(item))]);
	}
}

Object.assign(Legend.prototype, {
	items: methodArray({
		set(newValue) {
			const self = this;
			const TEXT_X = (RADIUS * 2) + TEXT_PADDING + CHECKBOX_OFFSET;
			const getY = (d, index) => ((index + 1) * ITEM_OFFSET) + PADDING + RADIUS;

			if (newValue.length !== 0) {
				self[ITEMS] = newValue[0].items;
				self[D3_COLOR] = color(self.color());

				self[TITLE] = select(self.element).selectAll('.legend-title')
					.data([newValue[0].title])
					.enter()
					.append('text')
					.classed('legend-title', true);
				self[TITLE]
					.attr('alignment-baseline', 'top')
					.attr('dx', PADDING)
					.attr('dy', () => d3Helper.maxTextHeight(self[TITLE]) + PADDING)
					.text((d) => d);

				select(self.element).selectAll('g').remove();

				self[ITEM_ELEMENTS] = select(self.element).selectAll('g')
					.data(self[ITEMS])
					.enter()
					.append('g')
					.attr('transform', (d, index) => 'translate(' + PADDING + ',' + getY(d, index) + ')')
					.on(MOUSE_OVER_EVENT, function(d) {
						self.onMouseOverItem().trigger(null, [d]);
					})
					.on(MOUSE_OUT_EVENT, function(d) {
						self.onMouseOutItem().trigger(null, [d]);
					})
					.on(CLICK_EVENT, () => {
						self[toggleItem]();
					});

				self[ITEM_ELEMENTS]
					.append('text')
					.classed('legend-check', true)
					.attr('alignment-baseline', 'middle')
					.html((d) => self[setCheckedCharacter](d));

				self[ITEM_ELEMENTS]
					.append('circle')
					.classed('legend-dots', true)
					.style('fill', (d) => self.itemColor(d))
					.attr('cx', RADIUS + CHECKBOX_OFFSET)
					.attr('cy', -1)
					.style(OPACITY, START_OPACITY)
					.attr('r', RADIUS);

				self[TEXT] = self[ITEM_ELEMENTS]
					.append('text')
					.classed('legend-text', true)
					.attr('alignment-baseline', 'middle')
					.attr('dx', TEXT_X)
					.text((d) => d);

				self[BACKGROUND]
					.attr(WIDTH, d3Helper.maxTextWidth(self[TEXT]) + TEXT_X + (PADDING * 2) + CHECKBOX_OFFSET)
					.attr(HEIGHT, ((newValue.length - 1) * ITEM_OFFSET) + (PADDING + RADIUS) * 2);
			}
		}
	}),

	itemColor(item) {
		const self = this;

		return self[D3_COLOR].brighter(((self[ITEMS].indexOf(item) + 1) / self[ITEMS].length) * COLOR_MULTIPLIER);
	},

	color: methodString({
		init: '#b24f26',
		set() {
			this.items(this.items(), true);
		}
	}),

	onMouseOverItem: methodQueue(),

	onMouseOutItem: methodQueue(),

	onSelectionChange: methodQueue()
});
