import { throttle } from 'async-agent';
import { event, select } from 'd3';
import { CssSize, enforce, isString, method, PIXELS, Thickness } from 'type-enforcer';
import dom from '../utility/dom';
import {
	BORDER_BOX,
	BOTTOM,
	BOX_SIZING,
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
	WIDTH
} from '../utility/domConstants';
import windowResize from '../utility/windowResize';
import './Control.less';
import Removable from './mixins/Removable';

const ELEMENT = Symbol();
const ELEMENT_D3 = Symbol();
const WINDOW_RESIZE_ID = Symbol();
const CURRENT_CLASSES = Symbol();
const MIGRATION = Symbol();
const THROTTLED_RESIZE = Symbol();

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
					containerHeight = dom.get.height(self.container()) * (self.parsedHeight / 100);
					containerHeight -= dom.get.margins.height(this[ELEMENT]);
					if (self.css(BOX_SIZING) !== BORDER_BOX) {
						containerHeight -= dom.get.paddings.height(this[ELEMENT]);
					}
					self.css(HEIGHT, containerHeight);
				}

				self.onResize().trigger(null, [windowWidth, windowHeight, self], self);
			}
		}, self[ELEMENT], self.type());
	}
	else if (self[WINDOW_RESIZE_ID]) {
		windowResize.discard(self[WINDOW_RESIZE_ID]);
		self[WINDOW_RESIZE_ID] = null;
	}
};

/**
 * The base class for a control
 *
 * @class Control
 * @extends Removable
 * @constructor
 *
 * @arg {string}        type
 * @arg {Object}        settings - An object where keys are methods and values are arguments.
 */
export default class Control extends Removable {
	constructor(settings = {}) {
		super();
		const self = this;

		this[CURRENT_CLASSES] = '';
		this[MIGRATION] = {};
		this[THROTTLED_RESIZE] = throttle(() => {
			self.resize(true);
		}, 10);

		self.type(settings.type);
		self.element(settings.element || dom.buildNew());
		self.container(settings.container);
		self.skipWindowResize(settings.skipWindowResize);

		setResizeEvent.call(self);

		self.onRemove(() => {
			if (self[WINDOW_RESIZE_ID]) {
				windowResize.discard(self[WINDOW_RESIZE_ID]);
			}

			self.element(null);
			this[MIGRATION] = null;
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
		set: updateElementID
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
		enforce: (newValue, oldValue) => {
			return dom.getElement(newValue, true) || oldValue;
		},
		other: null,
		before: function(container) {
			if (container && this[ELEMENT] && container.contains(this[ELEMENT])) {
				container.removeChild(this[ELEMENT]);
			}
		},
		set: function(container) {
			if (container && this[ELEMENT]) {
				if (this[MIGRATION].nextSibling) {
					dom.appendBefore(this[MIGRATION].nextSibling, this[ELEMENT]);
				}
				else if (this[MIGRATION].previousSibling) {
					dom.appendAfter(this[MIGRATION].previousSibling, this[ELEMENT]);
				}
				else {
					dom.appendTo(container, this[ELEMENT]);
				}

				delete this[MIGRATION].previousSibling;
				delete this[MIGRATION].nextSibling;

				this.resize();
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
		before: function() {
			if (this[ELEMENT]) {
				if (this[ELEMENT].nextSibling) {
					this[MIGRATION].nextSibling = this[ELEMENT].nextSibling;
				}
				else if (this[ELEMENT].previousSibling) {
					this[MIGRATION].previousSibling = this[ELEMENT].previousSibling;
				}
				if (this[ELEMENT].childNodes.length) {
					this[MIGRATION].previousContent = this[ELEMENT].childNodes;
				}

				this[MIGRATION].prevAttrs = this[ELEMENT_D3].property('attributes');
				this[MIGRATION].prevEvents = dom.getD3Events(this[ELEMENT]);
				dom.applyD3Events(this[ELEMENT], this[MIGRATION].prevEvents, true);

				this.padding().element(null);
				this.margin().element(null);
				this.minWidth().element(null);
				this.width().element(null);
				this.maxWidth().element(null);
				this.minHeight().element(null);
				this.height().element(null);
				this.maxHeight().element(null);

				dom.remove(this[ELEMENT]);
				this[ELEMENT] = null;
				this[ELEMENT_D3] = null;
			}
		},
		set: function(newValue) {
			if (newValue) {
				const newElement = dom.getElement(newValue);

				if (newElement !== newValue) {
					this.element(newElement);
				}
				else {
					this[ELEMENT] = newValue;
					this[ELEMENT_D3] = select(this[ELEMENT]);

					if (this[MIGRATION].previousContent) {
						while (this[MIGRATION].previousContent.length) {
							if (this[MIGRATION].previousContent[0] !== this[ELEMENT]) {
								this[ELEMENT].appendChild(this[MIGRATION].previousContent[0]);
							}
							else {
								this[MIGRATION].previousContent[0].parentNode.removeChild(this[MIGRATION].previousContent[0]);
							}
						}
						delete this[MIGRATION].previousContent;
					}

					this.padding().element(this[ELEMENT]);
					this.margin().element(this[ELEMENT]);
					this.minWidth().element(this[ELEMENT]);
					this.width().element(this[ELEMENT]);
					this.maxWidth().element(this[ELEMENT]);
					this.minHeight().element(this[ELEMENT]);
					this.height().element(this[ELEMENT]);
					this.maxHeight().element(this[ELEMENT]);

					if (this[MIGRATION].prevAttrs) {
						this[MIGRATION].prevAttrs.forEach((attr) => {
							this[ELEMENT_D3].attr(attr.name, attr.value);
						});
					}
					delete this[MIGRATION].prevAttrs;

					dom.applyD3Events(this[ELEMENT], this[MIGRATION].prevEvents);
					delete this[MIGRATION].prevEvents;

					this.container(this.container());
					setPropagationClickEvent.call(this);
				}
			}
		},
		other: [String, null]
	}),

	elementD3: function() {
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
		set: function(attribute, value) {
			if (this[ELEMENT]) {
				this[ELEMENT].setAttribute(attribute, value);
			}
		},
		get: function(attribute) {
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
		set: function(property, value) {
			if (!isNaN(value) && cssPropertiesToParseAsInt.includes(property)) {
				value = value + PIXELS;
			}

			this[ELEMENT].style[property] = value;
		},
		get: function(property) {
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
	addClass: function(className) {
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
	removeClass: function(className) {
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
	classes: function(classes, performAdd) {
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
		init: new Thickness(),
		set: function(newValue) {
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
		init: new Thickness(),
		set: function(newValue) {
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
		set: function(newValue) {
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
		set: function(width) {
			this.css(WIDTH, width.toPixels());
			this.resize();
		}
	}),

	borderWidth: function() {
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

	innerWidth: function() {
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
		set: function(newValue) {
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
		set: function(newValue) {
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
		set: function(height) {
			this.css(HEIGHT, height.toPixels());
			this.resize();
		}
	}),

	borderHeight: function() {
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

	innerHeight: function() {
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
		set: function(maxHeight) {
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
		set: function(isEnabled) {
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
		set: function(isVisible) {
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
		set: function(isDisplayed) {
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
		set: function(eventName, handler) {
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
	off: function(eventName) {
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
	set: function(eventName, handler, performAdd) {
		return this.on(eventName, performAdd ? handler : null);
	},

	/**
	 * See if this control has focus.
	 *
	 * @method isFocused
	 * @member module:Control
	 * @instance
	 *
	 * @returns {boolean|this}
	 */
	isFocused: function() {
		return this[ELEMENT] ? (this[ELEMENT] === DOCUMENT.activeElement || this[ELEMENT].contains(DOCUMENT.activeElement)) : false;
	},

	blur: function() {
		if (this.isFocused()) {
			DOCUMENT.activeElement.blur();
		}

		return this;
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
	resize: function(isForced) {
		if (isForced) {
			if (!this.isRemoved) {
				if (!this.skipWindowResize()) {
					windowResize.trigger(this[WINDOW_RESIZE_ID]);
				}
				else {
					this.onResize().trigger(null, null, this);
				}
			}
		}
		else {
			this[THROTTLED_RESIZE]();
		}

		return this;
	}
});
