import { applySettings, castArray, isArray, isElement, isJson, isNumber, isObject, isString } from 'type-enforcer-ui';
import controlTypes from '../controlTypes';
import { CONTENT_CHANGE_EVENT } from '../utility/domConstants';
import setDefaults from '../utility/setDefaults.js';
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
 * @param {Object} settings
 */
export default class Div extends Control {
	constructor(settings = {}) {
		super(setDefaults({
			type: controlTypes.DIV
		}, settings));

		if (this.type === controlTypes.DIV) {
			applySettings(this, settings);
		}
	}

	/**
	 * Looks through the content array and builds the actual controls.
	 *
	 * @function addLayout
	 *
	 * @param {Object[]} content    - Takes a JSON array of objects with control settings
	 * @param {String}   [appendAt]
	 */
	[addLayout](content, appendAt) {
		const self = this;

		castArray(content).forEach((controlDefinition, index) => {
			if (controlDefinition && controlDefinition.control) {
				new controlDefinition.control({
					...controlDefinition,
					container: self,
					appendAt: isNumber(appendAt) ? appendAt + index : null
				});
			}
		});
	}

	/**
	 * Adds content to this container
	 *
	 * @function addContent
	 *
	 * @param {Object[]} content    - Takes a JSON array of objects with control settings
	 * @param {String}   [appendAt]
	 */
	[addContent](content, appendAt) {
		const self = this;

		if (content) {
			if (isArray(content) || isObject(content)) {
				self[addLayout](content, appendAt);
			}
			else if (isJson(content) && isString(content) && (content.charAt(0) === '[' || content.charAt(0) === '{')) {
				self[addLayout](JSON.parse(content), appendAt);
			}
			else {
				const parent = self.element;

				if (content.element !== undefined) {
					content.container(self);
					content = content.element;
				}

				if (isElement(content)) {
					if (isNumber(appendAt)) {
						parent.insertBefore(content, parent.children[appendAt]);
					}
					else {
						parent.appendChild(content);
					}
				}
				else {
					if (isNumber(appendAt)) {
						parent.children[appendAt].insertAdjacentHTML('beforebegin', content);
					}
					else {
						parent.insertAdjacentHTML('beforeend', content);
					}
				}
			}

			self.trigger(CONTENT_CHANGE_EVENT);
		}
	}

	/**
	 * Get a control in the content container that matches the provided id
	 *
	 * @method get
	 * @member module:Div
	 * @instance
	 *
	 * @param {String} id
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
	 * @param {Object[]} content - An Array of control objects. Look at each control for options.
	 */
	content(content) {
		this[CHILD_CONTROLS].remove();
		this.element.textContent = '';
		this[addContent](content);

		return this;
	}

	/**
	 * Add new content to the end of this container without removing the current controls.
	 *
	 * @method append
	 * @member module:Div
	 * @instance
	 *
	 * @param {Object[]} content - An Array of control objects. Look at each control for options.
	 */
	append(content) {
		this[addContent](content);

		return this;
	}

	/**
	 * Add new content to the beginning of this container without removing the current controls.
	 *
	 * @method prepend
	 * @member module:Div
	 * @instance
	 *
	 * @param {Object[]} content - An Array of control objects. Look at each control for options.
	 */
	prepend(content) {
		this[addContent](content, 0);
		return this;
	}

	insertAt(content, index = 0) {
		this[addContent](content, index);
		return this;
	}

	/**
	 * Iterate over each control in this container
	 *
	 * @method each
	 * @member module:Div
	 * @instance
	 *
	 * @param {function} callback
	 * @param {boolean}  [skipDeep=false] - if true then only iterate on immediate children
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
	 * @param {function} callback
	 */
	map(callback) {
		return this[CHILD_CONTROLS].map(callback);
	}

	total() {
		return this[CHILD_CONTROLS].length;
	}

	/**
	 * Calls .remove on all of the controls added to this container or a specific control
	 *
	 * @method removeContent
	 * @member module:Div
	 * @instance
	 *
	 * @param {string} id
	 */
	removeContent(id) {
		this[CHILD_CONTROLS].remove(id);

		return this;
	}
}
