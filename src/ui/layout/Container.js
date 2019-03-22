import { castArray, isArray, isJson, isObject, method } from 'type-enforcer';
import dom from '../../utility/dom';
import { CONTENT_CHANGE_EVENT, TAB_INDEX, TAB_INDEX_DISABLED, TAB_INDEX_ENABLED } from '../../utility/domConstants';
import objectHelper from '../../utility/objectHelper';
import Control from '../Control';
import ControlManager from '../ControlManager';
import controlTypes from '../controlTypes';
import FocusMixin from '../mixins/FocusMixin';
import IsWorkingMixin from '../mixins/IsWorkingMixin';
import './Container.less';

const CONTAINER_CLASS = 'container clearfix';

/**
 * Looks through the content array and builds the actual controls.
 *
 * @function addLayout
 *
 * @arg {Object[]} content    - Takes a JSON array of objects with control settings
 * @arg {String}   [doPrepend=false]
 */
const addLayout = (content, doPrepend) => {
	const addControl = (controlDefinition) => {
		if (controlDefinition && controlDefinition.control) {
			controlDefinition = Object.assign(controlDefinition, {
				container: this.contentContainer(),
				parentContainer: this
			});

			let control = new controlDefinition.control(controlDefinition);
			if (doPrepend) {
				control.container(this.contentContainer(), true);
			}
			this[CONTROLS].add(control);
			control = null;
		}
	};

	content = castArray(content);
	if (doPrepend) {
		content.reverse();
	}
	content.forEach(addControl);
};

/**
 * Adds content to this container
 *
 * @function addContent
 *
 * @arg {Object[]} content    - Takes a JSON array of objects with control settings
 * @arg {String}   [doPrepend=false]
 */
const addContent = (content, doPrepend) => {
	if (content) {
		if (isArray(content) || isObject(content)) {
			addLayout.call(this, content, doPrepend);
		}
		else if (isJson(content)) {
			addLayout.call(this, JSON.parse(content), doPrepend);
		}
		else {
			dom.content(this, content, doPrepend);
			if (content.element) {
				this[CONTROLS].add(content);
			}
		}
		this.elementD3().dispatch(CONTENT_CHANGE_EVENT);
		this.resize();
	}
};

const CONTROLS = Symbol();

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
		super(settings.type || controlTypes.CONTAINER, settings);

		this[CONTROLS] = new ControlManager();
		this.addClass(CONTAINER_CLASS)
			.contentContainer(this.element());

		objectHelper.applySettings(this, settings);

		this.onRemove(() => {
			this[CONTROLS].remove();
		});
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
		addContent.call(this, content, false);
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
		addContent.call(this, content, false);
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
		addContent.call(this, content, true);

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
		set: function(newValue) {
			this.attr(TAB_INDEX, newValue ? TAB_INDEX_ENABLED : TAB_INDEX_DISABLED);
		}
	})
});
