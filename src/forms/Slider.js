import { applySettings, DockPoint, methodArray, methodBoolean, methodFunction, methodNumber, methodQueue } from 'type-enforcer-ui';
import controlTypes from '../controlTypes';
import Button from '../elements/Button';
import Div from '../elements/Div';
import DragMixin from '../mixins/DragMixin';
import TooltipMixin from '../mixins/TooltipMixin';
import clamp from '../utility/math/clamp';
import FormControl from './FormControl';
import './Slider.less';

class Thumb extends TooltipMixin(DragMixin(Button)) {
	constructor(settings = {}) {
		super({
			...settings,
			canDrag: true,
			restrictVerticalDrag: true,
			restrictHorizontalDrag: true,
			tooltipDockPoint: DockPoint.POINTS.BOTTOM_CENTER
		});
	}
}

class Range extends DragMixin(Div) {
	constructor(settings = {}) {
		super({
			...settings,
			canDrag: false,
			restrictVerticalDrag: true,
			restrictHorizontalDrag: true
		});
	}
}

const addThumb = Symbol();
const saveNewValue = Symbol();
const removeThumb = Symbol();
const setValueToIncrement = Symbol();
const getValueAtOffset = Symbol();
const getOffsetAtValue = Symbol();
const positionRange = Symbol();
const getSnapSize = Symbol();
const setSnapGrid = Symbol();
const positionThumbs = Symbol();

const IS_DRAGGING = Symbol();
const OFFSETS = Symbol();
const TRACK = Symbol();
const RANGE = Symbol();
const THUMBS = Symbol();
const MOUSE_OFFSET = Symbol();
const TRACK_SIZE = Symbol();
const TRACK_MARGINS = Symbol();
const LOCATION_SIZE = Symbol();

export default class Slider extends FormControl {
	constructor(settings = {}) {
		settings.type = settings.type || controlTypes.SLIDER;

		super(settings);

		const self = this;
		self.addClass('slider');

		self[OFFSETS] = [];

		self[TRACK] = new Div({
			container: self,
			classes: 'track',
			on: {
				mousedown(event) {
					const mouseOffset = clamp(
						event.clientX - self.element.getBoundingClientRect().x - self[MOUSE_OFFSET],
						0,
						self[LOCATION_SIZE]
					);
					let minDiff = self[LOCATION_SIZE] + 1;
					let position = -1;

					self[OFFSETS].forEach((offset, index) => {
						const diff = Math.abs(offset - mouseOffset);
						if (diff < minDiff) {
							minDiff = diff;
							position = index;
						}
					});

					self[THUMBS][position].position(mouseOffset, 0);
					self[OFFSETS][position] = mouseOffset;
					self[positionRange]();
					self[saveNewValue]();
				}
			}
		});

		self[RANGE] = new Range({
			container: self,
			classes: 'range',
			width: '0.5rem',
			onDragStart() {
				self[IS_DRAGGING] = true;
			},
			onDrag(offset) {
				self[OFFSETS] = [offset.x, offset.x + (self[OFFSETS][1] - self[OFFSETS][0])];

				self[THUMBS].forEach((thumb, index) => {
					thumb.position(self[OFFSETS][index], 0);
				});

				if (self.onSlide().length) {
					self.onSlide().trigger(null, [self[OFFSETS].map((offset) => self[getValueAtOffset](offset))]);
				}
			},
			onDragEnd() {
				self[IS_DRAGGING] = false;
				self[saveNewValue]();
			}
		});

		self[THUMBS] = [];
		self[addThumb]();

		applySettings(self, settings);

		self.onResize((width) => {
				const thumbSize = self[THUMBS][0].borderWidth();
				self[MOUSE_OFFSET] = thumbSize / 2;
				self[TRACK_MARGINS] = self[TRACK].marginWidth;
				self[TRACK_SIZE] = thumbSize - self[TRACK_MARGINS];

				const trackWidth = width - self[TRACK_MARGINS];
				self[TRACK].width(trackWidth);

				self[LOCATION_SIZE] = trackWidth - self[TRACK_SIZE];

				self[setSnapGrid]();
				self[positionThumbs]();
			})
			.resize();
	}

	[addThumb]() {
		const self = this;
		const saveOffset = function(offset) {
			const thumbIndex = self[THUMBS].indexOf(this);

			if (self[OFFSETS][thumbIndex] !== offset.x) {
				self[OFFSETS][thumbIndex] = offset.x;
				self[positionRange]();
				if (self.onSlide().length) {
					self.onSlide().trigger(null, [self[OFFSETS].map((offset) => self[getValueAtOffset](offset))]);
				}
			}
		};

		self[THUMBS].push(new Thumb({
			container: self,
			onDragStart() {
				self[IS_DRAGGING] = true;
			},
			onDrag: saveOffset,
			onDragEnd(offset) {
				self[IS_DRAGGING] = false;
				saveOffset.call(this, offset);
				self[saveNewValue]();
			},
			snapGridSize: self[getSnapSize](),
			onResize() {
				self[positionThumbs]();
			}
		}));
	}

	[saveNewValue]() {
		const self = this;

		if (self[OFFSETS].length > 1 && self[OFFSETS][0] > self[OFFSETS][1]) {
			self[OFFSETS].push(self[OFFSETS].shift());
			self[THUMBS].push(self[THUMBS].shift());
		}

		const value = self[OFFSETS].map((offset) => self[getValueAtOffset](offset));

		if (self.value() !== value) {
			self.value(value);
			self.triggerChange();
		}
	}

	[removeThumb]() {
		const self = this;

		if (self[THUMBS].length) {
			self[THUMBS].pop().remove();
		}
	}

	[setValueToIncrement](value) {
		const increment = this.increment();

		if (increment) {
			return Math.round(value / increment) * increment;
		}

		return value;
	}

	[getValueAtOffset](offset) {
		const self = this;
		const min = self.min();
		const max = self.max();
		let percent = Math.min(offset / self[LOCATION_SIZE], 1);
		let value = percent * (max - min) + min;

		return self[setValueToIncrement](value);
	}

	[getOffsetAtValue](value) {
		const self = this;
		const min = self.min();
		const max = self.max();

		value = self[setValueToIncrement](clamp(value, min, max));

		const percent = ((value - min) / (max - min));

		return percent * (self[LOCATION_SIZE] || 0);
	}

	[positionRange]() {
		const self = this;
		let width = self[OFFSETS][0];
		let start = 0;

		self[THUMBS].forEach((thumb, index) => {
			let value = self[getValueAtOffset](self[OFFSETS][index]);

			thumb.tooltip(self.buildTooltip()(value));

			if (index) {
				if (self[OFFSETS][1] < self[OFFSETS][0]) {
					start = self[OFFSETS][1];
					width -= self[OFFSETS][1];
				}
				else {
					start = width;
					width = self[OFFSETS][1] - width;
				}
			}
		});

		self[RANGE]
			.width(width + self[TRACK_SIZE])
			.resize()
			.position(start, 0);
	}

	[getSnapSize]() {
		const self = this;

		if (self[LOCATION_SIZE]) {
			return self[LOCATION_SIZE] / ((self.max() - self.min()) / self.increment());
		}

		return 0;
	}

	[setSnapGrid]() {
		const self = this;
		const snap = self[getSnapSize]();

		self[THUMBS].forEach((thumb) => {
			thumb.snapGridSize(snap);
		});

		self[RANGE].snapGridSize(snap);
	}

	[positionThumbs]() {
		const self = this;

		self[OFFSETS] = self.value()
			.map(self[getOffsetAtValue], self);

		self[THUMBS].forEach((thumb, index) => {
			thumb.resize(true).position(self[OFFSETS][index], 0);
		});

		self[positionRange]();
	}
}

Object.assign(Slider.prototype, {
	value: methodArray({
		init: [0],
		coerce: true,
		set(value) {
			const self = this;

			if (!self[IS_DRAGGING]) {
				while (value.length > self[THUMBS].length) {
					self[addThumb]();
				}
				while (value.length < self[THUMBS].length) {
					self[removeThumb]();
				}
				self.resize(true);
				self[positionThumbs]();
			}
		}
	}),
	min: methodNumber({
		init: 0
	}),
	max: methodNumber({
		init: 100
	}),
	increment: methodNumber({
		init: 0,
		set: setSnapGrid
	}),
	buildTooltip: methodFunction({
		init(value) {
			return value + '';
		}
	}),
	onSlide: methodQueue(),
	canDragRange: methodBoolean({
		set(canDragRange) {
			this[RANGE]
				.canDrag(canDragRange)
				.classes('draggable', canDragRange);
		}
	})
});
