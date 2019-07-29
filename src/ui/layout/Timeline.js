import { throttle } from 'async-agent';
import { event } from 'd3';
import moment from 'moment';
import { repeat } from 'object-agent';
import { applySettings, CssSize, enforceBoolean, Enum, method, PIXELS, Thickness } from 'type-enforcer';
import { BOTTOM, MOUSE_WHEEL_EVENT, TOP } from '../../utility/domConstants';
import Control from '../Control';
import Div from '../elements/Div';
import NextPrevMixin from '../mixins/NextPrevMixin';
import './Timeline.less';
import TimeSpan from './TimeSpan';
import VirtualList from './VirtualList';

const MILLISECONDS_IN_SECOND = 1000;
const SECONDS_IN_MINUTE = 60;
const MINUTES_IN_HOUR = 60;
const HOURS_IN_DAY = 24;
const DAYS_IN_YEAR = 365;
const MONTHS_IN_YEAR = 12;
const MILLISECONDS_IN_DAY = HOURS_IN_DAY * MINUTES_IN_HOUR * SECONDS_IN_MINUTE * MILLISECONDS_IN_SECOND;
const MILLISECONDS_IN_YEAR = MILLISECONDS_IN_DAY * DAYS_IN_YEAR;

const SPAN_TYPES = new Enum({
	MILLENNIUM: 'Millennium',
	CENTURY: 'Century',
	DECADE: 'Decade',
	YEAR: 'Year',
	MONTH: 'Month',
	DAY: 'Day',
	HOUR: 'Hour',
	MINUTE: 'Minute',
	SECOND: 'Second',
	MILLISECOND: 'Millisecond'
});

const SPANS = [{
	min: 0,
	max: 0.25,
	type: SPAN_TYPES.MILLENNIUM,
	length: MILLISECONDS_IN_YEAR * 1000,
	subSpans: [10, 5, 2],
	format: 'YYYY',
	incValue: 1000,
	incUnit: 'y'
}, {
	min: 0.25,
	max: 0.5,
	type: SPAN_TYPES.CENTURY,
	length: MILLISECONDS_IN_YEAR * 100,
	subSpans: [10, 5, 2],
	format: 'YYYY',
	incValue: 100,
	incUnit: 'y'
}, {
	min: 0.5,
	max: 1,
	type: SPAN_TYPES.DECADE,
	length: MILLISECONDS_IN_YEAR * 10,
	subSpans: [10, 5, 2],
	format: 'YYYY',
	incValue: 10,
	incUnit: 'y'
}, {
	min: 1,
	max: MONTHS_IN_YEAR,
	type: SPAN_TYPES.YEAR,
	length: MILLISECONDS_IN_YEAR,
	subSpans: [12, 6, 4, 2],
	format: 'YYYY',
	incValue: 1,
	incUnit: 'y'
}, {
	min: MONTHS_IN_YEAR,
	max: MONTHS_IN_YEAR * 30,
	type: SPAN_TYPES.MONTH,
	length: MILLISECONDS_IN_YEAR / MONTHS_IN_YEAR,
	subSpans: [4, 2],
	format: 'MMM YYYY',
	incValue: 1,
	incUnit: 'M'
}, {
	min: MONTHS_IN_YEAR * 30,
	max: MONTHS_IN_YEAR * 30 * HOURS_IN_DAY,
	type: SPAN_TYPES.DAY,
	length: MILLISECONDS_IN_DAY,
	subSpans: [24, 12, 6, 4, 2],
	format: 'D MMM YYYY',
	incValue: 1,
	incUnit: 'd'
}, {
	min: MONTHS_IN_YEAR * 30 * HOURS_IN_DAY,
	max: MONTHS_IN_YEAR * 30 * HOURS_IN_DAY * MINUTES_IN_HOUR,
	type: SPAN_TYPES.HOUR,
	length: MINUTES_IN_HOUR * SECONDS_IN_MINUTE * MILLISECONDS_IN_SECOND,
	subSpans: [6, 4, 2],
	format: 'ha, D MMM YYYY',
	incValue: 1,
	incUnit: 'h'
}, {
	min: MONTHS_IN_YEAR * 30 * HOURS_IN_DAY * MINUTES_IN_HOUR,
	max: MONTHS_IN_YEAR * 30 * HOURS_IN_DAY * MINUTES_IN_HOUR * SECONDS_IN_MINUTE,
	type: SPAN_TYPES.MINUTE,
	length: SECONDS_IN_MINUTE * MILLISECONDS_IN_SECOND,
	subSpans: [6, 4, 2],
	format: 'h:mma, D MMM YYYY',
	incValue: MINUTES_IN_HOUR,
	incUnit: 'm'
}, {
	min: MONTHS_IN_YEAR * 30 * HOURS_IN_DAY * MINUTES_IN_HOUR * SECONDS_IN_MINUTE,
	max: MONTHS_IN_YEAR * 30 * HOURS_IN_DAY * MINUTES_IN_HOUR * SECONDS_IN_MINUTE * MILLISECONDS_IN_SECOND,
	type: SPAN_TYPES.SECOND,
	length: MILLISECONDS_IN_SECOND,
	subSpans: [10, 5, 2],
	format: 'h:mm:ssa, D MMM YYYY',
	incValue: SECONDS_IN_MINUTE,
	incUnit: 's'
}];

const minSpanWidth = new CssSize('8rem');
const minSubSpanWidth = new CssSize('0.5rem');

const LINE = Symbol();
const VIRTUAL_LIST = Symbol();
const MIN_SPAN_WIDTH = Symbol();
const MIN_SUB_SPAN_WIDTH = Symbol();
const START = Symbol();
const END = Symbol();
const LENGTH = Symbol();
const ZOOM = Symbol();
const MIN_ZOOM = Symbol();
const MAX_ZOOM = Symbol();
const SPAN = Symbol();
const SUB_SPANS = Symbol();

const setLayout = Symbol();
const setZoom = Symbol();
const calcSpans = Symbol();
const buildSlides = Symbol();
const renderSpan = Symbol();
const getSpanOffset = Symbol();

export default class Timeline extends NextPrevMixin(Control) {
	constructor(settings = {}) {
		settings.canZoom = enforceBoolean(settings.canZoom, true);
		settings.NextPrevMixin = {
			onShowButtons: (onChange) => {
				self[VIRTUAL_LIST].onLayoutChange(onChange);
			},
			onHideButtons: () => {
				self[VIRTUAL_LIST].onLayoutChange(null);
			},
			isAtStart: () => self[VIRTUAL_LIST].isAtStart(),
			isAtEnd: () => self[VIRTUAL_LIST].isAtEnd(),
			onPrev: () => self[VIRTUAL_LIST].prevPage(),
			onNext: () => self[VIRTUAL_LIST].nextPage()
		};

		super(settings);

		const self = this;
		self[ZOOM] = 1;
		self[MAX_ZOOM] = SPANS[SPANS.length - 1].max;

		self.addClass('timeline');

		self[LINE] = new Div({
			container: self,
			classes: 'line'
		});

		self[VIRTUAL_LIST] = new VirtualList({
			container: self.element(),
			isHorizontal: true,
			height: settings.height,
			itemControl: TimeSpan,
			hideScrollBars: true,
			keepAltRows: false,
			onItemRender: (control, data) => {
				self[renderSpan](control, data);
			}
		});

		self.onResize(() => {
			self[MIN_SPAN_WIDTH] = minSpanWidth.toPixels(true);
			self[MIN_SUB_SPAN_WIDTH] = minSubSpanWidth.toPixels(true);
			self[setLayout]();
		});

		applySettings(self, settings);
	}

	[setZoom](newZoom) {
		const self = this;

		newZoom = Math.max(newZoom, self[MIN_ZOOM] || 0);
		newZoom = Math.min(newZoom, self[MAX_ZOOM]);

		if (newZoom !== self[ZOOM] || (self.data().length && !self[VIRTUAL_LIST].itemSize())) {
			self[ZOOM] = newZoom;
			self[calcSpans]();
		}
	}

	[getSpanOffset](span, date) {
		const start = moment(date).startOf(span.incUnit).toDate();
		const end = moment(date).endOf(span.incUnit).toDate();

		return (date - start) / (end - start);
	}

	[calcSpans]() {
		const self = this;

		SPANS.some((span) => {
			if (span.min <= self[ZOOM] && span.max >= self[ZOOM]) {
				let slides;

				if (self[SPAN] !== span) {
					self[SPAN] = span;
					slides = self[buildSlides]();
				}

				let slideWidth = self[ZOOM] * self[MIN_SPAN_WIDTH] * (self[SPAN].length / MILLISECONDS_IN_YEAR);

				self[SPAN].subSpans.some((subSpan) => {
					if (slideWidth / subSpan > self[MIN_SUB_SPAN_WIDTH]) {
						self[SUB_SPANS] = subSpan;
						if (!slides) {
							self[VIRTUAL_LIST].getRenderedControls().forEach((control) => {
								control.subSpans(self[SUB_SPANS]);
							});
						}
						return true;
					}
				});

				self[VIRTUAL_LIST]
					.itemSize(slideWidth + PIXELS)
					.startOffset(-self[getSpanOffset](span, self[START]) * slideWidth)
					.endOffset(-((1 - self[getSpanOffset](span, self[END])) + 1) * slideWidth);

				if (slides) {
					self[VIRTUAL_LIST].itemData(slides);
				}

				return true;
			}
		});
	}

	[buildSlides]() {
		const self = this;
		const slides = [];
		const totalSlides = Math.ceil(self[LENGTH] / self[SPAN].length) + 1;
		const currentValue = moment(self[START]);

		repeat(totalSlides, () => {
			const title = currentValue.format(self[SPAN].format);

			slides.push({
				ID: 'span_' + title,
				title: title,
				events: [],
				start: moment(currentValue)
					.startOf(self[SPAN].incUnit).toDate(),
				end: moment(currentValue)
					.endOf(self[SPAN].incUnit)
					.add(self[SPAN].incValue - 1, self[SPAN].incUnit)
					.toDate()
			});

			currentValue.add(self[SPAN].incValue, self[SPAN].incUnit);
		});

		const start = slides[0].start;

		self.data().forEach((item) => {
			if (!isNaN(item.date)) {
				const diff = Math.floor((item.date - start) / self[SPAN].length);
				if (slides[diff]) {
					slides[diff].events.push(item);
				}
			}
		});

		return slides;
	}

	[renderSpan](control, data) {
		const self = this;

		control
			.lineOffset(self.lineOffset())
			.title(data.title)
			.subTitle(data.subTitle)
			.subSpans(self[SUB_SPANS]);

		if (self.onSpanRender()) {
			self.onSpanRender()(control, data);
		}
	}
}

Object.assign(Timeline.prototype, {
	[setLayout]: throttle(function() {
		const self = this;

		self[LENGTH] = self[END] - self[START];

		const baseZoomMsPerPixel = MILLISECONDS_IN_YEAR / self[MIN_SPAN_WIDTH];
		const minZoom = baseZoomMsPerPixel / (self[LENGTH] / self.innerWidth());

		if (minZoom !== self[MIN_ZOOM]) {
			self[MIN_ZOOM] = minZoom;
			self[setZoom](self[ZOOM]);
		}
	}, 0, {
		leading: false
	}),
	padding: method.thickness({
		init: new Thickness('0'),
		set: function(padding) {
			this[VIRTUAL_LIST].padding(padding);
			this[setLayout]();
		}
	}),
	data: method.array({
		set: function(data) {
			const self = this;

			self[START] = data[0].date;
			self[END] = data[0].date;

			data.forEach((item) => {
				if (item.date) {
					if (item.date > self[END]) {
						self[END] = item.date;
					}
					if (item.endDate > self[END]) {
						self[END] = item.date;
					}
					if (item.date < self[START]) {
						self[START] = item.date;
					}
					if (item.startDate < self[START]) {
						self[START] = item.date;
					}
				}
			});

			self[setLayout]();
		}
	}),
	dateStart: method.date({
		set: function(dateStart) {
			this[START] = dateStart;
			this[setLayout]();
		},
		coerce: true
	}),
	dateEnd: method.date({
		set: function(dateEnd) {
			this[END] = dateEnd;
			this[setLayout]();
		},
		coerce: true
	}),
	lineOffset: method.cssSize({
		set: function(lineOffset) {
			const self = this;

			lineOffset.element(self.element());

			if (lineOffset.toPixels(true) < 0) {
				self[LINE].css(BOTTOM, -lineOffset.toPixels(true) + PIXELS);
			}
			else {
				self[LINE].css(TOP, lineOffset.toPixels());
			}

			self[VIRTUAL_LIST].getRenderedControls()
				.forEach((control) => {
					control.lineOffset(lineOffset);
				});
		}
	}),
	onSpanRender: method.function(),
	canZoom: method.boolean({
		set: function(canZoom) {
			const self = this;
			const onMouseWheel = () => {
				event.preventDefault();
				event.stopPropagation();

				self[setZoom](self[ZOOM] + (self[ZOOM] * (event.deltaY / -1000)));
			};

			self[VIRTUAL_LIST]
				.on(MOUSE_WHEEL_EVENT, canZoom ? onMouseWheel : null);

		}
	}),
	maxZoom: method.enum({
		enum: SPAN_TYPES,
		init: SPAN_TYPES.MILLISECOND,
		set: function() {
			const self = this;

			SPANS.some((span) => {
				if (span.type === self.maxZoom()) {
					self[MAX_ZOOM] = span.max;
					return true;
				}
			});

			self[setZoom](self[ZOOM]);
		}
	})
});

Timeline.SPAN_TYPES = SPAN_TYPES;
