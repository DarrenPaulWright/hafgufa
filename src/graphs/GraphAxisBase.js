import { axisBottom, axisLeft, axisRight, axisTop, scaleBand, scaleLinear, select } from 'd3';
import { fill } from 'object-agent';
import { Enum, methodAny, methodEnum, methodNumber, methodString } from 'type-enforcer-ui';
import d3Helper from '../utility/d3Helper';
import accuracy from '../utility/math/accuracy';
import round from '../utility/math/round';
import setDefaults from '../utility/setDefaults.js';
import GraphBase from './GraphBase';

const MIN_AXIS_SIZE = 20;
const AXIS_LABEL_OFFSET = 6;

const DATA_TYPES = new Enum({
	TWO_AXIS: GraphBase.DATA_TYPES.TWO_AXIS,
	THREE_AXIS: GraphBase.DATA_TYPES.THREE_AXIS,
	FOUR_AXIS: GraphBase.DATA_TYPES.FOUR_AXIS,
	FOUR_AXIS_RANGE: GraphBase.DATA_TYPES.FOUR_AXIS_RANGE
});
const SCALE_TYPES = new Enum({
	BAND: 'band',
	LINEAR: 'linear'
});

const buildScale = Symbol();
const buildDomain = Symbol();
const updateSize = Symbol();
const setScaleRange = Symbol();
const getOptimalTicks = Symbol();
const updateData = Symbol();

const SVG = Symbol();
const X_SCALE = Symbol();
const Y_SCALE = Symbol();
const RENDERED_WIDTH = Symbol();
const RENDERED_HEIGHT = Symbol();

/**
 * @class GraphAxisBase
 * @extends GraphBase
 * @constructor
 *
 * @param {Object} settings
 */
export default class GraphAxisBase extends GraphBase {
	constructor(settings = {}) {
		super(setDefaults({
			xScaleType: SCALE_TYPES.LINEAR,
			yScaleType: SCALE_TYPES.LINEAR
		}, settings));

		const self = this;
		self[RENDERED_WIDTH] = 0;
		self[RENDERED_HEIGHT] = 0;

		self[SVG] = select(self.svgElement());

		self[SVG].append('g')
			.attr('class', 'axis xAxis');

		self[SVG].append('g')
			.attr('class', 'axis yAxis');

		self.onUpdateSize((renderWidth, renderHeight) => {
				self[updateSize](renderWidth, renderHeight);
			})
			.onUpdateData(() => {
				self[updateData]();
			});
	}

	[buildScale](scaleType) {
		switch (scaleType) {
			case SCALE_TYPES.BAND:
				return scaleBand().padding(0.1);
			case SCALE_TYPES.LINEAR:
				return scaleLinear().nice();
		}
	}

	[buildDomain](direction, data) {
		const self = this;
		let minValue = self[direction + 'Min']();
		let maxValue = self[direction + 'Max']();
		const interval = self[direction + 'Interval']();
		const intervalAccuracy = accuracy(interval);
		let output = [];

		const setValue = (value, limits, prefix, ySuffix, xSuffix) => {
			if (value !== null) {
				return value;
			}

			const newValue = limits[prefix + (direction === 'y' ? ySuffix : xSuffix)];

			return value ? Math[prefix](value, newValue) : newValue;
		};

		data.forEach((dataObject) => {
			switch (dataObject.dataType) {
				case DATA_TYPES.TWO_AXIS:
					minValue = setValue(minValue, dataObject.limits, 'min', 'Value', 'Label');
					maxValue = setValue(maxValue, dataObject.limits, 'max', 'Value', 'Label');
					break;
				case DATA_TYPES.THREE_AXIS:
				case DATA_TYPES.FOUR_AXIS:
					minValue = setValue(minValue, dataObject.limits, 'min', 'Y', 'X');
					maxValue = setValue(maxValue, dataObject.limits, 'max', 'Y', 'X');
					break;
				case DATA_TYPES.FOUR_AXIS_RANGE:
					minValue = setValue(minValue, dataObject.limits, 'min', 'YMin', 'XMin');
					maxValue = setValue(maxValue, dataObject.limits, 'max', 'YMax', 'XMax');
					break;
			}

			switch (self[direction + 'ScaleType']()) {
				case SCALE_TYPES.BAND:
					if (interval !== null) {
						output = fill(
							(maxValue - minValue) / interval,
							(index) => round((minValue + (index * interval)), intervalAccuracy)
						);
					}
					else {
						if (dataObject.data) {
							output = dataObject.data.map((d) => {
								if (d.label) {
									return d.label.toString ? d.label.toString() : d.label;
								}
								else if (d.x) {
									return d.x.toString ? d.x.toString() : d.x;
								}
							});
						}
					}
					break;
				case SCALE_TYPES.LINEAR:
					output = [minValue, maxValue];
			}
		});

		return output;
	}

	[updateSize](renderWidth, renderHeight) {
		const self = this;

		self[RENDERED_WIDTH] = renderWidth - self.graphPadding().horizontal;
		self[RENDERED_HEIGHT] = renderHeight - self.graphPadding().vertical;

		self[setScaleRange](self[RENDERED_WIDTH], self[RENDERED_HEIGHT]);
	}

	[setScaleRange](width, height) {
		const self = this;

		if (self[SVG] && self[X_SCALE] && self[Y_SCALE]) {
			self[X_SCALE].rangeRound([0, width]);
			self[Y_SCALE].rangeRound([height, 0]);
		}
	}

	[getOptimalTicks](size, scale, interval) {
		const sizeTicks = Math.floor(size / MIN_AXIS_SIZE);
		const scaleTicks = Math.ceil((scale.domain()[scale.domain().length - 1] - scale.domain()[0]) / (interval || 1));

		return Math.min(sizeTicks, scaleTicks);
	}

	[updateData]() {
		const self = this;
		const padding = self.graphPadding();
		let data = self.data();

		const buildXAxis = () => {
			let labelSize = 0;
			let label;

			self[SVG].select('.xAxis')
				.attr(
					'transform',
					'translate(' + (padding.left + self.yAxisSize()) + ',' + (self[RENDERED_HEIGHT] + padding.top - self.xAxisSize()) + ')'
				)
				.call((g) => {
					switch (self.xScaleType()) {
						case SCALE_TYPES.BAND:
							g.call(axisBottom(self[X_SCALE])
								.tickFormat((l) => l + self.xSuffix())
							);
							break;
						case SCALE_TYPES.LINEAR:
							g.call(axisTop(self[X_SCALE])
								.tickSize(self[RENDERED_HEIGHT] - self.xAxisSize())
								.ticks(self[getOptimalTicks](self[RENDERED_WIDTH], self[X_SCALE], self.xInterval()))
								.tickFormat((l) => l + self.xSuffix())
							);
							g.selectAll('.tick text')
								.attr('alignment-baseline', 'middle')
								.attr('text-anchor', 'middle')
								.attr('y', 12);
							g.selectAll('.tick line')
								.attr('stroke-dasharray', '3,5');
							break;
					}

					g.select('.domain').remove();

					if (self.xLabel()) {
						g.selectAll('.label').remove();
						label = g.append('text');
						labelSize = d3Helper.maxTextHeight(label);
						label
							.classed('label', true)
							.attr('text-anchor', 'middle')
							.attr(
								'transform',
								'translate(' + ((self[RENDERED_WIDTH] - self.yAxisSize()) / 2) + ',' + (self.xAxisSize()) + ')'
							)
							.text(self.xLabel());
						labelSize += AXIS_LABEL_OFFSET;
					}

					self.xAxisSize(labelSize + d3Helper.maxTextHeight(g.selectAll('.tick text')) + AXIS_LABEL_OFFSET);
				});
		};

		const buildYAxis = () => {
			let labelSize = 0;
			let label;

			self[SVG].select('.yAxis')
				.attr('transform', 'translate(' + (padding.left + self.yAxisSize()) + ',' + padding.top + ')')
				.call((g) => {
					switch (self.yScaleType()) {
						case SCALE_TYPES.BAND:
							g.call(axisLeft(self[Y_SCALE])
								.tickFormat((l) => l + self.ySuffix())
							);
							break;
						case SCALE_TYPES.LINEAR:
							g.call(axisRight(self[Y_SCALE])
								.tickSize(self[RENDERED_WIDTH] - self.yAxisSize())
								.ticks(self[getOptimalTicks](self[RENDERED_HEIGHT], self[Y_SCALE], self.yInterval()))
								.tickFormat((l) => l + self.ySuffix())
							);
							g.selectAll('.tick text')
								.attr('alignment-baseline', 'middle')
								.attr('text-anchor', 'end')
								.attr('x', -AXIS_LABEL_OFFSET)
								.attr('y', -3);
							g.selectAll('.tick line')
								.attr('stroke-dasharray', '3,5');
							break;
					}

					g.select('.domain').remove();

					if (self.yLabel()) {
						g.selectAll('.label').remove();
						label = g.append('text');
						labelSize = d3Helper.maxTextHeight(label);
						label
							.classed('label', true)
							.attr('text-anchor', 'middle')
							.attr(
								'transform',
								'translate(-' + (self.yAxisSize() - labelSize) + ',' + ((self[RENDERED_HEIGHT] - self.xAxisSize()) / 2) + ') rotate(-90)'
							)
							.text(self.yLabel());
						labelSize += AXIS_LABEL_OFFSET * 2;
					}

					self.yAxisSize(labelSize + d3Helper.maxTextWidth(g.selectAll('.tick text')) + AXIS_LABEL_OFFSET);
				});
		};

		if (self[SVG] && self[X_SCALE] && self[Y_SCALE]) {
			self.yAxisSize(20);
			self.xAxisSize(20);

			self[X_SCALE].domain(self[buildDomain]('x', data));
			self[Y_SCALE].domain(self[buildDomain]('y', data));

			buildXAxis();
			buildYAxis();
			self[setScaleRange](self[RENDERED_WIDTH] - self.yAxisSize(), self[RENDERED_HEIGHT] - self.xAxisSize());
			buildXAxis();
			buildYAxis();
		}
	}
}

Object.assign(GraphAxisBase.prototype, {
	xLabel: methodString({
		set: updateData
	}),

	xSuffix: methodString({
		set: updateData
	}),

	xAxisSize: methodNumber({
		init: 0
	}),

	xScale: methodAny({
		get() {
			return this[X_SCALE];
		}
	}),

	xScaleType: methodEnum({
		enum: SCALE_TYPES,
		set(xScaleType) {
			this[X_SCALE] = this[buildScale](xScaleType);
		}
	}),

	xMin: methodNumber({
		init: null,
		set: updateData,
		other: null
	}),

	xMax: methodNumber({
		init: null,
		set: updateData,
		other: null
	}),

	xInterval: methodNumber({
		init: null,
		set: updateData,
		other: null
	}),

	yLabel: methodString({
		set: updateData
	}),

	ySuffix: methodString({
		set: updateData
	}),

	yAxisSize: methodNumber({
		init: 0
	}),

	yScale: methodAny({
		get() {
			return this[Y_SCALE];
		}
	}),

	yScaleType: methodEnum({
		enum: SCALE_TYPES,
		set(yScaleType) {
			this[Y_SCALE] = this[buildScale](yScaleType);
		}
	}),

	yMin: methodNumber({
		init: null,
		set: updateData,
		other: null
	}),

	yMax: methodNumber({
		init: null,
		set: updateData,
		other: null
	}),

	yInterval: methodNumber({
		init: null,
		set: updateData,
		other: null
	}),

	zLabel: methodString({
		set: updateData
	}),

	zSuffix: methodString({
		set: updateData
	})
});

GraphAxisBase.DATA_TYPES = DATA_TYPES;
GraphAxisBase.SCALE_TYPES = SCALE_TYPES;
