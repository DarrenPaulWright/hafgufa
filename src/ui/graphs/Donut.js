import { arc, color, pie, select, sum } from 'd3';
import { applySettings, Point } from 'type-enforcer-math';
import { byKeyDesc } from '../../../src/utility/sortBy';
import controlTypes from '../controlTypes';
import './Donut.less';
import GraphBase from './GraphBase';

const INNER_RADIUS = 0.55;
const OUTER_RADIUS = 0.75;
const LINE_START_RADIUS = 0.8;
const LINE_PIVOT_RADIUS = 0.9;
const LINE_ARM_OFFSET = 0.2;
const LABEL_OFFSET = 0.25;
const CORNER_RADIUS_DIVIDER = 40;
const PAD_ANGLE_DIVIDER = 1.2;

const midAngle = (d) => (d.startAngle + d.endAngle) / 2;

const TWO_THIRDS = 2 / 3;

const softOffsetPoint = (point1, point2) => (point1.x + ((point2.x - point1.x) * TWO_THIRDS)) + ',' + (point1.y + ((point2.y - point1.y) * TWO_THIRDS));

const setupGraph = Symbol();
const updateSize = Symbol();
const updateData = Symbol();

const SVG = Symbol();
const PIE_DATA = Symbol();
const RADIUS = Symbol();
const DONUT_ARC = Symbol();
const LINE_START_ARC = Symbol();
const LINE_PIVOT_ARC = Symbol();

/**
 * @class Donut
 * @extends GraphBase
 * @constructor
 *
 * @arg {Object} settings
 */
export default class Donut extends GraphBase {
	constructor(settings = {}) {
		settings.type = settings.type || controlTypes.DONUT;

		super(settings);

		const self = this;
		self.addClass('donut');

		applySettings(self, settings);

		self[setupGraph]();
		self.onUpdateSize((renderWidth, renderHeight) => {
				self[updateSize](renderWidth, renderHeight);
			})
			.onUpdateData(() => {
				self[updateData]();
			})
			.onRemove(() => {
				self[PIE_DATA] = null;
				self[RADIUS] = null;
				self[DONUT_ARC] = null;
				self[LINE_START_ARC] = null;
				self[LINE_PIVOT_ARC] = null;
				if (self[SVG]) {
					self[SVG].remove();
					self[SVG] = null;
				}
			})
			.resize();
	}

	[setupGraph]() {
		const self = this;

		self[SVG] = select(self.svgElement())
			.append('g');

		self[SVG].append('g')
			.attr('class', 'slices');
		self[SVG].append('g')
			.attr('class', 'label-name');
		self[SVG].append('g')
			.attr('class', 'lines');
		self[SVG].append('g')
			.attr('class', 'total');

		self[PIE_DATA] = pie()
			.value((sliceData) => sliceData.value);

		self[DONUT_ARC] = arc();
		self[LINE_START_ARC] = arc();
		self[LINE_PIVOT_ARC] = arc();

		self[SVG].select('.total')
			.append('text')
			.attr('alignment-baseline', 'middle')
			.attr('text-anchor', 'middle')
			.attr('dy', '0.07em');
	}

	[updateSize](renderWidth, renderHeight) {
		const self = this;

		self[RADIUS] = Math.min(renderWidth, renderHeight) / 2;

		self[DONUT_ARC]
			.outerRadius(self[RADIUS] * OUTER_RADIUS)
			.innerRadius(self[RADIUS] * INNER_RADIUS)
			.cornerRadius(self[RADIUS] / CORNER_RADIUS_DIVIDER)
			.padAngle(PAD_ANGLE_DIVIDER / self[RADIUS]);

		self[LINE_START_ARC]
			.outerRadius(self[RADIUS] * LINE_START_RADIUS)
			.innerRadius(self[RADIUS] * LINE_START_RADIUS);

		self[LINE_PIVOT_ARC]
			.outerRadius(self[RADIUS] * LINE_PIVOT_RADIUS)
			.innerRadius(self[RADIUS] * LINE_PIVOT_RADIUS);

		self[SVG].attr('transform', 'translate(' + renderWidth / 2 + ',' + renderHeight / 2 + ')');

		self[updateData]();
	}

	[updateData]() {
		const self = this;
		let total;
		let data = self.data();
		const mainColor = color(self.color());

		if (data.length) {
			data = data[0].data ? data[0].data.sort(byKeyDesc('value')) : [];

			self[SVG].select('.slices')
				.datum(data)
				.selectAll('path')
				.data(self[PIE_DATA])
				.enter()
				.append('path')
				.attr('fill', (sliceData, index) => mainColor.brighter(Math.sqrt(index) * 0.9))
				.attr('d', self[DONUT_ARC]);

			self[SVG].select('.label-name')
				.datum(data)
				.selectAll('text')
				.data(self[PIE_DATA])
				.enter()
				.append('text')
				.attr('dy', '.35em')
				.html((sliceData) => sliceData.data.label)
				.attr('transform', (sliceData) => {
					const isOnRight = midAngle(sliceData) < Math.PI;
					const pos = self[LINE_PIVOT_ARC].centroid(sliceData);
					pos[0] += (self[RADIUS] * LABEL_OFFSET) * (isOnRight ? 1 : -1);
					return 'translate(' + pos + ')';
				})
				.style('text-anchor', (d) => (midAngle(d)) < Math.PI ? 'start' : 'end');

			self[SVG].select('.lines')
				.datum(data)
				.selectAll('path')
				.data(self[PIE_DATA])
				.enter()
				.append('path')
				.classed('.lines', true)
				.attr('d', (d) => {
					const isOnRight = midAngle(d) < Math.PI;
					const point1 = new Point(self[LINE_START_ARC].centroid(d));
					const pivotPoint = new Point(self[LINE_PIVOT_ARC].centroid(d));
					const point4 = new Point(pivotPoint.x + (self[RADIUS] * LINE_ARM_OFFSET) * (isOnRight ? 1 : -1), pivotPoint.y);

					return 'M ' + point1.toString() + ' C' + softOffsetPoint(point1, pivotPoint)
						.toString() + ' ' + softOffsetPoint(point4, pivotPoint).toString() + ' ' + point4.toString();
				});

			total = sum(data, (d) => d.value).toString();

			self[SVG].select('.total text')
				.html(total)
				.style('font-size', self[RADIUS] * (2 / (total.length + 1)));
		}
	}
}
