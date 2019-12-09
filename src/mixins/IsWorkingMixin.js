import { methodBoolean, methodString, PrivateVars } from 'type-enforcer-ui';
import IsWorking from '../display/IsWorking';

const _ = new PrivateVars();

/**
 * @module IsWorkingAddon
 * @constructor
 */
export default (Base) => {
	class IsWorkingMixin extends Base {
		constructor(settings) {
			super(settings);

			_.set(this);

			this.onRemove(function() {
				this.isWorking(false);
			});
		}
	}

	Object.assign(IsWorkingMixin.prototype, {
		/**
		 * Toggles the working animation
		 *
		 * @method isWorking
		 * @member module:IsWorkingAddon
		 * @instance
		 *
		 * @arg   {boolean} [isWorking]
		 *
		 * @returns {boolean|this}
		 */
		isWorking: methodBoolean({
			set(isWorking) {
				const _self = _(this);

				if (isWorking) {
					if (!_self.isWorking) {
						_self.isWorking = new IsWorking({
							container: this.element,
							label: this.isWorkingLabel(),
							onRemove() {
								_self.isWorking = null;
							}
						});
					}
					else {
						_self.isWorking.revive();
					}
				}
				else if (_self.isWorking) {
					_self.isWorking.remove();
				}
			}
		}),

		/**
		 * Get or set a string to display in the IsWorking control
		 *
		 * @method isWorkingLabel
		 * @member module:IsWorkingAddon
		 * @instance
		 *
		 * @arg   {string} [isWorkingLabel]
		 *
		 * @returns {string|this}
		 */
		isWorkingLabel: methodString({
			set(isWorkingLabel) {
				const _self = _(this);

				if (_self.isWorking) {
					_self.isWorking.label(isWorkingLabel);
				}
			}
		})
	});

	return IsWorkingMixin;
}
