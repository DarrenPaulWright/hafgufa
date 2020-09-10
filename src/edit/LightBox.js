import { clear, defer, delay } from 'async-agent';
import { applySettings, AUTO, HUNDRED_PERCENT, methodArray, methodFunction, PIXELS } from 'type-enforcer-ui';
import Control from '../Control.js';
import controlTypes from '../controlTypes.js';
import Button from '../elements/Button.js';
import Div from '../elements/Div.js';
import { ICON_SIZES } from '../elements/Icon.js';
import Image from '../elements/Image.js';
import FileThumbnail from '../forms/FileThumbnail.js';
import { CLEAR_ICON, UP_ARROW_ICON } from '../icons.js';
import Carousel from '../layout/Carousel.js';
import Container from '../layout/Container.js';
import Toolbar from '../layout/Toolbar.js';
import DragMixin from '../mixins/DragMixin.js';
import {
	BODY,
	MOUSE_ENTER_EVENT,
	MOUSE_LEAVE_EVENT,
	PADDING_BOTTOM,
	PADDING_LEFT,
	PADDING_RIGHT,
	PADDING_TOP
} from '../utility/domConstants.js';
import setDefaults from '../utility/setDefaults.js';
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

/**
 * @class DragImage
 * @mixes DragMixin
 * @extends Image
 * @private
 */
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
 *
 * @param {object} settings
 */
export default class LightBox extends Control {
	constructor(settings = {}) {
		super(setDefaults({
			type: controlTypes.LIGHT_BOX,
			container: BODY
		}, settings));

		const self = this;
		self.addClass(LIGHT_BOX_CLASS);

		self[IMAGE_LAYER] = new Container({
			container: self,
			classes: IMAGE_LAYER_CLASS,
			isWorking: true,
			height: HUNDRED_PERCENT
		});
		self[INTERACTION_LAYER] = new Div({
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
			id: LIGHT_BOX_TOOLBAR_ID,
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
		const imageSelectorHeight = self[INTERACTION_LAYER].get(LIGHT_BOX_CAROUSEL_ID) ?
			self[INTERACTION_LAYER].get(LIGHT_BOX_CAROUSEL_ID).height() * CAROUSEL_SLIDE_PERCENT :
			self[TOOLBAR_HEIGHT];

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
				control.isSelected(selectedItems.includes(control.id()));
			});
		}
	}

	[setCarouselImages]() {
		const self = this;
		if (self[INTERACTION_LAYER].get(LIGHT_BOX_CAROUSEL_ID)) {
			self[INTERACTION_LAYER].get(LIGHT_BOX_CAROUSEL_ID)
				.slideData(self.files()
					.map((file) => file ? {
						id: file.name,
						source: file.thumbSource || file.source || file.fileData,
						data: file
					} : {
						id: file.name,
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
					id: LIGHT_BOX_CAROUSEL_ID,
					classes: ABSOLUTE_CLASS,
					showButtons: true,
					slideControl: FileThumbnail,
					slideDefaultSettings: {
						padding: THUMB_MARGIN + PIXELS,
						onEdit(fileThumbnail) {
							self.selectedItems([fileThumbnail.id()]);
						},
						onDelete(fileThumbnail) {
							self.files(this.files().filter((file) => file.name !== fileThumbnail.id()), true);
							if (self.onDelete()) {
								self.onDelete()(fileThumbnail.id());
							}
						}
					},
					onSlideRender(thumb, item) {
						thumb
							.imageSource(item.source)
							.fileExtension(item.data.extension)
							.isSelected(self.selectedItems().includes(item.id));
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
					id: LIGHT_BOX_CAROUSEL_BUTTON_ID,
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
	files: methodArray({
		set: renderImages
	}),

	selectedItems: methodArray({
		set() {
			this[renderMainImage]();
			this[updateSelectedItems]();
		}
	}),

	onDelete: methodFunction()
});
