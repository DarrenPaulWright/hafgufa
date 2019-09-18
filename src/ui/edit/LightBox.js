import { clear, defer, delay } from 'async-agent';
import { applySettings, AUTO, HUNDRED_PERCENT, method, PIXELS } from 'type-enforcer';
import {
	BODY,
	MOUSE_ENTER_EVENT,
	MOUSE_LEAVE_EVENT,
	PADDING_BOTTOM,
	PADDING_LEFT,
	PADDING_RIGHT,
	PADDING_TOP
} from '../../utility/domConstants';
import Control from '../Control';
import controlTypes from '../controlTypes';
import Button from '../elements/Button';
import { ICON_SIZES } from '../elements/Icon';
import Image from '../elements/Image';
import FileThumbnail from '../forms/FileThumbnail';
import { CLEAR_ICON, UP_ARROW_ICON } from '../icons';
import Carousel from '../layout/Carousel';
import Container from '../layout/Container';
import Toolbar from '../layout/Toolbar';
import DragMixin from '../mixins/DragMixin';
import './LightBox.less';

const ABSOLUTE_CLASS = 'absolute-full-size ';
const LIGHT_BOX_CLASS = ABSOLUTE_CLASS + 'lightbox inverse';
const IMAGE_LAYER_CLASS = ABSOLUTE_CLASS + 'image-layer';
const INTERACTION_LAYER_CLASS = ABSOLUTE_CLASS + 'interaction-layer';
const TOOLBAR_CLASS = ABSOLUTE_CLASS + 'lightbox-toolbar';
const SHOW_CAROUSEL_CLASS = 'show';
const CAROUSEL_BUTTON_CLASS = 'carousel-button';

const LIGHT_BOX_TOOLBAR_ID = 'lightBoxToolbar';
const LIGHT_BOX_CAROUSEL_ID = 'lightBoxCarousel';
const LIGHT_BOX_CAROUSEL_BUTTON_ID = 'lightBoxCarouselButton';

const THUMB_MARGIN = 6;
const IMAGE_MARGIN = 8;
const CAROUSEL_SLIDE_PERCENT = 0.4;
const CAROUSEL_HIDE_DELAY_TIME = 500;

class DragImage extends DragMixin(Image) {
}

const TOOLBAR_HEIGHT = Symbol();
const IMAGE_LAYER = Symbol();
const INTERACTION_LAYER = Symbol();
const MAIN_IMAGE = Symbol();
const CAROUSEL_HIDE_DELAY = Symbol();

const addToolbar = Symbol();
const renderMainImage = Symbol();
const positionMainImage = Symbol();
const updateSelectedItems = Symbol();
const setCarouselImages = Symbol();
const renderImages = Symbol();

/**
 * Display an image editor light box.
 *
 * @class LightBox
 * @extends Control
 * @constructor
 *
 * @arg {Object} settings
 */
export default class LightBox extends Control {
	constructor(settings = {}) {
		settings.type = settings.type || controlTypes.LIGHT_BOX;
		settings.container = BODY;
		super(settings);

		const self = this;
		self.addClass(LIGHT_BOX_CLASS);

		self[IMAGE_LAYER] = new Container({
			container: self,
			classes: IMAGE_LAYER_CLASS,
			isWorking: true,
			height: HUNDRED_PERCENT
		});
		self[INTERACTION_LAYER] = new Container({
			container: self,
			classes: INTERACTION_LAYER_CLASS,
			height: HUNDRED_PERCENT
		});

		self[addToolbar]();

		applySettings(self, settings);

		self.onResize(() => {
			self[TOOLBAR_HEIGHT] = self[INTERACTION_LAYER].get(LIGHT_BOX_TOOLBAR_ID).borderHeight();
			self[positionMainImage]();
		});
	}

	[addToolbar]() {
		const self = this;

		self[INTERACTION_LAYER].append(new Toolbar({
			ID: LIGHT_BOX_TOOLBAR_ID,
			classes: TOOLBAR_CLASS,
			content: [{
				icon: CLEAR_ICON,
				classes: 'icon-button',
				align: 'right',
				onClick() {
					self.remove();
				}
			}]
		}));
	}

	[renderMainImage]() {
		const self = this;
		const file = self.files().find((item) => item.name === self.selectedItems()[0]);

		self[IMAGE_LAYER].isWorking(true);

		if (!self[MAIN_IMAGE]) {
			self[MAIN_IMAGE] = new DragImage({
				container: self[IMAGE_LAYER],
				on: {
					load() {
						defer(() => {
							self[MAIN_IMAGE]
								.stretch('fit')
								.center()
								.css('opacity', '1');
							self[IMAGE_LAYER].isWorking(false);
						});
					}
				},
				canThrow: true,
				scaleMin: 0.1,
				scaleMax: 10,
				canDrag: true
			});
		}

		self[positionMainImage]();

		if (file && file.fileData) {
			self[MAIN_IMAGE]
				.source(file.fileData)
				.css('opacity', '0.01');
		}
	}

	[positionMainImage]() {
		const self = this;
		const imageSelectorHeight = self[INTERACTION_LAYER].get(LIGHT_BOX_CAROUSEL_ID) ? self[INTERACTION_LAYER].get(
			LIGHT_BOX_CAROUSEL_ID)
			.height() * CAROUSEL_SLIDE_PERCENT : self[TOOLBAR_HEIGHT];

		self[IMAGE_LAYER]
			.css(PADDING_TOP, self[TOOLBAR_HEIGHT] + IMAGE_MARGIN + PIXELS)
			.css(PADDING_RIGHT, IMAGE_MARGIN + PIXELS)
			.css(PADDING_BOTTOM, imageSelectorHeight + IMAGE_MARGIN + PIXELS)
			.css(PADDING_LEFT, IMAGE_MARGIN + PIXELS);
	}

	[updateSelectedItems]() {
		const self = this;
		const selectedItems = self.selectedItems();

		if (self[INTERACTION_LAYER].get(LIGHT_BOX_CAROUSEL_ID)) {
			self[INTERACTION_LAYER].get(LIGHT_BOX_CAROUSEL_ID).getRenderedControls().forEach((control) => {
				control.isSelected(selectedItems.includes(control.ID()));
			});
		}
	}

	[setCarouselImages]() {
		const self = this;
		if (self[INTERACTION_LAYER].get(LIGHT_BOX_CAROUSEL_ID)) {
			self[INTERACTION_LAYER].get(LIGHT_BOX_CAROUSEL_ID)
				.slideData(self.files()
					.map((file) => file ? {
						ID: file.name,
						source: file.thumbSource || file.source || file.fileData,
						data: file
					} : {
						ID: file.name,
						data: file
					})
					.filter(Boolean));
		}

		self[positionMainImage]();
	}

	[renderImages]() {
		const self = this;
		const files = self.files();

		if (files.length > 1) {
			if (!self[INTERACTION_LAYER].get(LIGHT_BOX_CAROUSEL_ID)) {
				self[INTERACTION_LAYER].append(new Carousel({
					ID: LIGHT_BOX_CAROUSEL_ID,
					classes: ABSOLUTE_CLASS,
					showButtons: true,
					slideControl: FileThumbnail,
					slideDefaultSettings: {
						padding: THUMB_MARGIN + PIXELS,
						onEdit(fileThumbnail) {
							self.selectedItems([fileThumbnail.ID()]);
						},
						onDelete(fileThumbnail) {
							self.files(this.files().filter((file) => file.name !== fileThumbnail.ID()), true);
							if (self.onDelete()) {
								self.onDelete()(fileThumbnail.ID());
							}
						}
					},
					onSlideRender(thumb, item) {
						thumb
							.imageSource(item.source)
							.fileExtension(item.data.extension)
							.isSelected(self.selectedItems().includes(item.ID));
					},
					padding: THUMB_MARGIN + PIXELS,
					height: AUTO
				}));

				self[INTERACTION_LAYER].get(LIGHT_BOX_CAROUSEL_ID)
					.on(MOUSE_ENTER_EVENT, () => {
						clear(self[CAROUSEL_HIDE_DELAY]);
						self[INTERACTION_LAYER].get(LIGHT_BOX_CAROUSEL_ID).addClass(SHOW_CAROUSEL_CLASS);
						self[INTERACTION_LAYER].get(LIGHT_BOX_CAROUSEL_BUTTON_ID).isVisible(false);
					})
					.on(MOUSE_LEAVE_EVENT, () => {
						clear(self[CAROUSEL_HIDE_DELAY]);
						self[CAROUSEL_HIDE_DELAY] = delay(() => {
							self[INTERACTION_LAYER].get(LIGHT_BOX_CAROUSEL_ID).removeClass(SHOW_CAROUSEL_CLASS);
							self[INTERACTION_LAYER].get(LIGHT_BOX_CAROUSEL_BUTTON_ID).isVisible(true);
						}, CAROUSEL_HIDE_DELAY_TIME);
					});

				self[INTERACTION_LAYER].append(new Button({
					ID: LIGHT_BOX_CAROUSEL_BUTTON_ID,
					icon: UP_ARROW_ICON,
					iconSize: ICON_SIZES.TWO_TIMES,
					classes: 'icon-button ' + CAROUSEL_BUTTON_CLASS
				}));
			}
		}

		self[setCarouselImages]();

		if (!self.selectedItems().length && files[0]) {
			self.selectedItems([files[0].name]);
		}
		else {
			self[renderMainImage]();
			self[updateSelectedItems]();
		}
	}
}

Object.assign(LightBox.prototype, {
	files: method.array({
		set() {
			this[renderImages]();
		}
	}),

	selectedItems: method.array({
		set() {
			this[renderMainImage]();
			this[updateSelectedItems]();
		}
	}),

	onDelete: method.function()
});
