import { select } from 'd3';
import Hammer from 'hammerjs';
import { applySettings, CssSize, DockPoint, Enum, method, PIXELS } from 'type-enforcer';
import { IS_PHONE } from '../../utility/browser';
import d3Helper from '../../utility/d3Helper';
import {
	MARGIN,
	OPACITY,
	PADDING,
	SPACE,
	SWIPE_DOWN_EVENT,
	SWIPE_LEFT_EVENT,
	SWIPE_RIGHT_EVENT,
	SWIPE_UP_EVENT
} from '../../utility/domConstants';
import controlTypes from '../controlTypes';
import Resizer from '../elements/Resizer';
import { ORIENTATION } from '../uiConstants';
import Container from './Container';
import './Drawer.less';

const ALL_SIDE_CLASSES = DockPoint.POINTS.TOP + SPACE + DockPoint.POINTS.RIGHT + SPACE + DockPoint.POINTS.BOTTOM + SPACE + DockPoint.POINTS.LEFT;
const minSwipeHitSize = new CssSize('3rem');

const DOCK = Symbol();
const IS_HORIZONTAL = Symbol();
const RESIZER = Symbol();
const OVERLAP = Symbol();
const TOUCH_CONTAINER = Symbol();
const TOUCH_ELEMENT = Symbol();
const SWIPE_HIT_SIZE = Symbol();

const addTouch = Symbol();
const swipeEvents = Symbol();
const inHitZone = Symbol();
const removeTouch = Symbol();
const resize = Symbol();
const layout = Symbol();

/**
 * Display a sliding drawer on the edge of a container.
 *
 * @class Drawer
 * @extends Container
 * @constructor
 *
 * @arg {Object} settings
 */
export default class Drawer extends Container {
	constructor(settings = {}) {
		settings.type = settings.type || controlTypes.DRAWER;
		settings.dock = settings.dock || DockPoint.POINTS.LEFT;

		super(settings);

		const self = this;

		self[OVERLAP] = IS_PHONE;
		self[SWIPE_HIT_SIZE] = minSwipeHitSize.toPixels(true);

		self.addClass('drawer')
			.removeClass('container');

		if (settings.type === controlTypes.DRAWER) {
			applySettings(self, settings, ['dock'], ['isOpen']);
		}

		self
			.onResize(() => {
				if (self[RESIZER]) {
					self[RESIZER].resize();
				}
			})
			.onRemove(() => {
				self.canResize(false);
				self[removeTouch]();
			});
	}

	[swipeEvents]() {
		if (this[IS_HORIZONTAL]) {
			if (this[DOCK] === DockPoint.POINTS.LEFT) {
				return [SWIPE_RIGHT_EVENT, SWIPE_LEFT_EVENT];
			}
			return [SWIPE_LEFT_EVENT, SWIPE_RIGHT_EVENT];
		}

		if (this[DOCK] === DockPoint.POINTS.TOP) {
			return [SWIPE_DOWN_EVENT, SWIPE_UP_EVENT];
		}

		return [SWIPE_UP_EVENT, SWIPE_DOWN_EVENT];
	}

	[inHitZone](hammerEvent) {
		const self = this;
		const offsets = self.container().getBoundingClientRect();
		let touchStart;

		if (self[IS_HORIZONTAL]) {
			touchStart = hammerEvent.center.x - hammerEvent.deltaX;

			if (this[DOCK] === DockPoint.POINTS.LEFT) {
				return touchStart - offsets.left < this[SWIPE_HIT_SIZE];
			}

			return touchStart - offsets.left > offsets.width - this[SWIPE_HIT_SIZE];
		}

		touchStart = hammerEvent.center.y - hammerEvent.deltaY;

		if (this[DOCK] === DockPoint.POINTS.TOP) {
			return touchStart - offsets.top < this[SWIPE_HIT_SIZE];
		}

		return touchStart - offsets.top > offsets.height - this[SWIPE_HIT_SIZE];
	}

	[addTouch]() {
		const self = this;
		let [swipeOpenEvent, swipeCloseEvent] = self[swipeEvents]();

		self[removeTouch]();

		if (self.container()) {
			self[TOUCH_CONTAINER] = new Hammer(self.container())
				.on(swipeOpenEvent, (hammerEvent) => {
					if (self[inHitZone](hammerEvent)) {
						hammerEvent.srcEvent.stopPropagation();
						self.isOpen(true);
					}
				});

			self[TOUCH_ELEMENT] = new Hammer(self.element())
				.on(swipeCloseEvent, () => {
					self.isOpen(false);
				});

			if (!self[IS_HORIZONTAL]) {
				self[TOUCH_CONTAINER].domEvents = true;
				self[TOUCH_CONTAINER]
					.get('swipe')
					.set({direction: Hammer.DIRECTION_VERTICAL});
				self[TOUCH_ELEMENT].domEvents = true;
				self[TOUCH_ELEMENT]
					.get('swipe')
					.set({direction: Hammer.DIRECTION_VERTICAL});
			}
		}
	}

	[removeTouch]() {
		const clearEvents = (container) => {
			if (this[container]) {
				this[container]
					.off(SWIPE_RIGHT_EVENT)
					.off(SWIPE_LEFT_EVENT)
					.off(SWIPE_UP_EVENT)
					.off(SWIPE_DOWN_EVENT)
					.destroy();
				this[container] = null;
			}
		};

		clearEvents(TOUCH_CONTAINER);
		clearEvents(TOUCH_ELEMENT);
	}

	[resize](offset, availableSize) {
		const self = this;

		if (self[DOCK] === DockPoint.POINTS.RIGHT || self[DOCK] === DockPoint.POINTS.BOTTOM) {
			offset = availableSize - offset;
		}

		if (self[IS_HORIZONTAL]) {
			self.width(offset);
		}
		else {
			self.height(offset);
		}
	}

	[layout]() {
		const self = this;
		const closedSize = self.closedSize().toPixels(true);
		let newMargin = 0;
		let newOpacity = 1;
		let containerPadding = closedSize;
		const element = self.isAnimated() ? d3Helper.animate(self) : self.elementD3();

		if (self.isOpen()) {
			if (!self[OVERLAP]) {
				containerPadding = self[IS_HORIZONTAL] ? self.borderWidth() : self.borderHeight();
			}
		}
		else {
			newMargin = -((self[IS_HORIZONTAL] ? self.borderWidth() : self.borderHeight()) - closedSize);
			newOpacity = closedSize ? 1 : 0;
		}

		element
			.style(MARGIN + '-' + self[DOCK], newMargin + PIXELS)
			.style(OPACITY, newOpacity);

		select(self.container())
			.style(PADDING + '-' + self[DOCK], containerPadding + PIXELS);

		if (self[RESIZER]) {
			let splitOffset = self[IS_HORIZONTAL] ? self.borderWidth() : self.borderHeight();

			if (self[DOCK] === DockPoint.POINTS.RIGHT || self[DOCK] === DockPoint.POINTS.BOTTOM) {
				splitOffset = -splitOffset;
			}

			self[RESIZER]
				.orientation(self[IS_HORIZONTAL] ? ORIENTATION.VERTICAL : ORIENTATION.HORIZONTAL)
				.isEnabled(self.isOpen())
				.splitOffset(splitOffset + PIXELS);
		}
	}
}

Drawer.OVERLAP = new Enum({
	PHONE: 'phone',
	ALWAYS: 'always',
	NEVER: 'never'
});

Object.assign(Drawer.prototype, {
	/**
	 * The side of the container that the drawer should open from.
	 *
	 * @method dock
	 * @member class:Drawer
	 * @instance
	 *
	 * @arg {string} [side] - Must be a dockPoint
	 *
	 * @returns {string|this}
	 */
	dock: method.dockPoint({
		set: function(dock) {
			const self = this;

			self[DOCK] = dock.primary();

			self.removeClass(ALL_SIDE_CLASSES)
				.addClass(self[DOCK]);

			self[IS_HORIZONTAL] = self[DOCK] === DockPoint.POINTS.LEFT || self[DOCK] === DockPoint.POINTS.RIGHT;

			self[addTouch]();
			self[layout]();
		}
	}),

	isAnimated: method.boolean(),

	canResize: method.boolean({
		set: function(canResize) {
			const self = this;

			if (canResize) {
				if (!self[RESIZER]) {
					self[RESIZER] = new Resizer({
						container: self.element().parentElement,
						onOffsetChange: (splitOffset, offset, availableSize) => {
							self[resize](offset, availableSize);
						}
					});
					self[layout]();
				}
			}
			else if (self[RESIZER]) {
				self[RESIZER].remove();
				self[RESIZER] = null;
			}
		}
	}),

	overlap: method.enum({
		init: Drawer.OVERLAP.PHONE,
		enum: Drawer.OVERLAP,
		set: function(overlap) {
			this[OVERLAP] = (overlap === Drawer.OVERLAP.PHONE && IS_PHONE) || overlap === Drawer.OVERLAP.ALWAYS;
			this[layout]();
		}
	}),

	closedSize: method.cssSize({
		init: new CssSize('0'),
		set: function(closedSize) {
			this[SWIPE_HIT_SIZE] = Math.max(minSwipeHitSize.toPixels(true), closedSize.toPixels(true));
			this[layout]();
		}
	}),

	isOpen: method.boolean({
		set: function(isOpen) {
			if (isOpen) {
				if (this.onOpen()) {
					this.onOpen()();
				}
			}
			else if (this.onClose()) {
				this.onClose()();
			}

			this[layout]();
		}
	}),

	onOpen: method.function(),

	onClose: method.function()
});
