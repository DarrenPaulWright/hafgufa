import { clear, delay } from 'async-agent';
import { event } from 'd3';
import { method, PIXELS, Point, Thickness, Vector } from 'type-enforcer';
import {
	ABSOLUTE, BODY, BOTTOM, LEFT, MOUSE_WHEEL_EVENT, POSITION, RIGHT, SCALE_CHANGE_EVENT, SCROLL_LEFT, SCROLL_TOP, TOP, TRANSFORM
} from '../../utility/domConstants';
import clamp from '../../utility/math/clamp';
import { CONTROL_PROP } from '../Control';

const FRICTION = 0.85;
const ELASTICITY = 0.75;

const IS_REGISTERED_RESIZE = Symbol();
const DRAGGABLE_RECT = Symbol();
const AVAILABLE_WIDTH = Symbol();
const AVAILABLE_HEIGHT = Symbol();
const IGNORE_PADDING = Symbol();

const DRAG_BOUNDS = Symbol();
const DRAG_OFFSET = Symbol();
const DRAG_OFFSET_PREVIOUS = Symbol();
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
const setPosition = Symbol();
const updateBounds = Symbol();
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

			self.onResize(() => {
					if (self.canDrag()) {
						self[updateBounds]();
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
				self[setPosition](self[DRAG_OFFSET].x + self[THROW_VELOCITY].offset().x, self[DRAG_OFFSET].y + self[THROW_VELOCITY].offset().y);

				if (self[DRAG_OFFSET].x < self[DRAG_BOUNDS].left ||
					self[DRAG_OFFSET].x > self[DRAG_BOUNDS].right ||
					self[DRAG_OFFSET].y < self[DRAG_BOUNDS].top ||
					self[DRAG_OFFSET].y > self[DRAG_BOUNDS].bottom) {
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
				.start(new Point(self[DRAG_OFFSET].x, self[DRAG_OFFSET].y))
				.end(new Point(self[DRAG_OFFSET].x, self[DRAG_OFFSET].y));

			if (self.container()) {
				if (self[DRAG_OFFSET].x < self[DRAG_BOUNDS].left) {
					if (self[DRAG_OFFSET].y < self[DRAG_BOUNDS].top) {
						self[BOUNCE_VECTOR].end(new Point(self[DRAG_BOUNDS].left, self[DRAG_BOUNDS].top));
					}
					else if (self[DRAG_OFFSET].y > self[DRAG_BOUNDS].bottom) {
						self[BOUNCE_VECTOR].end(new Point(self[DRAG_BOUNDS].left, self[DRAG_BOUNDS].bottom));
					}
					else if (self[THROW_VELOCITY].length() > 0) {
						self[BOUNCE_VECTOR]
							.angle(Math.PI - self[THROW_VELOCITY].angle())
							.length((self[DRAG_BOUNDS].left - self[DRAG_OFFSET].x) / Math.cos(self[BOUNCE_VECTOR].angle()));
					}
					else {
						self[BOUNCE_VECTOR].end(new Point(self[DRAG_BOUNDS].left, self[DRAG_OFFSET].y));
					}
				}
				else if (self[DRAG_OFFSET].x > self[DRAG_BOUNDS].right) {
					if (self[DRAG_OFFSET].y < self[DRAG_BOUNDS].top) {
						self[BOUNCE_VECTOR].end(new Point(self[DRAG_BOUNDS].right, self[DRAG_BOUNDS].top));
					}
					else if (self[DRAG_OFFSET].y > self[DRAG_BOUNDS].bottom) {
						self[BOUNCE_VECTOR].end(new Point(self[DRAG_BOUNDS].right, self[DRAG_BOUNDS].bottom));
					}
					else if (self[THROW_VELOCITY].length() > 0) {
						self[BOUNCE_VECTOR]
							.angle(Math.PI - self[THROW_VELOCITY].angle())
							.length((self[DRAG_BOUNDS].right - self[DRAG_OFFSET].x) / Math.cos(self[BOUNCE_VECTOR].angle()));
					}
					else {
						self[BOUNCE_VECTOR].end(new Point(self[DRAG_BOUNDS].right, self[DRAG_OFFSET].y));
					}
				}
				else if (self[DRAG_OFFSET].y < self[DRAG_BOUNDS].top) {
					if (self[THROW_VELOCITY].length() > 0) {
						self[BOUNCE_VECTOR]
							.angle(-self[THROW_VELOCITY].angle())
							.length((self[DRAG_BOUNDS].top - self[DRAG_OFFSET].y) / Math.sin(self[BOUNCE_VECTOR].angle()));
					}
					else {
						self[BOUNCE_VECTOR].end(new Point(self[DRAG_OFFSET].x, self[DRAG_BOUNDS].top));
					}
				}
				else if (self[DRAG_OFFSET].y > self[DRAG_BOUNDS].bottom) {
					if (self[THROW_VELOCITY].length() > 0) {
						self[BOUNCE_VECTOR]
							.angle(-self[THROW_VELOCITY].angle())
							.length((self[DRAG_BOUNDS].bottom - self[DRAG_OFFSET].y) / Math.sin(self[BOUNCE_VECTOR].angle()));
					}
					else {
						self[BOUNCE_VECTOR].end(new Point(self[DRAG_OFFSET].x, self[DRAG_BOUNDS].bottom));
					}
				}
			}

			self[BOUNCE_DESTINATION].x = clamp(self[BOUNCE_VECTOR].end().x, self[DRAG_BOUNDS].left, self[DRAG_BOUNDS].right);
			self[BOUNCE_DESTINATION].y = clamp(self[BOUNCE_VECTOR].end().y, self[DRAG_BOUNDS].top, self[DRAG_BOUNDS].bottom);

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

				self[setPosition](self[BOUNCE_VECTOR].end().x, self[BOUNCE_VECTOR].end().y);

				self[BOUNCE_FRAME] = requestAnimationFrame(() => {
					self[animateBounce]();
				});
			}
			else {
				self[IS_BOUNCING] = false;
				self[setPosition](Math.round(self[DRAG_OFFSET].x), Math.round(self[DRAG_OFFSET].y));

				self.onDragEnd().trigger(null, [{...self[DRAG_OFFSET]}], self);
			}
		}

		[setPosition](newX, newY) {
			const self = this;
			let transform = '';

			const setScrollPosition = (scrollOrigin, dragPosition, start, end) => {
				const isOverStart = self[DRAG_OFFSET][dragPosition] > self[DRAG_BOUNDS][start];
				const isOverEnd = self[DRAG_OFFSET][dragPosition] < self[DRAG_BOUNDS][end];
				let scrollOffset = 0;

				if (isOverStart) {
					self[TRANSFORM_OFFSET][dragPosition] = self[DRAG_OFFSET][dragPosition];
				}
				else if (isOverEnd) {
					self[TRANSFORM_OFFSET][dragPosition] = self[DRAG_OFFSET][dragPosition] - self[DRAG_BOUNDS][end];
					scrollOffset = Math.round(-self[DRAG_BOUNDS][end]);
				}
				else {
					self[TRANSFORM_OFFSET][dragPosition] = 0;
					scrollOffset = -self[DRAG_OFFSET][dragPosition];
				}

				self.container()[scrollOrigin] = scrollOffset;
			};

			self[DRAG_OFFSET].x = newX;
			self[DRAG_OFFSET].y = newY;

			if (self.restrictHorizontalDrag()) {
				self[DRAG_OFFSET].x = clamp(self[DRAG_OFFSET].x, self[DRAG_BOUNDS].left, self[DRAG_BOUNDS].right);
			}
			if (self.restrictVerticalDrag()) {
				self[DRAG_OFFSET].y = clamp(self[DRAG_OFFSET].y, self[DRAG_BOUNDS].top, self[DRAG_BOUNDS].bottom);
			}

			if (!self.isRemoved) {
				if (self.scrollOnDrag()) {
					setScrollPosition(SCROLL_LEFT, 'x', RIGHT, LEFT);
					setScrollPosition(SCROLL_TOP, 'y', BOTTOM, TOP);
				}
				else {
					self[TRANSFORM_OFFSET].x = self[DRAG_OFFSET].x;
					self[TRANSFORM_OFFSET].y = self[DRAG_OFFSET].y;
				}

				if (self[TRANSFORM_OFFSET].x || self[TRANSFORM_OFFSET].y) {
					transform = 'translate(' + self[TRANSFORM_OFFSET].toString(PIXELS) + ') ';
				}
				if (self.scale() !== 1) {
					transform += 'scale(' + self.scale() + ')';
				}
				self.css(TRANSFORM, transform);

				if (self.isDragging) {
					self.onDrag().trigger(null, [{...self[DRAG_OFFSET]}], self);
				}
			}
		}

		[updateBounds]() {
			const self = this;

			if (self.container()) {
				const scale = self.scale();

				if (!self[IS_REGISTERED_RESIZE]) {
					self[IS_REGISTERED_RESIZE] = true;

					if (self.container()[CONTROL_PROP]) {
						self.container()[CONTROL_PROP]
							.onResize(function(width, height) {
								const padding = new Thickness(this.css('padding') || 0);

								self[AVAILABLE_WIDTH] = width - (IGNORE_PADDING ? 0 : padding.horizontal);
								self[AVAILABLE_HEIGHT] = height - (IGNORE_PADDING ? 0 : padding.vertical);
							})
							.resize(true);
					}
					else {
						const bounds = self.container().getBoundingClientRect();
						self[AVAILABLE_WIDTH] = bounds.width;
						self[AVAILABLE_HEIGHT] = bounds.height;
					}
				}

				self[DRAGGABLE_RECT] = self.element().getBoundingClientRect();

				if (self[DRAGGABLE_RECT].width < self[AVAILABLE_WIDTH]) {
					self[DRAG_BOUNDS].left = 0;
					self[DRAG_BOUNDS].right = self[AVAILABLE_WIDTH] - self[DRAGGABLE_RECT].width;
				}
				else {
					self[DRAG_BOUNDS].left = self[AVAILABLE_WIDTH] - self[DRAGGABLE_RECT].width;
					self[DRAG_BOUNDS].right = 0;
				}

				if (self[DRAGGABLE_RECT].height < self[AVAILABLE_HEIGHT]) {
					self[DRAG_BOUNDS].top = 0;
					self[DRAG_BOUNDS].bottom = self[AVAILABLE_HEIGHT] - self[DRAGGABLE_RECT].height;
				}
				else {
					self[DRAG_BOUNDS].top = self[AVAILABLE_HEIGHT] - self[DRAGGABLE_RECT].height;
					self[DRAG_BOUNDS].bottom = 0;
				}

				if (self.element() instanceof SVGElement) {
					const bBox = self.element().getBBox();

					self[DRAG_BOUNDS].left -= bBox.x * scale;
					self[DRAG_BOUNDS].top -= bBox.y * scale;
					self[DRAG_BOUNDS].right -= bBox.x * scale;
					self[DRAG_BOUNDS].bottom -= bBox.y * scale;
				}
			}
		}

		[setZoom](newScaleLevel, offsetX = 0, offsetY = 0) {
			const self = this;
			let scaleChange;

			newScaleLevel = clamp(newScaleLevel, self.scaleMin(), self.scaleMax());
			scaleChange = (self.scale() - newScaleLevel) * (1 / self.scale());
			self.scale(newScaleLevel);

			self[setPosition](self[DRAG_OFFSET].x + (offsetX * scaleChange), self[DRAG_OFFSET].y + (offsetY * scaleChange));

			self.elementD3().dispatch(SCALE_CHANGE_EVENT);
		}

		[startDrag]() {
			const self = this;

			self[updateBounds]();

			self[stopDrag]();
			self[stopThrow]();

			self[IS_DRAGGING] = true;
			self[IS_THROWING] = false;
			self[IS_BOUNCING] = false;

			self.onDragStart().trigger();

			if (self.scrollOnDrag()) {
				self[DRAG_OFFSET].x = -self.container()[SCROLL_LEFT];
				self[DRAG_OFFSET].y = -self.container()[SCROLL_TOP];
			}
		}

		[onDrag](x, y) {
			const self = this;

			this[setPosition](x, y);

			clear(self[DRAG_DELAY]);
			self[DRAG_DELAY] = delay(() => {
				self[VELOCITY_OFFSET].x = 0;
				self[VELOCITY_OFFSET].y = 0;
			}, 100);

			if (self.canThrow()) {
				self[VELOCITY_OFFSET].x = self[DRAG_OFFSET].x - self[DRAG_OFFSET_PREVIOUS].x;
				self[VELOCITY_OFFSET].y = self[DRAG_OFFSET].y - self[DRAG_OFFSET_PREVIOUS].y;
				self[DRAG_OFFSET_PREVIOUS].x = self[DRAG_OFFSET].x;
				self[DRAG_OFFSET_PREVIOUS].y = self[DRAG_OFFSET].y;
			}
		}

		[stopDrag]() {
			const self = this;

			if (self[IS_DRAGGING]) {
				clear(self[DRAG_DELAY]);

				self[IS_DRAGGING] = false;

				if (self.canThrow()) {
					self[IS_THROWING] = true;

					self[THROW_VELOCITY].end(self[VELOCITY_OFFSET]);

					self[THROW_FRAME] = requestAnimationFrame(() => {
						self[animateThrow]();
					});
				}
				else {
					self.onDragEnd().trigger(null, [{...self[DRAG_OFFSET]}], self);
				}
			}
		}

		stretch(format) {
			const self = this;

			self[updateBounds]();

			const horizontalScale = self[AVAILABLE_WIDTH] / (self[DRAGGABLE_RECT].width / self.scale());
			const verticalScale = self[AVAILABLE_HEIGHT] / (self[DRAGGABLE_RECT].height / self.scale());

			if (format === 'fit') {
				self[setZoom](Math.min(horizontalScale, verticalScale));
			}
			else if (format === 'fill') {
				self[setZoom](Math.max(horizontalScale, verticalScale));
			}
			else if (format === 'none') {
				self[setZoom](1);
			}

			return self;
		}

		center() {
			const self = this;

			self[updateBounds]();

			self[setPosition](self[DRAG_BOUNDS].horizontal / 2, self[DRAG_BOUNDS].vertical / 2);

			return self;
		}

		scaleToBounds(newX, newY, newWidth, newHeight) {
			const self = this;

			self[updateBounds]();

			const newScale = Math.min(self[AVAILABLE_WIDTH] / newWidth, self[AVAILABLE_HEIGHT] / newHeight);

			newX = (self[AVAILABLE_WIDTH] - newWidth * newScale) / 2 - (newX * newScale);
			newY = (self[AVAILABLE_HEIGHT] - newHeight * newScale) / 2 - (newY * newScale);

			cancelAnimationFrame(self[THROW_FRAME]);

			self.scale(newScale);
			self[setPosition](newX, newY);

			return self;
		}

		top(value) {
			const self = this;

			if (value !== undefined) {
				self.position(self[DRAG_OFFSET].x, value);

				return self;
			}

			return self[DRAG_OFFSET].y;
		}

		left(value) {
			const self = this;

			if (value !== undefined) {
				self.position(value, self[DRAG_OFFSET].y);

				return self;
			}

			return self[DRAG_OFFSET].x;
		}

		position(x, y) {
			const self = this;

			if (arguments.length) {
				self[updateBounds]();
				self[setPosition](x, y);

				return self;
			}

			return {...self[DRAG_OFFSET]};
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
		canDrag: method.boolean({
			set(canDrag) {
				const self = this;

				if (canDrag) {
					self[DRAG_BOUNDS] = new Thickness();
					self[DRAG_OFFSET] = new Point();
					self[DRAG_OFFSET_PREVIOUS] = new Point();
					self[TRANSFORM_OFFSET] = new Point();

					self[THROW_VELOCITY] = new Vector();
					self[VELOCITY_OFFSET] = new Point();
					self[BOUNCE_VECTOR] = new Vector();
					self[BOUNCE_DESTINATION] = new Point();

					self.css(POSITION, ABSOLUTE)
						.css('transform-origin', 'top left')
						.on('mousedown touchstart', () => {
							event.stopPropagation();

							const bounds = self.container().getBoundingClientRect();
							const localOffset = new Point(event.offsetX + bounds.left, event.offsetY + bounds.top);
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

							self[startDrag]();

							BODY.addEventListener('mousemove', moveHandler);
							BODY.addEventListener('touchmove', moveHandler);
							BODY.addEventListener('mouseup', endHandler);
							BODY.addEventListener('touchend', endHandler);
						})
						.on(MOUSE_WHEEL_EVENT, () => {
							self[setZoom](self.scale() * (1 - (event.deltaY / 1000)),
								event.x - self[DRAG_OFFSET].x,
								event.y - self[DRAG_OFFSET].y
							);
						});

					self[updateBounds]();
				}
			}
		}),

		canThrow: method.boolean(),

		scaleMin: method.number({
			init: 1,
			min: 0
		}),

		scaleMax: method.number({
			init: 1,
			min: 0
		}),

		scale: method.number({
			init: 1,
			min: 0
		}),

		restrictVerticalDrag: method.boolean(),

		restrictHorizontalDrag: method.boolean(),

		scrollOnDrag: method.boolean(),

		snapGridSize: method.number({
			init: 0
		}),

		onDragStart: method.queue(),

		onDrag: method.queue(),

		onDragEnd: method.queue()
	});

	return DragMixin;
}
