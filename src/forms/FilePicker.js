import { delay } from 'async-agent';
import { clone } from 'object-agent';
import {
	applySettings,
	AUTO,
	enforceCssSize,
	methodArray,
	methodBoolean,
	methodEnum,
	methodFunction
} from 'type-enforcer-ui';
import ControlManager from '../ControlManager';
import controlTypes from '../controlTypes';
import LightBox from '../edit/LightBox';
import IsWorkingMixin from '../mixins/IsWorkingMixin';
import { EMPTY_STRING } from '../utility/domConstants';
import locale from '../utility/locale';
import FileInput from './FileInput';
import './FilePicker.less';
import FileThumbnail, { IMAGE_FILE_TYPES, PREVIEW_SIZES } from './FileThumbnail';
import FormControl from './FormControl';

const FILE_PICKER_CLASS = 'file-picker';

const FILE_INPUT = Symbol();
const FILES = Symbol();
const FILE_THUMBNAILS = Symbol();
const LIGHTBOX = Symbol();
const LOAD_COUNT = Symbol();

const buildFileInput = Symbol();
const preloadFiles = Symbol();
const buildThumbnail = Symbol();
const editFile = Symbol();
const deleteFile = Symbol();
const onLoadFile = Symbol();
const buildLightbox = Symbol();
const updateLightBox = Symbol();

/**
 * Display a control that picks files from the device and loads them.
 *
 * @class FilePicker
 * @extends FormControl
 * @constructor
 *
 * @arg {Object}        settings
 */
export default class FilePicker extends IsWorkingMixin(FormControl) {
	constructor(settings = {}) {
		settings.type = settings.type || controlTypes.FILE_PICKER;
		settings.width = enforceCssSize(settings.width, AUTO, true);

		super(settings);

		const self = this;
		self[FILES] = [];
		self[FILE_THUMBNAILS] = new ControlManager();
		self[LOAD_COUNT] = 0;

		self.addClass(FILE_PICKER_CLASS);

		applySettings(self, settings);

		self[buildFileInput]();
	}

	[buildFileInput]() {
		const self = this;
		if (!self[FILE_INPUT] && (!self[FILE_THUMBNAILS].total() || self.isMulti())) {
			self[FILE_INPUT] = new FileInput({
				container: self,
				onPreLoad(data) {
					self[preloadFiles](data);
				},
				onLoad(data) {
					self[onLoadFile](data);
				},
				previewSize: self.previewSize(),
				isMulti: self.isMulti() || self.isImage(),
				isAudio: self.isAudio(),
				isImage: self.isImage(),
				isVideo: self.isVideo(),
				mimeTypes: self.mimeTypes().length ? self.mimeTypes() : undefined
			});
		}
	}

	[preloadFiles](data) {
		const self = this;
		const firstFileName = data[0].name;

		self[FILES] = self[FILES].concat(data);

		if (self.isImage()) {
			if (self.isQuickEdit() || (!self.isMulti() && self[FILES].length > 1)) {
				self[buildLightbox](firstFileName);
			}
			if (!self.isMulti() && self[FILES].length > 1) {
				self.error(locale.get('filePickerTooManyItemsError'));
			}
		}
	}

	[buildThumbnail](data, skipOnChange) {
		const self = this;
		let thumb = new FileThumbnail({
			id: data.name,
			container: self,
			previewSize: self.previewSize(),
			fileExtension: data.extension,
			fileData: data
		});

		if (IMAGE_FILE_TYPES.includes(data.extension)) {
			thumb.imageSource(data.fileData);
		}
		else {
			thumb.isWorking(false);
		}

		if (self.canEdit()) {
			thumb.onEdit((thumb) => {
				self[editFile](thumb);
			});
		}
		if (self.canDelete()) {
			thumb.onDelete(() => {
				self[deleteFile](thumb);
			});
		}

		if (self.isMulti() || self.isImage()) {
			self[FILE_INPUT].container(self);
		}
		else {
			if (self[FILE_INPUT]) {
				self[FILE_INPUT].remove();
				self[FILE_INPUT] = null;
			}
		}

		if (!self.canEdit()) {
			self.onSave()(data);
		}

		self[FILE_THUMBNAILS].add(thumb);
		thumb = null;

		if (++self[LOAD_COUNT] === self[FILES].length && !skipOnChange) {
			self.triggerChange();
		}
	}

	[editFile](control) {
		this[buildLightbox](control.id());
	}

	[deleteFile](fileThumbnail) {
		const self = this;

		if (self.onDelete()) {
			self.onDelete()({
				fileData: fileThumbnail.fileData(),
				fileExtension: fileThumbnail.fileExtension()
			});
		}

		self[FILES] = self[FILES].filter((file) => file.name !== fileThumbnail.id());

		self[FILE_THUMBNAILS].remove(fileThumbnail.id());

		if (!self.isMulti() && self[FILES].length <= 1) {
			self.error(EMPTY_STRING);
		}

		fileThumbnail.remove();

		self[buildFileInput]();

		self[LOAD_COUNT]--;
		self.triggerChange();
	}

	[onLoadFile](data) {
		const self = this;

		Object.assign(self[FILES].find((item) => item.name === data.name), data);
		self[buildThumbnail](data);
		self[updateLightBox]();
	}

	[buildLightbox](selectedItem) {
		const self = this;
		if (!self[LIGHTBOX]) {
			self[LIGHTBOX] = new LightBox({
				isMulti: self.isMulti(),
				onDelete(fileName) {
					self[deleteFile](self[FILE_THUMBNAILS].get(fileName));
				},
				onRemove() {
					self[LIGHTBOX] = null;
				}
			});
		}

		if (selectedItem) {
			self[LIGHTBOX].selectedItems([selectedItem]);
		}
		self[updateLightBox]();
	}

	[updateLightBox]() {
		const self = this;
		if (self[LIGHTBOX]) {
			self[LIGHTBOX].files(clone(self[FILES]));
		}
	}
}

Object.assign(FilePicker.prototype, {
	/**
	 * @method value
	 * @member module:FilePicker
	 * @instance
	 *
	 * @arg {Number} [value]
	 *
	 * @returns {Number|this}
	 */
	value: methodArray({
		set(value) {
			const self = this;
			self[FILES] = value;
			self[FILE_THUMBNAILS].remove();
			self[LOAD_COUNT] = 0;
			self[FILES].forEach((file) => {
				self[buildThumbnail](file, true);
			});
			if (!self[FILES].length) {
				self[buildFileInput]();
			}
		},
		get() {
			return this[FILES];
		}
	}),

	isAudio: methodBoolean({
		set(isAudio) {
			if (this[FILE_INPUT]) {
				this[FILE_INPUT].isAudio(isAudio);
			}
		}
	}),

	isImage: methodBoolean({
		set(isImage) {
			if (this[FILE_INPUT]) {
				this[FILE_INPUT].isImage(isImage);
			}
		}
	}),

	isVideo: methodBoolean({
		set(isVideo) {
			if (this[FILE_INPUT]) {
				this[FILE_INPUT].isVideo(isVideo);
			}
		}
	}),

	/**
	 * If true and isImage is true then show the LightBox immediately when files are added
	 *
	 * @method isQuickEdit
	 * @member module:FilePicker
	 * @instance
	 *
	 * @arg {boolean} [isQuickEdit]
	 *
	 * @returns {boolean|this}
	 */
	isQuickEdit: methodBoolean(),

	mimeTypes: methodArray({
		set(newValue) {
			if (this[FILE_INPUT]) {
				this[FILE_INPUT].mimeTypes(newValue);
			}
		}
	}),

	onSave: methodFunction(),

	onDelete: methodFunction(),

	canEdit: methodBoolean({
		set() {
			const self = this;
			self[FILE_THUMBNAILS].each((fileThumbnail) => {
				fileThumbnail.onEdit(() => {
					self[editFile](fileThumbnail);
				});
			});
		}
	}),

	canDelete: methodBoolean({
		init: true,
		set(newValue) {
			this[FILE_THUMBNAILS].each((fileThumbnail) => {
				fileThumbnail.canDelete(newValue);
			});
		}
	}),

	/**
	 * Get or Set the size of the preview image.
	 * @method previewSize
	 * @member module:FilePicker
	 * @instance
	 * @arg {Number} [previewSize] - FilePicker.PREVIEW_SIZES
	 * @returns {Number|this}
	 */
	previewSize: methodEnum({
		enum: PREVIEW_SIZES,
		init: PREVIEW_SIZES.SMALL,
		set(newValue) {
			const self = this;
			if (self[FILE_INPUT]) {
				self[FILE_INPUT].previewSize(newValue);
			}

			self[FILE_THUMBNAILS].each((fileThumbnail) => {
				fileThumbnail.previewSize(newValue);
			});

			delay(() => {
				self.resize();
			}, 200);
		}
	}),

	/**
	 * Get or Set if this control should accept multiple files
	 * @method isMulti
	 * @member module:FilePicker
	 * @instance
	 * @arg {Boolean} [isMulti]
	 * @returns {Boolean|this}
	 */
	isMulti: methodBoolean({
		set(isMulti) {
			const self = this;

			self.classes('isMulti', isMulti);
			if (self[FILE_INPUT]) {
				self[FILE_INPUT].isMulti(isMulti);
			}
		}
	}),

	/**
	 * Determines if this control has focus
	 * @method isFocused
	 * @member module:FilePicker
	 * @instance
	 * @returns {Boolean}
	 */
	isFocused() {
		return false;
	}
});

FilePicker.PREVIEW_SIZES = PREVIEW_SIZES;
