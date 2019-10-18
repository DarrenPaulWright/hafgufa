import { select } from 'd3';
import { clone } from 'object-agent';
import { castArray } from 'type-enforcer';

/**
 * Utility functions for adding new content to the DOM.
 *
 * @module dom
 */
const dom = {
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
