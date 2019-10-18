import { select } from 'd3';
import { clone } from 'object-agent';
import { castArray, isElement, isString } from 'type-enforcer';
import { DOCUMENT, WINDOW } from './domConstants';

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
	}
};

export default dom;
