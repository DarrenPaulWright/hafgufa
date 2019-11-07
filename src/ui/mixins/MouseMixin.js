import { method } from 'type-enforcer-ui';
import { MOUSE_ENTER_EVENT, MOUSE_LEAVE_EVENT } from '../..';

/**
 * Adds onMouseEnter and onMouseLeave methods to a control
 *
 * @module MouseMixin
 * @constructor
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
		 * @arg {Function} [callback]
		 *
		 * @returns {Function|this}
		 */
		onMouseEnter: method.function({
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
		 * @arg {Function} [callback]
		 *
		 * @returns {Function|this}
		 */
		onMouseLeave: method.function({
			set(onMouseLeave) {
				this.on(MOUSE_LEAVE_EVENT, onMouseLeave);
			},
			other: null
		})
	});

	return MouseMixin;
};
