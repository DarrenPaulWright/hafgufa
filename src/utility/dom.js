import { select } from 'd3';
import { clone } from 'object-agent';
import { castArray, isElement, isString } from 'type-enforcer';
import {
	DOCUMENT,
	MARGIN_BOTTOM,
	MARGIN_LEFT,
	MARGIN_RIGHT,
	MARGIN_TOP,
	PADDING_BOTTOM,
	PADDING_LEFT,
	PADDING_RIGHT,
	PADDING_TOP,
	WINDOW
} from './domConstants';

const parseStyle = (element, styleName) => parseFloat(WINDOW.getComputedStyle(element)
	.getPropertyValue(styleName) || 0);

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
			return element.offsetWidth + dom.get.margins.width(element);
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
			return element.offsetHeight + dom.get.margins.height(element);
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
		}
	}
};

export default dom;
