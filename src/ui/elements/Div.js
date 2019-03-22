import dom from '../../utility/dom';
import objectHelper from '../../utility/objectHelper';
import controlTypes from '../controlTypes';
import Control from './../Control';

/**
 * <p>Display a span element.</p>
 *
 * @class Div
 * @extends Control
 * @constructor
 *
 * @arg {Object} settings
 * @arg {String} [settings.text]
 */
export default class Div extends Control {
	constructor(settings = {}) {
		settings.element = dom.buildNew();
		settings.skipWindowResize = true;

		super(controlTypes.DIV, settings);

		objectHelper.applySettings(this, settings);
	}
}
