import {
	applySettings,
	Enum,
	methodAny,
	methodBoolean,
	methodEnum,
	methodFunction,
	methodObject,
	methodString
} from 'type-enforcer-ui';
import Control from '../Control';
import controlTypes from '../controlTypes';
import Button from '../elements/Button';
import Div from '../elements/Div';
import Icon from '../elements/Icon';
import Image from '../elements/Image';
import {
	CLEAR_ALT_ICON,
	CODE_FILE_ICON,
	FILE_ICON,
	IMAGE_FILE_ICON,
	PDF_FILE_ICON,
	WORD_FILE_ICON,
	ZIP_FILE_ICON
} from '../icons';
import IsWorkingMixin from '../mixins/IsWorkingMixin';
import { ABSOLUTE_CLASS, CLICK_EVENT, MOUSE_ENTER_EVENT, MOUSE_LEAVE_EVENT, OPACITY } from '../utility/domConstants';
import './FileThumbnail.less';

const THUMBNAIL_CLASS = 'file-thumbnail ';
const IMAGE_WRAPPER_CLASS = 'image-wrapper';
const BUTTON_CLASS = ABSOLUTE_CLASS + 'icon-button';
const EDITABLE_CLASS = 'editable';
const IS_SELECTED_CLASS = 'selected';

export const IMAGE_FILE_TYPES = ['jpeg', 'jpg', 'png', 'gif', 'bmp', 'ico', 'tif'];
export const CODE_FILE_TYPES = ['js', 'json', 'html', 'htm', 'css', 'less', 'xml', 'yml'];
export const PDF_FILE_TYPES = ['pdf'];
export const WORD_FILE_TYPES = ['doc', 'docx', 'docm', 'dotx', 'dotm', 'docb'];
export const ZIP_FILE_TYPES = ['zip', 'gzip'];

export const PREVIEW_SIZES = new Enum({
	EXTRA_SMALL: 'extra-small',
	SMALL: 'small',
	MEDIUM: 'medium',
	LARGE: 'large',
	EXTRA_LARGE: 'extra-large'
});

const DELETE_BUTTON = Symbol();
const IMAGE_WRAPPER = Symbol();
const ICON = Symbol();
const IMAGE = Symbol();

const hideDeleteButton = Symbol();

/**
 * Display a file thumbnail.
 *
 * @module FileThumbnail
 * @extends Control
 * @constructor
 *
 * @arg {Object} settings
 */
export default class FileThumbnail extends IsWorkingMixin(Control) {
	constructor(settings = {}) {
		settings.type = settings.type || controlTypes.FILE_THUMBNAIL;

		super(settings);

		const self = this;

		self.addClass(THUMBNAIL_CLASS + PREVIEW_SIZES.SMALL)
			.on(MOUSE_ENTER_EVENT, () => {
				if (self.onDelete()) {
					if (!self[DELETE_BUTTON]) {
						self[DELETE_BUTTON] = new Button({
							container: self.element,
							stopPropagation: true,
							icon: CLEAR_ALT_ICON,
							classes: BUTTON_CLASS,
							onClick() {
								if (self.onDelete()) {
									self.onDelete()(self);
								}
							},
							fade: true
						});
					}
				}
			})
			.on(MOUSE_LEAVE_EVENT, () => {
				self[hideDeleteButton]();
			});

		self[IMAGE_WRAPPER] = new Div({
			container: self,
			classes: IMAGE_WRAPPER_CLASS
		});

		self[ICON] = new Icon({
			container: self[IMAGE_WRAPPER]
		});

		self[IMAGE] = new Image({
			container: self[IMAGE_WRAPPER]
		});
		self[IMAGE].css(OPACITY, 0);

		self.isWorking(true);

		applySettings(self, settings);
	}

	[hideDeleteButton]() {
		const self = this;
		if (self[DELETE_BUTTON]) {
			self[DELETE_BUTTON].remove();
			self[DELETE_BUTTON] = null;
		}
	}
}

Object.assign(FileThumbnail.prototype, {
	/**
	 * Get or Set the size of the preview image.
	 * @method previewSize
	 * @member module:FileThumbnail
	 * @instance
	 * @arg {String} [previewSize] - FileThumbnail.PREVIEW_SIZES
	 * @returns {String|this}
	 */
	previewSize: methodEnum({
		enum: PREVIEW_SIZES,
		init: PREVIEW_SIZES.SMALL,
		before: 'removeClass',
		set: 'addClass'
	}),

	/**
	 * Get or Set the source url for the thumbnail image.
	 * @method imageSource
	 * @member module:FileThumbnail
	 * @instance
	 * @arg {String} [previewSize] - FileThumbnail.PREVIEW_SIZES
	 * @returns {String|this}
	 */
	imageSource: methodAny({
		set(newValue) {
			const self = this;
			if (self[IMAGE]) {
				self[IMAGE].source(newValue || '')
					.css(OPACITY, newValue ? 1 : 0);
				self[ICON].isVisible(!newValue);
				self.isWorking(!newValue);
			}
		}
	}),

	fileData: methodObject(),

	fileExtension: methodString({
		set(fileExtension) {
			let fileIcon = FILE_ICON;

			if (IMAGE_FILE_TYPES.includes(fileExtension)) {
				fileIcon = IMAGE_FILE_ICON;
			}
			else if (CODE_FILE_TYPES.includes(fileExtension)) {
				fileIcon = CODE_FILE_ICON;
			}
			else if (PDF_FILE_TYPES.includes(fileExtension)) {
				fileIcon = PDF_FILE_ICON;
			}
			else if (WORD_FILE_TYPES.includes(fileExtension)) {
				fileIcon = WORD_FILE_ICON;
			}
			else if (ZIP_FILE_TYPES.includes(fileExtension)) {
				fileIcon = ZIP_FILE_ICON;
			}

			this[ICON].icon(fileIcon)
				.classes('image', fileIcon === IMAGE_FILE_ICON);
		}
	}),

	isSelected: methodBoolean({
		set(isSelected) {
			this.classes(IS_SELECTED_CLASS, isSelected);
		}
	}),

	onEdit: methodFunction({
		set(onEdit) {
			const self = this;
			self.set(CLICK_EVENT, () => {
				if (self.onEdit()) {
					self.onEdit()(self);
				}
			}, !!onEdit);
			self.classes(EDITABLE_CLASS, !!onEdit);
		}
	}),

	onDelete: methodFunction()
});
