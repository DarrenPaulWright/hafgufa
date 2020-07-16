import { clear, delay } from 'async-agent';
import { isFunction, methodBoolean, methodQueue, PrivateVars } from 'type-enforcer-ui';

const isTest = isFunction(global.it);
const FADE_INITIAL_CLASS = 'fade-initial';
const FADE_IN_CLASS = 'fade-in';
const FADE_DURATION = 200;

const _ = new PrivateVars();

/**
 * Adds remove methods to a module.
 *
 * @class Removable
 * @constructor
 */
export default class Removable {
	constructor() {
		_.set(this, {
			isRemoved: false
		});
	}

	/**
	 * If the returned value is true then remove has been called.
	 *
	 * @method isRemoved
	 * @member module:Removable
	 * @instance
	 */
	get isRemoved() {
		return _(this).isRemoved;
	}
}

Object.assign(Removable.prototype, {
	fade: methodBoolean({
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
	 *
	 * @method remove
	 * @member module:Removable
	 * @instance
	 */
	remove() {
		const self = this;
		const _self = _(self);

		const removeFinal = () => {
			if (self.onRemove()) {
				self.onRemove().trigger()
					.discardAll();
			}
			if (self.onPreRemove()) {
				self.onPreRemove().discardAll();
			}
		};

		if (self && !_self.isRemoved) {
			_self.isRemoved = true;

			if (self.onPreRemove()) {
				self.onPreRemove().trigger();
			}

			if (self.fade() && !isTest) {
				self.removeClass(FADE_IN_CLASS);
				_self.removeDelay = delay(removeFinal, FADE_DURATION);
			}
			else {
				removeFinal();
			}
		}
	},

	revive() {
		const self = this;
		const _self = _(self);

		if (self.fade()) {
			_self.isRemoved = false;
			clear(_self.removeDelay);
			self.addClass(FADE_IN_CLASS);
		}

		return self;
	}
});

Object.assign(Removable.prototype, {
	/**
	 * Adds a callback that gets called before any fade animations
	 *
	 * @method onPreRemove
	 * @member module:Removable
	 * @instance
	 * @param {Function} callback
	 * @returns {this}
	 */
	onPreRemove: methodQueue(),
	/**
	 * Adds a callback to the remove method
	 *
	 * @method onRemove
	 * @member module:Removable
	 * @instance
	 * @param {Function} callback
	 * @returns {this}
	 */
	onRemove: methodQueue()
});
