import { event, select } from 'd3';
import { clone, forOwn } from 'object-agent';
import { castArray, enforce, isElement, isObject, isString, PIXELS } from 'type-enforcer';
import {
	BODY,
	BORDER_BOTTOM_WIDTH,
	BORDER_LEFT_WIDTH,
	BORDER_RIGHT_WIDTH,
	BORDER_TOP_WIDTH,
	BOTTOM,
	DIV,
	DOCUMENT,
	EMPTY_STRING,
	HEIGHT,
	IMAGE,
	LEFT,
	LINE_HEIGHT,
	LOAD_EVENT,
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
	SOURCE,
	SPACE,
	TOP,
	WIDTH,
	WINDOW
} from './domConstants';

const SVG_SEPARATOR = ':';

const cssPropertiesToApplyAttrWhenSvg = [
	HEIGHT,
	WIDTH
];

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

const parseStyle = (element, styleName) => parseInt(WINDOW.getComputedStyle(element).getPropertyValue(styleName) || 0, 10);

const INSERT_HTML_BEGIN = 'afterbegin';
const INSERT_HTML_END = 'beforeend';
const DOM_INSERTION_CLASS = 'element-inserted';
const DOM_INSERTION_EVENTS = 'animationstart MSAnimationStart webkitAnimationStart';

/**
 * <p>Utility functions for adding new content to the DOM.</p>
 *
 * @module dom
 */
const dom = {
	getElement: function(element, isContainer = false) {
		if (isElement(element) || element === WINDOW) {
			return element;
		}
		else if (isContainer && element && element.contentContainer) {
			return element.contentContainer();
		}
		else if (element && element.element) {
			return element.element();
		}
		else if (isString(element)) {
			return dom.find(element);
		}

		return null;
	},
	/**
	 * Build a new element and apply a css class.
	 *
	 * @method buildNew
	 * @member module:dom
	 * @static
	 *
	 * @param {String}  [className] - A css class to apply to the new element.
	 * @param {String}  [element=div] - The name of an HTML element.
	 *
	 * @returns {Object} - Reference to an element NOT attached to the DOM.
	 */
	buildNew: function(className, element) {
		let newElement;

		if (element && element.includes(SVG_SEPARATOR)) {
			element = element.split(SVG_SEPARATOR);
			newElement = DOCUMENT.createElementNS('http://www.w3.org/2000/' + element[0], element[1]);
			dom.addClass(newElement, className);

		}
		else {
			newElement = DOCUMENT.createElement(element || DIV);
			dom.addClass(newElement, className);
		}

		return newElement;
	},
	/**
	 * Build a new element, apply a css class, and prepend the element INSIDE the specified container.
	 *
	 * @method prependNewTo
	 * @member module:dom
	 * @static
	 *
	 * @param {Object} container - DOM element to prepend the new element to.
	 * @param {String} [className] - A css class to apply to the new element.
	 * @param {String} [element=div] - The name of an HTML element.
	 *
	 * @returns {Object} - Reference to an element in the DOM.
	 */
	prependNewTo: function(container, className, element) {
		return dom.prependTo(container, dom.buildNew(className, element));
	},
	/**
	 * Build a new element, apply a css class, and append the element INSIDE the specified container.
	 *
	 * @method appendNewTo
	 * @member module:dom
	 * @static
	 *
	 * @param {Object} container - DOM element to append to the new element to.
	 * @param {String} [className] - A css class to apply to the new element.
	 * @param {String} [element=div] - The name of an HTML element.
	 *
	 * @returns {Object} - Reference to an element in the DOM.
	 */
	appendNewTo: function(container, className, element) {
		return dom.appendTo(container, dom.buildNew(className, element));
	},
	/**
	 * Build a new element, apply a css class, and append the element BEFORE the specified container.
	 *
	 * @method appendNewBefore
	 * @member module:dom
	 * @static
	 *
	 * @param {Object} container - DOM element to append to the new element to.
	 * @param {String} [className] - A css class to apply to the new element.
	 * @param {String} [element=div] - The name of an HTML element.
	 *
	 * @returns {Object} - Reference to an element in the DOM.
	 */
	appendNewBefore: function(container, className, element) {
		return dom.appendBefore(container, dom.buildNew(className, element));
	},
	/**
	 * Build a new element, apply a css class, and append the element AFTER the specified container.
	 *
	 * @method appendNewAfter
	 * @member module:dom
	 * @static
	 *
	 * @param {Object} container - DOM element to append to the new element to.
	 * @param {String} [className] - A css class to apply to the new element.
	 * @param {String} [element=div] - The name of an HTML element.
	 *
	 * @returns {Object} - Reference to an element in the DOM.
	 */
	appendNewAfter: function(container, className, element) {
		return dom.appendAfter(container, dom.buildNew(className, element));
	},
	/**
	 * Add an element to the DOM as the first child of another element
	 *
	 * @method prependTo
	 * @member module:dom
	 * @static
	 *
	 * @param {object} container - The parent element
	 * @param {element} element   - The element to be prepended
	 */
	prependTo: function(container, element) {
		container = dom.getElement(container, true);
		element = dom.getElement(element);

		if (container && element) {
			container.insertBefore(element, container.firstChild);
		}
		return element;
	},
	/**
	 * Add an element to the DOM as the last child of another element
	 *
	 * @method appendTo
	 * @member module:dom
	 * @static
	 *
	 * @param {object} container - The parent element
	 * @param {element} element   - The element to be prepended
	 */
	appendTo: function(container, element) {
		container = dom.getElement(container, true);
		element = dom.getElement(element);

		if (container && element) {
			container.appendChild(element);
		}
		return element;
	},
	/**
	 * Add an element to the DOM as the previous sibling of another element
	 *
	 * @method appendBefore
	 * @member module:dom
	 * @static
	 *
	 * @param {object} container - The parent element
	 * @param {element} element   - The element to be prepended
	 */
	appendBefore: function(container, element) {
		container = dom.getElement(container, true);
		element = dom.getElement(element);

		if (container && element && container.parentNode) {
			container.parentNode.insertBefore(element, container);
		}
		return element;
	},
	/**
	 * Add an element to the DOM as the next sibling of another element
	 *
	 * @method appendAfter
	 * @member module:dom
	 * @static
	 *
	 * @param {object} container - The parent element
	 * @param {element} element   - The element to be prepended
	 */
	appendAfter: function(container, element) {
		container = dom.getElement(container, true);
		element = dom.getElement(element);

		if (container && element && container.parentNode) {
			container.parentNode.insertBefore(element, container.nextSibling);
		}
		return element;
	},
	/**
	 * Query the DOM for an element
	 *
	 * @method find
	 * @member module:dom
	 * @static
	 *
	 * @param {string} query
	 *
	 * @returns {element}
	 */
	find: function(query) {
		return DOCUMENT.querySelector(query);
	},
	/**
	 * Determines if an element has focus
	 *
	 * @method isActive
	 * @member module:dom
	 * @static
	 *
	 * @param {element} element
	 *
	 * @returns {boolean}
	 */
	isActive: function(element) {
		return isElement(element) ? element === DOCUMENT.activeElement : false;
	},
	/**
	 * Determines if an element contains a focused element
	 *
	 * @method hasActive
	 * @member module:dom
	 * @static
	 *
	 * @param {element} element
	 *
	 * @returns {boolean}
	 */
	hasActive: function(element) {
		return isElement(element) ? element.contains(DOCUMENT.activeElement) : false;
	},
	/**
	 * Blurs the currently focused element.
	 *
	 * @method blur
	 * @member module:dom
	 * @static
	 */
	blur: function() {
		DOCUMENT.activeElement.blur();
	},
	/**
	 * Prepares a string to be used as a valid element ID.
	 *
	 * @method prepDomIDString
	 * @member module:dom
	 * @static
	 *
	 * @param {String} input
	 *
	 * @returns {string}
	 */
	prepDomIDString: function(input) {
		return (isString(input)) ? input.replace(SPACE, EMPTY_STRING)
			.replace(/[^A-Za-z0-9_:\.-]/g, EMPTY_STRING) : EMPTY_STRING;
	},
	/**
	 * Tests to see if a string has content that should be processed as HTML
	 *
	 * @method isHTML
	 * @member module:dom
	 * @static
	 *
	 * @param {String} input
	 *
	 * @returns {boolean}
	 */
	isHTML: function(input) {
		return /<[a-z][\s\S]*>|\&|null/i.test(input);
	},
	/**
	 * Adds string content to an element. If the string has HTML in it, then innerHTML is used.
	 *
	 * @method content
	 * @member module:dom
	 * @static
	 *
	 * @param {element} element
	 * @param {String} content
	 * @param {String} [doPrepend] - false will append, true will prepend, undefined will replace all
	 *
	 * @returns {dom}
	 */
	content: function(element, content, doPrepend) {
		element = dom.getElement(element, true);

		if (element) {
			if (doPrepend === undefined) {
				dom.empty(element);
			}
			if (content === undefined) {
				content = '';
			}

			if (isElement(content) || (content && content.element)) {
				if (doPrepend === true) {
					dom.prependTo(element, content);
				}
				else {
					dom.appendTo(element, content);
				}
			}
			else {
				if (doPrepend === true) {
					element.insertAdjacentHTML(INSERT_HTML_BEGIN, content);
				}
				else {
					element.insertAdjacentHTML(INSERT_HTML_END, content);
				}
			}
		}

		return dom;
	},
	/**
	 * Remove the content of an element
	 *
	 * @method empty
	 * @member module:dom
	 * @static
	 *
	 * @param {element} element
	 *
	 * @returns {dom}
	 */
	empty: function(element) {
		element = dom.getElement(element, true);

		if (element) {
			element.textContent = EMPTY_STRING;
		}

		return dom;
	},
	/**
	 * Builds an email link.
	 *
	 * @method buildLink
	 * @member module:dom
	 * @static
	 *
	 * @param {String} link
	 * @param {String} [text] - Visible text, if not provided then link is used.
	 *
	 * @returns {element}
	 */
	buildLink: function(link, text) {
		const anchor = dom.buildNew('', 'a');

		if (link && !link.includes('http')) {
			link = 'http://' + link;
		}
		anchor.href = link;
		anchor.target = '_blank';
		anchor.textContent = text || link;
		return anchor;
	},
	/**
	 * Builds an email link.
	 *
	 * @method buildEmailLink
	 * @member module:dom
	 * @static
	 *
	 * @param {String} email
	 *
	 * @returns {element}
	 */
	buildEmailLink: function(email) {
		const link = dom.buildNew('', 'a');
		link.href = 'mailto:' + email;
		link.textContent = email;
		return link;
	},
	/**
	 * Add a class to an element
	 *
	 * @method addClass
	 * @member module:dom
	 * @static
	 *
	 * @param {element} element
	 * @param {String} className
	 *
	 * @returns {dom}
	 */
	addClass: function(element, className) {
		element = dom.getElement(element);

		if (element && isString(className) && className !== EMPTY_STRING) {
			let classArray = className.trim().split(SPACE);

			for (let index = 0; index < classArray.length; index++) {
				if (element.classList) {
					element.classList.add(classArray[index]);
				}
				else {
					if (element.className.baseVal !== undefined) {
						element.className.baseVal += SPACE + classArray[index];
					}
					else {
						element.className += SPACE + classArray[index];
					}
				}
			}
		}

		return dom;
	},
	/**
	 * Remove a class from an element
	 *
	 * @method removeClass
	 * @member module:dom
	 * @static
	 *
	 * @param {element} element
	 * @param {String} className
	 *
	 * @returns {dom}
	 */
	removeClass: function(element, className) {
		const BASE_PREFIX = '(^|\\b)';
		const BASE_SUFFIX = '(\\b|$)';
		const FLAGS = 'gi';
		let classArray;

		element = dom.getElement(element);

		if (element && isString(className) && className !== EMPTY_STRING) {
			classArray = className.trim().split(SPACE);
			for (let index = 0; index < classArray.length; index++) {
				if (element.classList) {
					element.classList.remove(classArray[index]);
				}
				else {
					if (element.className.baseVal !== undefined) {
						element.className.baseVal = element.className.baseVal.replace(new RegExp(BASE_PREFIX + classArray[index].split(SPACE)
							.join('|') + BASE_SUFFIX, FLAGS), SPACE);
					}
					else {
						element.className = element.className.replace(new RegExp(BASE_PREFIX + classArray[index].split(SPACE)
							.join('|') + BASE_SUFFIX, FLAGS), SPACE);
					}
				}
			}
		}

		return dom;
	},
	/**
	 * Add or remove classes from an element
	 *
	 * @method classes
	 * @member module:dom
	 * @static
	 *
	 * @param {Object}  element
	 * @param {String}  className
	 * @param {Boolean} [performAdd=true] - True will add the provided classes to the element, false will remove the
	 *     classes.
	 */
	classes: function(element, className, performAdd) {
		element = dom.getElement(element);

		if (element) {
			if (arguments.length > 1) {
				if (enforce.boolean(performAdd, true)) {
					dom.addClass(element, className);
				}
				else {
					dom.removeClass(element, className);
				}
			}

			return element.classList ? element.classList.value : element.className.baseVal || element.className;
		}
	},
	/**
	 * Get or set a css style on a DOM element
	 *
	 * @method css
	 * @member module:dom
	 * @static
	 *
	 * @param {element} element
	 * @param {String} property - The style property to get or set
	 * @param {String} [value]  - If provided then set this as the value of the property, if not provided then return
	 *     the computed style.
	 *
	 * @returns {dom}
	 */
	css: function(element, property, value) {
		const setProperty = (property, value) => {
			if (!isNaN(value) && cssPropertiesToParseAsInt.includes(property)) {
				value = value + PIXELS;
			}

			if (cssPropertiesToApplyAttrWhenSvg.includes(property) && element instanceof SVGElement) {
				dom.attr(element, property, value);
			}
			else {
				element.style[property] = value;
			}
		};

		element = dom.getElement(element);

		if (element) {
			if (isObject(property)) {
				forOwn(property, (value, key) => {
					setProperty(key, value);
				});
			}
			else if (value !== undefined) {
				setProperty(property, value);
			}
			else {
				return element.style[property];
			}
		}

		return dom;
	},
	/**
	 * Get or set the value of an attribute of a DOM element
	 *
	 * @method attr
	 * @member module:dom
	 * @static
	 *
	 * @param {element} element
	 * @param {string|object} attributeName - The attribute to get or set. Can be an object with multiple values
	 * @param {string} [attributeValue]  - If provided then set this as the value of the attribute, if not provided
	 *     then return the current value.
	 *
	 * @returns {dom}
	 */
	attr: function(element, attributeName, attributeValue) {
		element = dom.getElement(element);

		if (element) {
			if (isObject(attributeName)) {
				forOwn(attributeName, (value, key) => {
					element.setAttribute(key, value);
				});
			}
			else if (attributeValue) {
				return element.setAttribute(attributeName, attributeValue);
			}
			else {
				return element.getAttribute(attributeName);
			}
		}

		return dom;
	},
	/**
	 * Set a callback that gets triggered when an element is added to the DOM
	 *
	 * @method addDomInsertionCallback
	 * @member module:dom
	 * @static
	 *
	 * @param {Object}   element   - Must be a reference to the actual element
	 * @param {Function} callback
	 */
	addDomInsertionCallback: function(element, callback) {
		element = dom.getElement(element);

		if (element) {
			if (!BODY.contains(element)) {
				dom.addClass(element, DOM_INSERTION_CLASS);
				select(element).on(DOM_INSERTION_EVENTS, () => {
					if (event.animationName === 'nodeInserted') {
						callback();
						dom.removeDomInsertionCallback(event.target);
					}
				});
			}
			else {
				callback();
				callback = null;
			}

			return true;
		}

		return false;
	},
	/**
	 * Remove a callback set by addDomInsertionCallback
	 *
	 * @method removeDomInsertionCallback
	 * @member module:dom
	 * @static
	 *
	 * @param {Object}   element   - Must be a reference to the actual element
	 */
	removeDomInsertionCallback: function(element) {
		element = dom.getElement(element);
		dom.removeClass(element, DOM_INSERTION_CLASS);
		select(element).on(DOM_INSERTION_EVENTS, null);
	},
	/**
	 * Removes an element from the DOM
	 *
	 * @method remove
	 * @member module:dom
	 * @static
	 *
	 * @param {element} element  - DOM element
	 */
	remove: function(element) {
		element = dom.getElement(element);

		if (element) {
			dom.removeDomInsertionCallback(element);

			dom.applyD3Events(element, dom.getD3Events(element), true);

			if (element.remove) {
				element.remove();
			}
			else if (element.parentNode) {
				element.parentNode.removeChild(element);
			}
		}

		element = null;
	},
	getD3Events: function(element) {
		return element.__on;
	},
	applyD3Events: function(element, events, doRemove) {
		if (events) {
			let name;

			element = select(element);

			clone(castArray(events)).forEach((event) => {
				if (event) {
					name = event.type;
					if (event.name) {
						name += '.' + event.name;
					}
					element.on(name, doRemove ? null : event.value);
				}
			});
		}
	},
	/**
	 * Gets various measurements of DOM elements
	 *
	 * @method get
	 * @member module:dom
	 * @static
	 */
	get: {
		/**
		 * Get the width of a DOM element including borders
		 *
		 * @method width
		 * @member module:dom.get
		 * @static
		 *
		 * @param {element} element
		 *
		 * @returns {Number}
		 */
		width: function(element) {
			element = dom.getElement(element);

			if (element) {
				if (element instanceof SVGElement) {
					return element.getBBox().width;
				}
				else {
					return element.offsetWidth;
				}
			}

			return undefined;
		},
		/**
		 * Get the height of a DOM element including borders
		 *
		 * @method height
		 * @member module:dom.get
		 * @static
		 *
		 * @param {element} element
		 *
		 * @returns {Number}
		 */
		height: function(element) {
			element = dom.getElement(element);

			if (element) {
				if (element instanceof SVGElement) {
					return element.getBBox().height;
				}
				else {
					return element.offsetHeight;
				}
			}

			return undefined;
		},
		/**
		 * Get the top offset of a DOM element relative to it's parent element or the body
		 *
		 * @method top
		 * @member module:dom.get
		 * @static
		 *
		 * @param {Object}  element
		 * @param {boolean} [toBody=false] - if true then calculates offset from the body
		 *
		 * @returns {Number}
		 */
		top: function(element, toBody = false) {
			element = dom.getElement(element);

			return !element ? 0 : (toBody ? element.getBoundingClientRect().top : element.offsetTop);
		},
		/**
		 * Get the left offset of a DOM element relative to it's parent element or the body
		 *
		 * @method left
		 * @member module:dom.get
		 * @static
		 *
		 * @param {Object}  element
		 * @param {boolean} [toBody=false] - if true then calculates offset from the body
		 *
		 * @returns {Number}
		 */
		left: function(element, toBody = false) {
			element = dom.getElement(element);

			return !element ? 0 : (toBody ? element.getBoundingClientRect().left : element.offsetLeft);
		},
		/**
		 * Get the total width of an element with margins
		 *
		 * @method outerWidth
		 * @member module:dom.get
		 * @static
		 *
		 * @param {element} element
		 *
		 * @returns {Number}
		 */
		outerWidth: function(element) {
			return dom.get.width(element) + dom.get.margins.width(element);
		},
		/**
		 * Get the total height of an element with margins
		 *
		 * @method outerHeight
		 * @member module:dom.get
		 * @static
		 *
		 * @param {element} element
		 *
		 * @returns {Number}
		 */
		outerHeight: function(element) {
			return dom.get.height(element) + dom.get.margins.height(element);
		},
		scrollWidth: function(element) {
			element = dom.getElement(element);

			return !element ? 0 : element.scrollWidth;
		},
		scrollHeight: function(element) {
			element = dom.getElement(element);

			return !element ? 0 : element.scrollHeight;
		},
		/**
		 * Get the total size of opposite borders
		 *
		 * @method borders
		 * @member module:dom.get
		 * @static
		 *
		 * @param {element} element
		 *
		 * @returns {Number}
		 */
		borders: {
			width: function(element) {
				element = dom.getElement(element);
				return !element ? 0 : parseStyle(element, BORDER_LEFT_WIDTH) + parseStyle(element, BORDER_RIGHT_WIDTH);
			},
			height: function(element) {
				element = dom.getElement(element);
				return !element ? 0 : parseStyle(element, BORDER_TOP_WIDTH) + parseStyle(element, BORDER_BOTTOM_WIDTH);
			}
		},
		/**
		 * Get the total size of opposite margins
		 *
		 * @method margins
		 * @member module:dom.get
		 * @static
		 *
		 * @param {element} element
		 *
		 * @returns {Number}
		 */
		margins: {
			width: function(element) {
				element = dom.getElement(element);
				return !element ? 0 : parseStyle(element, MARGIN_LEFT) + parseStyle(element, MARGIN_RIGHT);
			},
			height: function(element) {
				element = dom.getElement(element);
				return !element ? 0 : parseStyle(element, MARGIN_TOP) + parseStyle(element, MARGIN_BOTTOM);
			}
		},
		/**
		 * Get the total size of opposite paddings
		 *
		 * @method paddings
		 * @member module:dom.get
		 * @static
		 *
		 * @param {element} element
		 *
		 * @returns {Number}
		 */
		paddings: {
			width: function(element) {
				element = dom.getElement(element);
				return !element ? 0 : parseStyle(element, PADDING_LEFT) + parseStyle(element, PADDING_RIGHT);
			},
			height: function(element) {
				element = dom.getElement(element);
				return !element ? 0 : parseStyle(element, PADDING_TOP) + parseStyle(element, PADDING_BOTTOM);
			}
		},
		/**
		 * Gets the line-height of an element as an int
		 *
		 * @method lineHeight
		 * @member module:dom.get
		 * @static
		 *
		 * @param {element} element
		 *
		 * @returns {Number}
		 */
		lineHeight: function(element) {
			element = dom.getElement(element);
			return !element ? 0 : parseStyle(element, LINE_HEIGHT);
		},
		/**
		 * Gets the width or height of a scrollbar, if it exists
		 *
		 * @method scrollbar
		 * @member module:dom.get
		 * @static
		 *
		 * @param {element} element
		 *
		 * @returns {Number}
		 */
		scrollbar: {
			width: function(element) {
				element = dom.getElement(element);
				return !element ? 0 : element.offsetWidth - element.clientWidth;
			},
			height: function(element) {
				element = dom.getElement(element);
				return !element ? 0 : element.offsetHeight - element.clientHeight;
			}
		}
	}
};

export default dom;
