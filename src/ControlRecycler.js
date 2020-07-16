import { clone } from 'object-agent';
import { applySettings, methodFunction, methodObject } from 'type-enforcer-ui';

const VISIBLES = Symbol();
const DISCARDED = Symbol();

/**
 * Instead of creating and destroying controls in rapid succession, recycle them!
 *
 * @class ControlRecycler
 * @constructor
 */
export default class ControlRecycler {
	constructor(settings) {
		this[VISIBLES] = [];
		this[DISCARDED] = [];

		if (settings !== undefined) {
			applySettings(this, settings);
		}
	}
}

Object.assign(ControlRecycler.prototype, {
	/**
	 * @method control
	 * @member module:ControlRecycler
	 * @instance
	 * @param {constructor} [newControl]
	 * @returns {constructor|this}
	 */
	control: methodFunction({
		bind: false
	}),

	/**
	 * @method defaultSettings
	 * @member module:ControlRecycler
	 * @instance
	 * @param {Object} [newDefaultSettings]
	 * @returns {Object|this}
	 */
	defaultSettings: methodObject({
		other: undefined
	}),

	/**
	 * If there are discarded controls available then return one of those, otherwise instantiate a new control.
	 * @method getRecycledControl
	 * @member module:ControlRecycler
	 * @instance
	 * @param {Boolean} [doPrepend=false]
	 * @returns {Object}
	 */
	getRecycledControl(doPrepend = false) {
		const Control = this.control();

		if (Control !== undefined) {
			const control = this[DISCARDED].length !== 0 && this[DISCARDED].shift() || new Control(clone(this.defaultSettings()));

			if (doPrepend) {
				this[VISIBLES].unshift(control);
			}
			else {
				this[VISIBLES].push(control);
			}

			return control;
		}
	},

	/**
	 * Get a visible control with a specific id
	 * @method getControl
	 * @member module:ControlRecycler
	 * @instance
	 * @param {String} [id]
	 * @returns {Object}
	 */
	getControl(id) {
		return this[VISIBLES].find((control) => control.id() === id);
	},

	/**
	 * Get an Array of all the visible controls
	 * @method getRenderedControls
	 * @member module:ControlRecycler
	 * @instance
	 * @returns {Object[]}
	 */
	getRenderedControls() {
		return this[VISIBLES];
	},

	/**
	 * Calls a callback for each rendered control
	 * @method each
	 * @member module:ControlRecycler
	 * @instance
	 * @param {Function} [callback] - provides a reference to the control and the index
	 * @returns {Object[]}
	 */
	each(callback) {
		this[VISIBLES].forEach(callback);
	},

	/**
	 * Calls a callback for each rendered control, returns the resulting array
	 *
	 * @method map
	 * @member module:ControlRecycler
	 * @instance
	 *
	 * @param {Function} [callback] - provides a reference to the control and the index
	 *
	 * @returns {Object[]}
	 */
	map(callback) {
		return this[VISIBLES].map(callback);
	},

	/**
	 * Discard a control that matches a specific id
	 * @method discardControl
	 * @member module:ControlRecycler
	 * @instance
	 * @param {String} [id]
	 */
	discardControl(id) {
		const index = this[VISIBLES].findIndex((control) => control.id() === id);

		if (index !== -1) {
			this[DISCARDED].push(this[VISIBLES][index].container(null));
			this[VISIBLES].splice(index, 1);
		}
	},

	/**
	 * Discard all the controls that are currently visible.
	 * @method discardAllControls
	 * @member module:ControlRecycler
	 * @instance
	 */
	discardAllControls() {
		while (this[VISIBLES].length > 0) {
			this[DISCARDED].push(this[VISIBLES].pop().container(null));
		}
	},

	/**
	 * Get a reference to a control at a specific offset.
	 *
	 * @method getControlAtOffset
	 * @member module:ControlRecycler
	 * @instance
	 *
	 * @param {Number} [controlOffset]
	 * @param {Boolean} [canCreateNew=false]
	 *
	 * @returns {Object}
	 */
	getControlAtOffset(controlOffset, canCreateNew = false) {
		return this[VISIBLES][controlOffset] || canCreateNew && this.getRecycledControl();
	},

	/**
	 * Gets the total number of controls that are currently visible.
	 * @method totalVisibleControls
	 * @member module:ControlRecycler
	 * @instance
	 * @returns {Number}
	 */
	totalVisibleControls() {
		return this[VISIBLES].length;
	},

	/**
	 * Prepares itself for deletion and removes all the controls it contains
	 * @method remove
	 * @member module:ControlRecycler
	 * @instance
	 */
	remove() {
		this[DISCARDED].forEach((control) => control.remove());
		this[DISCARDED].length = 0;
		
		this[VISIBLES].forEach((control) => control.remove());
		this[VISIBLES].length = 0;
	}
});
