import { applySettings } from 'type-enforcer-ui';
import controlTypes from '../controlTypes';
import setDefaults from '../utility/setDefaults.js';
import SvgControl from './SvgControl';

export default class Rect extends SvgControl {
	constructor(settings = {}) {
		super(setDefaults({
			type: controlTypes.RECT,
			element: 'svg:rect'
		}, settings));

		const self = this;
		if (self.type === controlTypes.RECT) {
			applySettings(self, settings);
		}
	}

	x(x) {
		if (arguments.length) {
			this.attr('x', x);

			return this;
		}

		return this.attr('x');
	}

	y(y) {
		if (arguments.length) {
			this.attr('y', y);

			return this;
		}

		return this.attr('y');
	}
}
