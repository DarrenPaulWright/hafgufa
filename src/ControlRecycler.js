import { clone } from 'object-agent';
import { applySettings, methodFunction, methodObject } from 'type-enforcer-ui';

const VISIBLES = Symbol();
const DISCARDED = Symbol();

/**
 * Instead of creating and destroying controls in rapid succession, recycle them!
 *
 * @class ControlRecycler
 * @constructor
 *
 * @param {object} settings
 */
export default class ControlRecycler {
	constructor(settings = {}) {
		this[VISIBLES] = [];
		this[DISCARDED] = [];

		applySettings(this, settings);
	}
}

Object.assign(ControlRecycler.prototype, {
	/**
	 * A reference to a Control.
	 *
	 * @method control
	 * @member module:ControlRecycler
	 * @instance
	 * @chainable
	 *
	 * @param {constructor} [newControl]
	 *
	 * @returns {constructor}
	 */
	control: methodFunction({
		bind: false
	}),

	/**
	 * Default settings to be applied to controls when created.
	 *
	 * @method defaultSettings
	 * @member module:ControlRecycler
	 * @instance
	 * @chainable
	 *
	 * @param {object} [newDefaultSettings]
	 *
	 * @returns {object}
	 */
	defaultSettings: methodObject({
		other: undefined
	}),

	/**
	 * If there are discarded controls available then return one of those, otherwise instantiate a new control.
	 *
	 * @method getRecycledControl
	 * @member module:ControlRecycler
	 * @instance
	 *
	 * @param {boolean} [doPrepend=false] - Add the control to the beginning fo the stack
	 *
	 * @returns {object}
	 */
	getRecycledControl(doPrepend = false) {
		const Control = this.control();

		if (Control !== undefined) {
			const control = this[DISCARDED].length === 0 ?
				new Control(clone(this.defaultSettings())) :
				this[DISCARDED].shift();

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
	 * Get a visible control with a specific id.
	 *
	 * @method getControl
	 * @member module:ControlRecycler
	 * @instance
	 *
	 * @param {string} id - The id of the control
	 *
	 * @returns {object}
	 */
	getControl(id) {
		return this[VISIBLES].find((control) => control.id() === id);
	},

	/**
	 * Get an array of all the visible controls.
	 *
	 * @method getRenderedControls
	 * @member module:ControlRecycler
	 * @instance
	 *
	 * @returns {object[]}
	 */
	getRenderedControls() {
		return this[VISIBLES];
	},

	/**
	 * Calls a callback for each rendered control.
	 *
	 * @method each
	 * @member module:ControlRecycler
	 * @instance
	 * @chainable
	 *
	 * @param {Function} [callback] - provides a reference to the control and the index
	 *
	 * @returns {object} this
	 */
	each(callback) {
		this[VISIBLES].forEach(callback);

		return this;
	},

	/**
	 * Calls a callback for each rendered control, returns the resulting array.
	 *
	 * @method map
	 * @member module:ControlRecycler
	 * @instance
	 *
	 * @param {Function} [callback] - provides a reference to the control and the index
	 *
	 * @returns {object[]}
	 */
	map(callback) {
		return this[VISIBLES].map(callback);
	},

	/**
	 * Discard a control that matches a specific id.
	 *
	 * @method discardControl
	 * @member module:ControlRecycler
	 * @instance
	 * @chainable
	 *
	 * @param {string} id - The id of the control
	 *
	 * @returns {object} this
	 */
	discardControl(id) {
		const index = this[VISIBLES].findIndex((control) => control.id() === id);

		if (index !== -1) {
			this[DISCARDED].push(this[VISIBLES][index].container(null));
			this[VISIBLES].splice(index, 1);
		}

		return this;
	},

	/**
	 * Discard all the controls that are currently visible.
	 *
	 * @method discardAllControls
	 * @member module:ControlRecycler
	 * @instance
	 * @chainable
	 *
	 * @returns {object} this
	 */
	discardAllControls() {
		while (this[VISIBLES].length > 0) {
			this[DISCARDED].push(this[VISIBLES].pop().container(null));
		}

		return this;
	},

	/**
	 * Get a reference to a control at a specific offset.
	 *
	 * @method getControlAtIndex
	 * @member module:ControlRecycler
	 * @instance
	 *
	 * @param {number} [index] - Index of the control
	 * @param {boolean} [canCreateNew=false] - Create a new control if there isn't one at index
	 *
	 * @returns {object}
	 */
	getControlAtIndex(index, canCreateNew = false) {
		return this[VISIBLES][index] ||
			(canCreateNew && this.getRecycledControl());
	},

	/**
	 * Gets the total number of controls that are currently visible.
	 *
	 * @method totalVisibleControls
	 * @member module:ControlRecycler
	 * @instance
	 * @returns {number}
	 */
	totalVisibleControls() {
		return this[VISIBLES].length;
	},

	/**
	 * Prepares itself for deletion and removes all the controls it contains.
	 *
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
