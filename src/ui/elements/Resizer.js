import { applySettings, CssSize, enforce, HUNDRED_PERCENT, method, PERCENT, PIXELS } from 'type-enforcer';
import { IS_DESKTOP } from '../..';
import clamp from '../../utility/math/clamp';
import controlTypes from '../controlTypes';
import DragMixin from '../mixins/DragMixin';
import { ORIENTATION } from '../uiConstants';
import Control from './../Control';
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
 * @extends Control
 *
 * @arg {Object} settings
 */
export default class Resizer extends DragMixin(Control) {
	constructor(settings = {}) {
		settings = {
			...settings,
			ignorePadding: true,
			type: settings.type || controlTypes.RESIZER,
			skipWindowResize: true,
			orientation: enforce.enum(settings.orientation, ORIENTATION, ORIENTATION.HORIZONTAL),
			splitOffset: enforce.cssSize(settings.splitOffset, new CssSize('0'), true)
		};

		super(settings);

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
			.onDragDone((offset) => {
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
	 * @member module:Resizer
	 * @instance
	 *
	 * @arg {string} orientation
	 *
	 * @returns {string|this}
	 */
	orientation: method.enum({
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
	 * @member module:Resizer
	 * @instance
	 *
	 * @arg {String} [splitOffset]
	 *
	 * @returns {String|Object}
	 */
	splitOffset: method.cssSize({
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
	 * @member module:Resizer
	 * @instance
	 *
	 * @arg {String} [newMinOffset]
	 *
	 * @returns {String|Object}
	 */
	minOffset: method.cssSize({
		init: new CssSize('0'),
		set() {
			this[setMinMaxOffsets]();
			this[setPosition]();
		}
	}),

	/**
	 * Set or Get the maximum offset when resizing.
	 *
	 * @method maxOffset
	 * @member module:Resizer
	 * @instance
	 *
	 * @arg {String} [maxOffset]
	 *
	 * @returns {String|Object}
	 */
	maxOffset: method.cssSize({
		init: new CssSize('100%'),
		set() {
			this[setMinMaxOffsets]();
			this[setPosition]();
		}
	}),

	onOffsetChange: method.function({
		other: undefined
	}),

	onOffsetChangeDone: method.function({
		other: undefined
	})
});
