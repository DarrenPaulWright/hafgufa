import { applySettings, castArray, methodArray, methodBoolean, methodEnum, methodFunction } from 'type-enforcer-ui';
import Control from '../Control.js';
import controlTypes from '../controlTypes.js';
import Icon from '../elements/Icon.js';
import Input from '../elements/Input.js';
import Label from '../elements/Label.js';
import { AUDIO_FILE_ICON, FILE_ICON, IMAGE_FILE_ICON, VIDEO_FILE_ICON } from '../icons.js';
import { IS_DESKTOP } from '../utility/browser.js';
import {
	ACCEPT,
	CHANGE_EVENT,
	CLICK_EVENT,
	DRAG_DROP_EVENT,
	DRAG_ENTER_EVENT,
	DRAG_LEAVE_EVENT,
	EMPTY_STRING,
	INPUT_TYPE_FILE,
	MULTIPLE
} from '../utility/domConstants.js';
import locale from '../utility/locale.js';
import setDefaults from '../utility/setDefaults.js';
import './FileInput.less';
import { PREVIEW_SIZES } from './FileThumbnail.js';

const FILE_INPUT_CLASS = 'file-input ';
const FILE_ELEMENT_CLASS = 'file-element';
const HOVER_CLASS = 'hover';
const AUDIO_TYPE = 'audio/*';
const IMAGE_TYPE = 'image/*';
const VIDEO_TYPE = 'video/*';
const EXTENSION_SEPARATOR = '.';

const stopEvent = (event) => {
	event.stopPropagation();
	event.preventDefault();
};

const getFileName = (fileName) => fileName.split(EXTENSION_SEPARATOR)[0];

const getFileExtension = (fileName) => {
	const fileNamePieces = fileName.split(EXTENSION_SEPARATOR);
	return fileNamePieces[fileNamePieces.length - 1].toLowerCase();
};

const INPUT_CONTROL = Symbol();
const ICON = Symbol();
const LABEL = Symbol();

const loadFile = Symbol();
const isValidMimeType = Symbol();

/**
 * Display a styled file input element with file drop support.
 *
 * @module FileInput
 * @extends Control
 * @constructor
 *
 * @param {object} settings
 */
export default class FileInput extends Control {
	constructor(settings = {}) {
		super(setDefaults({
			type: controlTypes.FILE_INPUT
		}, settings));

		const self = this;

		self.addClass(FILE_INPUT_CLASS + PREVIEW_SIZES.SMALL);

		self[INPUT_CONTROL] = new Input({
			inputType: INPUT_TYPE_FILE,
			class: FILE_ELEMENT_CLASS
		});
		self[INPUT_CONTROL].on(CHANGE_EVENT, () => {
			const onPreLoad = self.onPreLoad();
			const files = castArray(self[INPUT_CONTROL].element.files);

			if (onPreLoad) {
				onPreLoad(files.map((file) => ({
					name: getFileName(file.name),
					extension: getFileExtension(file.name),
					type: file.type
				})));
			}
			self[loadFile](files);
		});

		self[ICON] = new Icon({
			container: self,
			icon: FILE_ICON
		});

		self[LABEL] = new Label({
			container: self,
			content: locale.get(IS_DESKTOP ? 'fileInputClickOrDrop' : 'fileInputClickToAdd')
		});

		self.on(CLICK_EVENT, (event) => {
				stopEvent(event);
				self[INPUT_CONTROL].isFocused(true).click();
			})
			.on(DRAG_ENTER_EVENT, (event) => {
				stopEvent(event);
				self.addClass(HOVER_CLASS);
			})
			.on(DRAG_LEAVE_EVENT, (event) => {
				stopEvent(event);
				self.removeClass(HOVER_CLASS);
			})
			.on(DRAG_DROP_EVENT, (event) => {
				stopEvent(event);
				if (event.dataTransfer.files.length > 0) {
					self[loadFile](event.dataTransfer.files);
				}
			});

		applySettings(self, settings);

		self.onRemove(() => {
			self[INPUT_CONTROL].remove();
		});
	}

	[loadFile](files) {
		const self = this;
		const onLoad = self.onLoad();

		const getImageSize = (data) => new Promise((resolve) => {
			if (self.isImage()) {
				let img = new Image();

				img.onload = () => {
					resolve({
						...data,
						width: img.width,
						height: img.height
					});
					img = null;
				};

				img.src = data.fileData;
			}
			else {
				resolve(data);
			}
		});

		const readFile = (file, index) => new Promise((resolve) => {
			let reader = new FileReader();

			reader.onload = () => {
				resolve({
					file: file,
					fileData: reader.result,
					name: getFileName(file.name),
					extension: getFileExtension(file.name),
					index: index
				});
				reader = null;
			};

			reader.readAsDataURL(file);
		});

		if (!self.isMulti()) {
			files = [files[0]];
		}

		if (onLoad) {
			files.forEach((file, index) => {
				if (self[isValidMimeType](file.type)) {
					readFile(file, index)
						.then(getImageSize)
						.then(onLoad);
				}
			});
		}
	}

	[isValidMimeType](type) {
		const mimeTypes = this.mimeTypes();
		let isValid = false;

		mimeTypes.forEach((mimeType) => {
			if (type.match(mimeType)) {
				isValid = true;
			}
		});

		return isValid || !mimeTypes.length;
	}
}

Object.assign(FileInput.prototype, {
	isAudio: methodBoolean({
		set(isAudio) {
			this.mimeTypes([isAudio ? AUDIO_TYPE : EMPTY_STRING]);
			this[ICON].icon(AUDIO_FILE_ICON);
		}
	}),

	isImage: methodBoolean({
		set(isImage) {
			this.mimeTypes([isImage ? IMAGE_TYPE : EMPTY_STRING]);
			this[ICON].icon(IMAGE_FILE_ICON);
		}
	}),

	isVideo: methodBoolean({
		set(isVideo) {
			this.mimeTypes([isVideo ? VIDEO_TYPE : EMPTY_STRING]);
			this[ICON].icon(VIDEO_FILE_ICON);
		}
	}),

	mimeTypes: methodArray({
		set(mimeTypes) {
			this[INPUT_CONTROL].attr(ACCEPT, mimeTypes.join(','));
		}
	}),

	/**
	 * Get or Set if this input should accept multiple files
	 *
	 * @method isMulti
	 * @member module:FileInput
	 * @instance
	 * @param {boolean} [isMulti]
	 * @returns {boolean|this}
	 */
	isMulti: methodBoolean({
		set(newValue) {
			this[INPUT_CONTROL].attr(MULTIPLE, newValue);
		}
	}),

	/**
	 * Get or Set the size of the preview image.
	 *
	 * @method previewSize
	 * @member module:FileInput
	 * @instance
	 * @param {string} [previewSize] - FileThumbnail.PREVIEW_SIZES
	 * @returns {string|this}
	 */
	previewSize: methodEnum({
		enum: PREVIEW_SIZES,
		init: PREVIEW_SIZES.SMALL,
		before: 'removeClass',
		set: 'addClass'
	}),

	/**
	 * Get or Set a function that gets called when a file is selected via user input
	 *
	 * @method onPreLoad
	 * @memberof module:FilePicker
	 * @instance
	 * @param {Function} [onLoad]
	 * @returns {Function|this}
	 */
	onPreLoad: methodFunction(),

	/**
	 * Get or Set a function that gets called when a file is loaded via user input
	 *
	 * @method onLoad
	 * @member module:FileInput
	 * @instance
	 * @param {Function} [onLoad]
	 * @returns {Function|this}
	 */
	onLoad: methodFunction()
});
