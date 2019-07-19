import { clear, delay } from 'async-agent';
import { method } from 'type-enforcer';

/**
 * @function start
 */
const start = function() {
	this[DELAY_TIMER] = delay(this[ON_RENDER], this.delay() * 1000);
};

/**
 * @function stop
 */
const stop = function() {
	clear(this[DELAY_TIMER]);
};

const ON_RENDER = Symbol();
const DELAY_TIMER = Symbol();

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

			this[ON_RENDER] = settings.onRender;
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
			set: function(delay) {
				stop.call(this);
				if (delay) {
					start.call(this);
				}
				else {
					this[ON_RENDER].call(this);
				}
			}
		})
	});

	return DelayedRenderMixin;
}
