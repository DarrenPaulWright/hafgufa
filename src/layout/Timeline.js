import { throttle } from 'async-agent';
import moment from 'moment';
import { repeat } from 'object-agent';
import {
	applySettings,
	CssSize,
	enforceBoolean,
	Enum,
	isInteger,
	methodArray,
	methodBoolean,
	methodCssSize,
	methodDate,
	methodEnum,
	methodFunction,
	methodNumber,
	methodThickness,
	PIXELS,
	Thickness
} from 'type-enforcer-ui';
import Control from '../Control';
import Div from '../elements/Div';
import IsWorkingMixin from '../mixins/IsWorkingMixin';
import NextPrevMixin from '../mixins/NextPrevMixin';
import { BOTTOM, MOUSE_WHEEL_EVENT, TOP } from '../utility/domConstants';
import clamp from '../utility/math/clamp';
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
	incUnit: 'y'
}, {
	min: 0.25,
	max: 0.5,
	type: SPAN_TYPES.CENTURY,
	length: MILLISECONDS_IN_YEAR * 100,
	subSpans: [10, 5, 2],
	format: 'YYYY',
	incUnit: 'y'
}, {
	min: 0.5,
	max: 1,
	type: SPAN_TYPES.DECADE,
	length: MILLISECONDS_IN_YEAR * 10,
	subSpans: [10, 5, 2],
	format: 'YYYY',
	incUnit: 'y'
}, {
	min: 1,
	max: MONTHS_IN_YEAR,
	type: SPAN_TYPES.YEAR,
	length: MILLISECONDS_IN_YEAR,
	subSpans: [12, 6, 4, 2],
	format: 'YYYY',
	incUnit: 'y'
}, {
	min: MONTHS_IN_YEAR,
	max: MONTHS_IN_YEAR * 30,
	type: SPAN_TYPES.MONTH,
	length: MILLISECONDS_IN_YEAR / MONTHS_IN_YEAR,
	subSpans: [30, 4, 2],
	format: 'MMM YYYY',
	incUnit: 'M'
}, {
	min: MONTHS_IN_YEAR * 30,
	max: MONTHS_IN_YEAR * 30 * HOURS_IN_DAY,
	type: SPAN_TYPES.DAY,
	length: MILLISECONDS_IN_DAY,
	subSpans: [24, 12, 6, 4, 2],
	format: 'D MMM YYYY',
	incUnit: 'd'
}, {
	min: MONTHS_IN_YEAR * 30 * HOURS_IN_DAY,
	max: MONTHS_IN_YEAR * 30 * HOURS_IN_DAY * MINUTES_IN_HOUR,
	type: SPAN_TYPES.HOUR,
	length: MINUTES_IN_HOUR * SECONDS_IN_MINUTE * MILLISECONDS_IN_SECOND,
	subSpans: [60, 30, 12, 6, 4, 2],
	format: 'ha, D MMM YYYY',
	incUnit: 'h'
}, {
	min: MONTHS_IN_YEAR * 30 * HOURS_IN_DAY * MINUTES_IN_HOUR,
	max: MONTHS_IN_YEAR * 30 * HOURS_IN_DAY * MINUTES_IN_HOUR * SECONDS_IN_MINUTE,
	type: SPAN_TYPES.MINUTE,
	length: SECONDS_IN_MINUTE * MILLISECONDS_IN_SECOND,
	subSpans: [60, 30, 12, 6, 4, 2],
	format: 'h:mma, D MMM YYYY',
	incUnit: 'm'
}, {
	min: MONTHS_IN_YEAR * 30 * HOURS_IN_DAY * MINUTES_IN_HOUR * SECONDS_IN_MINUTE,
	max: MONTHS_IN_YEAR * 30 * HOURS_IN_DAY * MINUTES_IN_HOUR * SECONDS_IN_MINUTE * MILLISECONDS_IN_SECOND,
	type: SPAN_TYPES.SECOND,
	length: MILLISECONDS_IN_SECOND,
	subSpans: [1000, 500, 200, 100, 50, 20, 10, 5, 2],
	format: 'h:mm:ssa, D MMM YYYY',
	incUnit: 's'
}, {
	min: MONTHS_IN_YEAR * 30 * HOURS_IN_DAY * MINUTES_IN_HOUR * SECONDS_IN_MINUTE * MILLISECONDS_IN_SECOND,
	max: MONTHS_IN_YEAR * 30 * HOURS_IN_DAY * MINUTES_IN_HOUR * SECONDS_IN_MINUTE * MILLISECONDS_IN_SECOND * 1000,
	type: SPAN_TYPES.MILLISECOND,
	length: 1,
	subSpans: [1000, 500, 200, 100, 50, 20, 10, 5, 2],
	format: 'h:mm:ssa, D MMM YYYY',
	incUnit: 'ms'
}];

const minSpanWidth = new CssSize('8rem');
const minDurationSpanWidth = new CssSize('6rem');
const minSubSpanWidth = new CssSize('0.5rem');

const LINE = Symbol();
const VIRTUAL_LIST = Symbol();
const MIN_SPAN_WIDTH = Symbol();
const MIN_DURATION_SPAN_WIDTH = Symbol();
const MIN_SUB_SPAN_WIDTH = Symbol();
const INNER_WIDTH = Symbol();
const START = Symbol();
const END = Symbol();
const LENGTH = Symbol();
const ZOOM = Symbol();
const MIN_ZOOM = Symbol();
const MAX_ZOOM = Symbol();
const SPAN = Symbol();
const PARENT_SPAN = Symbol();
const PARENT_SUB_SPAN = Symbol();
const PARENT_MULTIPLIER = Symbol();
const SUB_SPANS = Symbol();

const reset = Symbol();
const setLayout = Symbol();
const setZoom = Symbol();
const calcSpans = Symbol();
const buildSlides = Symbol();
const renderSpan = Symbol();
const getSpanOffset = Symbol();

export default class Timeline extends IsWorkingMixin(NextPrevMixin(Control)) {
	constructor(settings = {}) {
		settings.canZoom = enforceBoolean(settings.canZoom, true);
		settings.NextPrevMixin = {
			onShowButtons(onChange) {
				self[VIRTUAL_LIST].onLayoutChange(onChange);
			},
			onHideButtons() {
				self[VIRTUAL_LIST].onLayoutChange(null);
			},
			isAtStart() {
				return self[VIRTUAL_LIST].isAtStart();
			},
			isAtEnd() {
				return self[VIRTUAL_LIST].isAtEnd();
			},
			onPrev() {
				return self[VIRTUAL_LIST].prevPage();
			},
			onNext() {
				return self[VIRTUAL_LIST].nextPage();
			}
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
			container: self,
			isHorizontal: true,
			height: settings.height,
			itemControl: TimeSpan,
			hideScrollBars: true,
			keepAltRows: false,
			onItemRender(control, data) {
				self[renderSpan](control, data);
			}
		});

		self[setLayout] = throttle(function() {
			const self = this;
			const minSpanWidth = self.duration() === undefined ? self[MIN_SPAN_WIDTH] : self[MIN_DURATION_SPAN_WIDTH];

			self[LENGTH] = self[END] - self[START];

			const baseZoomMsPerPixel = MILLISECONDS_IN_YEAR / minSpanWidth;
			const minZoom = baseZoomMsPerPixel / (self[LENGTH] / self[INNER_WIDTH]);

			if (minZoom !== self[MIN_ZOOM]) {
				self[MIN_ZOOM] = minZoom;
				self[setZoom](self[ZOOM]);
			}
		}, 0, {
			leading: false
		});

		self.onResize(() => {
			self[MIN_SPAN_WIDTH] = minSpanWidth.toPixels(true);
			self[MIN_DURATION_SPAN_WIDTH] = minDurationSpanWidth.toPixels(true);
			self[MIN_SUB_SPAN_WIDTH] = minSubSpanWidth.toPixels(true);

			const innerWidth = self[VIRTUAL_LIST].innerWidth();
			if (innerWidth !== self[INNER_WIDTH]) {
				self[INNER_WIDTH] = innerWidth;
				self[reset]();
			}
		});

		applySettings(self, settings);
	}

	[setZoom](newZoom) {
		const self = this;

		newZoom = clamp(newZoom, self[MIN_ZOOM] || 0, self[MAX_ZOOM]);

		if (newZoom !== self[ZOOM] || (self.data().length && !self[VIRTUAL_LIST].itemSize())) {
			self[ZOOM] = newZoom;
			self[calcSpans]();
		}
	}

	[getSpanOffset](span, date) {
		if (!span.incUnit) {
			return 1;
		}

		date = date.valueOf ? date.valueOf() : date;

		const start = moment(date)
			.startOf(span.incUnit)
			.toDate();
		const end = moment(date + (span.length * (this[PARENT_MULTIPLIER] - 1)))
			.endOf(span.incUnit)
			.toDate();

		return (date - start) / (end - start);
	}

	[calcSpans]() {
		const self = this;
		const minSpanWidth = self.duration() === undefined ? self[MIN_SPAN_WIDTH] : self[MIN_DURATION_SPAN_WIDTH];

		self[PARENT_SPAN] = null;
		self[PARENT_SUB_SPAN] = 1;
		self[PARENT_MULTIPLIER] = 1;

		SPANS.some((span) => {
			if ((span.min <= self[ZOOM] && span.max >= self[ZOOM]) || self[PARENT_SPAN]) {
				let slides;
				let subSpans;

				if (self[SPAN] !== span) {
					self[SPAN] = span;
				}

				let slideWidth = self[ZOOM] * minSpanWidth * (self[SPAN].length / MILLISECONDS_IN_YEAR);

				if (self[PARENT_SPAN]) {
					self[PARENT_MULTIPLIER] = self[PARENT_SPAN].length / self[SPAN].length / self[PARENT_SUB_SPAN];
					slideWidth = slideWidth * self[PARENT_MULTIPLIER];
				}
				else {
					self[SPAN].subSpans.some((subSpan) => {
						if (slideWidth / subSpan > minSpanWidth) {
							self[PARENT_SPAN] = span;
							self[PARENT_SUB_SPAN] = subSpan;
							return true;
						}
					});
				}

				if (self[PARENT_SPAN] && self[PARENT_SPAN] === self[SPAN]) {
					return false;
				}
				else {
					slides = self[buildSlides]();
				}

				if (self[PARENT_SPAN]) {
					subSpans = self[SPAN].subSpans
						.map((subSpan) => subSpan * self[PARENT_SPAN].subSpans[0])
						.concat(self[PARENT_SPAN].subSpans)
						.map((subSpan) => subSpan / self[PARENT_SUB_SPAN])
						.filter(isInteger);
				}
				else {
					subSpans = self[SPAN].subSpans;
				}

				subSpans.some((subSpan) => {
					if (slideWidth / subSpan > self[MIN_SUB_SPAN_WIDTH]) {
						self[SUB_SPANS] = subSpan;
						if (!slides) {
							self[VIRTUAL_LIST].getRenderedControls()
								.forEach((control) => {
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
		const isDuration = self.duration() !== undefined;
		const spanLength = self[SPAN].length * self[PARENT_MULTIPLIER];
		const totalSlides = Math.ceil(self[LENGTH] / spanLength) + 1;
		const currentValue = isDuration ? moment.utc(0) : moment(self[START].valueOf());
		const format = isDuration ? (self[SPAN].incUnit !== 'ms' ? 'HH:mm:ss' : 'HH:mm:ss.SSS') : self[SPAN].format;
		const exporter = isDuration ? ((value) => value.toDate()
			.valueOf()) : ((value) => value.toDate());

		repeat(totalSlides, () => {
			const title = currentValue.format(format);

			slides.push({
				id: 'span_' + title,
				title: title,
				events: [],
				start: exporter(moment(currentValue)
					.startOf(self[SPAN].incUnit)),
				end: exporter(moment(currentValue + (self[SPAN].length * (self[PARENT_MULTIPLIER] - 1)))
					.endOf(self[SPAN].incUnit))
			});

			currentValue.add(spanLength);
		});

		const start = slides[0].start;

		self.data()
			.forEach((item) => {
				if (!isNaN(item.date)) {
					const diff = Math.floor((item.date.valueOf() - start) / spanLength);
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
	[reset]() {
		this[SPAN] = undefined;
		this[MIN_ZOOM] = undefined;
		this[ZOOM] = 1;
		this[setLayout]();
	},
	padding: methodThickness({
		init: new Thickness('0'),
		set(padding) {
			this[VIRTUAL_LIST].padding(padding);
			this[reset]();
		}
	}),
	data: methodArray({
		set(data) {
			const self = this;

			if (!(self.dateStart() && self.dateEnd()) && !self.duration()) {
				self[START] = data[0].startdate || data[0].date;
				self[END] = data[0].endDate || data[0].date;

				self[START] = self[START].valueOf();
				self[END] = self[END].valueOf();

				data.forEach((item) => {
					if (item.date) {
						if (item.date.valueOf() > self[END]) {
							self[END] = item.date.valueOf();
						}
						if (item.endDate && item.endDate.valueOf() > self[END]) {
							self[END] = item.endDate.valueOf();
						}
						if (item.date.valueOf() < self[START]) {
							self[START] = item.date.valueOf();
						}
						if (item.startDate && item.startDate.valueOf() < self[START]) {
							self[START] = item.startDate.valueOf();
						}
					}
				});
			}

			self[reset]();
		}
	}),
	dateStart: methodDate({
		set(dateStart) {
			this[START] = dateStart;
			this[reset]();
		},
		coerce: true
	}),
	dateEnd: methodDate({
		set(dateEnd) {
			this[END] = dateEnd;
			this[reset]();
		},
		coerce: true
	}),
	duration: methodNumber({
		set(duration) {
			this[START] = 0;
			this[END] = duration;
			this[reset]();
		}
	}),
	lineOffset: methodCssSize({
		set(lineOffset) {
			const self = this;

			lineOffset.element(self.element);

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
	onSpanRender: methodFunction(),
	canZoom: methodBoolean({
		set(canZoom) {
			const self = this;
			const onMouseWheel = (event) => {
				event.preventDefault();
				event.stopPropagation();

				self[setZoom](self[ZOOM] + (self[ZOOM] * (event.deltaY / -1000)));
			};

			self[VIRTUAL_LIST]
				.set(MOUSE_WHEEL_EVENT, onMouseWheel, canZoom);

		}
	}),
	maxZoom: methodEnum({
		enum: SPAN_TYPES,
		init: SPAN_TYPES.MILLISECOND,
		set(maxZoom) {
			const self = this;

			SPANS.some((span) => {
				if (span.type === maxZoom) {
					self[MAX_ZOOM] = span.max;
					return true;
				}
			});

			self[setZoom](self[ZOOM]);
		}
	})
});

Timeline.SPAN_TYPES = SPAN_TYPES;
