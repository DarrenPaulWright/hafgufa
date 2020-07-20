import { select } from 'd3';
import { applySettings, INITIAL, NONE } from 'type-enforcer-ui';
import controlTypes from '../controlTypes.js';
import d3Helper from '../utility/d3Helper.js';
import { HEIGHT, MOUSE_OUT_EVENT, MOUSE_OVER_EVENT, OPACITY, WIDTH } from '../utility/domConstants.js';
import setDefaults from '../utility/setDefaults.js';
import GraphAxisBase from './GraphAxisBase.js';
import { DURATION, FADE_OPACITY, HILITE_OPACITY, START_OPACITY } from './graphConstants.js';
import './Scatter.less';

const MAX_DOT_STROKE_WIDTH = 16;
const RANGE_CORNER_RADIUS = 12;
const RANGE_FILL_OPACITY = 0.3;

const POINTER_EVENTS = 'pointer-events';

const legendOnMouseOverItem = Symbol();
const legendOnSelectionChange = Symbol();
const isVisibleItem = Symbol();
const fadeItemsNormal = Symbol();
const onMouseOverDatum = Symbol();
const onMouseOutDatum = Symbol();
const setupGraph = Symbol();
const updateSize = Symbol();
const updateData = Symbol();

const SVG = Symbol();
const DOTS = Symbol();
const RANGES = Symbol();
const RENDERED_WIDTH = Symbol();
const RENDERED_HEIGHT = Symbol();
const RADIUS_MULTIPLIER = Symbol();
const UNIQUE_Z_VALUES = Symbol();
const VISIBLE_ITEMS = Symbol();

/**
 * @class Scatter
 * @extends GraphAxisBase
 * @class
 *
 * @param {object} settings
 */
export default class Scatter extends GraphAxisBase {
	constructor(settings = {}) {
		super(setDefaults({
			type: controlTypes.SCATTER,
			xScaleType: GraphAxisBase.SCALE_TYPES.LINEAR,
			yScaleType: GraphAxisBase.SCALE_TYPES.LINEAR
		}, settings));

		const self = this;
		self[RENDERED_WIDTH] = 0;
		self[RENDERED_HEIGHT] = 0;
		self[RADIUS_MULTIPLIER] = 1;
		self[UNIQUE_Z_VALUES] = [];
		self[VISIBLE_ITEMS] = [];

		applySettings(self, settings);

		self[setupGraph]();
		self.onUpdateSize((renderWidth, renderHeight) => {
			self[updateSize](renderWidth, renderHeight);
		});
		self.onUpdateData(() => {
			self[updateData]();
		});

		self.resize();

		self.onRemove(() => {
			self[DOTS] = null;
			self[SVG] = null;
		});
	}

	[legendOnMouseOverItem](item) {
		const self = this;

		self.data().forEach((dataObject) => {
			if (dataObject.dataType === GraphAxisBase.DATA_TYPES.FOUR_AXIS) {
				d3Helper.fade(self[DOTS], DURATION, 0);
				d3Helper.fade(
					self[DOTS].filter((d) => d.z === item),
					DURATION,
					HILITE_OPACITY
				);
			}
			else if (dataObject.dataType === GraphAxisBase.DATA_TYPES.FOUR_AXIS_RANGE) {
				d3Helper.fade(self[RANGES], DURATION, 0);
				d3Helper.fade(
					self[RANGES].filter((d) => d.z === item),
					DURATION,
					HILITE_OPACITY
				);
			}
		});
	}

	[legendOnSelectionChange](selectedItems) {
		const self = this;

		self[VISIBLE_ITEMS] = selectedItems;

		if (self[DOTS]) {
			self[DOTS]
				.style(POINTER_EVENTS, INITIAL)
				.filter((d) => !self[isVisibleItem](d))
				.style(POINTER_EVENTS, NONE);
		}
		if (self[RANGES]) {
			self[RANGES]
				.style(POINTER_EVENTS, INITIAL)
				.filter((d) => !self[isVisibleItem](d))
				.style(POINTER_EVENTS, NONE);
		}
	}

	[isVisibleItem](d) {
		return this[VISIBLE_ITEMS].length === 0 || this[VISIBLE_ITEMS].includes(d.z);
	}

	[fadeItemsNormal](items) {
		d3Helper.fade(items, DURATION, 0);
		d3Helper.fade(items.filter(this[isVisibleItem]), DURATION, START_OPACITY);
	}

	[onMouseOverDatum](d, item, dataType) {
		const self = this;

		self.tooltip(item, d, dataType);

		if (self[DOTS]) {
			d3Helper.fade(self[DOTS].filter(self[isVisibleItem]), DURATION, FADE_OPACITY);

			if (dataType === GraphAxisBase.DATA_TYPES.FOUR_AXIS_RANGE) {
				d3Helper.fade(self[DOTS].filter((datum) => self[isVisibleItem](d) &&
					datum.x <= d.xMax &&
					datum.x >= d.xMin &&
					datum.y <= d.yMax &&
					datum.y >= d.yMin &&
					datum.z === d.z), DURATION, HILITE_OPACITY);
			}
		}
		if (self[RANGES]) {
			d3Helper.fade(
				self[RANGES].filter(self[isVisibleItem]),
				DURATION,
				FADE_OPACITY
			);

			if (dataType === GraphAxisBase.DATA_TYPES.FOUR_AXIS) {
				d3Helper.fade(self[RANGES].filter((datum) => self[isVisibleItem](d) &&
					datum.xMin <= d.x &&
					datum.xMax >= d.x &&
					datum.yMin <= d.y &&
					datum.yMax >= d.y &&
					datum.z === d.z), DURATION, HILITE_OPACITY);
			}
		}

		d3Helper.fade(select(item), DURATION, HILITE_OPACITY);
	}

	[onMouseOutDatum]() {
		const self = this;

		self.tooltip(null);

		if (self[DOTS]) {
			self[fadeItemsNormal](self[DOTS]);
		}
		if (self[RANGES]) {
			self[fadeItemsNormal](self[RANGES]);
		}
	}

	[setupGraph]() {
		const self = this;

		self[SVG] = select(self.svgElement())
			.attr('class', 'scatter');
	}

	[updateSize](renderWidth, renderHeight) {
		const self = this;

		self[RENDERED_WIDTH] = renderWidth;
		self[RENDERED_HEIGHT] = renderHeight;
	}

	[updateData]() {
		const self = this;
		const padding = self.graphPadding();
		const data = self.data();
		const xScale = self.xScale();
		const yScale = self.yScale();
		const offsetLeft = padding.left + self.yAxisSize();
		const offsetTop = padding.top;

		const calculateX = (d) => {
			return offsetLeft + xScale(d.x) + (xScale.bandwidth ? xScale.bandwidth() / 2 : 0);
		};

		const calculateY = (d) => {
			return offsetTop + yScale(d.y) + (yScale.bandwidth ? yScale.bandwidth() / 2 : 0);
		};

		const calculateRadius = (d) => (d.value * self[RADIUS_MULTIPLIER]) + 2;

		const calculateStrokeWidth = (d) => Math.max(0, MAX_DOT_STROKE_WIDTH - calculateRadius(d));

		const calculateRangeX = (d) => offsetLeft + xScale(d.xMin);

		const calculateInitialRangeX = (d) => offsetLeft + xScale((d.xMin + d.xMax) / 2);

		const calculateRangeY = (d) => offsetTop + yScale(d.yMax);

		const calculateInitialRangeY = (d) => offsetTop + yScale((d.yMin + d.yMax) / 2);

		const calculateRangeWidth = (d) => Math.abs(xScale(d.xMax) - xScale(d.xMin));

		const calculateRangeHeight = (d) => Math.abs(yScale(d.yMax) - yScale(d.yMin));

		const getOpacity = (d) => self[isVisibleItem](d) ? START_OPACITY : 0;

		if (self[SVG]) {
			self[UNIQUE_Z_VALUES] = [];

			data.forEach((dataObject) => {
				if (dataObject.dataType === GraphAxisBase.DATA_TYPES.FOUR_AXIS || dataObject.dataType === GraphAxisBase.DATA_TYPES.FOUR_AXIS_RANGE) {
					self[UNIQUE_Z_VALUES] = self[UNIQUE_Z_VALUES].concat(dataObject.data.map((d) => d.z).keys());
				}
			});

			if (self[UNIQUE_Z_VALUES].length !== 0) {
				self[UNIQUE_Z_VALUES] = self[UNIQUE_Z_VALUES].reduce((result, item) => {
					if (!result.includes(item)) {
						result.push(item);
					}
					return result;
				}, []);
				self[UNIQUE_Z_VALUES].sort();

				self.legendItems([{
					title: self.zLabel(),
					items: self[UNIQUE_Z_VALUES]
				}]);
				self.legendOnMouseOverItem(self[legendOnMouseOverItem]);
				self.legendOnMouseOutItem(self[onMouseOutDatum]);
				self.legendOnSelectionChange(self[legendOnSelectionChange]);
			}

			data.forEach((dataObject) => {
				if (dataObject.dataType === GraphAxisBase.DATA_TYPES.THREE_AXIS) {
					self[RADIUS_MULTIPLIER] = (Math.min(
						self[RENDERED_WIDTH],
						self[RENDERED_HEIGHT]
					) / 30) / (dataObject.limits ? dataObject.limits.maxValue : 1);

					self[DOTS] = self[SVG].selectAll('.dot')
						.data(dataObject.data);

					self[DOTS].exit()
						.on(MOUSE_OVER_EVENT, null)
						.on(MOUSE_OUT_EVENT, null)
						.transition()
						.duration(DURATION)
						.attr('r', 0)
						.remove();

					self[DOTS].transition()
						.duration(DURATION)
						.attr('r', calculateRadius)
						.attr('stroke-width', calculateStrokeWidth)
						.style(OPACITY, getOpacity)
						.attr('cx', calculateX)
						.attr('cy', calculateY);

					self[DOTS]
						.enter()
						.append('circle')
						.attr('class', 'dot')
						.style('fill', self.color())
						.style(OPACITY, getOpacity)
						.attr('cx', calculateX)
						.attr('cy', calculateY)
						.attr('r', 0)
						.transition()
						.duration(DURATION)
						.attr('r', calculateRadius)
						.attr('stroke-width', calculateStrokeWidth);
				}
				else if (dataObject.dataType === GraphAxisBase.DATA_TYPES.FOUR_AXIS) {
					self[RADIUS_MULTIPLIER] = (Math.min(
						self[RENDERED_WIDTH],
						self[RENDERED_HEIGHT]
					) / 30) / (dataObject.limits ? dataObject.limits.maxValue : 1);

					self[DOTS] = self[SVG].selectAll('.dot')
						.data(dataObject.data);

					self[DOTS].exit()
						.on(MOUSE_OVER_EVENT, null)
						.on(MOUSE_OUT_EVENT, null)
						.transition()
						.duration(DURATION)
						.attr('r', 0)
						.remove();

					self[DOTS].transition()
						.duration(DURATION)
						.attr('r', calculateRadius)
						.attr('stroke-width', calculateStrokeWidth)
						.style(OPACITY, getOpacity)
						.attr('cx', calculateX)
						.attr('cy', calculateY);

					self[DOTS]
						.enter()
						.append('circle')
						.attr('class', 'dot')
						.style('fill', (d) => self.legendItemColor(d.z))
						.style(OPACITY, getOpacity)
						.attr('cx', calculateX)
						.attr('cy', calculateY)
						.attr('r', 0)
						.on(MOUSE_OVER_EVENT, function(d) {
							self[onMouseOverDatum](d, this, dataObject.dataType);
						})
						.on(MOUSE_OUT_EVENT, () => {
							self[onMouseOutDatum]();
						})
						.transition()
						.duration(DURATION)
						.attr('r', calculateRadius)
						.attr('stroke-width', calculateStrokeWidth);
				}
				else if (dataObject.dataType === GraphAxisBase.DATA_TYPES.FOUR_AXIS_RANGE) {
					self[RANGES] = self[SVG].selectAll('.range')
						.data(dataObject.data);

					self[RANGES].exit()
						.on(MOUSE_OVER_EVENT, null)
						.on(MOUSE_OUT_EVENT, null)
						.transition()
						.duration(DURATION)
						.attr(WIDTH, 0)
						.attr(HEIGHT, 0)
						.remove();

					self[RANGES].transition()
						.duration(DURATION)
						.style(OPACITY, getOpacity)
						.attr('x', calculateRangeX)
						.attr('y', calculateRangeY)
						.attr(WIDTH, calculateRangeWidth)
						.attr(HEIGHT, calculateRangeHeight);

					self[RANGES]
						.enter()
						.append('rect')
						.attr('class', 'range')
						.style('stroke', (d) => self.legendItemColor(d.z))
						.style(OPACITY, getOpacity)
						.style('fill-opacity', RANGE_FILL_OPACITY)
						.style('fill', (d) => self.legendItemColor(d.z))
						.attr('rx', RANGE_CORNER_RADIUS)
						.attr('ry', RANGE_CORNER_RADIUS)
						.attr('x', calculateInitialRangeX)
						.attr('y', calculateInitialRangeY)
						.attr(WIDTH, 0)
						.attr(HEIGHT, 0)
						.on(MOUSE_OVER_EVENT, function(d) {
							self[onMouseOverDatum](d, this, dataObject.dataType);
						})
						.on(MOUSE_OUT_EVENT, () => {
							self[onMouseOutDatum]();
						})
						.transition()
						.duration(DURATION)
						.attr('x', calculateRangeX)
						.attr('y', calculateRangeY)
						.attr(WIDTH, calculateRangeWidth)
						.attr(HEIGHT, calculateRangeHeight);
				}
			});
		}
	}
}
