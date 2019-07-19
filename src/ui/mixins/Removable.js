import { clear, delay } from 'async-agent';
import { isFunction, method, Queue } from 'type-enforcer';

const isTest = isFunction(global.it);
const FADE_INITIAL_CLASS = 'fade-initial';
const FADE_IN_CLASS = 'fade-in';
const FADE_DURATION = 200;

const IS_REMOVED = Symbol();
const ON_PRE_REMOVE = Symbol();
const ON_REMOVE = Symbol();
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
		set: function(fade) {
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
	 * Adds a callback that gets called before any fade animations
	 * @method onPreRemove
	 * @member module:Removable
	 * @instance
	 * @arg {Function} callback
	 * @returns {this}
	 */
	onPreRemove: function(callback) {
		const self = this;

		if (!self.isRemoved && callback) {
			if (!self[ON_PRE_REMOVE]) {
				self[ON_PRE_REMOVE] = new Queue();
			}
			self[ON_PRE_REMOVE].add(callback);
		}

		return self;
	},

	/**
	 * Adds a callback to the remove method
	 * @method onRemove
	 * @member module:Removable
	 * @instance
	 * @arg {Function} callback
	 * @returns {this}
	 */
	onRemove: function(callback) {
		const self = this;

		if (!self.isRemoved && callback) {
			if (!self[ON_REMOVE]) {
				self[ON_REMOVE] = new Queue();
			}
			self[ON_REMOVE].add(callback);
		}

		return self;
	},

	/**
	 * Calls all the onRemove callbacks and sets isRemoved to true
	 * @method remove
	 * @member module:Removable
	 * @instance
	 */
	remove: function() {
		const self = this;

		const removeFinal = () => {
			if (self[ON_REMOVE]) {
				self[ON_REMOVE].trigger(null, null, self)
					.discardAll();
				self[ON_REMOVE] = null;
			}
			if (self[ON_PRE_REMOVE]) {
				self[ON_PRE_REMOVE].discardAll();
				self[ON_PRE_REMOVE] = null;
			}
		};

		if (self && !self.isRemoved) {
			self[IS_REMOVED] = true;

			if (self[ON_PRE_REMOVE]) {
				self[ON_PRE_REMOVE].trigger(null, null, self);
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

	revive: function() {
		const self = this;

		if (self.fade()) {
			self[IS_REMOVED] = false;
			clear(self[REMOVE_DELAY]);
			self.addClass(FADE_IN_CLASS);
		}

		return self;
	}
});
