import { forOwn } from 'object-agent';

const callIfExists = (func, argument1, argument2, argument3) => {
	if (func) {
		return func(argument1, argument2, argument3);
	}
};

/**
 * Object helper functions.
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
	 * @arg {Object} control - The control to apply the settings to; Usually "self".
	 * @arg {Object} settings
	 * @arg {boolean} [forceSave]
	 * @arg {Array}  [priorityList=[]] - Array of method names to apply first, if the are actually in the settings. Methods are called in the order provided in this array.
	 * @arg {Array}  [deferedList=[]] - Array of method names to apply last, if the are actually in the settings. Methods are called in the order provided in this array.
	 */
	applySettings: function(control, settings, forceSave, priorityList = [], deferedList = []) {
		const mainList = Object.keys(settings)
			.filter((method) => !deferedList.includes(method) && !priorityList.includes(method));
		const apply = (method) => {
			if (method in settings && method in control) {
				control[method](settings[method], forceSave);
			}
		};

		priorityList.forEach(apply);
		mainList.forEach(apply);
		deferedList.forEach(apply);
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
