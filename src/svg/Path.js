import { applySettings } from 'type-enforcer-ui';
import controlTypes from '../controlTypes';
import SvgControl from './SvgControl';

export default class Polygon extends SvgControl {
	constructor(settings = {}) {
		settings.type = settings.type || controlTypes.PATH;
		settings.element = 'svg:path';

		super(settings);

		const self = this;
		if (self.type === controlTypes.PATH) {
			applySettings(self, settings);
		}
	}

	data(data) {
		if (arguments.length) {
			this.attr('d', data);

			return this;
		}

		return this.attr('d');
	}

	pathLength(pathLength) {
		if (arguments.length) {
			this.attr('pathLength', pathLength);

			return this;
		}

		return this.attr('pathLength');
	}
}
