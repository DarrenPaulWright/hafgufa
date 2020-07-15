import { applySettings } from 'type-enforcer-ui';
import controlTypes from '../controlTypes';
import setDefaults from '../utility/setDefaults.js';
import SvgControl from './SvgControl';

export default class G extends SvgControl {
	constructor(settings = {}) {
		super(setDefaults({
			type: controlTypes.G,
			element: 'svg:g'
		}, settings));

		const self = this;
		if (self.type === controlTypes.G) {
			applySettings(self, settings);
		}
	}
}
