import { drag, event } from 'd3';
import { CssSize, enforce, method, PERCENT, PIXELS, ZERO_PIXELS } from 'type-enforcer';
import { DRAG_END_EVENT, DRAG_MOVE_EVENT } from '../../utility/d3Helper';
import dom from '../../utility/dom';
import { HEIGHT, LEFT, TOP, WIDTH } from '../../utility/domConstants';
import objectHelper from '../../utility/objectHelper';
import controlTypes from '../controlTypes';
import { ORIENTATION } from '../uiConstants';
import Control from './../Control';
import './Resizer.less';

const RESIZER_CLASS = 'resizer';
const HORIZONTAL_CLASS = 'horizontal';
const VERTICAL_CLASS = 'vertical';

const DIRECTION = Symbol();
const POSITION = Symbol();
const ALT_POSITION = Symbol();
const IS_HORIZONTAL = Symbol();
const AVAILABLE_SIZE = Symbol();
const MIN_OFFSET_PIXELS = Symbol();
const MAX_OFFSET_PIXELS = Symbol();

export const getResizerExtentOffset = function(offset, availableSize) {
	if (!offset) {
		return 0;
	}
	if (offset.isPercent) {
		return (offset.value / 100) * availableSize;
	}
	if (offset.value < 0) {
		return availableSize + offset.toPixels(true);
	}
	return offset.toPixels(true);
};

const setExtentOffset = function(offsetPixels) {
	if (this.splitOffset().isPercent) {
		this.splitOffset((offsetPixels / this[AVAILABLE_SIZE]) * 100 + PERCENT);
	}
	else {
		this.splitOffset(offsetPixels);
	}
};

const position = function() {
	if (this.container() && this[AVAILABLE_SIZE] !== undefined && this.splitOffset()) {
		let splitOffsetPixels = getResizerExtentOffset(this.splitOffset(), this[AVAILABLE_SIZE]);
		const minOffsetPixels = this[MIN_OFFSET_PIXELS] || getResizerExtentOffset(this.minOffset(), this[AVAILABLE_SIZE]);
		const maxOffsetPixels = this[MAX_OFFSET_PIXELS] || getResizerExtentOffset(this.maxOffset(), this[AVAILABLE_SIZE]);

		this[MIN_OFFSET_PIXELS] = minOffsetPixels;
		this[MAX_OFFSET_PIXELS] = maxOffsetPixels;

		if (splitOffsetPixels < minOffsetPixels) {
			setExtentOffset.call(this, minOffsetPixels);
		}
		else if (maxOffsetPixels && splitOffsetPixels > maxOffsetPixels) {
			setExtentOffset.call(this, maxOffsetPixels);
		}
		else {
			this.css(this[ALT_POSITION], ZERO_PIXELS)
				.css(this[POSITION], splitOffsetPixels + PIXELS);
		}
	}
};

const measure = function() {
	this[MIN_OFFSET_PIXELS] = null;
	this[MAX_OFFSET_PIXELS] = null;

	if (this[IS_HORIZONTAL] !== undefined && this.container()) {
		if (this[IS_HORIZONTAL]) {
			this[POSITION] = TOP;
			this[ALT_POSITION] = LEFT;
			this[DIRECTION] = 'y';
		}
		else {
			this[POSITION] = LEFT;
			this[ALT_POSITION] = TOP;
			this[DIRECTION] = 'x';
		}
		this[AVAILABLE_SIZE] = dom.get[this[IS_HORIZONTAL] ? HEIGHT : WIDTH](this.container());

		position.call(this);
	}
};

/**
 * Display a draggable resizer bar.
 *
 * @class Resizer
 * @extends Control
 * @constructor
 *
 * @arg {Object} settings
 */
export default class Resizer extends Control {
	constructor(settings = {}) {
		settings.type = settings.type || controlTypes.RESIZER;
		settings.skipWindowResize = true;
		settings.orientation = enforce.enum(settings.orientation, ORIENTATION, ORIENTATION.HORIZONTAL);
		settings.splitOffset = enforce.cssSize(settings.splitOffset, new CssSize('50%'), true);

		super(settings);

		this.addClass(RESIZER_CLASS);
		objectHelper.applySettings(this, settings);
		if (!this[MIN_OFFSET_PIXELS]) {
			position.call(this);
		}

		this.elementD3()
			.call(drag()
				.on(DRAG_MOVE_EVENT, () => {
					setExtentOffset.call(this, Math.max(0, event[this[DIRECTION]]));
					if (this.onOffsetChange()) {
						this.onOffsetChange()(this.splitOffset());
					}
				})
				.on(DRAG_END_EVENT, () => {
					this[MIN_OFFSET_PIXELS] = null;
					this[MAX_OFFSET_PIXELS] = null;

					if (this.onOffsetChangeDone()) {
						this.onOffsetChangeDone()(this.splitOffset());
					}
				})
			);

		this.onResize(measure, true);
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
		set: function(orientation) {
			this[IS_HORIZONTAL] = orientation === ORIENTATION.HORIZONTAL;

			this.classes(HORIZONTAL_CLASS, this[IS_HORIZONTAL])
				.classes(VERTICAL_CLASS, !this[IS_HORIZONTAL]);

			measure.call(this);
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
		set: position
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
		set: position
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
		set: position
	}),

	onOffsetChange: method.function({
		other: undefined
	}),

	onOffsetChangeDone: method.function({
		other: undefined
	})

});
