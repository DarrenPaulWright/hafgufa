import { applySettings } from 'type-enforcer-ui';
import controlTypes from '../controlTypes.js';
import setDefaults from '../utility/setDefaults.js';
import SvgControl from './SvgControl.js';

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
		if (arguments.length !== 0) {
			this.attr('points', points || '0,0');

			return this;
		}

		return this.attr('points');
	}

	pathLength(pathLength) {
		if (arguments.length !== 0) {
			this.attr('pathLength', pathLength);

			return this;
		}

		return this.attr('pathLength');
	}
}
