import { select } from 'd3';
import { clone } from 'object-agent';
import { castArray, enforce, isElement, isString } from 'type-enforcer';
import {
	BORDER_BOTTOM_WIDTH,
	BORDER_LEFT_WIDTH,
	BORDER_RIGHT_WIDTH,
	BORDER_TOP_WIDTH,
	DOCUMENT,
	EMPTY_STRING,
	LINE_HEIGHT,
	MARGIN_BOTTOM,
	MARGIN_LEFT,
	MARGIN_RIGHT,
	MARGIN_TOP,
	PADDING_BOTTOM,
	PADDING_LEFT,
	PADDING_RIGHT,
	PADDING_TOP,
	SPACE,
	WINDOW
} from './domConstants';

const SVG_SEPARATOR = ':';

const parseStyle = (element, styleName) => parseFloat(WINDOW.getComputedStyle(element)
	.getPropertyValue(styleName) || 0);

const INSERT_HTML_BEGIN = 'afterbegin';
const INSERT_HTML_END = 'beforeend';

/**
 * Utility functions for adding new content to the DOM.
 *
 * @module dom
 */
const dom = {
	getElement(element, isContainer = false) {
		if (isElement(element) || element === WINDOW) {
			return element;
		}
		else if (isContainer && element && element.contentContainer) {
			return element.contentContainer.element();
		}
		else if (element && element.element) {
			return element.element();
		}
		else if (isString(element)) {
			return DOCUMENT.querySelector(element);
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
	 * @arg {String}  [className] - A css class to apply to the new element.
	 * @arg {String}  [element=div] - The name of an HTML element.
	 *
	 * @returns {Object} - Reference to an element NOT attached to the DOM.
	 */
	buildNew(className, element) {
		let newElement;

		if (element && element.includes(SVG_SEPARATOR)) {
			element = element.split(SVG_SEPARATOR);
			newElement = DOCUMENT.createElementNS('http://www.w3.org/2000/' + element[0], element[1]);
			dom.addClass(newElement, className);

		}
		else {
			newElement = DOCUMENT.createElement(element || 'div');
			dom.addClass(newElement, className);
		}

		return newElement;
	},
	/**
	 * Build a new element, apply a css class, and append the element INSIDE the specified container.
	 *
	 * @method appendNewTo
	 * @member module:dom
	 * @static
	 *
	 * @arg {Object} container - DOM element to append to the new element to.
	 * @arg {String} [className] - A css class to apply to the new element.
	 * @arg {String} [element=div] - The name of an HTML element.
	 *
	 * @returns {Object} - Reference to an element in the DOM.
	 */
	appendNewTo(container, className, element) {
		return dom.appendTo(container, dom.buildNew(className, element));
	},

	/**
	 * Add an element to the DOM as the first child of another element
	 *
	 * @method prependTo
	 * @member module:dom
	 * @static
	 *
	 * @arg {object} container - The parent element
	 * @arg {element} element   - The element to be prepended
	 */
	prependTo(container, element) {
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
	 * @arg {object} container - The parent element
	 * @arg {element} element   - The element to be prepended
	 */
	appendTo(container, element) {
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
	 * @arg {object} container - The parent element
	 * @arg {element} element   - The element to be prepended
	 */
	appendBefore(container, element) {
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
	 * @arg {object} container - The parent element
	 * @arg {element} element   - The element to be prepended
	 */
	appendAfter(container, element) {
		container = dom.getElement(container, true);
		element = dom.getElement(element);

		if (container && element && container.parentNode) {
			container.parentNode.insertBefore(element, container.nextSibling);
		}
		return element;
	},
	/**
	 * Prepares a string to be used as a valid element id.
	 *
	 * @method prepDomIdString
	 * @member module:dom
	 * @static
	 *
	 * @arg {String} input
	 *
	 * @returns {string}
	 */
	prepDomIdString(input) {
		return (isString(input)) ? input.replace(SPACE, EMPTY_STRING)
			.replace(/[^A-Za-z0-9_:\.-]/g, EMPTY_STRING) : EMPTY_STRING;
	},
	/**
	 * Adds string content to an element. If the string has HTML in it, then innerHTML is used.
	 *
	 * @method content
	 * @member module:dom
	 * @static
	 *
	 * @arg {element} element
	 * @arg {String} content
	 * @arg {String} [doPrepend] - false will append, true will prepend, undefined will replace all
	 *
	 * @returns {dom}
	 */
	content(element, content, doPrepend) {
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
	 * @arg {element} element
	 *
	 * @returns {dom}
	 */
	empty(element) {
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
	 * @arg {String} link
	 * @arg {String} [text] - Visible text, if not provided then link is used.
	 *
	 * @returns {element}
	 */
	buildLink(link, text) {
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
	 * @arg {String} email
	 *
	 * @returns {element}
	 */
	buildEmailLink(email) {
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
	 * @arg {element} element
	 * @arg {String} className
	 *
	 * @returns {dom}
	 */
	addClass(element, className) {
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
	 * @arg {element} element
	 * @arg {String} className
	 *
	 * @returns {dom}
	 */
	removeClass(element, className) {
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
	 * @arg {Object}  element
	 * @arg {String}  className
	 * @arg {Boolean} [performAdd=true] - True will add the provided classes to the element, false will remove the
	 *     classes.
	 */
	classes(element, className, performAdd) {
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
	 * Removes an element from the DOM
	 *
	 * @method remove
	 * @member module:dom
	 * @static
	 *
	 * @arg {element} element  - DOM element
	 */
	remove(element) {
		element = dom.getElement(element);

		if (element) {
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
	getD3Events(element) {
		return element.__on;
	},
	applyD3Events(element, events, doRemove) {
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
		 * @arg {element} element
		 *
		 * @returns {Number}
		 */
		width(element) {
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
		 * @arg {element} element
		 *
		 * @returns {Number}
		 */
		height(element) {
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
		 * @arg {Object}  element
		 * @arg {boolean} [toBody=false] - if true then calculates offset from the body
		 *
		 * @returns {Number}
		 */
		top(element, toBody = false) {
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
		 * @arg {Object}  element
		 * @arg {boolean} [toBody=false] - if true then calculates offset from the body
		 *
		 * @returns {Number}
		 */
		left(element, toBody = false) {
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
		 * @arg {element} element
		 *
		 * @returns {Number}
		 */
		outerWidth(element) {
			return dom.get.width(element) + dom.get.margins.width(element);
		},
		/**
		 * Get the total height of an element with margins
		 *
		 * @method outerHeight
		 * @member module:dom.get
		 * @static
		 *
		 * @arg {element} element
		 *
		 * @returns {Number}
		 */
		outerHeight(element) {
			return dom.get.height(element) + dom.get.margins.height(element);
		},
		scrollWidth(element) {
			element = dom.getElement(element);

			return !element ? 0 : element.scrollWidth;
		},
		scrollHeight(element) {
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
		 * @arg {element} element
		 *
		 * @returns {Number}
		 */
		borders: {
			width(element) {
				element = dom.getElement(element);
				return !element ? 0 : parseStyle(element, BORDER_LEFT_WIDTH) + parseStyle(element, BORDER_RIGHT_WIDTH);
			},
			height(element) {
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
		 * @arg {element} element
		 *
		 * @returns {Number}
		 */
		margins: {
			width(element) {
				element = dom.getElement(element);
				return !element ? 0 : parseStyle(element, MARGIN_LEFT) + parseStyle(element, MARGIN_RIGHT);
			},
			height(element) {
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
		 * @arg {element} element
		 *
		 * @returns {Number}
		 */
		paddings: {
			width(element) {
				element = dom.getElement(element);
				return !element ? 0 : parseStyle(element, PADDING_LEFT) + parseStyle(element, PADDING_RIGHT);
			},
			height(element) {
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
		 * @arg {element} element
		 *
		 * @returns {Number}
		 */
		lineHeight(element) {
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
		 * @arg {element} element
		 *
		 * @returns {Number}
		 */
		scrollbar: {
			width(element) {
				element = dom.getElement(element);
				return !element ? 0 : element.offsetWidth - element.clientWidth;
			},
			height(element) {
				element = dom.getElement(element);
				return !element ? 0 : element.offsetHeight - element.clientHeight;
			}
		}
	}
};

export default dom;
