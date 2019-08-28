import { applySettings, castArray, isArray, isJson, isObject, isString, method } from 'type-enforcer';
import dom from '../../utility/dom';
import { CONTENT_CHANGE_EVENT, TAB_INDEX, TAB_INDEX_DISABLED, TAB_INDEX_ENABLED } from '../../utility/domConstants';
import Control from '../Control';
import ControlManager from '../ControlManager';
import controlTypes from '../controlTypes';
import FocusMixin from '../mixins/FocusMixin';
import IsWorkingMixin from '../mixins/IsWorkingMixin';
import './Container.less';

const CONTAINER_CLASS = 'container clearfix';

const CONTROLS = Symbol();
const ADD_CONTENT = Symbol();
const ADD_LAYOUT = Symbol();

/**
 * @class Container
 * @extends Control
 * @constructor
 *
 * @arg {Object}   settings
 * @arg {Object[]} [settings.content]
 * @arg {Object[]} [settings.parentContainer]
 */
export default class Container extends IsWorkingMixin(FocusMixin(Control)) {
	constructor(settings = {}) {
		settings.type = settings.type || controlTypes.CONTAINER;
		settings.FocusMixin = settings.FocusMixin || {};
		settings.FocusMixin.hasChildren = true;

		super(settings);

		const self = this;
		self[CONTROLS] = new ControlManager();
		self.addClass(CONTAINER_CLASS)
			.contentContainer(self.element());

		if (settings.type === controlTypes.CONTAINER) {
			applySettings(self, settings);
		}

		self.onRemove(() => {
			self[CONTROLS].remove();
		});
	}

	/**
	 * Looks through the content array and builds the actual controls.
	 *
	 * @function addLayout
	 *
	 * @arg {Object[]} content    - Takes a JSON array of objects with control settings
	 * @arg {String}   [doPrepend=false]
	 */
	[ADD_LAYOUT](content, doPrepend) {
		content = castArray(content);

		if (doPrepend) {
			content.reverse();
		}

		content.forEach((controlDefinition) => {
			if (controlDefinition && controlDefinition.control) {
				this[CONTROLS].add(new controlDefinition.control({
					...controlDefinition,
					container: this.contentContainer(),
					prepend: doPrepend,
					parentContainer: this
				}));
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
	[ADD_CONTENT](content, doPrepend) {
		if (content) {
			if (isArray(content) || isObject(content)) {
				this[ADD_LAYOUT](content, doPrepend);
			}
			else if (isJson(content) && isString(content) && (content.charAt(0) === '[' || content.charAt(0) === '{')) {
				this[ADD_LAYOUT](JSON.parse(content), doPrepend);
			}
			else {
				if (content.element) {
					this[CONTROLS].add(content);
					content.container(this);
				}
				dom.content(this, content, doPrepend);
			}
			this.elementD3().dispatch(CONTENT_CHANGE_EVENT);
			this.resize(true);
		}
	}

	/**
	 * Get a control in the content container that matches the provided ID
	 *
	 * @method get
	 * @member module:Container
	 * @instance
	 *
	 * @arg {String} ID
	 *
	 * @returns {Object}
	 */
	get(ID) {
		return this[CONTROLS].get(ID);
	}

	/**
	 * Add new content to the container after removing all the current controls.
	 *
	 * @method content
	 * @member module:Container
	 * @instance
	 *
	 * @arg {Object[]} content - An Array of control objects. Look at each control for options.
	 */
	content(content) {
		this[CONTROLS].remove();
		dom.empty(this);
		this[ADD_CONTENT](content, false);
		return this;
	}

	/**
	 * Add new content to the end of this container without removing the current controls.
	 *
	 * @method append
	 * @member module:Container
	 * @instance
	 *
	 * @arg {Object[]} content - An Array of control objects. Look at each control for options.
	 */
	append(content) {
		this[ADD_CONTENT](content, false);
		return this;
	}

	/**
	 * Add new content to the beginning of this container without removing the current controls.
	 *
	 * @method prepend
	 * @member module:Container
	 * @instance
	 *
	 * @arg {Object[]} content - An Array of control objects. Look at each control for options.
	 */
	prepend(content) {
		this[ADD_CONTENT](content, true);

		return this;
	}

	/**
	 * Iterate over each control in this container
	 *
	 * @method each
	 * @member module:Container
	 * @instance
	 *
	 * @arg {function} callback
	 * @arg {boolean}  [skipDeep=false] - if true then only iterate on immediate children
	 */
	each(callback, skipDeep) {
		return this[CONTROLS].each((control, index) => {
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
	 * @member module:Container
	 * @instance
	 *
	 * @arg {function} callback
	 */
	map(callback) {
		return this[CONTROLS].map(callback);
	}

	total() {
		return this[CONTROLS].total();
	}

	/**
	 * Calls .remove on all of the controls added to this container or a specific control
	 *
	 * @method removeContent
	 * @member module:Container
	 * @instance
	 *
	 * @arg {string} ID
	 */
	removeContent(ID) {
		this[CONTROLS].remove(ID);
	}
}

Object.assign(Container.prototype, {

	contentContainer: method.element(),

	isFocusable: method.boolean({
		set(newValue) {
			this.attr(TAB_INDEX, newValue ? TAB_INDEX_ENABLED : TAB_INDEX_DISABLED);
		}
	})
});
