import getBrowserLanguage from 'get-browser-language';
import { forOwn } from 'object-agent';
import { Enum, methodObject, methodQueue, methodString } from 'type-enforcer-ui';
import assign from './assign.js';

const strings = {};

/**
 * Loads and interacts with localized strings
 *
 * @module locale
 */
const locale = {
	/**
	 * Supported languages. If the [browser language](https://github.com/gummesson/get-browser-language) matches a supported language, then locale.language is set to that language, which can be overridden by calling locale.language after setting locale.languages
	 *
	 * @method languages
	 * @memberOf locale
	 * @default {English: 'en-us'}
	 *
	 * @param {object} languages - An object with supported languages. Keys should be human readable names, the values are used when loading files
	 *
	 * @returns {object}
	 */
	languages: methodObject({
		init: { English: 'en-US' },
		set(languages) {
			const browser = getBrowserLanguage();

			if (new Enum(languages).has(browser.toLowerCase())) {
				locale.language(browser);
			}
			else {
				forOwn(languages, (value) => {
					locale.language(value);
					return true;
				});
			}
		}
	}),
	/**
	 * The language used when loading files. Sets the lang attribute of the HTML tag to the language.
	 *
	 * @method language
	 * @memberOf locale
	 *
	 * @param {string} language
	 *
	 * @returns {string}
	 */
	language: methodString({
		set(language) {
			document.querySelector('html').setAttribute('lang', language);
			locale.onLanguageChange().trigger(null, [language]);
		}
	}),
	/**
	 * A format string used by locale.load.
	 *
	 * @method urlFormat
	 * @memberOf locale
	 * @default '[path]-[lang].json'
	 *
	 * @param {string} urlFormat - Has two tags, [path] which gets replaced by the path provided when clling locale.load, and [lang] which gets replaced by the lowercase value in locale.langugage
	 *
	 * @returns {string}
	 */
	urlFormat: methodString({
		init: '[path]-[lang].json'
	}),
	/**
	 * Loads .json files from a server and saves them for recall via locale.get.
	 *
	 * @method load
	 * @memberOf locale
	 *
	 * @param {...string} urls - One are more strings of files to load. The strings are formatted with locale.urlFormat.
	 *
	 * @returns {string}
	 */
	load(...urls) {
		const format = locale.urlFormat();
		const language = locale.language().toLowerCase();
		const options = {
			method: 'GET',
			headers: { 'Content-Type': 'application/json' }
		};

		return new Promise((resolve) => {
			Promise.all(urls.map((path) => {
					const url = format.replace('[path]', path).replace('[lang]', language);

					return fetch(url, options)
						.then((response) => response.json());
				}))
				.then((data) => {
					data.forEach((result) => {
						locale.set(result);
					});
					resolve(strings);
				});
		});
	},
	/**
	 * Set some strings directly. This function is called by locale.load after files are loaded.
	 *
	 * @method set
	 * @memberOf locale
	 *
	 * @param {object} newStrings
	 */
	set(newStrings) {
		assign(strings, newStrings);
	},
	/**
	 * Get named strings that have been added via locale.load or locale.set. Convert tags in localized strings into text
	 *
	 * @method get
	 * @memberOf locale
	 *
	 * @param {string} key - The key for a string
	 * @param {object} [replacer] - Replaces tags in strings with values. Keys should match a tag in the string wrapped like <tag>.
	 *
	 * @returns {string}
	 */
	get(key, replacer) {
		let output = strings[key] || '';

		if (replacer && output) {
			forOwn(replacer, (value, key) => {
				output = output.replace('<' + key + '>', value);
			});
		}

		return output;
	},
	/**
	 * Add a callback to be called whenever locale.language changes
	 *
	 * @method onLanguageChange
	 * @memberOf locale
	 *
	 * @param {Function} callback
	 *
	 * @returns {Queue}
	 */
	onLanguageChange: methodQueue()
};

export default locale;
