import { method } from 'type-enforcer';
import IsWorking from '../IsWorking';

const IS_WORKING = Symbol();

/**
 * @module IsWorkingAddon
 * @constructor
 */
export default (Base) => {
	class IsWorkingMixin extends Base {
		constructor(type, settings) {
			super(type, settings);

			const self = this;
			self.onRemove(() => {
				self.isWorking(false);
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
		isWorking: method.boolean({
			set: function(isWorking) {
				if (isWorking) {
					if (!this[IS_WORKING]) {
						this[IS_WORKING] = new IsWorking({
							container: this.element(),
							label: this.isWorkingLabel(),
							onRemove: function() {
								this[IS_WORKING] = null;
							}
						});
					}
					else {
						this[IS_WORKING].revive();
					}
				}
				else {
					this[IS_WORKING].remove();
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
		isWorkingLabel: method.string({
			set: function(newValue) {
				if (this[IS_WORKING]) {
					this[IS_WORKING].label(newValue);
				}
			}
		})
	});

	return IsWorkingMixin;
}
