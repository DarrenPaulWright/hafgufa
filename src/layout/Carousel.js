import {
	applySettings,
	AUTO,
	methodArray,
	methodBoolean,
	methodFunction,
	methodNumber,
	methodObject,
	methodString,
	PIXELS,
	ZERO_PIXELS
} from 'type-enforcer-ui';
import Control from '../Control.js';
import controlTypes from '../controlTypes.js';
import NextPreviousMixin from '../mixins/NextPreviousMixin.js';
import { PADDING_BOTTOM, PADDING_LEFT, PADDING_RIGHT, PADDING_TOP, SPACE } from '../utility/domConstants.js';
import setDefaults from '../utility/setDefaults.js';
import './Carousel.less';
import VirtualList from './VirtualList.js';

const VIRTUAL_LIST = Symbol();
const IS_FIT = Symbol();
const BUTTON_SIZE = Symbol();

const fitToSlide = Symbol();

/**
 * A horizontal slide viewer.
 *
 * @class Carousel
 * @extends Control
 * @constructor
 *
 * @param {object} settings
 */
export default class Carousel extends NextPreviousMixin(Control) {
	constructor(settings = {}) {
		super(setDefaults({
			type: controlTypes.CAROUSEL,
			height: AUTO
		}, settings, {
			NextPrevMixin: {
				onShowButtons(onChange, buttonWidth) {
					self[BUTTON_SIZE] = buttonWidth;

					self[VIRTUAL_LIST]
						.padding(ZERO_PIXELS + SPACE + buttonWidth + PIXELS)
						.onLayoutChange(onChange);
				},
				onHideButtons() {
					self[BUTTON_SIZE] = 0;

					self[VIRTUAL_LIST]
						.padding(ZERO_PIXELS)
						.onLayoutChange(null);
				},
				isAtStart: () => self[VIRTUAL_LIST].isAtStart(),
				isAtEnd: () => self[VIRTUAL_LIST].isAtEnd(),
				onPrev: () => self[VIRTUAL_LIST].prevPage(),
				onNext: () => self[VIRTUAL_LIST].nextPage()
			}
		}));

		const self = this;
		self[IS_FIT] = false;
		self[BUTTON_SIZE] = 0;

		self.addClass('carousel');

		self[VIRTUAL_LIST] = new VirtualList({
			container: self,
			isHorizontal: true,
			height: settings.height,
			itemControl: settings.slideControl,
			itemData: settings.slideData,
			itemDefaultSettings: settings.slideDefaultSettings,
			isCentered: true,
			hideScrollBars: true,
			keepAltRows: false
		});

		applySettings(self, settings);

		self.onResize(() => {
			if (self.fitToSlide()) {
				self[fitToSlide]();
			}
		});
	}

	[fitToSlide]() {
		const self = this;
		const slide = self[VIRTUAL_LIST].firstVisibleItem();

		const setPaddings = (padding1, padding2, size) => {
			self
				.css(padding1, size)
				.css(padding2, size);
		};

		if (slide) {
			const thisWidth = self.borderWidth();
			const thisHeight = self.borderHeight();
			const slideWidth = slide.borderWidth();
			const slideHeight = slide.borderHeight();
			let newSize;

			self[IS_FIT] = true;

			if (thisWidth / slideWidth > thisHeight / slideHeight) {
				newSize = (thisWidth - slideWidth) / 2;
				newSize -= self[BUTTON_SIZE];

				setPaddings(PADDING_LEFT, PADDING_RIGHT, newSize);
			}
			else {
				setPaddings(PADDING_TOP, PADDING_BOTTOM, (thisHeight - slideHeight) / 2);
			}
		}
	}
}

Object.assign(Carousel.prototype, {
	/**
	 * Get or set the control to render for each slide
	 *
	 * @method slideControl
	 * @member module:Carousel
	 * @instance
	 *
	 * @param {Function}
	 *
	 * @returns {Function|this}
	 */
	slideControl: methodFunction({
		set(slideControl) {
			this[VIRTUAL_LIST].itemControl(slideControl);
		},
		bind: false
	}),

	/**
	 * Get or set a collection of slide data
	 *
	 * @method slideData
	 * @member module:Carousel
	 * @instance
	 *
	 * @param {object[]}
	 *
	 * @returns {object[]|this}
	 */
	slideData: methodArray({
		set(slideData) {
			this[VIRTUAL_LIST].itemData(slideData, true);
		}
	}),

	/**
	 * Get or set an object of settings to use when first initializing a slide
	 *
	 * @method slideDefaultSettings
	 * @member module:Carousel
	 * @instance
	 *
	 * @param {object}
	 *
	 * @returns {object|this}
	 */
	slideDefaultSettings: methodObject({
		set(slideDefaultSettings) {
			this[VIRTUAL_LIST].itemDefaultSettings(slideDefaultSettings);
			this.resize();
		}
	}),

	/**
	 * Get or set a callback that gets called as each slide is rendered.
	 *
	 * @method onSlideRender
	 * @member module:Carousel
	 * @instance
	 *
	 * @param {Function}
	 *
	 * @returns {Function|this}
	 */
	onSlideRender: methodFunction({
		set(onSlideRender) {
			this[VIRTUAL_LIST].onItemRender((control, itemData) => {
				onSlideRender(control, itemData);
				if (!this[IS_FIT] && this.fitToSlide()) {
					this.resize();
				}
			});
		}
	}),

	/**
	 * Get or set a specific width for each slide
	 *
	 * @method slideWidth
	 * @member module:Carousel
	 * @instance
	 *
	 * @param {string}
	 *
	 * @returns {string|this}
	 */
	slideWidth: methodString({
		set(slideWidth) {
			this[VIRTUAL_LIST].itemSize(slideWidth);
		}
	}),

	/**
	 * Fit a single slide at a time in the view.
	 *
	 * @method fitToSlide
	 * @member module:Carousel
	 * @instance
	 *
	 * @param {boolean}
	 *
	 * @returns {boolean|this}
	 */
	fitToSlide: methodBoolean({
		set(fitToSlide) {
			this[VIRTUAL_LIST].snapToLeadingEdge(fitToSlide);
			this.resize();
		}
	}),

	/**
	 * Get an Array of all the visible controls
	 *
	 * @method getRenderedControls
	 * @member module:Carousel
	 * @instance
	 *
	 * @returns {object[]}
	 */
	getRenderedControls() {
		return this[VIRTUAL_LIST].getRenderedControls();
	},

	/**
	 * Get or set the amount controls to render beyond the visible viewport (as a ratio of
	 * the items rendered within the viewport).
	 *
	 * @method extraRenderedItemsRatio
	 * @member module:Carousel
	 * @instance
	 *
	 * @param {number} [extraRenderedItemsRatio]
	 *
	 * @returns {object|this}
	 */
	extraRenderedItemsRatio: methodNumber({
		init: 0.1,
		set(extraRenderedItemsRatio) {
			this[VIRTUAL_LIST].extraRenderedItemsRatio(extraRenderedItemsRatio);
		},
		min: 0
	}),

	isFocusable: methodBoolean({
		set(isFocusable) {
			this[VIRTUAL_LIST].isFocusable(isFocusable);
		}
	})
});
