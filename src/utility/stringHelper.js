import { isArray, isObject } from 'type-enforcer';

/**
 * String helper functions.
 * @module stringHelper
 */
const stringHelper = {
	/**
	 * Search a string for each word in the search.
	 *
	 * @member module:stringHelper
	 * @static
	 * @function isEachInString
	 *
	 * @arg   {String}  needle - The string you want to find
	 * @arg   {String}  haystack - The string you want to find matches in
	 * @arg   {boolean} [breakOnSpaces=true]
	 *
	 * @returns {Boolean}
	 */
	isEachInString(needle, haystack, breakOnSpaces = true) {
		const searchSubString = (searchs) => {
			for (let i = 0, length = searchs.length; i < length; i++) {
				if (searchs[i].charAt(0) === '-') {
					if (searchs[i].length > 1 && haystack.includes(searchs[i].substring(1).toLowerCase())) {
						return false;
					}
				}
				else {
					if (!haystack.includes(searchs[i].toLowerCase())) {
						return false;
					}
				}
			}

			return true;
		};
		const parsedSearch = stringHelper.parseSearch(needle, breakOnSpaces);

		haystack = haystack.toLowerCase();

		for (let index = 0; index < parsedSearch.length; index++) {
			if (searchSubString(parsedSearch[index])) {
				return true;
			}
		}

		return false;
	},
	parseSearch: (string, breakOnSpaces = true) => {
		const SPACES_REGEX = /[^\s",;]+|"([^"]*)"/g;
		const NO_SPACES_REGEX = /[^,;]+/g;
		const REGEX = breakOnSpaces ? SPACES_REGEX : NO_SPACES_REGEX;

		return string.split(' OR ')
			.map((orString) => (orString.match(REGEX) || []).map((item) => item.replace(/^[" ]+|[" ]+$/g, '')));
	},
	/**
	 * Verify if a string or character is upper case.
	 * @member module:stringHelper
	 * @static
	 * @function isUpperCase
	 * @arg   {String} string
	 * @returns {Boolean}
	 */
	isUpperCase(string) {
		return (string === string.toUpperCase() && string !== string.toLowerCase());
	},
	/**
	 * Convert tags in localized strings into text
	 * @member module:stringHelper
	 * @static
	 * @function locStringReplace
	 * @arg   {String} locString - The localization string
	 * @arg   {Object} replaceObject
	 * @returns {String}
	 */
	locStringReplace(locString, replaceObject) {
		for (let replaceItem in replaceObject) {
			locString = locString.replace('<' + replaceItem + '>', replaceObject[replaceItem]);
		}
		return locString;
	},
	/**
	 * Clean a user input string before parsing it as JSON
	 * @member module:stringHelper
	 * @static
	 * @function cleanJson
	 * @arg   {String} json
	 * @returns {Boolean}
	 */
	cleanJson(json) {
		const validJson = stringHelper.isValidJson(json);

		return validJson ? JSON.stringify(validJson) : json;
	},
	/**
	 * Determine if a string can be parsed as valid JSON.
	 * @member module:stringHelper
	 * @static
	 * @function isValidJson
	 * @arg   {String} maybeJson
	 * @returns {Boolean|String}
	 */
	isValidJson(maybeJson) {
		try {
			return isObject(maybeJson) || isArray(maybeJson) ? maybeJson : JSON.parse(maybeJson);
		}
		catch (e) {
			return false;
		}
	},
	/**
	 * Beautify a json string for better human readability.
	 * @member module:stringHelper
	 * @static
	 * @function beautifyJson
	 * @arg   {String} json
	 * @returns {String}
	 */
	beautifyJson(json) {
		const validJson = stringHelper.isValidJson(json);

		return validJson ? JSON.stringify(validJson, null, 4) : json;
	}
};

export default stringHelper;
