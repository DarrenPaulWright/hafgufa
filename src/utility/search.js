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
	 * @param {boolean} [breakOnSpaces=true]
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
	parseNeedle: (string, breakOnSpaces = true) => {
		const SPACES_REGEX = /[^\s",;]+|"([^"]*)"/g;
		const NO_SPACES_REGEX = /[^,;]+/g;
		const REGEX = breakOnSpaces ? SPACES_REGEX : NO_SPACES_REGEX;

		return string.split(' OR ')
			.map((orString) => {
				return (orString.match(REGEX) || [])
					.map((item) => {
						return item.replace(/^[ "]+|[ "]+$/g, '');
					});
			});
	}
};

export default search;
