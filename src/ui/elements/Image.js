import { event } from 'd3';
import { applySettings, Enum, method } from 'type-enforcer';
import { DRAG_START_EVENT, OBJECT_FIT, OPACITY, SOURCE } from '../../utility/domConstants';
import controlTypes from '../controlTypes';
import Control from './../Control';
import './Image.less';

const DEFAULT_IMAGE_SOURCE = ' ';
const preventDefault = () => {
	event.preventDefault();
};

export const FIT = new Enum({
	FILL: 'fill',
	CONTAIN: 'contain',
	COVER: 'cover',
	NONE: 'none',
	SCALE_DOWN: 'scale-down'
});

/**
 * Display an image element.
 *
 * @class Image
 * @extends Control
 * @constructor
 *
 * @arg {Object} settings
 * @arg {String} [settings.source]
 * @arg {String} [settings.fit]
 */
export default class Image extends Control {
	constructor(settings = {}) {
		settings.type = settings.type || controlTypes.IMAGE;
		settings.element = 'img';
		settings.skipWindowResize = true;

		super(settings);

		this.fit(this.fit(), true)
			.source(DEFAULT_IMAGE_SOURCE);

		applySettings(this, settings);
	}
}

Object.assign(Image.prototype, {
	/**
	 * Set or get the source property fo the image
	 *
	 * @method source
	 * @member module:Image
	 * @instance
	 *
	 * @arg {string} content
	 *
	 * @returns {string|this}
	 */
	source: method.string({
		set(source) {
			this.attr(SOURCE, source || DEFAULT_IMAGE_SOURCE)
				.css(OPACITY, (source && source !== ' ') ? 1 : 0.001);
		}
	}),

	/**
	 * Set or get the "fit" type of this image.
	 *
	 * @method content
	 * @member module:Image
	 * @instance
	 *
	 * @arg {string|element} content
	 *
	 * @returns {string|element|this}
	 */
	fit: method.enum({
		enum: FIT,
		init: FIT.CONTAIN,
		set(fit) {
			this.css(OBJECT_FIT, fit);
		}
	}),

	preventDrag: method.boolean({
		set(preventDrag) {
			this.set(DRAG_START_EVENT, preventDefault, preventDrag);
		}
	})
});
