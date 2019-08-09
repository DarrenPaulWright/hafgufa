import { throttle } from 'async-agent';
import { isElement, method } from 'type-enforcer';
import dom from '../utility/dom';
import windowResize from '../utility/windowResize';
import Removable from './mixins/Removable';

const APPEND = Symbol();
const PREPEND = Symbol();
const ELEMENT = Symbol();
const WINDOW_RESIZE_ID = Symbol();
const CURRENT_CLASSES = Symbol();
const THROTTLED_RESIZE = Symbol();

/**
 * Update the elements id attribute with the current ID and IDSuffix.
 * @function updateElementID
 */
const updateElementID = function() {
	const self = this;
	self.attr('id', self.ID() ? (self.ID() + (self.IDSuffix() || '')) : null);
};

/**
 * The base class for an element.
 *
 * @class Element
 * @extends Removable
 * @constructorEmpty
 *
 * @arg {string} type
 * @arg {Object} settings - An object where keys are methods and values are arguments.
 */
export default class Element extends Removable {
	constructor(settings = {}) {
		super();
		const self = this;

		this[CURRENT_CLASSES] = '';
		this[THROTTLED_RESIZE] = throttle(() => {
			self.resize(true);
		}, 10);

		self[APPEND] = settings.append;
		delete settings.append;
		self[PREPEND] = settings.prepend;
		delete settings.prepend;

		self.type(settings.type);
		self.element(settings.element || dom.buildNew());
		delete settings.element;
		self.container(settings.container);
		delete settings.container;

		self.onRemove(() => {
			if (self[WINDOW_RESIZE_ID]) {
				windowResize.discard(self[WINDOW_RESIZE_ID]);
			}

			self.element(null);
		});
	}
}

Object.assign(Element.prototype, {
	/**
	 * The "type" of control.
	 *
	 * @method type
	 * @member Element
	 * @instance
	 *
	 * @arg {String} [type]
	 *
	 * @returns {String|this}
	 */
	type: method.string(),

	/**
	 * Set the id attribute.
	 *
	 * @method ID
	 * @member Element
	 * @instance
	 *
	 * @arg {String} [newID] - A unique ID
	 *
	 * @returns {String|this}
	 */
	ID: method.string({
		set: updateElementID,
		coerce: true
	}),

	/**
	 * A string to append to the end of the ID.
	 *
	 * @method IDSuffix
	 * @member Element
	 * @instance
	 *
	 * @arg {String} [newIDSuffix]
	 *
	 * @returns {String|this}
	 */
	IDSuffix: method.string({
		set: updateElementID
	}),

	/**
	 * Set the containing DOM element and append element to it.
	 *
	 * @method container
	 * @member Element
	 * @instance
	 *
	 * @arg {String}  [newContainer]
	 *
	 * @returns {Object|this}
	 */
	container: method.element({
		enforce: (newValue, oldValue) => dom.getElement(newValue, true) || oldValue,
		other: null,
		before: function(container) {
			if (container && this[ELEMENT] && container.contains(this[ELEMENT])) {
				container.removeChild(this[ELEMENT]);
			}
		},
		set: function(container) {
			if (container && this[ELEMENT]) {
				if (this[APPEND]) {
					if (isElement(this[APPEND])) {
						container.insertBefore(this[ELEMENT], this[APPEND].nextSibling);
					}
					else {
						container.appendChild(this[ELEMENT]);
					}
					delete this[APPEND];
				}
				else if (this[PREPEND]) {
					if (isElement(this[PREPEND])) {
						container.insertBefore(this[ELEMENT], this[PREPEND]);
					}
					else {
						container.insertBefore(this[ELEMENT], container.firstChild);
					}
					delete this[PREPEND];
				}
				else {
					container.appendChild(this[ELEMENT]);
				}
			}
		}
	}),

	/**
	 * The main DOM element for this control
	 *
	 * @method element
	 * @member Element
	 * @instance
	 *
	 * @returns {Object|this}
	 */
	element: method.element({
		before: function() {
			dom.remove(this[ELEMENT]);
			this[ELEMENT] = null;
		},
		set: function(element) {
			if (element) {
				this[ELEMENT] = element;
			}
		}
	}),

	/**
	 * Get or set an attribute of the main element of this control
	 *
	 * @method attr
	 * @member Element
	 * @instance
	 *
	 * @arg {String} attribute - The attribute to get or set
	 * @arg {String} [value]  - If provided then set this as the value of the property, if not provided then return
	 *    the attribute's value.
	 */
	attr: method.keyValue({
		set: function(attribute, value) {
			if (this[ELEMENT]) {
				this[ELEMENT].setAttribute(attribute, value);
			}
		},
		get: function(attribute) {
			return this[ELEMENT].getAttribute(attribute);
		}
	})
});
