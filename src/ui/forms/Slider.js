import { applySettings, DockPoint, method, PIXELS } from 'type-enforcer';
import dom from '../../utility/dom';
import { LEFT } from '../../utility/domConstants';
import clamp from '../../utility/math/clamp';
import controlTypes from '../controlTypes';
import Button from '../elements/Button';
import Div from '../elements/Div';
import DragMixin from '../mixins/DragMixin';
import TooltipMixin from '../mixins/TooltipMixin';
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

const addThumb = Symbol();
const removeThumb = Symbol();
const setValueToIncrement = Symbol();
const getValueAtOffset = Symbol();
const getOffsetAtValue = Symbol();
const positionRange = Symbol();
const getSnapSize = Symbol();
const setSnapGrid = Symbol();
const positionThumbs = Symbol();

const OFFSETS = Symbol();
const TRACK = Symbol();
const RANGE = Symbol();
const THUMBS = Symbol();
const TRACK_SIZE = Symbol();
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
			classes: 'track'
		});

		self[RANGE] = new Div({
			container: self,
			classes: 'range',
			width: '0.5rem'
		});

		self[THUMBS] = [];
		self[addThumb]();

		applySettings(self, settings);

		self.onResize(() => {
				const thumbSize = self[THUMBS][0].borderWidth();
				self[TRACK_SIZE] = thumbSize - dom.get.margins.width(self[TRACK]);
				const offset = thumbSize - self[TRACK_SIZE];

				const trackWidth = self.borderWidth() - offset;
				self[TRACK].width(trackWidth);

				self[LOCATION_SIZE] = trackWidth - self[TRACK_SIZE];

				self[setSnapGrid]();
				self[positionThumbs]();
			})
			.onRemove(() => {
				while (self[THUMBS].length) {
					self[removeThumb]();
				}
				self[RANGE].remove();
				self[RANGE] = null;
				self[TRACK].remove();
				self[TRACK] = null;
			})
			.resize();
	}

	[addThumb]() {
		const self = this;
		const saveOffset = function(offset) {
			const thumbIndex = self[THUMBS].indexOf(this);
			self[OFFSETS][thumbIndex] = offset.x;
			self[positionRange]();
		};

		self[THUMBS].push(new Thumb({
			container: self,
			onDragStart: () => {
			},
			onDrag: saveOffset,
			onDragDone: (offset) => {
				saveOffset.call(this, offset);

				if (self[OFFSETS].length > 1 && self[OFFSETS][0] > self[OFFSETS][1]) {
					self[OFFSETS].push(self[OFFSETS].shift());
					self[THUMBS].push(self[THUMBS].shift());
				}

				const value = self[OFFSETS].map((offset) => self[getValueAtOffset](offset));

				if (self.value() !== value) {
					self.value(value);
					self.triggerChange();
				}
			},
			snapGridSize: self[getSnapSize]()
		}));
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
			.css(LEFT, start + PIXELS);
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
	}

	[positionThumbs]() {
		const self = this;

		self[OFFSETS] = self.value()
			.map(self[getOffsetAtValue], self);

		self[THUMBS].forEach((thumb, index) => {
			thumb.position(self[OFFSETS][index], 0);
		});

		self[positionRange]();
	}
}

Object.assign(Slider.prototype, {
	value: method.array({
		init: [0],
		coerce: true,
		set: function(value) {
			const self = this;

			while (value.length > self[THUMBS].length) {
				self[addThumb]();
			}
			while (value.length < self[THUMBS].length) {
				self[removeThumb]();
			}
			self[positionThumbs]();
		}
	}),
	min: method.number({
		init: 0
	}),
	max: method.number({
		init: 100
	}),
	increment: method.number({
		init: 0,
		set: function() {
			this[setSnapGrid]();
		}
	}),
	buildTooltip: method.function({
		init: (value) => value + ''
	})
});
