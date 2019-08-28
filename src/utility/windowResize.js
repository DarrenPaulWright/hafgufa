import { debounce, throttle } from 'async-agent';
import { select } from 'd3';
import { Queue } from 'type-enforcer';
import dom from './dom';
import { RESIZE_EVENT, WINDOW } from './domConstants';

let windowWidth = 0;
let windowHeight = 0;
const queue = new Queue();

/**
 * Executes a callback on ID only.
 * @function trigger
 */
const trigger = (ID) => queue.trigger(ID, [windowWidth, windowHeight]);

/**
 * Executes all callbacks.
 * @function triggerAll
 */
const triggerAll = debounce(trigger, 1);

const measureWindow = () => {
	windowWidth = WINDOW.innerWidth;
	windowHeight = WINDOW.innerHeight;
	trigger();
};

select(WINDOW).on(RESIZE_EVENT, throttle(measureWindow, 100));

measureWindow();

/**
 * Executes callbacks whenever the screen is resized or a control that has changed size triggers the others to
 * layout themselves again. windowResize is a singleton so that all callbacks added are processed together.
 * @module windowResize
 */
export default {
	/**
	 * Add a callback to be called whenever the window is resized or windowResize.trigger() is called.
	 * @method add
	 * @member module:windowResize
	 * @instance
	 *
	 * @arg {Function} callback - Callback function.
	 * @arg {Element} element - If provided then a resize event will be triggered when the element is added to the DOM
	 * @arg {string} type
	 *
	 * @returns {Number} - An unique ID for this callback.
	 */
	add(callback, element, type) {
		const newID = queue.add(callback, {
			element: element,
			type: type
		});

		if (element) {
			dom.addDomInsertionCallback(element, () => trigger(newID));
		}

		return newID;
	},

	/**
	 * Remove a specific callback from the stack.
	 *
	 * @method discard
	 * @member module:windowResize
	 * @instance
	 *
	 * @arg {Number} ID - The ID returned by windowResize.add().
	 */
	discard(ID) {
		dom.removeDomInsertionCallback(queue.discard(ID).element);
	},

	/**
	 * Remove ALL callbacks from the stack.
	 *
	 * @method discardAll
	 * @member module:windowResize
	 * @instance
	 */
	discardAll: queue.discardAll,

	/**
	 * Triggers one or all callbacks.
	 * @method trigger
	 * @member module:windowResize
	 * @instance
	 * @arg {Number} [ID] - To trigger only a specific callback, provide the ID returned by windowResize.add().
	 *     Otherwise all callbacks are called.
	 */
	trigger(ID) {
		if (ID) {
			trigger(ID);
		}
		else {
			triggerAll();
		}
	},

	/**
	 * Gets the total number of current callbacks.
	 * @method getTotalCallbacks
	 * @member module:windowResize
	 * @instance
	 */
	getTotalCallbacks() {
		return queue.length;
	}
};
