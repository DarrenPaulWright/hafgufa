import { defer } from 'async-agent';
import { method } from 'type-enforcer';
import { DOCUMENT, FOCUS_IN_EVENT, FOCUS_OUT_EVENT } from '../../utility/domConstants';
import { event } from 'd3';

const MAIN_CONTROL = Symbol();
const SUB_CONTROL = Symbol();
const SET_FOCUS = Symbol();
const GET_FOCUS = Symbol();
const HAS_CHILDREN = Symbol();
const IS_FOCUSED = Symbol();
const IS_ALL_BLURRED = Symbol();

const triggerCallback = function(queue) {
	if (queue) {
		queue.trigger(null, [], this);
	}
};

/**
 * Callback that is called when the text control gets focus
 * @function onFocusCallback
 */
const onFocusCallback = function() {
	if (this[SUB_CONTROL] || this[HAS_CHILDREN]) {
		this[IS_FOCUSED] = true;

		if (this[IS_ALL_BLURRED]) {
			this[IS_ALL_BLURRED] = false;
			triggerCallback(this.onFocus());
		}
	}
	else {
		triggerCallback(this.onFocus());
	}
};

/**
 * Callback that is called when the text control loses focus
 * @function onBlurCallback
 */
const onBlurCallback = function() {
	if (this[SUB_CONTROL] || this[HAS_CHILDREN]) {
		this[IS_FOCUSED] = false;

		defer(() => {
			if (!this[IS_FOCUSED]) {
				this[IS_ALL_BLURRED] = true;
				triggerCallback(this.onBlur());
			}
		});
	}
	else {
		triggerCallback(this.onBlur());
	}
};

const setCallback = function(control, eventName, callback) {
	const self = this;
	const handler = () => {
		event.stopPropagation();
		callback.call(self);
	};

	control.on(eventName, handler);
};

/**
 * <p>Adds focus and blur related methods to a control.</p>
 *
 * @module FocusMixin
 * @constructor
 *
 * @param {class} [Base]
 */
const FocusMixin = (Base) => {
	class Focus extends Base {
		constructor(type, settings = {}) {
			super(type, settings);

			if (settings.FocusMixin) {
				this[MAIN_CONTROL] = settings.FocusMixin.mainControl || this;
				this[SUB_CONTROL] = settings.FocusMixin.subControl;
				this[SET_FOCUS] = settings.FocusMixin.setFocus;
				this[GET_FOCUS] = settings.FocusMixin.getFocus;
				this[HAS_CHILDREN] = settings.FocusMixin.hasChildren;
			}
			else {
				this[MAIN_CONTROL] = this;
			}
		}

		/**
		 * Set focus on the text input element.
		 * @method focus
		 * @member module:FocusAddon
		 * @instance
		 */
		focus() {
			return this.isFocused(true);
		}

		/**
		 * Remove focus from this control if it is focused.
		 * @method blur
		 * @member module:FocusAddon
		 * @instance
		 * @returns {this}
		 */
		blur() {
			return this.isFocused(false);
		}

		/**
		 * See if this control has focus.
		 * @method isFocused
		 * @member module:FocusAddon
		 * @instance
		 * @returns {Boolean}
		 */
		isFocused(doFocus) {
			if (doFocus !== undefined) {
				if (doFocus) {
					if (!this.isFocused()) {
						if (this[SET_FOCUS]) {
							this[SET_FOCUS]();
						}
						else if (this[MAIN_CONTROL] !== this) {
							this[MAIN_CONTROL].isFocused(true);
						}
						else {
							this[MAIN_CONTROL].element().focus();
						}
					}
				}
				else if (this.isFocused()) {
					DOCUMENT.activeElement.blur();
				}

				return this;
			}

			if (this[GET_FOCUS]) {
				return this[GET_FOCUS](DOCUMENT.activeElement);
			}

			return this.element() ? (this.element() === DOCUMENT.activeElement || this.element().contains(DOCUMENT.activeElement)) : false;
		}
	}

	Object.assign(Focus.prototype, {

		/**
		 * Adds a callback that is triggered when the control gets focus
		 * @method onFocus
		 * @member module:FocusAddon
		 * @instance
		 * @param {Function} callback
		 * @returns {queue}
		 */
		onFocus: method.queue({
			set: function(queue) {
				if (queue.length === 1 && (!this.isFocusable || this.isFocusable())) {
					setCallback.call(this, this[MAIN_CONTROL], FOCUS_IN_EVENT, onFocusCallback);
					if (this[SUB_CONTROL]) {
						setCallback.call(this, this[SUB_CONTROL], FOCUS_IN_EVENT, onFocusCallback);
					}
				}
			}
		}),

		/**
		 * Adds a callback that is triggered when the control loses focus
		 * @method onBlur
		 * @member module:FocusAddon
		 * @instance
		 * @param {Function} callback
		 * @returns {queue}
		 */
		onBlur: method.queue({
			set: function(queue) {
				if (queue.length === 1 && (!this.isFocusable || this.isFocusable())) {
					setCallback.call(this, this[MAIN_CONTROL], FOCUS_OUT_EVENT, onBlurCallback);
					if (this[SUB_CONTROL]) {
						setCallback.call(this, this[SUB_CONTROL], FOCUS_OUT_EVENT, onBlurCallback);
					}
				}
			}
		})
	});

	return Focus;
};

export default FocusMixin;
