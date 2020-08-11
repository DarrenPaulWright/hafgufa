import { defer } from 'async-agent';
import { forOwn } from 'object-agent';
import {
	DockPoint,
	Enum,
	isObject,
	methodArray,
	methodElement,
	methodQueue,
	methodString,
	methodThickness,
	PIXELS,
	Thickness
} from 'type-enforcer-ui';
import Control from '../Control.js';
import Tooltip from '../layout/Tooltip.js';
import ControlHeadingMixin from '../mixins/ControlHeadingMixin.js';
import IsWorkingMixin from '../mixins/IsWorkingMixin.js';
import Svg from '../svg/Svg.js';
import { HEIGHT, WIDTH } from '../utility/domConstants.js';
import setDefaults from '../utility/setDefaults.js';
import './GraphBase.less';
import Legend from './Legend.js';

const BREAK = '<br>';
const MAX_TOOLTIP_WIDTH = '20rem';

const DATA_TYPES = new Enum({
	TWO_AXIS: 'twoAxis',
	THREE_AXIS: 'threeAxis',
	FOUR_AXIS: 'fourAxis',
	FOUR_AXIS_RANGE: 'fourAxisRange',
	TREE: 'tree',
	NETWORK: 'network',
	TIME_LINE: 'timeLine'
});

const TOOLTIP = Symbol();
// const STORE_ON_CHANGE_IDS = Symbol();
const LEGEND = Symbol();

const calculateDataLimits = Symbol();
const buildTooltipText = Symbol();

/**
 * @class GraphBase
 * @mixes IsWorkingMixin
 * @mixes ControlHeadingMixin
 * @extends Control
 *
 * @param {object} settings
 */
export default class GraphBase extends IsWorkingMixin(ControlHeadingMixin(Control)) {
	constructor(settings = {}) {
		super(setDefaults({ isWorking: true }, settings));

		const self = this;
		self.addClass('graph');
		self.svgElement(new Svg().element);

		// self[STORE_ON_CHANGE_IDS] = [];

		self.onResize(() => {
			let legendWidth;
			let renderWidth = self.innerWidth() || self.element.offsetWidth;
			let renderHeight = self.innerHeight() || self.element.offsetHeight;

			if (self.getHeading()) {
				renderHeight -= self.getHeading().height();
			}

			self.svgElement().setAttribute(WIDTH, renderWidth + PIXELS);
			self.svgElement().setAttribute(HEIGHT, renderHeight + PIXELS);

			if (self[LEGEND]) {
				legendWidth = self[LEGEND].width();
				renderWidth -= legendWidth + 10;
				self[LEGEND].attr('transform', 'translate(' + renderWidth + ',' + self.graphPadding().top + ')');
			}

			self.onUpdateSize().trigger(null, [renderWidth, renderHeight]);
			if (self.data().length !== 0) {
				self.onUpdateData().trigger();
			}
		});

		defer(() => {
			self.resize();
		});

		self.onRemove(() => {
			// self.dataSource([]);
			self.data([]);
			self.legendItems([]);
			self.svgElement(null);
		});
	}

	[calculateDataLimits](data, dataType) {
		const limits = {};

		const parseValue = (value) => parseFloat(value);

		const calculate = (model) => {
			forOwn(model, (itemKey, limitKey) => {
				limits['min' + limitKey] = data.length ? parseValue(data[0][itemKey]) : 0;
				limits['max' + limitKey] = data.length ? parseValue(data[0][itemKey]) : 0;
			});

			data.forEach((item) => {
				forOwn(model, (itemKey, limitKey) => {
					limits['min' + limitKey] = Math.min(limits['min' + limitKey], parseValue(item[itemKey]));
					limits['max' + limitKey] = Math.max(limits['max' + limitKey], parseValue(item[itemKey]));
				});
			});
		};

		switch (dataType) {
			case DATA_TYPES.TWO_AXIS:
				calculate({
					Value: 'value',
					Label: 'label'
				});
				break;
			case DATA_TYPES.THREE_AXIS:
				calculate({
					Value: 'value',
					X: 'x',
					Y: 'y'
				});
				break;
			case DATA_TYPES.FOUR_AXIS:
				calculate({
					Value: 'value',
					X: 'x',
					Y: 'y',
					Z: 'z'
				});
				break;
			case DATA_TYPES.FOUR_AXIS_RANGE:
				calculate({
					Value: 'value',
					XMin: 'xMin',
					XMax: 'xMax',
					YMin: 'yMin',
					YMax: 'yMax',
					Z: 'z'
				});
				break;
		}

		return limits;
	}

	[buildTooltipText](d, dataType) {
		const self = this;
		let output = '';

		switch (dataType) {
			case DATA_TYPES.TWO_AXIS:
				output += d.label + BREAK;
				break;
			case DATA_TYPES.THREE_AXIS:
				if (self.xLabel()) {
					output += self.xLabel() + ': ';
				}
				output += d.x + BREAK;

				if (self.yLabel()) {
					output += self.yLabel() + ': ';
				}
				output += d.y + BREAK;

				break;
			case DATA_TYPES.FOUR_AXIS:
				if (d.title) {
					output += '<strong>' + d.title + '</strong>' + BREAK;
				}
				if (self.xLabel()) {
					output += self.xLabel() + ': ';
				}
				output += d.x + BREAK;

				if (self.yLabel()) {
					output += self.yLabel() + ': ';
				}
				output += d.y + BREAK;

				if (self.zLabel()) {
					output += self.zLabel() + ': ';
				}
				output += d.z + BREAK;

				break;
			case DATA_TYPES.FOUR_AXIS_RANGE:
				if (d.title) {
					output += '<strong>' + d.title + '</strong>' + BREAK;
				}
				if (self.xLabel()) {
					output += self.xLabel() + ': ';
				}
				output += d.xMin + ' - ' + d.xMax + BREAK;

				if (self.yLabel()) {
					output += self.yLabel() + ': ';
				}
				output += d.yMin + ' - ' + d.yMax + BREAK;

				if (self.zLabel()) {
					output += self.zLabel() + ': ';
				}
				output += d.z + BREAK;

				break;
		}

		output += 'Total: ' + d.value;

		return output;
	}
}

Object.assign(GraphBase.prototype, {
	svgElement: methodElement({
		set(newValue) {
			if (newValue) {
				this.contentContainer.append(newValue);
			}
		},
		other: null
	}),

	onUpdateSize: methodQueue(),

	onUpdateData: methodQueue(),

	graphPadding: methodThickness({
		init: new Thickness(12),
		set: 'resize'
	}),

	color: methodString({
		init: '#b24f26',
		set(newValue) {
			const self = this;

			self.onUpdateData().trigger();
			if (self[LEGEND]) {
				self[LEGEND].color(newValue);
			}
		}
	}),

	data: methodArray({
		set(newValue) {
			const self = this;

			if (!self.isRemoved) {
				newValue.forEach((dataObject) => {
					if (isObject(dataObject)) {
						dataObject.limits = self[calculateDataLimits](dataObject.data, dataObject.dataType);
					}
				});
				self.onUpdateData().trigger();
				self.isWorking(false);
			}
		}
	}),

	// dataSource: methodArray({
	// 	init: undefined,
	// 	before(oldValue) {
	// 		if (oldValue && !isArray(oldValue)) {
	// 			oldValue = [oldValue];
	// 		}
	// 		if (oldValue) {
	// 			oldValue.forEach((source, index) => {
	// 				if (source.store) {
	// 					source.store.offChange(self[STORE_ON_CHANGE_IDS][index]);
	// 					self[STORE_ON_CHANGE_IDS][index] = null;
	// 				}
	// 			});
	// 		}
	// 	},
	// 	set(newValue) {
	// 		const saveData = (data, index, dataType) => {
	// 			const currentData = clone(self.data());
	// 			currentData[index] = {
	// 				data: data,
	// 				dataType: dataType
	// 			};
	// 			self.data(currentData);
	// 		};
	//
	// 		if (newValue && !isArray(newValue)) {
	// 			newValue = [newValue];
	// 		}
	//
	// 		newValue.forEach((source, index) => {
	// 			if (source.store && source.valueKey) {
	// 				self[STORE_ON_CHANGE_IDS][index] = dataSource.twoAxisFromValueKey(source, (data) => {
	// 					saveData(data, index, DATA_TYPES.TWO_AXIS);
	// 				});
	// 			}
	// 			else if (source.store && source.groupKey) {
	// 				self[STORE_ON_CHANGE_IDS][index] = dataSource.twoAxisFromGroupKey(source, (data) => {
	// 					saveData(data, index, DATA_TYPES.TWO_AXIS);
	// 				});
	// 			}
	// 			else if (source.store && source.xKey && source.yKey && source.zKey) {
	// 				self[STORE_ON_CHANGE_IDS][index] = dataSource.fourAxisWithValue(source, (data) => {
	// 					saveData(data, index, DATA_TYPES.FOUR_AXIS);
	// 				});
	// 			}
	// 			else if (source.store && source.xKey && source.yKey) {
	// 				self[STORE_ON_CHANGE_IDS][index] = dataSource.threeAxisWithValue(source, (data) => {
	// 					saveData(data, index, DATA_TYPES.THREE_AXIS);
	// 				});
	// 			}
	// 			else if (source.store && source.xMinKey && source.xMaxKey && source.yMinKey && source.yMaxKey && source.zKey) {
	// 				self[STORE_ON_CHANGE_IDS][index] = dataSource.fourAxisWithRangeAndValue(source, (data) => {
	// 					saveData(data, index, DATA_TYPES.FOUR_AXIS_RANGE);
	// 				});
	// 			}
	// 		});
	// 	},
	// 	other: Object
	// }),

	tooltip(anchor, datum, dataType) {
		const self = this;

		if (anchor) {
			self[TOOLTIP] = new Tooltip({
				content: self[buildTooltipText](datum, dataType),
				anchor,
				anchorDockPoint: DockPoint.POINTS.TOP_CENTER,
				tooltipDockPoint: DockPoint.POINTS.BOTTOM_CENTER,
				maxWidth: MAX_TOOLTIP_WIDTH
			});
		}
		else if (self[TOOLTIP]) {
			self[TOOLTIP].remove();
			self[TOOLTIP] = null;
		}
	},

	legendItems: methodArray({
		set(newValue) {
			const self = this;

			if (newValue.length !== 0) {
				if (!self[LEGEND]) {
					self[LEGEND] = new Legend({
						container: self.svgElement(),
						color: self.color()
					});
				}

				self[LEGEND].items(newValue);
				self.resize();
			}
			else {
				self[LEGEND].remove();
				self[LEGEND] = null;
			}
		}
	}),

	legendItemColor(item) {
		return this[LEGEND] ? this[LEGEND].itemColor(item) : this.color();
	},

	legendOnMouseOverItem(callback) {
		return this[LEGEND] ? this[LEGEND].onMouseOverItem(callback) : undefined;
	},

	legendOnMouseOutItem(callback) {
		return this[LEGEND] ? this[LEGEND].onMouseOutItem(callback) : undefined;
	},

	legendOnSelectionChange(callback) {
		return this[LEGEND] ? this[LEGEND].onSelectionChange(callback) : undefined;
	}
});

GraphBase.DATA_TYPES = DATA_TYPES;
