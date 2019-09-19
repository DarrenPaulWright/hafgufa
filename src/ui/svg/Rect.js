import { applySettings } from 'type-enforcer';
import controlTypes from '../controlTypes';
import SvgControl from './SvgControl';

export default class Rect extends SvgControl {
	constructor(settings = {}) {
		settings.type = settings.type || controlTypes.RECT;
		settings.element = 'svg:rect';

		super(settings);

		const self = this;
		if (self.type === controlTypes.RECT) {
			applySettings(self, settings);
		}
	}
}
