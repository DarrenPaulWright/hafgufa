import { event } from 'd3';
import { applySettings, castArray, method } from 'type-enforcer';
import { IS_DESKTOP } from '../../utility/browser';
import dom from '../../utility/dom';
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
} from '../../utility/domConstants';
import locale from '../../utility/locale';
import Control from '../Control';
import controlTypes from '../controlTypes';
import Input from '../elements/Input';
import './FileInput.less';
import { PREVIEW_SIZES } from './FileThumbnail';

const FILE_INPUT_CLASS = 'file-input ';
const FILE_ELEMENT_CLASS = 'file-element';
const HOVER_CLASS = 'hover';
const IMAGE_TYPE = 'image/*';
const EXTENSION_SEPARATOR = '.';

const stopEvent = () => {
	event.stopPropagation();
	event.preventDefault();
};

const getFileName = (fileName) => fileName.split(EXTENSION_SEPARATOR)[0];

const getFileExtension = (fileName) => {
	const fileNamePieces = fileName.split(EXTENSION_SEPARATOR);
	return fileNamePieces[fileNamePieces.length - 1].toLowerCase();
};

const INPUT_CONTROL = Symbol();

const loadFile = Symbol();
const isValidMimeType = Symbol();

/**
 * Display a styled file input element with file drop support.
 *
 * @module FileInput
 * @extends Control
 * @constructor
 *
 * @arg {Object} settings
 */
export default class FileInput extends Control {
	constructor(settings = {}) {
		settings.type = settings.type || controlTypes.FILE_INPUT;

		super(settings);

		const self = this;

		self.addClass(FILE_INPUT_CLASS + PREVIEW_SIZES.SMALL);

		self[INPUT_CONTROL] = new Input({
			container: self,
			inputType: INPUT_TYPE_FILE,
			class: FILE_ELEMENT_CLASS
		});
		self[INPUT_CONTROL].on(CHANGE_EVENT, () => {
			const onPreLoad = self.onPreLoad();
			const files = castArray(self[INPUT_CONTROL].element().files);

			if (onPreLoad) {
				onPreLoad(files.map((file) => ({
					name: getFileName(file.name),
					extension: getFileExtension(file.name),
					type: file.type
				})));
			}
			self[loadFile](files);
		});

		dom.content(self.element(), locale.get(IS_DESKTOP ? 'fileInputClickOrDrop' : 'fileInputClickToAdd'));

		self.on(CLICK_EVENT, () => {
				stopEvent();
				self[INPUT_CONTROL].isFocused(true).click();
			})
			.on(DRAG_ENTER_EVENT, () => {
				stopEvent();
				self.addClass(HOVER_CLASS);
			})
			.on(DRAG_LEAVE_EVENT, () => {
				stopEvent();
				self.removeClass(HOVER_CLASS);
			})
			.on(DRAG_DROP_EVENT, () => {
				stopEvent();
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
	isImage: method.boolean({
		set: function(isImage) {
			this.mimeTypes([isImage ? IMAGE_TYPE : EMPTY_STRING]);
		}
	}),

	mimeTypes: method.array({
		set: function(mimeTypes) {
			this[INPUT_CONTROL].attr(ACCEPT, mimeTypes);
		}
	}),

	/**
	 * Get or Set if this input should accept multiple files
	 * @method isMulti
	 * @member module:FileInput
	 * @instance
	 * @arg {Boolean} [isMulti]
	 * @returns {Boolean|this}
	 */
	isMulti: method.boolean({
		set: function(newValue) {
			this[INPUT_CONTROL].attr(MULTIPLE, newValue);
		}
	}),

	/**
	 * Get or Set the size of the preview image.
	 * @method previewSize
	 * @member module:FileInput
	 * @instance
	 * @arg {String} [previewSize] - FileThumbnail.PREVIEW_SIZES
	 * @returns {String|this}
	 */
	previewSize: method.enum({
		enum: PREVIEW_SIZES,
		init: PREVIEW_SIZES.SMALL,
		before: function(oldValue) {
			this.removeClass(oldValue);
		},
		set: function(newValue) {
			this.addClass(newValue);
		}
	}),

	/**
	 * Get or Set a function that gets called when a file is selected via user input
	 * @method onPreLoad
	 * @memberof module:FilePicker
	 * @instance
	 * @arg {Function} [onLoad]
	 * @returns {Function|this}
	 */
	onPreLoad: method.function(),

	/**
	 * Get or Set a function that gets called when a file is loaded via user input
	 * @method onLoad
	 * @member module:FileInput
	 * @instance
	 * @arg {Function} [onLoad]
	 * @returns {Function|this}
	 */
	onLoad: method.function()
});
