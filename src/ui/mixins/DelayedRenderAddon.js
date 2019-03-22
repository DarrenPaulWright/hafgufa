import { clear, delay } from 'async-agent';
import { method } from 'type-enforcer';

/**
 * <p>Delays the rendering of a control</p>
 *
 * @module DelayedRenderAddon
 * @constructor
 */
export default function DelayedRenderAddon(onRender) {
	const self = this;
	let delayedBuildTimer;

	/**
	 * @function construct
	 */
	const construct = () => {
		start();
		self.onRemove(stop);
	};

	/**
	 * @function start
	 */
	const start = () => {
		delayedBuildTimer = delay(onRender, self.delay() * 1000);
	};

	/**
	 * @function stop
	 */
	const stop = () => {
		clear(delayedBuildTimer);
	};

	/**
	 * Get or set the render delay time
	 * @method delay
	 * @member module:DelayedRenderAddon
	 * @instance
	 * @arg {number} delay
	 * @returns {number|this}
	 */
	self.delay = method.number({
		init: 0.2,
		min: 0,
		set: function(delay) {
			stop();
			if (delay) {
				start();
			}
			else {
				onRender();
			}
		}
	});

	construct();
}
