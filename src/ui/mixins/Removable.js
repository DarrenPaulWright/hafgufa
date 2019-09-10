import { clear, delay } from 'async-agent';
import { isFunction, method } from 'type-enforcer';

const isTest = isFunction(global.it);
const FADE_INITIAL_CLASS = 'fade-initial';
const FADE_IN_CLASS = 'fade-in';
const FADE_DURATION = 200;

const IS_REMOVED = Symbol();
const REMOVE_DELAY = Symbol();

/**
 * Adds remove methods to a module.
 * @class Removable
 * @constructor
 */
export default class Removable {
	constructor() {
		this[IS_REMOVED] = false;
	}

	/**
	 * If the returned value is true then remove has been called.
	 * @method isRemoved
	 * @member module:Removable
	 * @instance
	 */
	get isRemoved() {
		return this[IS_REMOVED];
	}
}

Object.assign(Removable.prototype, {
	fade: method.boolean({
		set(fade) {
			const self = this;

			if (fade) {
				self.addClass(FADE_INITIAL_CLASS);
				window.requestAnimationFrame(() => {
					self.addClass(FADE_IN_CLASS);
				});
			}
			else {
				self.removeClass(FADE_IN_CLASS);
			}
		}
	}),

	/**
	 * Calls all the onRemove callbacks and sets isRemoved to true
	 * @method remove
	 * @member module:Removable
	 * @instance
	 */
	remove() {
		const self = this;

		const removeFinal = () => {
			if (self.onRemove()) {
				self.onRemove().trigger(null, null, self)
					.discardAll();
			}
			if (self.onPreRemove()) {
				self.onPreRemove().discardAll();
			}
		};

		if (self && !self.isRemoved) {
			self[IS_REMOVED] = true;

			if (self.onPreRemove()) {
				self.onPreRemove().trigger(null, null, self);
			}

			if (self.fade() && !isTest) {
				self.removeClass(FADE_IN_CLASS);
				self[REMOVE_DELAY] = delay(removeFinal, FADE_DURATION);
			}
			else {
				removeFinal();
			}
		}
	},

	revive() {
		const self = this;

		if (self.fade()) {
			self[IS_REMOVED] = false;
			clear(self[REMOVE_DELAY]);
			self.addClass(FADE_IN_CLASS);
		}

		return self;
	}
});

Object.assign(Removable.prototype, {
	/**
	 * Adds a callback that gets called before any fade animations
	 * @method onPreRemove
	 * @member module:Removable
	 * @instance
	 * @arg {Function} callback
	 * @returns {this}
	 */
	onPreRemove: method.queue(),
	/**
	 * Adds a callback to the remove method
	 * @method onRemove
	 * @member module:Removable
	 * @instance
	 * @arg {Function} callback
	 * @returns {this}
	 */
	onRemove: method.queue()
});
