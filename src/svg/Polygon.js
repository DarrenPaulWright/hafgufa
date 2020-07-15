import { applySettings } from 'type-enforcer-ui';
import controlTypes from '../controlTypes';
import setDefaults from '../utility/setDefaults.js';
import SvgControl from './SvgControl';

export default class Polygon extends SvgControl {
	constructor(settings = {}) {
		super(setDefaults({
			type: controlTypes.POLYGON,
			element: 'svg:polygon'
		}, settings));

		const self = this;
		if (self.type === controlTypes.POLYGON) {
			applySettings(self, settings);
		}
	}

	points(points) {
		if (arguments.length) {
			this.attr('points', points || '0,0');

			return this;
		}

		return this.attr('points');
	}

	pathLength(pathLength) {
		if (arguments.length) {
			this.attr('pathLength', pathLength);

			return this;
		}

		return this.attr('pathLength');
	}
}
