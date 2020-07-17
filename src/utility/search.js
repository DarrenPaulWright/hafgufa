const SPACES_REGEX = /[^\s",;]+|"([^"]*)"/ug;
const NO_SPACES_REGEX = /[^,;]+/ug;
const NEEDLE_REPLACE_REGEX = /^[ "]+|[ "]+$/ug;

/**
 * Sub string searching
 *
 * @module search
 */
const search = {
	/**
	 * Search a string for each word in the search.
	 *
	 * @memberOf module:search
	 * @static
	 * @function find
	 *
	 * @param {string}  needle - The string you want to find
	 * @param {string}  haystack - The string you want to find matches in
	 * @param {boolean} [breakOnSpaces=true] - Break multiple words into separate values
	 *
	 * @returns {boolean}
	 */
	find(needle, haystack, breakOnSpaces) {
		haystack = haystack.toLowerCase();

		return search.parseNeedle(needle, breakOnSpaces).some((subSearchs) => {
			return subSearchs.every((subSearch) => {
				subSearch = subSearch.toLowerCase();

				if (subSearch.charAt(0) === '-') {
					return !(subSearch.length > 1 && haystack.includes(subSearch.slice(1)));
				}

				return haystack.includes(subSearch);
			});
		});
	},
	/**
	 * Parse a search string.
	 *
	 * @memberOf module:search
	 * @static
	 * @function parseNeedle
	 *
	 * @param {string} needle - A search string
	 * @param {boolean} [breakOnSpaces=true] - Break multiple words into separate values
	 *
	 * @returns {Array}
	 */
	parseNeedle(needle, breakOnSpaces = true) {
		const REGEX = breakOnSpaces ? SPACES_REGEX : NO_SPACES_REGEX;

		return needle.split(' OR ')
			.map((orString) => {
				return (orString.match(REGEX) || [])
					.map((item) => item.replace(NEEDLE_REPLACE_REGEX, ''));
			});
	}
};

export default search;
