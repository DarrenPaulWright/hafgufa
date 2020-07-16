import { erase, firstInPath, forOwn, walkPath } from 'object-agent';
import {
	CssSize,
	enforceBoolean,
	isElement,
	isNumber,
	isString,
	methodBoolean,
	methodCssSize,
	methodElement,
	methodKeyValue,
	methodQueue,
	methodString,
	methodThickness,
	PIXELS,
	PrivateVars,
	Thickness,
	windowResize
} from 'type-enforcer-ui';
import './Control.less';
import ControlManager from './ControlManager.js';
import Removable from './mixins/Removable.js';
import getAttributes from './utility/dom/getAttributes.js';
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
} from './utility/domConstants.js';

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
].reduce((result, value) => {
	result[value] = true;

	return result;
}, {});

const propagationClickEvent = (event) => {
	event.stopPropagation();
};

const getElement = (element) => {
	return isElement(element) && element ||
		isString(element) && element.indexOf(':') !== -1 && DOCUMENT.createElementNS(`http://www.w3.org/2000/${element.substr(0, element.indexOf(':'))}`, element.substr(element.indexOf(':') + 1)) ||
		DOCUMENT.createElement(element || 'div');
};

const parseElementStyle = (styles, styleName) => parseFloat(styles.getPropertyValue(styleName)) || 0;
const parseStyle = (element, styleName) => parseElementStyle(getComputedStyle(element), styleName);

const updateElementId = Symbol();
const setPropagationClickEvent = Symbol();
const resizeContainer = Symbol();

/**
 * The base class for a control
 *
 * @class Control
 * @extends Removable
 * @constructor
 *
 * @param {object} settings - An object where keys are methods and values are arguments.
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
			appendAt: settings.appendAt,
			events: {}
		});

		Object.defineProperty(this, 'element', {
			value: getElement(settings.element),
			writable: false
		});
		self.element[CONTROL_PROP] = self;

		self.padding().element(self.element);
		self.margin().element(self.element);
		self.minWidth().element(self.element);
		self.width().element(self.element);
		self.maxWidth().element(self.element);
		self.minHeight().element(self.element);
		self.height().element(self.element);
		self.maxHeight().element(self.element);

		erase(settings, 'type');
		erase(settings, 'append');
		erase(settings, 'prepend');
		erase(settings, 'appendAt');
		erase(settings, 'element');

		if ('id' in settings) {
			self.id(settings.id);
			erase(settings, 'id');
		}

		if ('container' in settings) {
			self.container(settings.container);
			erase(settings, 'container');
		}

		self.onRemove(function() {
			this[CHILD_CONTROLS].remove();

			forOwn(_(this).events, (handler, name) => {
				this.off(name);
			});

			this.container(null);
			this.element.remove();
		});
	}

	/**
	 * Update the elements id attribute with the current id and idSuffix.
	 *
	 * @function updateElementId
	 */
	[updateElementId]() {
		const self = this;

		self.attr('id', self.id() ? `${self.id()}${self.idSuffix()}`.replace(/[^A-Za-z0-9_:\.-]/g, '') : null);
	}

	/**
	 * Set a click event that stops propagation.
	 *
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
	 * @param {string} [type]
	 *
	 * @returns {string|this}
	 */
	get type() {
		return _(this).type;
	}

	get paddingWidth() {
		const styles = getComputedStyle(this.element);
		return parseElementStyle(styles, PADDING_LEFT) + parseElementStyle(styles, PADDING_RIGHT);
	}

	get paddingHeight() {
		const styles = getComputedStyle(this.element);
		return parseElementStyle(styles, PADDING_TOP) + parseElementStyle(styles, PADDING_BOTTOM);
	}

	get marginWidth() {
		const styles = getComputedStyle(this.element);
		return parseElementStyle(styles, MARGIN_LEFT) + parseElementStyle(styles, MARGIN_RIGHT);
	}

	get marginHeight() {
		const styles = getComputedStyle(this.element);
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
	 * @param {string}  [newContainer]
	 *
	 * @returns {object|this}
	 */
	container: methodElement({
		enforce(newValue, oldValue) {
			return (isElement(newValue) || newValue === WINDOW) && newValue ||
				newValue.contentContainer !== undefined && newValue.contentContainer.element ||
				newValue.element !== undefined && newValue.element ||
				isString(newValue) && DOCUMENT.querySelector(newValue) ||
				oldValue;
		},
		other: null,
		before(container) {
			if (container) {
				const self = this;
				const _self = _(self);

				if (container && container.contains(self.element)) {
					container.removeChild(self.element);

					if (container[CONTROL_PROP]) {
						container[CONTROL_PROP][CHILD_CONTROLS].discard(self);
					}
				}

				if (_self.windowResizeId !== undefined) {
					windowResize.discard(_self.windowResizeId);
					_self.windowResizeId = null;
				}
			}
		},
		set(container) {
			if (container) {
				const self = this;
				const _self = _(self);

				if (_self.append !== undefined) {
					if (isElement(_self.append)) {
						container.insertBefore(self.element, _self.append.nextSibling);
					}
					else {
						container.appendChild(self.element);
					}

					erase(_self, 'append');
				}
				else if (_self.prepend !== undefined) {
					container.insertBefore(self.element, isElement(_self.prepend) ? _self.prepend : container.firstChild);

					erase(_self, 'prepend');
				}
				else if (_self.appendAt !== undefined) {
					container.insertBefore(self.element, container.children[_self.appendAt]);

					erase(_self, 'appendAt');
				}
				else {
					container.appendChild(self.element);
				}

				if (container[CONTROL_PROP]) {
					container[CONTROL_PROP][CHILD_CONTROLS].add(self);
				}
				else {
					_self.windowResizeId = windowResize.add(() => {
						self.resize(true);
					});
				}
			}
		}
	}),

	/**
	 * Set the id attribute.
	 *
	 * @method id
	 * @member module:Control
	 * @instance
	 *
	 * @param {string} [newId] - A unique id
	 *
	 * @returns {string|this}
	 */
	id: methodString({
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
	 * @param {string} [newIdSuffix]
	 *
	 * @returns {string|this}
	 */
	idSuffix: methodString({
		set: updateElementId
	}),

	/**
	 * Get or set an attribute of the main element of this control.
	 *
	 * @method attr
	 * @member module:Control
	 * @instance
	 *
	 * @param {string} attribute - The attribute to get or set
	 * @param {string} [value] - If provided then set this as the value of the property, if not provided then return the attribute's value.
	 */
	attr: methodKeyValue({
		set(attribute, value) {
			this.element.setAttribute(attribute, value);
		},
		get(attribute) {
			if (attribute !== undefined) {
				return this.element.getAttribute(attribute);
			}

			return getAttributes(this.element);
		}
	}),

	/**
	 * Get or set a css style property on the main element of this control
	 *
	 * @method css
	 * @member module:Control
	 * @instance
	 *
	 * @param {string} property - The style property to get or set
	 * @param {string} [value] - If provided then set this as the value of the property, if not provided then return
	 *    the computed style.
	 */
	css: methodKeyValue({
		set(property, value) {
			if (cssPropertiesToParseAsInt[property] && isNumber(value, true)) {
				value += PIXELS;
			}

			this.element.style[property] = value;
		},
		get(property) {
			return this.element.style[property];
		}
	}),

	/**
	 * Set classes on the main element
	 *
	 * @method addClass
	 * @member module:Control
	 * @instance
	 *
	 * @param {string} [className] - A space separated list of css classes
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
	 * @param {string} [className] - A space separated list of css classes
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
	 * @param {string}  [classes] - A space separated list of css classes
	 * @param {boolean} [performAdd] - If true then add the classes, if false then remove the classes
	 *
	 * @returns {this}
	 */
	classes(classes, performAdd = true) {
		if (arguments.length) {
			if (isString(classes) && this.isRemoved !== true) {
				performAdd = enforceBoolean(performAdd, true) ? 'add' : 'remove';

				walkPath(classes, (name) => {
					this.element.classList[performAdd](name);
				}, SPACE);
			}

			return this;
		}

		return this.element.classList.value;
	},

	/**
	 * Get or set the padding of the main element.
	 *
	 * @method padding
	 * @member module:Control
	 * @instance
	 *
	 * @param {string} [newPadding]
	 *
	 * @returns {string|this}
	 */
	padding: methodThickness({
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
	 * @param {string} [newMargin]
	 *
	 * @returns {string|this}
	 */
	margin: methodThickness({
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
	 * @param {string|CssSize} [minWidth] - Must be a string that parses as valid css.
	 *
	 * @returns {CssSize|this}
	 */
	minWidth: methodCssSize({
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
	 * @param {string|CssSize} [width] - Must be a string that parses as valid css.
	 *
	 * @returns {CssSize|this}
	 */
	width: methodCssSize({
		init: new CssSize(),
		set(width) {
			this.css(WIDTH, width.toPixels());
		}
	}),

	borderWidth() {
		return this.element.offsetWidth;
	},

	innerWidth() {
		return this.element.offsetWidth - this.paddingWidth;
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
	 * @param {string|CssSize} [maxWidth] - Must be a string that parses as valid css.
	 *
	 * @returns {CssSize|this}
	 */
	maxWidth: methodCssSize({
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
	 * @param {string|CssSize} [newMinHeight] - Must be a string that parses as valid css.
	 *
	 * @returns {CssSize|this}
	 */
	minHeight: methodCssSize({
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
	 * @param {string|CssSize} [newHeight] - Must be a string that parses as valid css.
	 *
	 * @returns {CssSize|this}
	 */
	height: methodCssSize({
		init: new CssSize(),
		set(height) {
			this.css(HEIGHT, height.toPixels());
		}
	}),

	borderHeight() {
		return this.element.offsetHeight;
	},

	innerHeight() {
		return this.element.offsetHeight - this.paddingHeight;
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
	 * @param {string|CssSize} [newMaxHeight] - Must be a string that parses as valid css.
	 *
	 * @returns {CssSize|this}
	 */
	maxHeight: methodCssSize({
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
	 * @param {boolean} [input=true] - If a value is provided then set, otherwise get the current state.
	 *
	 * @returns {boolean|this} - Only returned if no value is provided
	 */
	isEnabled: methodBoolean({
		init: true,
		set(isEnabled) {
			const self = this;

			self.classes(DISABLED_CLASS, !isEnabled);

			if (self.element && !isEnabled && self.isFocused) {
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
	 * @param {boolean} [newStopPropagation]
	 *
	 * @returns {boolean|this}
	 */
	stopPropagation: methodBoolean({
		set: setPropagationClickEvent
	}),

	/**
	 * Hides the control when true
	 *
	 * @method isVisisble
	 * @member module:Control
	 * @instance
	 *
	 * @param {boolean} [input=true] - If a value is provided then set, otherwise get the current state.
	 *
	 * @returns {boolean|this} - Only returned if no value is provided
	 */
	isVisible: methodBoolean({
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
	 * @param {boolean} [input=true] - If a value is provided then set, otherwise get the current state.
	 *
	 * @returns {boolean|this} - Only returned if no value is provided
	 */
	isDisplayed: methodBoolean({
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
	 * @param {string} eventName
	 * @param {Function} handler
	 *
	 * @returns {this}
	 */
	on: methodKeyValue({
		set(eventName, handler) {
			const self = this;

			if (!handler) {
				self.off(eventName);
			}
			else {
				const _self = _(self);

				walkPath(eventName, (name) => {
					if (_self.events[name]) {
						self.element.removeEventListener(firstInPath(name), _self.events[name], false);
					}

					self.element.addEventListener(firstInPath(name), handler, false);

					_self.events[name] = handler;
				}, SPACE);
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
	 * @param {string} eventName
	 *
	 * @returns {this}
	 */
	off(eventName) {
		const self = this;

		if (eventName) {
			const _self = _(self);

			walkPath(eventName, (name) => {
				const handler = _self.events[name];

				if (handler) {
					self.element.removeEventListener(firstInPath(name), handler, false);
					erase(_self.events, name);
				}
			}, SPACE);
		}

		return self;
	},

	/**
	 * Add or Remove an event listener.
	 *
	 * @method set
	 * @member module:Control
	 * @instance
	 *
	 * @param {string} eventName
	 * @param {Function} [handler] - if provided, then the event will only be removed if this handler matches the one
	 *    provided in the "on" method.
	 * @param {boolean} [performAdd=true] - true adds a listener, false removes it.
	 *
	 * @returns {this}
	 */
	set(eventName, handler, performAdd) {
		const self = this;

		if (performAdd) {
			self.on(eventName, handler);
		}
		else {
			self.off(eventName);
		}

		return self;
	},

	trigger(eventName) {
		const self = this;

		if (self.element !== undefined) {
			self.element.dispatchEvent(new Event(eventName));
		}

		return self;
	},

	/**
	 * The focused state of this control.
	 *
	 * @method isFocused
	 * @member module:Control
	 * @instance
	 *
	 * @param {boolean} [isFocused]
	 *
	 * @returns {boolean|this}
	 */
	isFocused(isFocused) {
		const self = this;

		if (isFocused !== undefined) {
			if (self.element) {
				if (isFocused) {
					self.element.focus();
				}
				else if (self.isFocused()) {
					DOCUMENT.activeElement.blur();
				}
			}

			return self;
		}

		return self.element ? (self.element === DOCUMENT.activeElement || self.element
			.contains(DOCUMENT.activeElement)) : false;
	},

	/**
	 * Adds a callback to the onResize method
	 *
	 * @method onResize
	 * @member module:Control
	 * @instance
	 *
	 * @param {Function} callback
	 * @param {boolean} callImmediately - if true then execute the callback immediately
	 *
	 * @returns {queue}
	 */
	onResize: methodQueue(),

	/**
	 * Trigger a resize on this control. This method is throttled by default
	 *
	 * @method resize
	 * @member module:Control
	 * @instance
	 *
	 * @param {boolean} [isForced=false] - if true a resize will happen immediately
	 */
	resize(isForced) {
		const self = this;
		const _self = _(self);

		if (!self.isRemoved && !_self.isResizing) {
			_self.isResizing = true;

			const newWidth = self.borderWidth();
			let newHeight = self.borderHeight();

			if (self.height().isPercent && self.container()) {
				let calculatedHeight = parseStyle(self.container(), 'height') * (self.height().value / 100);

				calculatedHeight -= self.marginHeight;
				if (getComputedStyle(self.element).boxSizing !== BORDER_BOX) {
					calculatedHeight -= self.paddingHeight;
				}

				if (_self.currentHeight !== calculatedHeight) {
					newHeight = calculatedHeight;
					self.element.style.height = calculatedHeight + PIXELS;
					isForced = true;
				}
			}

			if (isForced || _self.currentWidth !== newWidth || _self.currentHeight !== newHeight) {
				_self.currentWidth = newWidth;
				_self.currentHeight = newHeight;

				self.onResize().trigger(null, [newWidth, newHeight]);

				self[CHILD_CONTROLS].each((control) => {
					control.resize(isForced && self.contentContainer === control);
				});
			}

			_self.isResizing = false;
		}

		return self;
	}
});
