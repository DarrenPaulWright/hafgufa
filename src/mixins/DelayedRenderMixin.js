import { clear, delay } from 'async-agent';
import { method, PrivateVars } from 'type-enforcer-ui';

/**
 * @function start
 */
const start = function() {
	const _self = _(this);

	_self.delayTimer = delay(_self.onRender, this.delay() * 1000);
};

/**
 * @function stop
 */
const stop = function() {
	clear(_(this).delayTimer);
};

const _ = new PrivateVars();

/**
 * Delays the rendering of a control
 *
 * @module DelayedRenderMixin
 * @constructor
 */
export default (Base) => {
	class DelayedRenderMixin extends Base {
		constructor(settings = {}) {
			super(settings);

			_.set(this, {
				onRender: settings.onRender.bind(this)
			});
			start.call(this);
			this.onRemove(stop);
		}
	}

	Object.assign(DelayedRenderMixin.prototype, {
		/**
		 * Get or set the render delay time
		 * @method delay
		 * @member module:DelayedRenderMixin
		 * @instance
		 * @arg {number} delay
		 * @returns {number|this}
		 */
		delay: method.number({
			init: 0.2,
			min: 0,
			set(delay) {
				stop.call(this);
				if (delay) {
					start.call(this);
				}
				else {
					_(this).onRender();
				}
			}
		})
	});

	return DelayedRenderMixin;
}
