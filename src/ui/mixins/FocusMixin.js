import { defer } from 'async-agent';
import { method, PrivateVars } from 'type-enforcer';
import { DOCUMENT, FOCUS_IN_EVENT, FOCUS_OUT_EVENT } from '../../utility/domConstants';

const _ = new PrivateVars();

const onFocusCallback = Symbol();
const onBlurCallback = Symbol();

/**
 * Adds focus and blur related methods to a control.
 *
 * @mixin FocusMixin
 * @constructor
 *
 * @arg {class} [Base]
 */
export default (Base) => {
	class FocusMixin extends Base {
		constructor(settings = {}) {
			super(settings);

			const self = this;

			settings = settings.FocusMixin || {};

			_.set(self, {
				isAllBlurred: true,
				mainControl: settings.mainControl || self,
				subControl: settings.subControl,
				setFocus: settings.setFocus,
				getFocus: settings.getFocus,
				hasChildren: settings.hasChildren,
				isFocused: false
			});
		}

		/**
		 * Callback that is called when the control gets focus
		 *
		 * @function onFocusCallback
		 */
		[onFocusCallback](event) {
			const self = this;
			const _self = _(self);

			event.stopPropagation();

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
		 * @function onBlurCallback
		 */
		[onBlurCallback](event) {
			const self = this;
			const _self = _(self);

			event.stopPropagation();

			if (_self.subControl || _self.hasChildren) {
				_self.isFocused = false;

				defer(() => {
					if (!_self.isFocused) {
						_self.isAllBlurred = true;
						self.onBlur().trigger(null, [event]);
					}
				});
			}
			else {
				self.onBlur().trigger(null, [event]);
			}
		}

		/**
		 * Set focus on the text input element.
		 * @method focus
		 * @member module:FocusMixin
		 * @instance
		 */
		focus() {
			return this.isFocused(true);
		}

		/**
		 * Remove focus from this control if it is focused.
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
		 * @method isFocused
		 * @member module:FocusMixin
		 * @instance
		 * @returns {Boolean}
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
							_self.mainControl.element().focus();
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

			const element = self.element();

			return !element ? false : (element === activeElement || element.contains(activeElement));
		}
	}

	Object.assign(FocusMixin.prototype, {
		/**
		 * Adds a callback that is triggered when the control gets focus
		 * @method onFocus
		 * @member module:FocusMixin
		 * @instance
		 * @arg {Function} callback
		 * @returns {queue}
		 */
		onFocus: method.queue({
			set(queue) {
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
		}),

		/**
		 * Adds a callback that is triggered when the control loses focus
		 * @method onBlur
		 * @member module:FocusMixin
		 * @instance
		 * @arg {Function} callback
		 * @returns {queue}
		 */
		onBlur: method.queue({
			set(queue) {
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
		})
	});

	return FocusMixin;
};
