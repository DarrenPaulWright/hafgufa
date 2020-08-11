import keyCodes from 'keycodes';
import { methodFunction, methodInteger } from 'type-enforcer-ui';
import { KEY_DOWN_EVENT } from './domConstants.js';

const CONTAINER = Symbol();

const onKeyDown = Symbol();
const setFocus = Symbol();
const next = Symbol();
const previous = Symbol();

/**
 * Maintains the focus index of multiple subItems. Adds an event listener for arrow keys to navigate items.
 *
 * @class MultiItemFocus
 *
 * @param {element} container
 */
export default class MultiItemFocus {
	constructor(container) {
		const self = this;

		self[CONTAINER] = container;

		self[CONTAINER].on(KEY_DOWN_EVENT, (event) => {
			self[onKeyDown](event);
		});
	}

	/**
	 * Manage keyboard navigation.
	 *
	 * @param {Event} event - keydown event
	 */
	[onKeyDown](event) {
		switch (event.keyCode || event.which) {
			case keyCodes('left'):
			case keyCodes('up'):
				event.preventDefault();
				this[previous]();
				break;
			case keyCodes('right'):
			case keyCodes('down'):
				event.preventDefault();
				this[next]();
				break;
		}
	}

	/**
	 * Calls the onSetFocus callback
	 *
	 * @function setFocus
	 */
	[setFocus]() {
		this.onSetFocus()(this.current());
	}

	/**
	 * Sets focus on the next item
	 *
	 * @function next
	 */
	[next]() {
		this.current(Math.min(this.current() + 1, this.length() - 1));
		this[setFocus]();
	}

	/**
	 * Sets focus on the previous item
	 *
	 * @function prev
	 */
	[previous]() {
		this.current(Math.max(this.current() - 1, 0));
		this[setFocus]();
	}

	/**
	 * Focus the first item
	 *
	 * @method first
	 * @memberOf MultiItemFocus
	 * @instance
	 */
	first() {
		this.current(0);
		this[setFocus]();
	}

	/**
	 * Prep for removal
	 *
	 * @method remove
	 * @memberOf MultiItemFocus
	 * @instance
	 */
	remove() {
		this[CONTAINER].off(KEY_DOWN_EVENT);
	}
}

Object.assign(MultiItemFocus.prototype, {
	/**
	 * Get or set the current focused item
	 *
	 * @method current
	 * @memberOf MultiItemFocus
	 * @instance
	 *
	 * @param {number.int} [current]
	 *
	 * @returns {number.int|this}
	 */
	current: methodInteger({
		init: 0
	}),

	/**
	 * Get or set a function to call when focus changes
	 *
	 * @method onSetFocus
	 * @memberOf MultiItemFocus
	 * @instance
	 *
	 * @param {Function} [onSetFocus]
	 *
	 * @returns {Function|this}
	 */
	onSetFocus: methodFunction(),

	/**
	 * Get or set the total items that can be focused
	 *
	 * @method length
	 * @memberOf MultiItemFocus
	 * @instance
	 *
	 * @param {number.int} [length]
	 *
	 * @returns {number.int|this}
	 */
	length: methodInteger({
		set(length) {
			this.current(Math.min(this.current(), length - 1));
		}
	})

});
