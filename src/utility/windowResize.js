import { debounce, throttle } from 'async-agent';
import { select } from 'd3';
import { Queue } from 'type-enforcer';
import { RESIZE_EVENT, WINDOW } from './domConstants';

let windowWidth = 0;
let windowHeight = 0;
const queue = new Queue();

/**
 * Executes a callback on id only.
 * @function trigger
 */
const trigger = (id) => queue.trigger(id);

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
	 * @returns {Number} - An unique id for this callback.
	 */
	add(callback, type) {
		const newId = queue.add(callback, {
			type: type
		});

		return newId;
	},

	/**
	 * Remove a specific callback from the stack.
	 *
	 * @method discard
	 * @member module:windowResize
	 * @instance
	 *
	 * @arg {Number} id - The id returned by windowResize.add().
	 */
	discard(id) {
		queue.discard(id);
	},

	/**
	 * Remove ALL callbacks from the stack.
	 *
	 * @method discardAll
	 * @member module:windowResize
	 * @instance
	 */
	discardAll() {
		queue.discardAll();
	},

	/**
	 * Triggers one or all callbacks.
	 * @method trigger
	 * @member module:windowResize
	 * @instance
	 * @arg {Number} [id] - To trigger only a specific callback, provide the id returned by windowResize.add().
	 *     Otherwise all callbacks are called.
	 */
	trigger(id) {
		if (id) {
			trigger(id);
		}
		else {
			triggerAll();
		}
	},

	get width() {
		return windowWidth;
	},

	get height() {
		return windowHeight;
	},

	/**
	 * Gets the total number of current callbacks.
	 * @method getTotalCallbacks
	 * @member module:windowResize
	 * @instance
	 */
	get length() {
		return queue.length;
	}
};
