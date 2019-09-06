import { applySettings } from 'type-enforcer';
import controlTypes from '../controlTypes';
import Control from './../Control';

/**
 * Display a div element.
 *
 * @class Div
 * @extends Control
 * @constructor
 *
 * @arg {Object} settings
 */
export default class Div extends Control {
	constructor(settings = {}) {
		settings.type = settings.type || controlTypes.DIV;
		settings.element = 'div';

		super(settings);

		if (settings.type === controlTypes.DIV) {
			applySettings(this, settings);
		}
	}
}
