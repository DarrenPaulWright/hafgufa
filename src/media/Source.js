import { applySettings } from 'type-enforcer-ui';
import Control from '../Control';
import controlTypes from '../controlTypes';
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
