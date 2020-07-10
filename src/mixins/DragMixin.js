import { clear, delay } from 'async-agent';
import { methodBoolean, methodNumber, methodQueue, PIXELS, Point, Thickness, Vector } from 'type-enforcer-ui';
import { CONTROL_PROP } from '../Control';
import {
	ABSOLUTE,
	BODY,
	BOTTOM,
	LEFT,
	MOUSE_WHEEL_EVENT,
	POSITION as CSS_POSITION,
	RIGHT,
	SCALE_CHANGE_EVENT,
	SCROLL_LEFT,
	SCROLL_TOP,
	TOP,
	TRANSFORM
} from '../utility/domConstants';
import clamp from '../utility/math/clamp';

const FRICTION = 0.85;
const ELASTICITY = 0.75;

const IS_REGISTERED_RESIZE = Symbol();
const AVAILABLE_WIDTH = Symbol();
const AVAILABLE_HEIGHT = Symbol();
const IGNORE_PADDING = Symbol();

const DRAG_BOUNDS = Symbol();
const POSITION = Symbol();
const POSITION_PREVIOUS = Symbol();
const TRANSFORM_OFFSET = Symbol();

const THROW_VELOCITY = Symbol();
const VELOCITY_OFFSET = Symbol();
const BOUNCE_VECTOR = Symbol();
const BOUNCE_DESTINATION = Symbol();

const IS_DRAGGING = Symbol();
const IS_THROWING = Symbol();
const IS_BOUNCING = Symbol();

const DRAG_DELAY = Symbol();
const THROW_FRAME = Symbol();
const BOUNCE_FRAME = Symbol();

const stopThrow = Symbol();
const roundToSnapGrid = Symbol();
const animateThrow = Symbol();
const calculateBounce = Symbol();
const animateBounce = Symbol();
const setZoom = Symbol();
const startDrag = Symbol();
const onDrag = Symbol();
const stopDrag = Symbol();

export default (Base) => {
	class DragMixin extends Base {
		constructor(settings = {}) {
			super(settings);

			const self = this;
			self[IGNORE_PADDING] = settings.ignorePadding;
			self[AVAILABLE_WIDTH] = 0;
			self[AVAILABLE_HEIGHT] = 0;

			self[DRAG_BOUNDS] = new Thickness();
			self[POSITION] = new Point();
			self[POSITION_PREVIOUS] = new Point();
			self[TRANSFORM_OFFSET] = new Point();

			self.onResize((width, height) => {
					if (self.canDrag()) {
						if (!self[IS_REGISTERED_RESIZE] && self.container()) {
							self[IS_REGISTERED_RESIZE] = true;

							if (self.container()[CONTROL_PROP]) {
								self.container()[CONTROL_PROP]
									.onResize(function(width, height) {
										self[AVAILABLE_WIDTH] = this.innerWidth();
										self[AVAILABLE_HEIGHT] = this.innerHeight();

										if (!self[IGNORE_PADDING]) {
											const padding = new Thickness(this.css('padding') || 0);

											self[AVAILABLE_WIDTH] -= padding.horizontal;
											self[AVAILABLE_HEIGHT] -= padding.vertical;
										}

										self.resize(true);
									})
									.resize(true);
							}
							else {
								const bounds = self.container().getBoundingClientRect();
								self[AVAILABLE_WIDTH] = bounds.width;
								self[AVAILABLE_HEIGHT] = bounds.height;
							}
						}

						if (self.restrictDragToOrigin()) {
							width = 0;
							height = 0;
						}

						if (width < self[AVAILABLE_WIDTH]) {
							self[DRAG_BOUNDS].left = 0;
							self[DRAG_BOUNDS].right = self[AVAILABLE_WIDTH] - width;
						}
						else {
							self[DRAG_BOUNDS].left = self[AVAILABLE_WIDTH] - width;
							self[DRAG_BOUNDS].right = 0;
						}

						if (height < self[AVAILABLE_HEIGHT]) {
							self[DRAG_BOUNDS].top = 0;
							self[DRAG_BOUNDS].bottom = self[AVAILABLE_HEIGHT] - height;
						}
						else {
							self[DRAG_BOUNDS].top = self[AVAILABLE_HEIGHT] - height;
							self[DRAG_BOUNDS].bottom = 0;
						}
					}
				})
				.onRemove(() => {
					clear(self[DRAG_DELAY]);
					self[stopThrow]();
				});
		}

		[stopThrow]() {
			const self = this;

			if (self[IS_THROWING] || self[IS_BOUNCING]) {
				self[IS_THROWING] = false;
				cancelAnimationFrame(self[THROW_FRAME]);
				cancelAnimationFrame(self[BOUNCE_FRAME]);
			}
		}

		[roundToSnapGrid](value) {
			const snapGridSize = this.snapGridSize();

			if (snapGridSize) {
				return Math.round(value / snapGridSize) * snapGridSize;
			}
			return value;
		}

		[animateThrow]() {
			const self = this;

			if (self[THROW_VELOCITY].length() > 0.5) {
				self[THROW_VELOCITY].length(self[THROW_VELOCITY].length() * FRICTION);
				self.position(
					self[POSITION].x + self[THROW_VELOCITY].offset().x,
					self[POSITION].y + self[THROW_VELOCITY].offset().y
				);

				if (self[POSITION].x < self[DRAG_BOUNDS].left ||
					self[POSITION].x > self[DRAG_BOUNDS].right ||
					self[POSITION].y < self[DRAG_BOUNDS].top ||
					self[POSITION].y > self[DRAG_BOUNDS].bottom) {
					self[THROW_VELOCITY].length(self[THROW_VELOCITY].length() * ELASTICITY);
				}

				self[THROW_FRAME] = requestAnimationFrame(() => {
					self[animateThrow]();
				});
			}
			else {
				self[stopThrow]();
				self[calculateBounce]();
			}
		}

		[calculateBounce]() {
			const self = this;

			self[BOUNCE_VECTOR]
				.start(new Point(self[POSITION].x, self[POSITION].y))
				.end(new Point(self[POSITION].x, self[POSITION].y));

			if (self.container()) {
				if (self[POSITION].x < self[DRAG_BOUNDS].left) {
					if (self[POSITION].y < self[DRAG_BOUNDS].top) {
						self[BOUNCE_VECTOR].end(new Point(self[DRAG_BOUNDS].left, self[DRAG_BOUNDS].top));
					}
					else if (self[POSITION].y > self[DRAG_BOUNDS].bottom) {
						self[BOUNCE_VECTOR].end(new Point(self[DRAG_BOUNDS].left, self[DRAG_BOUNDS].bottom));
					}
					else if (self[THROW_VELOCITY].length() > 0) {
						self[BOUNCE_VECTOR]
							.angle(Math.PI - self[THROW_VELOCITY].angle())
							.length((self[DRAG_BOUNDS].left - self[POSITION].x) / Math.cos(self[BOUNCE_VECTOR].angle()));
					}
					else {
						self[BOUNCE_VECTOR].end(new Point(self[DRAG_BOUNDS].left, self[POSITION].y));
					}
				}
				else if (self[POSITION].x > self[DRAG_BOUNDS].right) {
					if (self[POSITION].y < self[DRAG_BOUNDS].top) {
						self[BOUNCE_VECTOR].end(new Point(self[DRAG_BOUNDS].right, self[DRAG_BOUNDS].top));
					}
					else if (self[POSITION].y > self[DRAG_BOUNDS].bottom) {
						self[BOUNCE_VECTOR].end(new Point(self[DRAG_BOUNDS].right, self[DRAG_BOUNDS].bottom));
					}
					else if (self[THROW_VELOCITY].length() > 0) {
						self[BOUNCE_VECTOR]
							.angle(Math.PI - self[THROW_VELOCITY].angle())
							.length((self[DRAG_BOUNDS].right - self[POSITION].x) / Math.cos(self[BOUNCE_VECTOR].angle()));
					}
					else {
						self[BOUNCE_VECTOR].end(new Point(self[DRAG_BOUNDS].right, self[POSITION].y));
					}
				}
				else if (self[POSITION].y < self[DRAG_BOUNDS].top) {
					if (self[THROW_VELOCITY].length() > 0) {
						self[BOUNCE_VECTOR]
							.angle(-self[THROW_VELOCITY].angle())
							.length((self[DRAG_BOUNDS].top - self[POSITION].y) / Math.sin(self[BOUNCE_VECTOR].angle()));
					}
					else {
						self[BOUNCE_VECTOR].end(new Point(self[POSITION].x, self[DRAG_BOUNDS].top));
					}
				}
				else if (self[POSITION].y > self[DRAG_BOUNDS].bottom) {
					if (self[THROW_VELOCITY].length() > 0) {
						self[BOUNCE_VECTOR]
							.angle(-self[THROW_VELOCITY].angle())
							.length((self[DRAG_BOUNDS].bottom - self[POSITION].y) / Math.sin(self[BOUNCE_VECTOR].angle()));
					}
					else {
						self[BOUNCE_VECTOR].end(new Point(self[POSITION].x, self[DRAG_BOUNDS].bottom));
					}
				}
			}

			self[BOUNCE_DESTINATION].x = clamp(
				self[BOUNCE_VECTOR].end().x,
				self[DRAG_BOUNDS].left,
				self[DRAG_BOUNDS].right
			);
			self[BOUNCE_DESTINATION].y = clamp(
				self[BOUNCE_VECTOR].end().y,
				self[DRAG_BOUNDS].top,
				self[DRAG_BOUNDS].bottom
			);

			self[BOUNCE_DESTINATION].x = self[roundToSnapGrid](self[BOUNCE_DESTINATION].x);
			self[BOUNCE_DESTINATION].y = self[roundToSnapGrid](self[BOUNCE_DESTINATION].y);

			self[BOUNCE_VECTOR].end(self[BOUNCE_DESTINATION]);
			self[BOUNCE_VECTOR].invert();

			self[IS_BOUNCING] = true;
			self[BOUNCE_FRAME] = requestAnimationFrame(() => {
				self[animateBounce]();
			});
		}

		[animateBounce]() {
			const self = this;

			if (self[BOUNCE_VECTOR].length() > 0.5) {
				self[BOUNCE_VECTOR].length(self[BOUNCE_VECTOR].length() * ELASTICITY);

				self.position(self[BOUNCE_VECTOR].end().x, self[BOUNCE_VECTOR].end().y);

				self[BOUNCE_FRAME] = requestAnimationFrame(() => self[animateBounce]());
			}
			else {
				self[IS_BOUNCING] = false;
				self.position(Math.round(self[POSITION].x), Math.round(self[POSITION].y));

				self.onDragEnd().trigger(null, [{ ...self[POSITION] }]);
			}
		}

		[setZoom](newScaleLevel, offsetX = 0, offsetY = 0, needsCheck = false) {
			const self = this;
			const originalScale = self.scale();

			newScaleLevel = clamp(newScaleLevel, self.scaleMin(), self.scaleMax());
			self.scale(newScaleLevel);

			const scaleChange = (originalScale - newScaleLevel) * (1 / originalScale);

			self
				.position(
					self[POSITION].x + (offsetX * scaleChange),
					self[POSITION].y + (offsetY * scaleChange)
				)
				.resize(true)
				.trigger(SCALE_CHANGE_EVENT);

			if (needsCheck && self.canDrag()) {
				self[calculateBounce]();
			}
		}

		[startDrag](event) {
			const self = this;

			self[stopDrag]();
			self[stopThrow]();

			self[IS_DRAGGING] = true;
			self[IS_THROWING] = false;
			self[IS_BOUNCING] = false;

			self.onDragStart().trigger(null, [event]);

			if (self.scrollOnDrag()) {
				self[POSITION].x = -self.container()[SCROLL_LEFT];
				self[POSITION].y = -self.container()[SCROLL_TOP];
			}
		}

		[onDrag](x, y) {
			const self = this;

			self.position(x, y);

			if (self.canThrow()) {
				clear(self[DRAG_DELAY]);
				self[DRAG_DELAY] = delay(() => {
					self[VELOCITY_OFFSET].x = 0;
					self[VELOCITY_OFFSET].y = 0;
				}, 100);

				self[VELOCITY_OFFSET].x = self[POSITION].x - self[POSITION_PREVIOUS].x;
				self[VELOCITY_OFFSET].y = self[POSITION].y - self[POSITION_PREVIOUS].y;
				self[POSITION_PREVIOUS].x = self[POSITION].x;
				self[POSITION_PREVIOUS].y = self[POSITION].y;
			}
		}

		[stopDrag]() {
			const self = this;

			if (self[IS_DRAGGING]) {
				self[IS_DRAGGING] = false;

				if (self.canThrow()) {
					self[IS_THROWING] = true;

					clear(self[DRAG_DELAY]);
					self[THROW_VELOCITY].end(self[VELOCITY_OFFSET]);
					self[THROW_FRAME] = requestAnimationFrame(() => self[animateThrow]());
				}
				else {
					self.onDragEnd().trigger(null, [{ ...self[POSITION] }]);
				}
			}
		}

		stretch(format) {
			const self = this;
			let newScale = null;
			const width = self.borderWidth();
			const height = self.borderHeight();
			const horizontalScale = self[AVAILABLE_WIDTH] / (width / self.scale());
			const verticalScale = self[AVAILABLE_HEIGHT] / (height / self.scale());

			if (format === 'none') {
				newScale = 1;
			}
			else if (format === 'auto') {
				newScale = Math.min(1, Math.min(horizontalScale, verticalScale));
			}
			else if (format === 'fit') {
				newScale = Math.min(horizontalScale, verticalScale);
			}
			else if (format === 'fill') {
				newScale = Math.max(horizontalScale, verticalScale);
			}
			else if (format === 'in') {
				newScale = self.scale() * 1.5;
			}
			else if (format === 'out') {
				newScale = self.scale() * (2 / 3);
			}

			if (newScale !== null) {
				const doCenter = ['none', 'auto', 'fit', 'fill'].includes(format);
				self[setZoom](newScale, width / 2, height / 2, !doCenter);

				if (doCenter) {
					self.center();
				}
			}

			return self;
		}

		center() {
			const self = this;

			self.position(self[DRAG_BOUNDS].horizontal / 2, self[DRAG_BOUNDS].vertical / 2);

			return self;
		}

		scaleToBounds(newX, newY, newWidth, newHeight) {
			const self = this;
			const newScale = Math.min(self[AVAILABLE_WIDTH] / newWidth, self[AVAILABLE_HEIGHT] / newHeight);

			newX = (self[AVAILABLE_WIDTH] - newWidth * newScale) / 2 - (newX * newScale);
			newY = (self[AVAILABLE_HEIGHT] - newHeight * newScale) / 2 - (newY * newScale);

			cancelAnimationFrame(self[THROW_FRAME]);

			self.scale(newScale);
			self.position(newX, newY);

			return self;
		}

		top(value) {
			const self = this;

			if (value !== undefined) {
				self.position(self[POSITION].x, value);

				return self;
			}

			return self[POSITION].y;
		}

		left(value) {
			const self = this;

			if (value !== undefined) {
				self.position(value, self[POSITION].y);

				return self;
			}

			return self[POSITION].x;
		}

		position(x, y) {
			const self = this;

			if (arguments.length) {
				let transform = '';

				const setScrollPosition = (scrollOrigin, dragPosition, start, end) => {
					const isOverStart = self[POSITION][dragPosition] > self[DRAG_BOUNDS][start];
					const isOverEnd = self[POSITION][dragPosition] < self[DRAG_BOUNDS][end];
					let scrollOffset = 0;

					if (isOverStart) {
						self[TRANSFORM_OFFSET][dragPosition] = self[POSITION][dragPosition];
					}
					else if (isOverEnd) {
						self[TRANSFORM_OFFSET][dragPosition] = self[POSITION][dragPosition] - self[DRAG_BOUNDS][end];
						scrollOffset = Math.round(-self[DRAG_BOUNDS][end]);
					}
					else {
						self[TRANSFORM_OFFSET][dragPosition] = 0;
						scrollOffset = -self[POSITION][dragPosition];
					}

					self.container()[scrollOrigin] = scrollOffset;
				};

				self[POSITION].x = x;
				self[POSITION].y = y;

				if (self.restrictHorizontalDrag()) {
					self[POSITION].x = clamp(self[POSITION].x, self[DRAG_BOUNDS].left, self[DRAG_BOUNDS].right);
				}

				if (self.restrictVerticalDrag()) {
					self[POSITION].y = clamp(self[POSITION].y, self[DRAG_BOUNDS].top, self[DRAG_BOUNDS].bottom);
				}

				if (!self.isRemoved) {
					if (self.scrollOnDrag()) {
						setScrollPosition(SCROLL_LEFT, 'x', RIGHT, LEFT);
						setScrollPosition(SCROLL_TOP, 'y', BOTTOM, TOP);
					}
					else {
						self[TRANSFORM_OFFSET].x = self[POSITION].x;
						self[TRANSFORM_OFFSET].y = self[POSITION].y;
					}

					if (self[TRANSFORM_OFFSET].x !== 0 || self[TRANSFORM_OFFSET].y !== 0) {
						transform = 'translate(' + self[TRANSFORM_OFFSET].toString(PIXELS) + ') ';
					}

					if (self.scale() !== 1) {
						transform += 'scale(' + self.scale() + ')';
					}

					self.css(TRANSFORM, transform);

					if (self.isDragging) {
						self.onDrag().trigger(null, [{ ...self[POSITION] }]);
					}
				}

				return self;
			}

			return new Point(self[POSITION]);
		}

		get isDragging() {
			return this[IS_DRAGGING] || this[IS_THROWING] || this[IS_BOUNCING];
		}

		get availableWidth() {
			return this[AVAILABLE_WIDTH];
		}

		get availableHeight() {
			return this[AVAILABLE_HEIGHT];
		}
	}

	Object.assign(DragMixin.prototype, {
		canDrag: methodBoolean({
			set(canDrag) {
				const self = this;

				if (canDrag) {
					self[THROW_VELOCITY] = new Vector();
					self[VELOCITY_OFFSET] = new Point();
					self[BOUNCE_VECTOR] = new Vector();
					self[BOUNCE_DESTINATION] = new Point();

					self.css(CSS_POSITION, ABSOLUTE)
						.css('transform-origin', '0 0')
						.on('mousedown touchstart', (event) => {
							event.stopPropagation();

							const localOffset = new Point(
								event.clientX - self[POSITION].x,
								event.clientY - self[POSITION].y
							);

							const moveHandler = (event) => {
								event.stopPropagation();

								self[onDrag](event.clientX - localOffset.x, event.clientY - localOffset.y);
							};

							const endHandler = (event) => {
								event.stopPropagation();

								BODY.removeEventListener('mousemove', moveHandler);
								BODY.removeEventListener('touchmove', moveHandler);
								BODY.removeEventListener('mouseup', endHandler);
								BODY.removeEventListener('touchend', endHandler);

								self[stopDrag]();
							};

							self[startDrag](event);

							BODY.addEventListener('mousemove', moveHandler);
							BODY.addEventListener('touchmove', moveHandler);
							BODY.addEventListener('mouseup', endHandler);
							BODY.addEventListener('touchend', endHandler);
						})
						.on(MOUSE_WHEEL_EVENT, (event) => {
							self[setZoom](
								self.scale() * (1 - (event.deltaY / 1000)),
								event.layerX - self[POSITION].x,
								event.layerY - self[POSITION].y
							);
						});

					self.resize(true);
				}
			}
		}),

		canThrow: methodBoolean(),

		scaleMin: methodNumber({
			init: 1,
			min: 0
		}),

		scaleMax: methodNumber({
			init: 1,
			min: 0
		}),

		scale: methodNumber({
			init: 1,
			min: 0
		}),

		restrictVerticalDrag: methodBoolean(),

		restrictHorizontalDrag: methodBoolean(),

		restrictDragToOrigin: methodBoolean(),

		scrollOnDrag: methodBoolean(),

		snapGridSize: methodNumber({
			init: 0
		}),

		onDragStart: methodQueue(),

		onDrag: methodQueue(),

		onDragEnd: methodQueue()
	});

	return DragMixin;
}
