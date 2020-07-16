import { applySettings } from 'type-enforcer-ui';
import Control from '../Control.js';
import controlTypes from '../controlTypes.js';
import setDefaults from '../utility/setDefaults.js';

export default class Source extends Control {
	constructor(settings = {}) {
		super(setDefaults({
			type: controlTypes.SOURCE,
			element: 'source'
		}, settings));

		applySettings(this, settings);
	}
}
