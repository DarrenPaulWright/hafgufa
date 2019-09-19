import { applySettings } from 'type-enforcer';
import controlTypes from '../controlTypes';
import SvgControl from './SvgControl';

export default class Svg extends SvgControl {
	constructor(settings = {}) {
		settings.type = settings.type || controlTypes.SVG;
		settings.element = 'svg:svg';

		super(settings);

		const self = this;
		if (self.type === controlTypes.SVG) {
			applySettings(self, settings);
		}
	}
}
