import { select } from 'd3';
import { clone } from 'object-agent';
import { castArray } from 'type-enforcer';

/**
 * Utility functions for adding new content to the DOM.
 *
 * @module dom
 */
const dom = {
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
