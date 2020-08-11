import { applySettings, Enum, methodBoolean, methodEnum, methodString } from 'type-enforcer-ui';
import controlTypes from '../controlTypes.js';
import { DRAG_START_EVENT, OBJECT_FIT, OPACITY, SOURCE } from '../utility/domConstants.js';
import setDefaults from '../utility/setDefaults.js';
import Control from './../Control.js';
import './Image.less';

const DEFAULT_IMAGE_SOURCE = ' ';
const preventDefault = (event) => {
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
 *
 * @param {object} settings
 * @param {string} [settings.source]
 * @param {string} [settings.fit]
 */
export default class Image extends Control {
	constructor(settings = {}) {
		super(setDefaults({
			type: controlTypes.IMAGE,
			element: 'img'
		}, settings));

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
	 * @memberOf Image
	 * @instance
	 *
	 * @param {string} content
	 *
	 * @returns {string|this}
	 */
	source: methodString({
		set(source) {
			this.attr(SOURCE, source || DEFAULT_IMAGE_SOURCE)
				.css(OPACITY, (source && source !== ' ') ? 1 : 0.001);
		}
	}),

	/**
	 * Set or get the "fit" type of this image.
	 *
	 * @method content
	 * @memberOf Image
	 * @instance
	 *
	 * @param {string|element} content
	 *
	 * @returns {string|element|this}
	 */
	fit: methodEnum({
		enum: FIT,
		init: FIT.CONTAIN,
		set(fit) {
			this.css(OBJECT_FIT, fit);
		}
	}),

	preventDrag: methodBoolean({
		set(preventDrag) {
			this.set(DRAG_START_EVENT, preventDefault, preventDrag);
		}
	})
});
