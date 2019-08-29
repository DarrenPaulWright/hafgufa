import { throttle } from 'async-agent';
import { event, select } from 'd3';
import { CssSize, enforce, isElement, isString, method, PIXELS, Thickness } from 'type-enforcer';
import dom from '../utility/dom';
import replaceElement from '../utility/dom/replaceElement';
import {
	BORDER_BOX,
	BOTTOM,
	CLICK_EVENT,
	DOCUMENT,
	EMPTY_STRING,
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
import Removable from './mixins/Removable';

export const ELEMENT_PROP = Symbol();

const APPEND = Symbol();
const PREPEND = Symbol();
const ELEMENT = Symbol();
const ELEMENT_D3 = Symbol();
const WINDOW_RESIZE_ID = Symbol();
const CURRENT_HEIGHT = Symbol();
const CURRENT_WIDTH = Symbol();
const CURRENT_CLASSES = Symbol();
const OLD_ELEMENT = Symbol();
const THROTTLED_RESIZE = Symbol();
const FORCE_RESIZE = Symbol();

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

const propagationClickEvent = () => {
	event.stopPropagation();
};

/**
 * Set a click event that stops propagation.
 * @function setPropagationClickEvent
 */
const setPropagationClickEvent = function() {
	const self = this;

	self.set(
		CLICK_EVENT + STOP_PROPAGATION_EVENT_SUFFIX,
		propagationClickEvent,
		(self.stopPropagation() && self.isEnabled())
	);
};

/**
 * Update the elements id attribute with the current ID and IDSuffix.
 * @function updateElementID
 */
const updateElementID = function() {
	const self = this;
	self.attr('id', self.ID() ? (self.ID() + (self.IDSuffix() || '')) : null);
};

const setResizeEvent = function() {
	const self = this;

	if (!self.skipWindowResize()) {
		self[WINDOW_RESIZE_ID] = windowResize.add((windowWidth, windowHeight) => {
			if (!self.isRemoved) {
				let containerHeight;

				if (self.container() && self.height().isPercent) {
					containerHeight = dom.get.height(self.container()) * (self.height().value / 100);
					containerHeight -= dom.get.paddings.height(self.container());
					containerHeight -= dom.get.margins.height(self[ELEMENT]);
					if (WINDOW.getComputedStyle(this[ELEMENT]).boxSizing !== BORDER_BOX) {
						containerHeight -= dom.get.paddings.height(self[ELEMENT]);
					}
					self.css(HEIGHT, Math.floor(containerHeight));
				}

				const newWidth = self.borderWidth();
				const newHeight = self.borderHeight();

				if (self[FORCE_RESIZE] || self[CURRENT_WIDTH] !== newWidth || self[CURRENT_HEIGHT] !== newHeight) {
					self[FORCE_RESIZE] = false;
					self[CURRENT_WIDTH] = newWidth;
					self[CURRENT_HEIGHT] = newHeight;

					self.onResize().trigger(null, [windowWidth, windowHeight, self], self);
				}
			}
		}, self[ELEMENT], self.type());
	}
	else if (self[WINDOW_RESIZE_ID]) {
		windowResize.discard(self[WINDOW_RESIZE_ID]);
		self[WINDOW_RESIZE_ID] = null;
	}
};

const setCssSizeElement = function(value) {
	this.padding().element(value);
	this.margin().element(value);
	this.minWidth().element(value);
	this.width().element(value);
	this.maxWidth().element(value);
	this.minHeight().element(value);
	this.height().element(value);
	this.maxHeight().element(value);
};

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
		self.skipWindowResize(settings.skipWindowResize);
		delete settings.skipWindowResize;

		setResizeEvent.call(self);

		self.onRemove(() => {
			if (self[WINDOW_RESIZE_ID]) {
				windowResize.discard(self[WINDOW_RESIZE_ID]);
			}

			self.element(null);
		});
	}
}

Object.assign(Control.prototype, {

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
	type: method.string(),

	/**
	 * Set the id attribute.
	 *
	 * @method ID
	 * @member module:Control
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
	 * @member module:Control
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
	 * @member module:Control
	 * @instance
	 *
	 * @arg {String}  [newContainer]
	 *
	 * @returns {Object|this}
	 */
	container: method.element({
		enforce(newValue, oldValue) {
			return dom.getElement(newValue, true) || oldValue;
		},
		other: null,
		before(container) {
			if (container && this[ELEMENT] && container.contains(this[ELEMENT])) {
				container.removeChild(this[ELEMENT]);
			}
		},
		set(container) {
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
	 * @member module:Control
	 * @instance
	 *
	 * @returns {Object|this}
	 */
	element: method.element({
		enforce(newValue, oldValue) {
			return dom.getElement(newValue) || oldValue;
		},
		before(element) {
			if (element) {
				this[OLD_ELEMENT] = element;

				setCssSizeElement.call(this, null);

				this[ELEMENT] = null;
				this[ELEMENT_D3] = null;
			}
		},
		set(newElement) {
			if (newElement) {
				this[ELEMENT] = newElement;
				this[ELEMENT_D3] = select(this[ELEMENT]);

				this[ELEMENT][ELEMENT_PROP] = this;

				if (this[OLD_ELEMENT]) {
					replaceElement(this[OLD_ELEMENT], newElement);
				}

				setCssSizeElement.call(this, this[ELEMENT]);

				setPropagationClickEvent.call(this);
			}

			if (this[OLD_ELEMENT]) {
				this[OLD_ELEMENT][ELEMENT_PROP] = null;
				dom.remove(this[OLD_ELEMENT]);
				this[OLD_ELEMENT] = null;
			}
		},
		other: [String, null]
	}),

	elementD3() {
		return this[ELEMENT_D3];
	},

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
			if (this[ELEMENT]) {
				this[ELEMENT].setAttribute(attribute, value);
			}
		},
		get(attribute) {
			return this[ELEMENT].getAttribute(attribute);
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
			if (this[ELEMENT]) {
				if (!isNaN(value) && cssPropertiesToParseAsInt.includes(property)) {
					value = value + PIXELS;
				}

				this[ELEMENT].style[property] = value;
			}
		},
		get(property) {
			return this[ELEMENT].style[property];
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
		if (this[ELEMENT] && isString(className) && className !== EMPTY_STRING) {
			let classArray = className.trim().split(SPACE);

			for (let index = 0; index < classArray.length; index++) {
				if (this[ELEMENT].classList) {
					this[ELEMENT].classList.add(classArray[index]);
				}
				else {
					if (this[ELEMENT].className.baseVal) {
						this[ELEMENT].className.baseVal += SPACE + classArray[index];
					}
					else {
						this[ELEMENT].className += SPACE + classArray[index];
					}
				}
			}
		}

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
		const BASE_PREFIX = '(^|\\b)';
		const BASE_SUFFIX = '(\\b|$)';
		const FLAGS = 'gi';
		let classArray;

		if (this[ELEMENT] && isString(className) && className !== EMPTY_STRING) {
			classArray = className.trim().split(SPACE);

			for (let index = 0; index < classArray.length; index++) {
				if (this[ELEMENT].classList) {
					this[ELEMENT].classList.remove(classArray[index]);
				}
				else {
					if (this[ELEMENT].className.baseVal !== undefined) {
						this[ELEMENT].className.baseVal = this[ELEMENT].className.baseVal.replace(new RegExp(BASE_PREFIX + classArray[index].split(SPACE)
							.join('|') + BASE_SUFFIX, FLAGS), SPACE);
					}
					else {
						this[ELEMENT].className = this[ELEMENT].className.replace(new RegExp(BASE_PREFIX + classArray[index].split(SPACE)
							.join('|') + BASE_SUFFIX, FLAGS), SPACE);
					}
				}
			}
		}

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
		if (arguments.length) {
			if (this[ELEMENT]) {
				if (enforce.boolean(performAdd, true)) {
					this.addClass(classes);
				}
				else {
					this.removeClass(classes);
				}

				this[CURRENT_CLASSES] = this[ELEMENT].classList ? this[ELEMENT].classList.value : this[ELEMENT].className.baseVal || this[ELEMENT].className;
			}
			else if (!this[CURRENT_CLASSES]) {
				this[CURRENT_CLASSES] = classes;
			}

			return this;
		}

		return this[CURRENT_CLASSES];
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
		if (this[ELEMENT]) {
			if (this[ELEMENT] instanceof SVGElement) {
				return this[ELEMENT].getBBox().width;
			}
			else {
				return this[ELEMENT].offsetWidth;
			}
		}

		return 0;
	},

	innerWidth() {
		if (this[ELEMENT]) {
			return (this[ELEMENT].clientWidth || 0) - dom.get.paddings.width(this[ELEMENT]);
		}

		return 0;
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
		if (this[ELEMENT]) {
			if (this[ELEMENT] instanceof SVGElement) {
				return this[ELEMENT].getBBox().height;
			}
			else {
				return this[ELEMENT].offsetHeight;
			}
		}

		return 0;
	},

	innerHeight() {
		if (this[ELEMENT]) {
			return (this[ELEMENT].clientHeight || 0) - dom.get.paddings.height(this[ELEMENT]);
		}

		return 0;
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
			this.classes(DISABLED_CLASS, !isEnabled);

			if (this[ELEMENT] && !isEnabled && this.isFocused) {
				this.isFocused(false);
			}

			setPropagationClickEvent.call(this);
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
		set: setPropagationClickEvent
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
			this.classes(HIDDEN_CLASS, !isVisible);

			if (!isVisible) {
				if (this.isFocused) {
					this.isFocused(false);
				}
			}
			else {
				this.resize();
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
			this.classes(NOT_DISPLAYED_CLASS, !isDisplayed);

			if (!isDisplayed) {
				if (this.isFocused) {
					this.isFocused(false);
				}
			}
			else {
				this.resize();
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
			if (this[ELEMENT_D3]) {
				this[ELEMENT_D3].on(eventName, handler);
			}
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

		if (isFocused !== undefined) {
			if (self[ELEMENT]) {
				if (isFocused) {
					self[ELEMENT].focus();
				}
				else if (self.isFocused()) {
					DOCUMENT.activeElement.blur();
				}
			}

			return self;
		}

		return self[ELEMENT] ? (self[ELEMENT] === DOCUMENT.activeElement || self[ELEMENT].contains(DOCUMENT.activeElement)) : false;
	},

	/**
	 * Get or Set whether or not this control should trigger the window resize event
	 *
	 * @method skipWindowResize
	 * @member module:Control
	 * @instance
	 *
	 * @arg {Boolean} newSkipWindowResize
	 *
	 * @returns {Boolean}
	 */
	skipWindowResize: method.boolean({
		set: setResizeEvent
	}),

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

		self[FORCE_RESIZE] = self[FORCE_RESIZE] || isForced;

		if (isForced) {
			if (!self.isRemoved) {
				if (!self.skipWindowResize()) {
					windowResize.trigger(self[WINDOW_RESIZE_ID]);
				}
				else {
					self.onResize().trigger(null, null, this);
				}
			}
		}
		else {
			self[THROTTLED_RESIZE]();
		}

		return self;
	}
});
