import { select } from 'd3';
import Hammer from 'hammerjs';
import {
	applySettings,
	CssSize,
	DockPoint,
	Enum,
	methodBoolean,
	methodCssSize,
	methodDockPoint,
	methodEnum,
	methodFunction,
	PIXELS
} from 'type-enforcer-ui';
import { CONTROL_PROP } from '../Control.js';
import controlTypes from '../controlTypes.js';
import Resizer from '../elements/Resizer.js';
import { ORIENTATION } from '../uiConstants.js';
import { IS_PHONE } from '../utility/browser.js';
import d3Helper from '../utility/d3Helper.js';
import {
	MARGIN,
	OPACITY,
	PADDING,
	SPACE,
	SWIPE_DOWN_EVENT,
	SWIPE_LEFT_EVENT,
	SWIPE_RIGHT_EVENT,
	SWIPE_UP_EVENT
} from '../utility/domConstants.js';
import setDefaults from '../utility/setDefaults.js';
import Container from './Container.js';
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
 * @param {object} settings
 */
export default class Drawer extends Container {
	constructor(settings = {}) {
		super(setDefaults({
			type: controlTypes.DRAWER,
			dock: DockPoint.POINTS.LEFT
		}, settings));

		const self = this;

		self[OVERLAP] = IS_PHONE;
		self[SWIPE_HIT_SIZE] = minSwipeHitSize.toPixels(true);

		self.addClass('drawer')
			.removeClass('container');

		if (self.type === controlTypes.DRAWER) {
			applySettings(self, settings, ['dock'], ['isOpen']);
		}

		self
			.onResize(() => {
				if (self[RESIZER] && !self[RESIZER].isDragging) {
					self[RESIZER].resize();
				}
			})
			.onPreRemove(() => {
				self.canResize(false);
				self[layout]();
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

			self[TOUCH_ELEMENT] = new Hammer(self.element)
				.on(swipeCloseEvent, () => {
					self.isOpen(false);
				});

			if (!self[IS_HORIZONTAL]) {
				self[TOUCH_CONTAINER].domEvents = true;
				self[TOUCH_CONTAINER]
					.get('swipe')
					.set({ direction: Hammer.DIRECTION_VERTICAL });
				self[TOUCH_ELEMENT].domEvents = true;
				self[TOUCH_ELEMENT]
					.get('swipe')
					.set({ direction: Hammer.DIRECTION_VERTICAL });
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
			if (offset.isPercent) {
				offset = new CssSize(offset.toString().replace('-', ''));
			}
			else {
				offset = new CssSize(availableSize - offset.toPixels(true));
			}
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
		let containerPadding = self.isRemoved ? 0 : closedSize;
		const element = (self.isAnimated() && !self.isRemoved) ? d3Helper.animate(self) : select(self.element);

		if (self.isOpen() && !self.isRemoved) {
			if (!self[OVERLAP]) {
				containerPadding = self[IS_HORIZONTAL] ? self.borderWidth() : self.borderHeight();
			}
		}
		else {
			newMargin = -((self[IS_HORIZONTAL] ? self.borderWidth() : self.borderHeight()) - closedSize);
			newOpacity = closedSize ? 1 : 0;
		}

		if (!self.isRemoved) {
			element
				.style(MARGIN + '-' + self[DOCK], newMargin + PIXELS)
				.style(OPACITY, newOpacity);
		}

		if (self.container()) {
			self.container().style[PADDING + self[DOCK].charAt(0)
				.toUpperCase() + self[DOCK].substring(1)] = containerPadding + PIXELS;

			if (self.container()[CONTROL_PROP]) {
				self.container()[CONTROL_PROP].resize(true);
			}
		}

		if (self[RESIZER] && !self[RESIZER].isDragging) {
			let splitOffset = self[IS_HORIZONTAL] ? self.width() : self.height();

			if (self[DOCK] === DockPoint.POINTS.RIGHT || self[DOCK] === DockPoint.POINTS.BOTTOM && splitOffset.toString()
				.charAt(0) !== '-') {
				splitOffset = '-' + splitOffset.toString();
			}

			self[RESIZER]
				.orientation(self[IS_HORIZONTAL] ? ORIENTATION.VERTICAL : ORIENTATION.HORIZONTAL)
				.isEnabled(self.isOpen())
				.splitOffset(splitOffset);
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
	 * @param {string} [side] - Must be a dockPoint
	 *
	 * @returns {string|this}
	 */
	dock: methodDockPoint({
		set(dock) {
			const self = this;

			self[DOCK] = dock.primary();

			self.removeClass(ALL_SIDE_CLASSES)
				.addClass(self[DOCK]);

			self[IS_HORIZONTAL] = self[DOCK] === DockPoint.POINTS.LEFT || self[DOCK] === DockPoint.POINTS.RIGHT;

			self[addTouch]();
			self[layout]();
		}
	}),

	isAnimated: methodBoolean(),

	canResize: methodBoolean({
		set(canResize) {
			const self = this;

			if (canResize) {
				if (!self[RESIZER]) {
					self[RESIZER] = new Resizer({
						container: self.element.parentElement,
						onOffsetChange(splitOffset, offset, availableSize) {
							self[resize](splitOffset, availableSize);
							self[layout]();
							self.resize(true);
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

	overlap: methodEnum({
		init: Drawer.OVERLAP.PHONE,
		enum: Drawer.OVERLAP,
		set(overlap) {
			this[OVERLAP] = (overlap === Drawer.OVERLAP.PHONE && IS_PHONE) || overlap === Drawer.OVERLAP.ALWAYS;
			this[layout]();
		}
	}),

	closedSize: methodCssSize({
		init: new CssSize(),
		set(closedSize) {
			this[SWIPE_HIT_SIZE] = Math.max(minSwipeHitSize.toPixels(true), closedSize.toPixels(true));
			this[layout]();
		}
	}),

	isOpen: methodBoolean({
		set(isOpen) {
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

	onOpen: methodFunction(),

	onClose: methodFunction()
});
