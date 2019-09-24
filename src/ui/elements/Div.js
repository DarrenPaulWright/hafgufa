import { applySettings, castArray, isArray, isJson, isObject, isString } from 'type-enforcer';
import { CONTENT_CHANGE_EVENT } from '../..';
import dom from '../../utility/dom';
import controlTypes from '../controlTypes';
import Control, { CHILD_CONTROLS } from './../Control';

const addContent = Symbol();
const addLayout = Symbol();

/**
 * Display a div element.
 *
 * @class Div
 * @extends Control
 * @constructor
 *
 * @arg {Object} settings
 */
export default class Div extends Control {
	constructor(settings = {}) {
		settings.type = settings.type || controlTypes.DIV;

		super(settings);

		if (this.type === controlTypes.DIV) {
			applySettings(this, settings);
		}
	}

	/**
	 * Looks through the content array and builds the actual controls.
	 *
	 * @function addLayout
	 *
	 * @arg {Object[]} content    - Takes a JSON array of objects with control settings
	 * @arg {String}   [doPrepend=false]
	 */
	[addLayout](content, doPrepend) {
		const self = this;

		content = castArray(content);

		if (doPrepend) {
			content.reverse();
		}

		content.forEach((controlDefinition) => {
			if (controlDefinition && controlDefinition.control) {
				new controlDefinition.control({
					...controlDefinition,
					container: self,
					prepend: doPrepend
				});
			}
		});
	}

	/**
	 * Adds content to this container
	 *
	 * @function addContent
	 *
	 * @arg {Object[]} content    - Takes a JSON array of objects with control settings
	 * @arg {String}   [doPrepend=false]
	 */
	[addContent](content, doPrepend) {
		const self = this;

		if (content) {
			if (isArray(content) || isObject(content)) {
				self[addLayout](content, doPrepend);
			}
			else if (isJson(content) && isString(content) && (content.charAt(0) === '[' || content.charAt(0) === '{')) {
				self[addLayout](JSON.parse(content), doPrepend);
			}
			else {
				if (content.element) {
					content.container(self);
				}
				dom.content(self, content, doPrepend);
			}
			self.elementD3().dispatch(CONTENT_CHANGE_EVENT);
		}
	}

	/**
	 * Get a control in the content container that matches the provided id
	 *
	 * @method get
	 * @member module:Div
	 * @instance
	 *
	 * @arg {String} id
	 *
	 * @returns {Object}
	 */
	get(id) {
		return this[CHILD_CONTROLS].get(id);
	}

	/**
	 * Add new content to the container after removing all the current controls.
	 *
	 * @method content
	 * @member module:Div
	 * @instance
	 *
	 * @arg {Object[]} content - An Array of control objects. Look at each control for options.
	 */
	content(content) {
		this[CHILD_CONTROLS].remove();
		this[addContent](content, false);
		return this;
	}

	/**
	 * Add new content to the end of this container without removing the current controls.
	 *
	 * @method append
	 * @member module:Div
	 * @instance
	 *
	 * @arg {Object[]} content - An Array of control objects. Look at each control for options.
	 */
	append(content) {
		this[addContent](content, false);
		return this;
	}

	/**
	 * Add new content to the beginning of this container without removing the current controls.
	 *
	 * @method prepend
	 * @member module:Div
	 * @instance
	 *
	 * @arg {Object[]} content - An Array of control objects. Look at each control for options.
	 */
	prepend(content) {
		this[addContent](content, true);

		return this;
	}

	/**
	 * Iterate over each control in this container
	 *
	 * @method each
	 * @member module:Div
	 * @instance
	 *
	 * @arg {function} callback
	 * @arg {boolean}  [skipDeep=false] - if true then only iterate on immediate children
	 */
	each(callback, skipDeep = false) {
		return this[CHILD_CONTROLS].each((control, index) => {
			if (callback(control, index)) {
				return true;
			}
			if (!skipDeep && control.get) {
				return control.each(callback);
			}
		});
	}

	/**
	 * Build a mapped array of each control in this container
	 *
	 * @method map
	 * @member module:Div
	 * @instance
	 *
	 * @arg {function} callback
	 */
	map(callback) {
		return this[CHILD_CONTROLS].map(callback);
	}

	total() {
		return this[CHILD_CONTROLS].total();
	}

	/**
	 * Calls .remove on all of the controls added to this container or a specific control
	 *
	 * @method removeContent
	 * @member module:Div
	 * @instance
	 *
	 * @arg {string} id
	 */
	removeContent(id) {
		this[CHILD_CONTROLS].remove(id);

		return this;
	}
}
