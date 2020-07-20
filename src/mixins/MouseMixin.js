import { methodFunction } from 'type-enforcer-ui';
import { MOUSE_ENTER_EVENT, MOUSE_LEAVE_EVENT } from '../utility/domConstants.js';

/**
 * Adds onMouseEnter and onMouseLeave methods to a control
 *
 * @module MouseMixin
 * @class
 *
 * @param {Function} Base - The class to extend
 */
export default (Base) => {
	class MouseMixin extends Base {
	}

	Object.assign(MouseMixin.prototype, {
		/**
		 * Sets or gets the current onMouseEnter callback.
		 *
		 * @method onMouseEnter
		 * @mixin MouseMixin
		 * @instance
		 * @chainable
		 *
		 * @param {Function} [callback]
		 *
		 * @returns {Function|this}
		 */
		onMouseEnter: methodFunction({
			set(onMouseEnter) {
				this.on(MOUSE_ENTER_EVENT, onMouseEnter);
			},
			other: null
		}),

		/**
		 * Sets or gets the current onMouseLeave callback.
		 *
		 * @method onMouseLeave
		 * @mixin MouseMixin
		 * @instance
		 * @chainable
		 *
		 * @param {Function} [callback]
		 *
		 * @returns {Function|this}
		 */
		onMouseLeave: methodFunction({
			set(onMouseLeave) {
				this.on(MOUSE_LEAVE_EVENT, onMouseLeave);
			},
			other: null
		})
	});

	return MouseMixin;
};
