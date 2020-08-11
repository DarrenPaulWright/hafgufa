import {
	applySettings,
	CssSize,
	HUNDRED_PERCENT,
	methodCssSize,
	methodEnum,
	methodFunction,
	PERCENT,
	PIXELS
} from 'type-enforcer-ui';
import controlTypes from '../controlTypes.js';
import DragMixin from '../mixins/DragMixin.js';
import { ORIENTATION } from '../uiConstants.js';
import { IS_DESKTOP } from '../utility/browser.js';
import clamp from '../utility/math/clamp.js';
import setDefaults from '../utility/setDefaults.js';
import Control from './../Control.js';
import './Resizer.less';

const RESIZER_CLASS = 'resizer';
const HORIZONTAL_CLASS = 'horizontal';
const VERTICAL_CLASS = 'vertical';
const DESKTOP_SIZE = new CssSize('0.4rem');
const TOUCH_SIZE = new CssSize('2rem');
const VISUAL_SIZE = new CssSize('0.032rem');

const SPLIT_OFFSET = Symbol();
const DIRECTION = Symbol();
const IS_HORIZONTAL = Symbol();
const AVAILABLE_SIZE = Symbol();
const MIN_OFFSET_PIXELS = Symbol();
const MAX_OFFSET_PIXELS = Symbol();

export const offsetToPixels = (offset, availableSize) => {
	if (!offset) {
		return 0;
	}
	if (offset.isPercent) {
		if (offset.value < 0) {
			return ((100 + offset.value) / 100) * availableSize;
		}

		return (offset.value / 100) * availableSize;
	}

	if (offset.value < 0) {
		return availableSize + offset.toPixels(true);
	}

	return offset.toPixels(true);
};

export const pixelsToOffset = (origin, pixels, availableSize) => {
	if (!origin) {
		return 0;
	}
	if (origin.isPercent) {
		if (origin.value < 0) {
			return -(100 - ((pixels / availableSize) * 100)) + PERCENT;
		}
		return (pixels / availableSize) * 100 + PERCENT;
	}
	if (origin.value < 0) {
		return -(availableSize - pixels) + PIXELS;
	}

	return pixels + PIXELS;
};

const setSplitOffset = Symbol();
const setPosition = Symbol();
const setMinMaxOffsets = Symbol();

/**
 * Display a draggable resizer bar.
 *
 * @class Resizer
 * @extends DragMixin
 * @extends Control
 *
 * @param {object} settings
 */
export default class Resizer extends DragMixin(Control) {
	constructor(settings = {}) {
		super(setDefaults({
			type: controlTypes.RESIZER,
			orientation: ORIENTATION.HORIZONTAL,
			splitOffset: '0',
			ignoreePadding: true
		}, settings));

		const self = this;

		self.addClass(RESIZER_CLASS);
		self[SPLIT_OFFSET] = new CssSize('unset');

		self
			.canDrag(true)
			.restrictHorizontalDrag(true)
			.restrictVerticalDrag(true)
			.onDragStart(() => self[setMinMaxOffsets]())
			.onDrag((offset) => {
				offset = offset[self[DIRECTION]];

				self[setSplitOffset](offset);

				if (self.onOffsetChange()) {
					self.onOffsetChange()(self[SPLIT_OFFSET], offset, self[AVAILABLE_SIZE]);
				}
			})
			.onDragEnd((offset) => {
				self[setSplitOffset](offset[self[DIRECTION]]);

				if (self.onOffsetChangeDone()) {
					self.onOffsetChangeDone()(self[SPLIT_OFFSET], offset[self[DIRECTION]], self[AVAILABLE_SIZE]);
				}
			})
			.onResize(() => {
				if (self[IS_HORIZONTAL] !== undefined && self.container()) {
					if (self[IS_HORIZONTAL]) {
						self[AVAILABLE_SIZE] = self.availableHeight;
						self[DIRECTION] = 'y';
					}
					else {
						self[AVAILABLE_SIZE] = self.availableWidth;
						self[DIRECTION] = 'x';
					}

					self[setPosition]();
				}
			});

		applySettings(self, settings);
	}

	[setSplitOffset](offset) {
		const self = this;

		self[SPLIT_OFFSET].set(pixelsToOffset(self[SPLIT_OFFSET], offset, self[AVAILABLE_SIZE]));
	}

	[setPosition]() {
		const self = this;

		let splitOffsetPixels = offsetToPixels(self[SPLIT_OFFSET], self[AVAILABLE_SIZE]);

		splitOffsetPixels = clamp(splitOffsetPixels, self[MIN_OFFSET_PIXELS], self[MAX_OFFSET_PIXELS]);

		if (self[IS_HORIZONTAL]) {
			self.position(0, splitOffsetPixels);
		}
		else {
			self.position(splitOffsetPixels, 0);
		}
	}

	[setMinMaxOffsets]() {
		const self = this;

		self[MIN_OFFSET_PIXELS] = offsetToPixels(self.minOffset(), self[AVAILABLE_SIZE]);
		self[MAX_OFFSET_PIXELS] = offsetToPixels(self.maxOffset(), self[AVAILABLE_SIZE]);
	}
}

Object.assign(Resizer.prototype, {
	/**
	 * The direction that the resizer should stretch, not the direction it drags
	 *
	 * @method orientation
	 * @memberOf Resizer
	 * @instance
	 *
	 * @param {string} orientation
	 *
	 * @returns {string|this}
	 */
	orientation: methodEnum({
		enum: ORIENTATION,
		set(orientation) {
			const self = this;
			const size = IS_DESKTOP ? DESKTOP_SIZE : TOUCH_SIZE;
			const margin = -(size.toPixels(true) / 2) + PIXELS;
			const padding = ((size.toPixels(true) / 2) - VISUAL_SIZE.toPixels(true)) + PIXELS;

			self[IS_HORIZONTAL] = orientation === ORIENTATION.HORIZONTAL;

			self.classes(HORIZONTAL_CLASS, self[IS_HORIZONTAL])
				.classes(VERTICAL_CLASS, !self[IS_HORIZONTAL])
				.width(self[IS_HORIZONTAL] ? HUNDRED_PERCENT : size)
				.height(self[IS_HORIZONTAL] ? size : HUNDRED_PERCENT)
				.margin(self[IS_HORIZONTAL] ? margin + ' 0' : '0 ' + margin)
				.padding(padding);

			self.resize(true);
		}
	}),

	/**
	 * Set or Get the split offset of this control.
	 *
	 * @method splitOffset
	 * @memberOf Resizer
	 * @instance
	 *
	 * @param {string} [splitOffset]
	 *
	 * @returns {string|object}
	 */
	splitOffset: methodCssSize({
		set(splitOffset) {
			this[SPLIT_OFFSET].set(splitOffset);

			this[setPosition]();
		},
		get() {
			return this[SPLIT_OFFSET];
		}
	}),

	/**
	 * Set or Get the minimum offset when resizing.
	 *
	 * @method minOffset
	 * @memberOf Resizer
	 * @instance
	 *
	 * @param {string} [newMinOffset]
	 *
	 * @returns {string|object}
	 */
	minOffset: methodCssSize({
		init: new CssSize(),
		set() {
			this[setMinMaxOffsets]();
			this[setPosition]();
		}
	}),

	/**
	 * Set or Get the maximum offset when resizing.
	 *
	 * @method maxOffset
	 * @memberOf Resizer
	 * @instance
	 *
	 * @param {string} [maxOffset]
	 *
	 * @returns {string|object}
	 */
	maxOffset: methodCssSize({
		init: new CssSize('100%'),
		set() {
			this[setMinMaxOffsets]();
			this[setPosition]();
		}
	}),

	onOffsetChange: methodFunction({
		other: undefined
	}),

	onOffsetChangeDone: methodFunction({
		other: undefined
	})
});
