import { event, select } from 'd3';
import { clone } from 'object-agent';
import {
	castArray,
	CssSize,
	enforceBoolean,
	isElement,
	isString,
	method,
	PIXELS,
	PrivateVars,
	Thickness
} from 'type-enforcer';
import replaceElement from '../utility/dom/replaceElement';
import {
	BORDER_BOX,
	BOTTOM,
	CLICK_EVENT,
	DOCUMENT,
	HEIGHT,
	LEFT,
	LINE_HEIGHT,
	MARGIN,
	MARGIN_BOTTOM,
	MARGIN_LEFT,
	MARGIN_RIGHT,
	MARGIN_TOP,
	MAX_HEIGHT,
	MAX_WIDTH,
	MIN_HEIGHT,
	MIN_WIDTH,
	PADDING,
	PADDING_BOTTOM,
	PADDING_LEFT,
	PADDING_RIGHT,
	PADDING_TOP,
	RIGHT,
	SPACE,
	TOP,
	WIDTH,
	WINDOW
} from '../utility/domConstants';
import windowResize from '../utility/windowResize';
import './Control.less';
import ControlManager from './ControlManager';
import Removable from './mixins/Removable';

const _ = new PrivateVars();

export const CONTROL_PROP = Symbol();
export const CHILD_CONTROLS = Symbol();

const DISABLED_CLASS = 'disabled';
const HIDDEN_CLASS = 'hidden';
const NOT_DISPLAYED_CLASS = 'display-none';
const STOP_PROPAGATION_EVENT_SUFFIX = '.stopPropagation';

const cssPropertiesToParseAsInt = [
	MIN_HEIGHT,
	HEIGHT,
	MAX_HEIGHT,
	MIN_WIDTH,
	WIDTH,
	MAX_WIDTH,
	TOP,
	RIGHT,
	BOTTOM,
	LEFT,
	LINE_HEIGHT,
	MARGIN,
	MARGIN_TOP,
	MARGIN_RIGHT,
	MARGIN_BOTTOM,
	MARGIN_LEFT,
	PADDING,
	PADDING_TOP,
	PADDING_RIGHT,
	PADDING_BOTTOM,
	PADDING_LEFT
];
const cssSizeMethods = [
	'padding',
	'margin',
	'minWidth',
	'width',
	'maxWidth',
	'minHeight',
	'height',
	'maxHeight'
];

const propagationClickEvent = () => {
	event.stopPropagation();
};

const parseElementStyle = (styles, styleName) => parseFloat(styles.getPropertyValue(styleName)) || 0;
const parseStyle = (element, styleName) => parseElementStyle(getComputedStyle(element), styleName);

const removeElement = (element) => {
	if (element.__on) {
		clone(castArray(element.__on)).forEach((event) => {
			if (event) {
				let name = event.type;
				if (event.name) {
					name += '.' + event.name;
				}
				select(element).on(name, null);
			}
		});
	}

	if (element.remove) {
		element.remove();
	}
	else if (element.parentNode) {
		element.parentNode.removeChild(element);
	}
};

const updateElementId = Symbol();
const setPropagationClickEvent = Symbol();
const setCssSizeElement = Symbol();
const resizeContainer = Symbol();

/**
 * The base class for a control
 *
 * @class Control
 * @extends Removable
 * @constructor
 *
 * @arg {Object} settings - An object where keys are methods and values are arguments.
 */
export default class Control extends Removable {
	constructor(settings = {}) {
		super();

		const self = this;
		self[CHILD_CONTROLS] = new ControlManager();

		_.set(self, {
			type: settings.type,
			append: settings.append,
			prepend: settings.prepend,
			appendAt: settings.appendAt
		});

		delete settings.type;
		delete settings.append;
		delete settings.prepend;
		delete settings.appendAt;

		self.element(settings.element || 'div');
		delete settings.element;
		self.id(settings.id);
		delete settings.id;
		self.container(settings.container);
		delete settings.container;

		self.onRemove(() => {
			self[CHILD_CONTROLS].remove();
			self.container(null);
			removeElement(self.element());
		});
	}

	/**
	 * Update the elements id attribute with the current id and idSuffix.
	 * @function updateElementId
	 */
	[updateElementId]() {
		const self = this;

		self.attr('id', self.id() ? `${self.id()}${self.idSuffix()}`.replace(/[^A-Za-z0-9_:\.-]/g, '') : null);
	}

	/**
	 * Set a click event that stops propagation.
	 * @function setPropagationClickEvent
	 */
	[setPropagationClickEvent]() {
		const self = this;

		self.set(
			CLICK_EVENT + STOP_PROPAGATION_EVENT_SUFFIX,
			propagationClickEvent,
			(self.stopPropagation() && self.isEnabled())
		);
	}

	[setCssSizeElement](value) {
		cssSizeMethods.forEach((method) => this[method]().element(value));
	}

	[resizeContainer]() {
		const self = this;

		if (self.container() && self.container()[CONTROL_PROP]) {
			self.container()[CONTROL_PROP].resize(true);
		}
	}

	/**
	 * The "type" of control.
	 *
	 * @method type
	 * @member module:Control
	 * @instance
	 *
	 * @arg {String} [type]
	 *
	 * @returns {String|this}
	 */
	get type() {
		return _(this).type;
	}

	get paddingWidth() {
		const styles = getComputedStyle(_(this).element);
		return parseElementStyle(styles, PADDING_LEFT) + parseElementStyle(styles, PADDING_RIGHT);
	}

	get paddingHeight() {
		const styles = getComputedStyle(_(this).element);
		return parseElementStyle(styles, PADDING_TOP) + parseElementStyle(styles, PADDING_BOTTOM);
	}

	get marginWidth() {
		const styles = getComputedStyle(_(this).element);
		return parseElementStyle(styles, MARGIN_LEFT) + parseElementStyle(styles, MARGIN_RIGHT);
	}

	get marginHeight() {
		const styles = getComputedStyle(_(this).element);
		return parseElementStyle(styles, MARGIN_TOP) + parseElementStyle(styles, MARGIN_BOTTOM);
	}
}

Object.assign(Control.prototype, {
	/**
	 * Set the containing DOM element and append element to it.
	 *
	 * @method container
	 * @member module:Control
	 * @instance
	 *
	 * @arg {String}  [newContainer]
	 *
	 * @returns {Object|this}
	 */
	container: method.element({
		enforce(newValue, oldValue) {
			if (!newValue) {
				return oldValue;
			}

			if (isElement(newValue) || newValue === WINDOW) {
				return newValue;
			}
			if (newValue.contentContainer) {
				return newValue.contentContainer.element();
			}
			if (newValue.element) {
				return newValue.element();
			}
			if (isString(newValue)) {
				return DOCUMENT.querySelector(newValue);
			}

			return oldValue;
		},
		other: null,
		before(container) {
			const self = this;
			const _self = _(self);

			if (container && container.contains(_self.element)) {
				container.removeChild(_self.element);
				if (container[CONTROL_PROP]) {
					container[CONTROL_PROP][CHILD_CONTROLS].discard(self);
				}
			}

			if (_self.windowResizeId) {
				windowResize.discard(_self.windowResizeId);
				_self.windowResizeId = null;
			}
		},
		set(container) {
			const self = this;
			const _self = _(self);

			if (container) {
				if (_self.append) {
					if (isElement(_self.append)) {
						container.insertBefore(_self.element, _self.append.nextSibling);
					}
					else {
						container.appendChild(_self.element);
					}
					delete _self.append;
				}
				else if (_self.prepend) {
					if (isElement(_self.prepend)) {
						container.insertBefore(_self.element, _self.prepend);
					}
					else {
						container.insertBefore(_self.element, container.firstChild);
					}
					delete _self.prepend;
				}
				else if (_self.appendAt !== undefined) {
					container.insertBefore(_self.element, container.children[_self.appendAt]);

					delete _self.appendAt;
				}
				else {
					container.appendChild(_self.element);
				}

				if (container[CONTROL_PROP]) {
					container[CONTROL_PROP][CHILD_CONTROLS].add(self);
				}
				else {
					_self.windowResizeId = windowResize.add(() => {
						self.resize(true);
					}, self.type);
				}
			}
		}
	}),

	/**
	 * The main DOM element for this control
	 *
	 * @method element
	 * @member module:Control
	 * @instance
	 *
	 * @returns {Object|this}
	 */
	element: method.element({
		enforce(newValue, oldValue) {
			if (newValue) {
				if (isElement(newValue)) {
					return newValue;
				}
				if (isString(newValue)) {
					const index = newValue.indexOf(':');

					if (index !== -1) {
						return DOCUMENT.createElementNS(`http://www.w3.org/2000/${newValue.substr(0, index)}`, newValue.substr(index + 1));
					}
					else {
						return DOCUMENT.createElement(newValue);
					}
				}
			}

			return oldValue;
		},
		before(element) {
			const self = this;
			const _self = _(self);

			_self.oldElement = element;

			self[setCssSizeElement](null);

			_self.element = null;
			_self.elementD3 = null;
		},
		set(newElement) {
			const self = this;
			const _self = _(self);

			_self.element = newElement;
			_self.elementD3 = select(newElement);
			_self.element[CONTROL_PROP] = self;

			if (_self.oldElement) {
				replaceElement(_self.oldElement, newElement);
			}

			self[setCssSizeElement](_self.element);
			self[setPropagationClickEvent]();

			if (_self.oldElement) {
				_self.oldElement[CONTROL_PROP] = null;
				removeElement(_self.oldElement);
				_self.oldElement = null;
			}
		}
	}),

	elementD3() {
		return _(this).elementD3;
	},

	/**
	 * Set the id attribute.
	 *
	 * @method id
	 * @member module:Control
	 * @instance
	 *
	 * @arg {String} [newId] - A unique id
	 *
	 * @returns {String|this}
	 */
	id: method.string({
		set(id) {
			const self = this;

			self[updateElementId]();

			if (id && self.container() && self.container()[CONTROL_PROP]) {
				self.container()[CONTROL_PROP][CHILD_CONTROLS].update(self);
			}
		},
		coerce: true
	}),

	/**
	 * A string to append to the end of the id.
	 *
	 * @method idSuffix
	 * @member module:Control
	 * @instance
	 *
	 * @arg {String} [newIdSuffix]
	 *
	 * @returns {String|this}
	 */
	idSuffix: method.string({
		set() {
			this[updateElementId]();
		}
	}),

	/**
	 * Get or set an attribute of the main element of this control
	 *
	 * @method attr
	 * @member module:Control
	 * @instance
	 *
	 * @arg {String} attribute - The attribute to get or set
	 * @arg {String} [value]  - If provided then set this as the value of the property, if not provided then return
	 *    the attribute's value.
	 */
	attr: method.keyValue({
		set(attribute, value) {
			_(this).element.setAttribute(attribute, value);
		},
		get(attribute) {
			return _(this).element.getAttribute(attribute);
		}
	}),

	/**
	 * Get or set a css style property on the main element of this control
	 *
	 * @method css
	 * @member module:Control
	 * @instance
	 *
	 * @arg {String} property - The style property to get or set
	 * @arg {String} [value]  - If provided then set this as the value of the property, if not provided then return
	 *    the computed style.
	 */
	css: method.keyValue({
		set(property, value) {
			if (!isNaN(value) && cssPropertiesToParseAsInt.includes(property)) {
				value += PIXELS;
			}

			_(this).element.style[property] = value;
		},
		get(property) {
			return _(this).element.style[property];
		}
	}),

	/**
	 * Set classes on the main element
	 *
	 * @method addClass
	 * @member module:Control
	 * @instance
	 *
	 * @arg {String} [className] - A space separated list of css classes
	 *
	 * @returns {this}
	 */
	addClass(className) {
		this.classes(className, true);
		return this;
	},

	/**
	 * Remove classes from the main element
	 *
	 * @method removeClass
	 * @member module:Control
	 * @instance
	 *
	 * @arg {String} [className] - A space separated list of css classes
	 *
	 * @returns {this}
	 */
	removeClass(className) {
		this.classes(className, false);
		return this;
	},

	/**
	 * Add or remove classes from the main element
	 *
	 * @method removeClass
	 * @member module:Control
	 * @instance
	 *
	 * @arg {String}  [classes]    - A space separated list of css classes
	 * @arg {Boolean} [performAdd] - If true then add the classes, if false then remove the classes
	 *
	 * @returns {this}
	 */
	classes(classes, performAdd) {
		const _self = _(this);

		if (arguments.length) {
			if (isString(classes)) {
				classes = classes.trim();

				if (classes) {
					const action = enforceBoolean(performAdd, true) ? 'add' : 'remove';

					classes.split(SPACE).forEach((name) => {
						_self.element.classList[action](name);
					});
				}
			}

			return this;
		}

		return _self.element.classList.value;
	},

	/**
	 * Get or set the padding of the main element.
	 *
	 * @method padding
	 * @member module:Control
	 * @instance
	 *
	 * @arg {String} [newPadding]
	 *
	 * @returns {String|this}
	 */
	padding: method.thickness({
		init: new Thickness('initial'),
		set(newValue) {
			this.css(PADDING, newValue.toString());
		}
	}),

	/**
	 * Get or set the margin of the main element.
	 *
	 * @method margin
	 * @member module:Control
	 * @instance
	 *
	 * @arg {String} [newMargin]
	 *
	 * @returns {String|this}
	 */
	margin: method.thickness({
		init: new Thickness('initial'),
		set(newValue) {
			this.css(MARGIN, newValue.toString());
		}
	}),

	/**
	 * Get or set the minWidth of the main element (NOT including padding and borders).
	 *
	 * @method minWidth
	 * @member module:Control
	 * @instance
	 *
	 * @arg {String|CssSize} [minWidth] - Must be a string that parses as valid css.
	 *
	 * @returns {CssSize|this}
	 */
	minWidth: method.cssSize({
		init: new CssSize(),
		set(newValue) {
			this.css(MIN_WIDTH, newValue.toPixels());
		}
	}),

	/**
	 * Get or set the width of the main element (NOT including padding and borders).
	 *
	 * @method width
	 * @member module:Control
	 * @instance
	 *
	 * @arg {String|CssSize} [width] - Must be a string that parses as valid css.
	 *
	 * @returns {CssSize|this}
	 */
	width: method.cssSize({
		init: new CssSize(),
		set(width) {
			this.css(WIDTH, width.toPixels());
		}
	}),

	borderWidth() {
		return _(this).element.offsetWidth;
	},

	innerWidth() {
		return parseStyle(_(this).element, 'width');
	},

	outerWidth() {
		return this.borderWidth() + this.marginWidth;
	},

	/**
	 * Get or set the maxWidth of the main element (NOT including padding and borders).
	 *
	 * @method maxWidth
	 * @member module:Control
	 * @instance
	 *
	 * @arg {String|CssSize} [maxWidth] - Must be a string that parses as valid css.
	 *
	 * @returns {CssSize|this}
	 */
	maxWidth: method.cssSize({
		init: new CssSize(),
		set(newValue) {
			this.css(MAX_WIDTH, newValue.toPixels());
		}
	}),

	/**
	 * Get or set the minHeight of the main element (NOT including padding and borders).
	 *
	 * @method minHeight
	 * @member module:Control
	 * @instance
	 *
	 * @arg {String|CssSize} [newMinHeight] - Must be a string that parses as valid css.
	 *
	 * @returns {CssSize|this}
	 */
	minHeight: method.cssSize({
		init: new CssSize(),
		set(newValue) {
			this.css(MIN_HEIGHT, newValue.toPixels());
		}
	}),

	/**
	 * The height of the main element (NOT including padding and borders).
	 *
	 * @method height
	 * @member module:Control
	 * @instance
	 *
	 * @arg {String|CssSize} [newHeight] - Must be a string that parses as valid css.
	 *
	 * @returns {CssSize|this}
	 */
	height: method.cssSize({
		init: new CssSize(),
		set(height) {
			this.css(HEIGHT, height.toPixels());
		}
	}),

	borderHeight() {
		return _(this).element.offsetHeight;
	},

	innerHeight() {
		return parseStyle(_(this).element, 'height');
	},

	outerHeight() {
		return this.borderHeight() + this.marginHeight;
	},

	/**
	 * Get or set the maxHeight of the main element (NOT including padding and borders).
	 *
	 * @method maxHeight
	 * @member module:Control
	 * @instance
	 *
	 * @arg {String|CssSize} [newMaxHeight] - Must be a string that parses as valid css.
	 *
	 * @returns {CssSize|this}
	 */
	maxHeight: method.cssSize({
		init: new CssSize(),
		set(maxHeight) {
			this.css(MAX_HEIGHT, maxHeight.toPixels());
		}
	}),

	/**
	 * Changes the view of the control to look disabled and prevents mouse and keyboard interaction
	 *
	 * @method isEnabled
	 * @member module:Control
	 * @instance
	 *
	 * @arg   {Boolean} [input=true] - If a value is provided then set, otherwise get the current state.
	 *
	 * @returns {Boolean|this} - Only returned if no value is provided
	 */
	isEnabled: method.boolean({
		init: true,
		set(isEnabled) {
			const self = this;

			self.classes(DISABLED_CLASS, !isEnabled);

			if (_(self).element && !isEnabled && self.isFocused) {
				self.isFocused(false);
			}

			self[setPropagationClickEvent]();
		}
	}),

	/**
	 * @method stopPropagation
	 * @member module:Control
	 * @instance
	 *
	 * @arg {Boolean} [newStopPropagation]
	 *
	 * @returns {Boolean|this}
	 */
	stopPropagation: method.boolean({
		set() {
			this[setPropagationClickEvent]();
		}
	}),

	/**
	 * Hides the control when true
	 *
	 * @method isVisisble
	 * @member module:Control
	 * @instance
	 *
	 * @arg   {Boolean} [input=true] - If a value is provided then set, otherwise get the current state.
	 *
	 * @returns {Boolean|this} - Only returned if no value is provided
	 */
	isVisible: method.boolean({
		init: true,
		set(isVisible) {
			const self = this;

			self.classes(HIDDEN_CLASS, !isVisible);

			if (!isVisible) {
				if (self.isFocused) {
					self.isFocused(false);
				}
			}
			else {
				self[resizeContainer]();
			}
		}
	}),

	/**
	 * Hides the control when true
	 *
	 * @method isDisplayed
	 * @member module:Control
	 * @instance
	 *
	 * @arg   {Boolean} [input=true] - If a value is provided then set, otherwise get the current state.
	 *
	 * @returns {Boolean|this} - Only returned if no value is provided
	 */
	isDisplayed: method.boolean({
		init: true,
		set(isDisplayed) {
			const self = this;

			self.classes(NOT_DISPLAYED_CLASS, !isDisplayed);

			if (!isDisplayed) {
				if (self.isFocused) {
					self.isFocused(false);
				}
			}
			else {
				self[resizeContainer]();
			}
		}
	}),

	/**
	 * Set an event listener
	 *
	 * @method on
	 * @member module:Control
	 * @instance
	 *
	 * @arg {String} eventName
	 * @arg {Function} handler
	 *
	 * @returns {this}
	 */
	on: method.keyValue({
		set(eventName, handler) {
			_(this).elementD3.on(eventName, handler);
		}
	}),

	/**
	 * Remove an event listener.
	 *
	 * @method off
	 * @member module:Control
	 * @instance
	 *
	 * @arg {String} eventName
	 *
	 * @returns {this}
	 */
	off(eventName) {
		return this.on(eventName, null);
	},

	/**
	 * Add or Remove an event listener.
	 *
	 * @method set
	 * @member module:Control
	 * @instance
	 *
	 * @arg {String} eventName
	 * @arg {Function} [handler] - if provided, then the event will only be removed if this handler matches the one
	 *    provided in the "on" method.
	 * @arg {boolean} [performAdd=true] - true adds a listener, false removes it.
	 *
	 * @returns {this}
	 */
	set(eventName, handler, performAdd) {
		return this.on(eventName, performAdd ? handler : null);
	},

	/**
	 * The focused state of this control.
	 *
	 * @method isFocused
	 * @member module:Control
	 * @instance
	 *
	 * @arg {Boolean} [isFocused]
	 *
	 * @returns {boolean|this}
	 */
	isFocused(isFocused) {
		const self = this;
		const element = _(self).element;

		if (isFocused !== undefined) {
			if (element) {
				if (isFocused) {
					element.focus();
				}
				else if (self.isFocused()) {
					DOCUMENT.activeElement.blur();
				}
			}

			return self;
		}

		return element ? (element === DOCUMENT.activeElement || element
			.contains(DOCUMENT.activeElement)) : false;
	},

	/**
	 * Adds a callback to the onResize method
	 *
	 * @method onResize
	 * @member module:Control
	 * @instance
	 *
	 * @arg {Function} callback
	 * @arg {Boolean} callImmediately - if true then execute the callback immediately
	 *
	 * @returns {queue}
	 */
	onResize: method.queue(),

	/**
	 * Trigger a resize on this control. This method is throttled by default
	 *
	 * @method resize
	 * @member module:Control
	 * @instance
	 *
	 * @arg {boolean} [isForced=false] - if true a resize will happen immediately
	 */
	resize(isForced) {
		const self = this;
		const _self = _(self);
		const element = _self.element;

		if (!self.isRemoved && !_self.isResizing) {
			_self.isResizing = true;

			const newWidth = self.borderWidth();
			let newHeight = self.borderHeight();

			if (self.height().isPercent && self.container()) {
				let calculatedHeight = parseStyle(self.container(), 'height') * (self.height().value / 100);

				calculatedHeight -= self.marginHeight;
				if (getComputedStyle(element).boxSizing !== BORDER_BOX) {
					calculatedHeight -= self.paddingHeight;
				}

				if (_self.currentHeight !== calculatedHeight) {
					newHeight = calculatedHeight;
					element.style.height = calculatedHeight + PIXELS;
					isForced = true;
				}
			}

			if (isForced || _self.currentWidth !== newWidth || _self.currentHeight !== newHeight) {
				_self.currentWidth = newWidth;
				_self.currentHeight = newHeight;

				self.onResize().trigger(null, [newWidth, newHeight]);

				self[CHILD_CONTROLS].each((control) => {
					control.resize();
				});
			}

			_self.isResizing = false;
		}

		return self;
	}
});
