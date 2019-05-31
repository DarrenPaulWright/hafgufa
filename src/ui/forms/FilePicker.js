import { delay } from 'async-agent';
import { remove } from 'lodash';
import { clone } from 'object-agent';
import { AUTO, enforce, method } from 'type-enforcer';
import { EMPTY_STRING } from '../../utility/domConstants';
import objectHelper from '../../utility/objectHelper';
import ControlManager from '../ControlManager';
import controlTypes from '../controlTypes';
import LightBox from '../other/LightBox';
import FileInput from './FileInput';
import './FilePicker.less';
import FileThumbnail, { IMAGE_FILE_TYPES, PREVIEW_SIZES } from './FileThumbnail';
import FormControl from './FormControl';

const FILE_PICKER_CLASS = 'file-picker';

const STRINGS = Symbol();
const FILE_INPUT = Symbol();
const FILES = Symbol();
const FILE_THUMBNAILS = Symbol();
const LIGHTBOX = Symbol();
const LOAD_COUNT = Symbol();

const buildFileInput = Symbol();
const removeFileInput = Symbol();
const preloadFiles = Symbol();
const buildThumbnail = Symbol();
const editFile = Symbol();
const saveFile = Symbol();
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
export default class FilePicker extends FormControl {
	constructor(settings = {}) {
		settings.type = settings.type || controlTypes.FILE_PICKER;
		settings.width = enforce.cssSize(settings.width, AUTO, true);

		super(settings);

		const self = this;
		self[STRINGS] = settings.localizedStrings || {};
		self[FILES] = [];
		self[FILE_THUMBNAILS] = new ControlManager();
		self[LOAD_COUNT] = 0;

		self.addClass(FILE_PICKER_CLASS);

		objectHelper.applySettings(self, settings);

		self[buildFileInput]();

		self.onRemove(() => {
			self[removeFileInput]();
			self[FILE_THUMBNAILS].remove();
		});
	}

	[buildFileInput]() {
		const self = this;
		if (!self[FILE_INPUT] && (!self[FILE_THUMBNAILS].total() || self.isMulti())) {
			self[FILE_INPUT] = new FileInput({
				container: self.contentContainer(),
				localizedStrings: self[STRINGS],
				onPreLoad: (data) => {
					self[preloadFiles](data);
				},
				onLoad: (data) => {
					self[onLoadFile](data);
				},
				previewSize: self.previewSize(),
				isMulti: self.isMulti() || self.isImage(),
				isImage: self.isImage(),
				mimeTypes: self.mimeTypes()
			});
		}
	}

	[removeFileInput]() {
		const self = this;
		if (self[FILE_INPUT]) {
			self[FILE_INPUT].remove();
			self[FILE_INPUT] = null;
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
				self.error(self[STRINGS].filePickerTooManyItemsError);
			}
		}
	}

	[buildThumbnail](data, skipOnChange) {
		const self = this;
		let thumb = new FileThumbnail({
			ID: data.name,
			container: self.contentContainer(),
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
				self[deleteFile]();
			});
		}

		if (self.isMulti() || self.isImage()) {
			self[FILE_INPUT].container(self);
		}
		else {
			self[removeFileInput]();
		}

		if (!self.canEdit()) {
			self[saveFile](thumb);
		}

		self[FILE_THUMBNAILS].add(thumb);
		thumb = null;

		if (++self[LOAD_COUNT] === self[FILES].length && !skipOnChange) {
			self.triggerChange();
		}
	}

	[editFile](control) {
		this[buildLightbox](control.ID());
	}

	[saveFile](fileThumbnail) {
		objectHelper.callIfExists(this.onSave(), {
			fileData: fileThumbnail.fileData().fileData,
			fileExtension: fileThumbnail.fileExtension()
		});
	}

	[deleteFile](fileThumbnail) {
		const self = this;
		objectHelper.callIfExists(self.onDelete(), {
			fileData: fileThumbnail.fileData(),
			fileExtension: fileThumbnail.fileExtension()
		});

		remove(self[FILES], {
			name: fileThumbnail.ID()
		});

		self[FILE_THUMBNAILS].remove(fileThumbnail.ID());

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
				onDelete: function(fileName) {
					self[deleteFile](self[FILE_THUMBNAILS].get(fileName));
				},
				onRemove: function() {
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
	value: method.array({
		set: function(value) {
			const self = this;
			self[FILES] = value;
			self[FILE_THUMBNAILS].remove();
			self[LOAD_COUNT] = 0;
			self[FILES].forEach((file) => {
				self[buildThumbnail](file, true);
			});
		},
		get: function() {
			return this[FILES];
		}
	}),

	isImage: method.boolean({
		set: function(isImage) {
			if (this[FILE_INPUT]) {
				this[FILE_INPUT].isImage(isImage);
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
	isQuickEdit: method.boolean(),

	mimeTypes: method.array({
		set: function(newValue) {
			if (this[FILE_INPUT]) {
				this[FILE_INPUT].mimeTypes(newValue);
			}
		}
	}),

	onSave: method.function(),

	onDelete: method.function(),

	canEdit: method.boolean({
		set: function() {
			const self = this;
			self[FILE_THUMBNAILS].each((fileThumbnail) => {
				fileThumbnail.onEdit(() => {
					self[editFile](fileThumbnail);
				});
			});
		}
	}),

	canDelete: method.boolean({
		init: true,
		set: function(newValue) {
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
	previewSize: method.enum({
		enum: PREVIEW_SIZES,
		init: PREVIEW_SIZES.SMALL,
		set: function(newValue) {
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
	isMulti: method.boolean({
		set: function(newValue) {
			if (this[FILE_INPUT]) {
				this[FILE_INPUT].isMulti(newValue);
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
	isFocused: () => false
});

FilePicker.PREVIEW_SIZES = PREVIEW_SIZES;
