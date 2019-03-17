import { event } from 'd3';
import { Enum, method } from 'type-enforcer';
import dom from '../../utility/dom';
import { DRAG_START_EVENT, IMAGE, OBJECT_FIT, OPACITY, SOURCE } from '../../utility/domConstants';
import objectHelper from '../../utility/objectHelper';
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
 * <p>Display an image element.</p>
 *
 * @class Image
 * @extends Control
 * @constructor
 *
 * @param {Object} settings
 * @param {String} [settings.source]
 * @param {String} [settings.fit]
 */
export default class Image extends Control {
	constructor(settings = {}) {
		settings.element = dom.buildNew('', IMAGE);
		settings.skipWindowResize = true;

		super(controlTypes.IMAGE, settings);

		this.fit(this.fit(), true)
			.source(DEFAULT_IMAGE_SOURCE);

		objectHelper.applySettings(this, settings);
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
	 * @param {string} content
	 *
	 * @returns {string|this}
	 */
	source: method.string({
		set: function(source) {
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
	 * @param {string|element} content
	 *
	 * @returns {string|element|this}
	 */
	fit: method.enum({
		enum: FIT,
		init: FIT.CONTAIN,
		set: function(fit) {
			this.css(OBJECT_FIT, fit);
		}
	}),

	preventDrag: method.boolean({
		set: function(preventDrag) {
			this.set(DRAG_START_EVENT, preventDefault, preventDrag);
		}
	})
});
