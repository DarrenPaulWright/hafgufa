import { applySettings } from 'type-enforcer-ui';
import controlTypes from '../controlTypes.js';
import setDefaults from '../utility/setDefaults.js';
import SvgControl from './SvgControl.js';

export default class Polygon extends SvgControl {
	constructor(settings = {}) {
		super(setDefaults({
			type: controlTypes.PATH,
			element: 'svg:path'
		}, settings));

		const self = this;
		if (self.type === controlTypes.PATH) {
			applySettings(self, settings);
		}
	}

	data(data) {
		if (arguments.length !== 0) {
			this.attr('d', data);

			return this;
		}

		return this.attr('d');
	}

	pathLength(pathLength) {
		if (arguments.length !== 0) {
			this.attr('pathLength', pathLength);

			return this;
		}

		return this.attr('pathLength');
	}
}
