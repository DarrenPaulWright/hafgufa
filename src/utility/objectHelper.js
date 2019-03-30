import { forOwn } from 'object-agent';

const callIfExists = (func, argument1, argument2, argument3) => {
	if (func) {
		return func(argument1, argument2, argument3);
	}
};

/**
 * <p>Object helper functions.</p>
 * @module objectHelper
 */
const objectHelper = {
	/**
	 * Loops through the provided options and calls any methods of the same name.
	 *
	 * @method applySettings
	 * @member module:objectHelper
	 * @static
	 *
	 * @arg {Object} [control] - The control to apply the settings to; Usually "self".
	 * @arg {Object} [settings]
	 * @arg {boolean} [forceSave=false]
	 * @arg {Array}  [priorityList=[]] - Array of method names to apply first, if the are actually in the settings.
	 */
	applySettings: function(control, settings, forceSave, priorityList = []) {
		priorityList.forEach((method) => {
			if (method in settings && method in control) {
				control[method](settings[method], forceSave);
				delete settings[method];
			}
		});

		for (let method in settings) {
			if (method in control) {
				control[method](settings[method], forceSave);
			}
		}
	},

	/**
	 * Adds the methods from one control to another. If a method exists on the control
	 * getting extended it won't be added.
	 *
	 * @method applyMethods
	 * @member module:objectHelper
	 * @static
	 *
	 * @arg {Object} [controlTo]
	 * @arg {Object} [controlFrom]
	 */
	applyMethods: function(controlTo, controlFrom) {
		forOwn(controlFrom, (value, key) => {
			if (!controlTo[key]) {
				controlTo[key] = value;
			}
		});
	},

	/**
	 * Loops through the provided methods and calls the method with whatever the method returns
	 * @method resetMethods
	 * @member module:objectHelper
	 * @static
	 * @arg {Object} [control] - The control to apply the options to; Usually "self".
	 * @arg {Object} [methods]
	 */
	resetMethods: function(control, methods) {
		methods.forEach((method) => {
			if (control[method]) {
				control[method](control[method](), true);
			}
		});
	},

	/**
	 * If the first argument is truthy then call it with any extra arguments
	 * @method callIfExists
	 * @member module:objectHelper
	 * @static
	 * @arg {Function} [func] - The control to apply the options to; Usually "self".
	 * @arg {*} [argument1]
	 * @arg {*} [argument2]
	 * @arg {*} [argument3]
	 */
	callIfExists: callIfExists
};

export default objectHelper;
