import { applySettings } from 'type-enforcer';
import dom from '../../utility/dom';
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
		settings.element = dom.buildNew();
		settings.skipWindowResize = true;

		super(settings);

		if (settings.type === controlTypes.DIV) {
			applySettings(this, settings);
		}
	}
}
