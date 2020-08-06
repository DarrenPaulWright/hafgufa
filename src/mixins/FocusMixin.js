import { defer } from 'async-agent';
import { methodQueue, PrivateVars } from 'type-enforcer-ui';
import { DOCUMENT, FOCUS_IN_EVENT, FOCUS_OUT_EVENT } from '../utility/domConstants.js';

const _ = new PrivateVars();

const onFocusCallback = Symbol();
const onBlurCallback = Symbol();
const setFocusEvent = Symbol();
const setBlurEvent = Symbol();

/**
 * Adds focus and blur related methods to a control.
 *
 * @mixin FocusMixin
 * @class
 *
 * @param {Function} Base - The class to extend
 */
export default (Base) => {
	class FocusMixin extends Base {
		constructor(settings = {}) {
			super(settings);

			_.set(this, {
				mainControl: this,
				...settings.FocusMixin,
				isAllBlurred: true,
				isFocused: false
			});
		}

		/**
		 * Callback that is called when the control gets focus
		 *
		 * @param event
		 */
		[onFocusCallback](event) {
			const self = this;
			const _self = _(self);

			if (_self.subControl || _self.hasChildren) {
				_self.isFocused = true;

				if (_self.isAllBlurred) {
					_self.isAllBlurred = false;
					self.onFocus().trigger(null, [event]);
				}
			}
			else {
				self.onFocus().trigger(null, [event]);
			}
		}

		/**
		 * Callback that is called when the control loses focus
		 *
		 * @param event
		 */
		[onBlurCallback](event) {
			const self = this;
			const _self = _(self);

			if (_self.subControl || _self.hasChildren) {
				_self.isFocused = false;

				defer(() => {
					if (!_self.isFocused && !self.isFocused()) {
						_self.isAllBlurred = true;
						self.onBlur().trigger(null, [event]);
					}
				});
			}
			else {
				self.onBlur().trigger(null, [event]);
			}
		}

		[setFocusEvent](queue) {
			const self = this;
			const _self = _(self);

			if (queue.length === 1 && (!self.isFocusable || self.isFocusable())) {
				_self.mainControl.on(FOCUS_IN_EVENT, (event) => {
					self[onFocusCallback](event);
				});

				if (_self.subControl) {
					_self.subControl.on(FOCUS_IN_EVENT, (event) => {
						self[onFocusCallback](event);
					});
				}
			}
		}

		[setBlurEvent](queue) {
			const self = this;
			const _self = _(self);

			if (queue.length === 1 && (!self.isFocusable || self.isFocusable())) {
				_self.mainControl.on(FOCUS_OUT_EVENT, (event) => {
					self[onBlurCallback](event);
				});

				if (_self.subControl) {
					_self.subControl.on(FOCUS_OUT_EVENT, (event) => {
						self[onBlurCallback](event);
					});
				}
			}
		}

		/**
		 * Set focus on the text input element.
		 *
		 * @method focus
		 * @member module:FocusMixin
		 * @instance
		 */
		focus() {
			return this.isFocused(true);
		}

		/**
		 * Remove focus from this control if it is focused.
		 *
		 * @method blur
		 * @member module:FocusMixin
		 * @instance
		 * @returns {this}
		 */
		blur() {
			return this.isFocused(false);
		}

		/**
		 * See if this control has focus.
		 *
		 * @method isFocused
		 * @member module:FocusMixin
		 * @instance
		 *
		 * @param {boolean} [doFocus]
		 *
		 * @returns {boolean}
		 */
		isFocused(doFocus) {
			const self = this;
			const _self = _(self);
			const activeElement = DOCUMENT.activeElement;

			if (doFocus !== undefined) {
				if (doFocus) {
					if (!self.isFocused()) {
						if (_self.setFocus) {
							_self.setFocus();
						}
						else if (_self.mainControl !== self) {
							_self.mainControl.isFocused(true);
						}
						else {
							_self.mainControl.element.focus();
						}
					}
				}
				else if (self.isFocused()) {
					activeElement.blur();
				}

				return self;
			}

			if (_self.getFocus) {
				return _self.getFocus(activeElement);
			}
			else if (_self.mainControl !== self && _self.subControl === undefined) {
				return _self.mainControl.isFocused();
			}

			return !self.element ? false : (self.element === activeElement || self.element.contains(activeElement));
		}

		setFocusControl(control) {
			const self = this;
			const _self = _(self);

			if (_self.mainControl !== undefined) {
				_self.mainControl
					.off(FOCUS_IN_EVENT)
					.off(FOCUS_OUT_EVENT);
			}

			_self.mainControl = control;

			self[setFocusEvent](self.onFocus());
			self[setBlurEvent](self.onBlur());
		}
	}

	Object.assign(FocusMixin.prototype, {
		/**
		 * Adds a callback that is triggered when the control gets focus
		 *
		 * @method onFocus
		 * @member module:FocusMixin
		 * @instance
		 * @param {Function} callback
		 * @returns {queue}
		 */
		onFocus: methodQueue({
			set: setFocusEvent
		}),

		/**
		 * Adds a callback that is triggered when the control loses focus
		 *
		 * @method onBlur
		 * @member module:FocusMixin
		 * @instance
		 * @param {Function} callback
		 * @returns {queue}
		 */
		onBlur: methodQueue({
			set: setBlurEvent
		})
	});

	return FocusMixin;
};
