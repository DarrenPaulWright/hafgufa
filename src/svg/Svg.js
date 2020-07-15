import { applySettings } from 'type-enforcer-ui';
import controlTypes from '../controlTypes';
import setDefaults from '../utility/setDefaults.js';
import SvgControl from './SvgControl';

export default class Svg extends SvgControl {
	constructor(settings = {}) {
		super(setDefaults({
			type: controlTypes.SVG,
			element: 'svg:svg'
		}, settings));

		const self = this;
		if (self.type === controlTypes.SVG) {
			applySettings(self, settings);
		}
	}
}
