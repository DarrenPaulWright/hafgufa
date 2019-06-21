import dom from '../../utility/dom';
import objectHelper from '../../utility/objectHelper';
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

		objectHelper.applySettings(this, settings);
	}
}
