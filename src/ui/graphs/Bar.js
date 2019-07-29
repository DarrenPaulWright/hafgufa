import { color, select } from 'd3';
import { applySettings, enforce, method } from 'type-enforcer';
import d3Helper from '../../utility/d3Helper';
import { ATTR_X, ATTR_Y, CLASS, HEIGHT, OPACITY, WIDTH } from '../../utility/domConstants';
import controlTypes from '../controlTypes';
import './Bar.less';
import GraphAxisBase from './GraphAxisBase';
import * as graphConstants from './graphConstants';

const GRADIENT_ID = 'bar-gradient';
const BAR_LABEL_OFFSET = 4;

const setupGraph = Symbol();
const updateSize = Symbol();
const updateData = Symbol();

const SVG = Symbol();
const BARS = Symbol();
const BAR_LABELS = Symbol();
const RENDERED_HEIGHT = Symbol();

/**
 * @class Bar
 * @extends GraphAxisBase
 * @constructor
 *
 * @arg {Object} settings
 */
export default class Bar extends GraphAxisBase {
	constructor(settings = {}) {
		settings.type = settings.type || controlTypes.BAR;
		settings.xScaleType = enforce.enum(settings.xScaleType, GraphAxisBase.SCALE_TYPES, GraphAxisBase.SCALE_TYPES.BAND);
		settings.yScaleType = enforce.enum(settings.yScaleType, GraphAxisBase.SCALE_TYPES, GraphAxisBase.SCALE_TYPES.LINEAR);

		super(settings);

		const self = this;

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
			self[BARS] = null;
			self[SVG] = null;
		});
	}

	[setupGraph]() {
		const self = this;
		self[SVG] = select(self.svgElement())
			.attr('class', 'bar');

		d3Helper.linearGradient(GRADIENT_ID, self[SVG], {
			x: 0,
			y: 1
		}, {
			x: 1,
			y: 0
		}, [{
			offset: 20,
			color: self.color(),
			opacity: 1
		}, {
			offset: 90,
			color: color(self.color()).brighter(1.8),
			opacity: 1
		}]);
	}

	[updateSize](renderWidth, renderHeight) {
		this[RENDERED_HEIGHT] = renderHeight;
	}

	[updateData]() {
		const self = this;
		const padding = self.graphPadding();
		let data = self.data();
		const xScale = self.xScale();
		const yScale = self.yScale();
		const renderedX = padding.left + self.yAxisSize();
		const renderedY = padding.top;
		const finalHeight = self[RENDERED_HEIGHT] - padding.vertical - self.xAxisSize();

		const getBarX = (d) => renderedX + (xScale(d.label) || 0);

		const getBarY = (d) => renderedY + yScale(d.value);

		const getInitialBarY = () => renderedY + finalHeight;

		const getBarHeight = (d) => finalHeight - yScale(d.value);

		const getBarLabelX = (d) => renderedX + (xScale(d.label) || 0) + (xScale.bandwidth() / 2);

		const getFinalY = () => renderedY + finalHeight;

		const getBarLabelY = function(d) {
			let offset = BAR_LABEL_OFFSET;

			if (isBarHigherThanHalf(d)) {
				offset = -d3Helper.maxTextHeight(select(this));
			}

			return renderedY + yScale(d.value) - offset;
		};

		const isBarHigherThanHalf = (d) => yScale(d.value) < (finalHeight / 2);

		const getInitialBarLabelY = () => renderedY + finalHeight - BAR_LABEL_OFFSET;

		const getBarLabelText = (d) => d.value ? d.value.toString() : '';

		const getBarLabelClass = (d) => {
			if (isBarHigherThanHalf(d)) {
				return 'bar-label inverse';
			}
			return 'bar-label';
		};

		if (self[SVG] && xScale && yScale) {
			data = data.length ? data[0].data : [];

			self[BARS] = self[SVG].selectAll('.bar')
				.data(data);
			self[BAR_LABELS] = self[SVG].selectAll('.bar-label')
				.data(data);

			if (self[BARS].exit) {
				// Remove old bars
				self[BARS].exit()
					.transition()
					.duration(graphConstants.DURATION)
					.attr(ATTR_Y, getFinalY)
					.attr(HEIGHT, 0)
					.remove();

				// Remove old barLabels
				self[BAR_LABELS].exit()
					.transition()
					.duration(graphConstants.DURATION)
					.attr(ATTR_Y, getFinalY)
					.style(OPACITY, 0)
					.remove();

				// Update existing bars
				self[BARS].transition()
					.duration(graphConstants.DURATION)
					.attr(ATTR_X, getBarX)
					.attr(ATTR_Y, getBarY)
					.attr(WIDTH, xScale.bandwidth())
					.attr(HEIGHT, getBarHeight);

				// Update existing barLabels
				self[BAR_LABELS].transition()
					.duration(graphConstants.DURATION)
					.attr(ATTR_X, getBarLabelX)
					.attr(ATTR_Y, getBarLabelY)
					.attr(CLASS, getBarLabelClass)
					.text(getBarLabelText);

				// Add new bars
				self[BARS]
					.enter()
					.append('rect')
					.attr(CLASS, 'bar')
					.attr('fill', 'url(#' + GRADIENT_ID + ')')
					.attr('rx', self.cornerRadius())
					.attr('ry', self.cornerRadius())
					.attr(ATTR_X, getBarX)
					.attr(ATTR_Y, getInitialBarY)
					.attr(WIDTH, xScale.bandwidth())
					.attr(HEIGHT, 0)
					.transition()
					.duration(graphConstants.DURATION)
					.attr(ATTR_Y, getBarY)
					.attr(HEIGHT, getBarHeight);

				// Add new barLabels
				self[BAR_LABELS]
					.enter()
					.append('text')
					.attr(CLASS, 'bar-label')
					.attr('text-anchor', 'middle')
					.attr(ATTR_X, getBarLabelX)
					.attr(ATTR_Y, getInitialBarLabelY)
					.style(OPACITY, 0)
					.attr(CLASS, getBarLabelClass)
					.text(getBarLabelText)
					.transition()
					.duration(graphConstants.DURATION)
					.attr(ATTR_Y, getBarLabelY)
					.style(OPACITY, 1);
			}
		}
	}
}

Object.assign(Bar.prototype, {
	cornerRadius: method.number({
		init: 2,
		set: function() {
			this[updateData]();
		}
	})
});
