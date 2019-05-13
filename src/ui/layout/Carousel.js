import { defer } from 'async-agent';
import { set } from 'object-agent';
import { AUTO, enforce, method, PIXELS, ZERO_PIXELS } from 'type-enforcer';
import {
	LEFT,
	MARGIN_BOTTOM,
	MARGIN_LEFT,
	MARGIN_RIGHT,
	MARGIN_TOP,
	RIGHT,
	SCROLL_EVENT,
	SPACE
} from '../../utility/domConstants';
import objectHelper from '../../utility/objectHelper';
import Control from '../Control';
import ControlManager from '../ControlManager';
import controlTypes from '../controlTypes';
import Button from '../elements/Button';
import { ICON_SIZES } from '../elements/Icon';
import { NEXT_ICON, PREVIOUS_ICON } from '../icons';
import './Carousel.less';
import VirtualList from './VirtualList';

const VIRTUAL_LIST_ID = 'carouselVirtualList';
const PREV_BUTTON_ID = 'carouselPrevButton';
const NEXT_BUTTON_ID = 'carouselNextButton';
const BUTTON_CLASS = 'icon-button';
const EVENT_SUFFIX = '.carousel';

const CONTROLS = Symbol();
const IS_FIT = Symbol();

const fitToSlide = Symbol();
const updateButtons = Symbol();

/**
 * A horizontal slide viewer.
 *
 * @class Carousel
 * @extends Control
 * @constructor
 *
 * @arg {Object} settings
 */
export default class Carousel extends Control {
	constructor(settings = {}) {
		settings.type = settings.type || controlTypes.CAROUSEL;
		settings.height = enforce.cssSize(settings.height, AUTO, true);

		super(settings);
		const self = this;
		self[CONTROLS] = new ControlManager();
		self[IS_FIT] = false;

		self.addClass('carousel');

		self[CONTROLS].add(new VirtualList({
			ID: VIRTUAL_LIST_ID,
			container: self.element(),
			isHorizontal: true,
			height: settings.height,
			itemControl: settings.slideControl,
			itemData: settings.slideData,
			itemDefaultSettings: settings.slideDefaultSettings,
			isCentered: true,
			hideScrollBars: true,
			keepAltRows: false
		}));

		objectHelper.applySettings(self, settings);

		self.onResize(() => {
			self[updateButtons]();

			if (self.fitToSlide()) {
				self[fitToSlide]();
			}
		}, true);

		self.onRemove(() => {
			self.showButtons(false);
			self[CONTROLS].remove();
		});
	}

	[fitToSlide]() {
		const self = this;
		const slide = self[CONTROLS].get(VIRTUAL_LIST_ID).firstVisibleItem();

		const setMargins = (margin1, margin2, size) => {
			self[CONTROLS].get(VIRTUAL_LIST_ID)
				.css(margin1, size)
				.css(margin2, size);
		};

		if (slide) {
			const thisWidth = self.width();
			const thisHeight = self.height();
			const slideWidth = slide.width();
			const slideHeight = slide.height();
			let newSize;

			self[IS_FIT] = true;

			if (thisWidth / slideWidth > thisHeight / slideHeight) {
				newSize = (thisWidth - slideWidth) / 2;

				if (self.showButtons()) {
					newSize -= self[CONTROLS].get(PREV_BUTTON_ID).width() || self[CONTROLS].get(NEXT_BUTTON_ID).width();
				}

				setMargins(MARGIN_LEFT, MARGIN_RIGHT, newSize);

				if (self.showButtons()) {
					self[CONTROLS].get(PREV_BUTTON_ID)
						.css(MARGIN_LEFT, newSize);
					self[CONTROLS].get(NEXT_BUTTON_ID)
						.css(MARGIN_RIGHT, newSize);
				}
			}
			else {
				setMargins(MARGIN_TOP, MARGIN_BOTTOM, (thisHeight - slideHeight) / 2);
			}
		}
	}

	/**
	 * Update the isEnabled value of the buttons
	 * @function updateButtons
	 */
	[updateButtons]() {
		if (this.showButtons()) {
			this[CONTROLS].get(PREV_BUTTON_ID)
				.isVisible(!this[CONTROLS].get(VIRTUAL_LIST_ID).isAtStart());
			this[CONTROLS].get(NEXT_BUTTON_ID)
				.isVisible(!this[CONTROLS].get(VIRTUAL_LIST_ID).isAtEnd());
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
	 * @arg {function}
	 *
	 * @returns {function|this}
	 */
	slideControl: method.function({
		set: function(slideControl) {
			this[CONTROLS].get(VIRTUAL_LIST_ID).itemControl(slideControl);
		}
	}),

	/**
	 * Get or set a collection of slide data
	 *
	 * @method slideData
	 * @member module:Carousel
	 * @instance
	 *
	 * @arg {object[]}
	 *
	 * @returns {object[]|this}
	 */
	slideData: method.array({
		set: function(slideData) {
			this[CONTROLS].get(VIRTUAL_LIST_ID).itemData(slideData);
		}
	}),

	/**
	 * Get or set an object of settings to use when first initializing a slide
	 *
	 * @method slideDefaultSettings
	 * @member module:Carousel
	 * @instance
	 *
	 * @arg {object}
	 *
	 * @returns {object|this}
	 */
	slideDefaultSettings: method.object({
		set: function(slideDefaultSettings) {
			this[CONTROLS].get(VIRTUAL_LIST_ID).itemDefaultSettings(slideDefaultSettings);
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
	 * @arg {function}
	 *
	 * @returns {function|this}
	 */
	onSlideRender: method.function({
		set: function(onSlideRender) {
			this[CONTROLS].get(VIRTUAL_LIST_ID).onItemRender((control, itemData) => {
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
	 * @arg {string}
	 *
	 * @returns {string|this}
	 */
	slideWidth: method.string({
		set: function(slideWidth) {
			this[CONTROLS].get(VIRTUAL_LIST_ID).itemSize(slideWidth);
		}
	}),

	/**
	 * Fit a single slide at a time in the view.
	 *
	 * @method fitToSlide
	 * @member module:Carousel
	 * @instance
	 *
	 * @arg {boolean}
	 *
	 * @returns {boolean|this}
	 */
	fitToSlide: method.boolean({
		set: function(fitToSlide) {
			this[CONTROLS].get(VIRTUAL_LIST_ID).snapToLeadingEdge(fitToSlide);
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
	 * @returns {Object[]}
	 */
	getRenderedControls: function() {
		return this[CONTROLS].get(VIRTUAL_LIST_ID).getRenderedControls();
	},

	/**
	 * Get or set the amount controls to render beyond the visible viewport (as a ratio of
	 * the items rendered within the viewport).
	 *
	 * @method extraRenderedItemsRatio
	 * @member module:Carousel
	 * @instance
	 *
	 * @arg {Number} [extraRenderedItemsRatio]
	 *
	 * @returns {Object|this}
	 */
	extraRenderedItemsRatio: method.number({
		init: 0.1,
		set: function(extraRenderedItemsRatio) {
			this[CONTROLS].get(VIRTUAL_LIST_ID).extraRenderedItemsRatio(extraRenderedItemsRatio);
		},
		min: 0
	}),

	/**
	 * Get or set whether the buttons should be viewed
	 *
	 * @method showButtons
	 * @member module:Carousel
	 * @instance
	 *
	 * @arg {boolean}
	 *
	 * @returns {boolean|this}
	 */
	showButtons: method.boolean({
		set: function(newValue) {
			const self = this;

			if (newValue) {
				if (!self[CONTROLS].get(PREV_BUTTON_ID)) {
					self[CONTROLS].add(new Button({
						ID: PREV_BUTTON_ID,
						container: self.element(),
						classes: BUTTON_CLASS,
						icon: PREVIOUS_ICON,
						iconSize: self.buttonIconSize(),
						onClick: () => self.prev(),
						css: {
							left: '0'
						}
					}));
					self[CONTROLS].add(new Button({
						ID: NEXT_BUTTON_ID,
						container: self.element(),
						classes: BUTTON_CLASS,
						icon: NEXT_ICON,
						iconSize: self.buttonIconSize(),
						onClick: () => self.next(),
						css: {
							right: '0'
						}
					}));
					self[CONTROLS].get(VIRTUAL_LIST_ID)
						.padding(ZERO_PIXELS + SPACE + self[CONTROLS].get(PREV_BUTTON_ID).width() + PIXELS)
						.on(SCROLL_EVENT + EVENT_SUFFIX, () => {
							self[updateButtons]();
						});
					defer(() => {
						self[updateButtons]();
					});
				}
			}
			else {
				self[CONTROLS].remove(PREV_BUTTON_ID);
				self[CONTROLS].remove(NEXT_BUTTON_ID);
				self[CONTROLS].get(VIRTUAL_LIST_ID)
					.padding(ZERO_PIXELS)
					.off(SCROLL_EVENT + EVENT_SUFFIX);
			}
		}
	}),

	/**
	 * Get or set the size of the icons on the buttons
	 *
	 * @method buttonIconSize
	 * @member module:Carousel
	 * @instance
	 *
	 * @arg {string} - see Icon ICON_SIZES
	 *
	 * @returns {string|this}
	 */
	buttonIconSize: method.enum({
		init: ICON_SIZES.TWO_TIMES,
		enum: ICON_SIZES,
		set: function(buttonIconSize) {
			if (this.showButtons()) {
				this[CONTROLS].get(PREV_BUTTON_ID).iconSize(buttonIconSize);
				this[CONTROLS].get(NEXT_BUTTON_ID).iconSize(buttonIconSize);
			}
		}
	}),

	/**
	 * Move to the next page of slides
	 *
	 * @method next
	 * @member module:Carousel
	 * @instance
	 */
	next: function() {
		this[CONTROLS].get(VIRTUAL_LIST_ID).nextPage();
	},

	/**
	 * Move to the previous page of slides
	 *
	 * @method prev
	 * @member module:Carousel
	 * @instance
	 */
	prev: function() {
		this[CONTROLS].get(VIRTUAL_LIST_ID).prevPage();
	},

	isFocusable: method.boolean({
		set: function(isFocusable) {
			this[CONTROLS].get(VIRTUAL_LIST_ID).isFocusable(isFocusable);
		}
	})
});
