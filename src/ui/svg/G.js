import { applySettings } from 'type-enforcer';
import controlTypes from '../controlTypes';
import SvgControl from './SvgControl';

export default class G extends SvgControl {
	constructor(settings = {}) {
		settings.type = settings.type || controlTypes.G;
		settings.element = 'svg:g';

		super(settings);

		const self = this;
		if (self.type === controlTypes.G) {
			applySettings(self, settings);
		}
	}
}
