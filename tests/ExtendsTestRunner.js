import { forOwn } from 'object-agent';
import { isFunction } from 'type-enforcer';
import { castArray } from 'type-enforcer-ui';

const TEST_ID = 'testId';
const forceSkipTests = ['run', 'buildSettings', 'focus', 'onChange'];

export const CONTROL = Symbol();
export const TEST_UTIL = Symbol();
export const SETTINGS = Symbol();

/**
 * @param object
 * @param callback
 */
function forIn(object, callback) {
	const allProperties = ['constructor', '__defineGetter__', '__defineSetter__'];
	let proto = Object.getPrototypeOf(object);

	while (proto) {
		Object.getOwnPropertyNames(proto)
			.forEach((key) => {
				if (isFunction(proto[key]) && !allProperties.includes(key)) {
					allProperties.push(key);
					callback(key);
				}
			});

		proto = Object.getPrototypeOf(proto);
	}
}

export default class ExtendsTestRunner {
	constructor(Control, testUtil) {
		const self = this;

		self[CONTROL] = Control;
		self[TEST_UTIL] = testUtil;
	}

	buildSettings(localSettings) {
		const self = this;

		return {
			id: TEST_ID,
			container: self[TEST_UTIL].container,
			delay: 0,
			fade: false,
			...self[SETTINGS].extraSettings,
			...localSettings
		};
	}

	run(name, settings = {}) {
		const self = this;
		const skipTests = castArray(settings.skipTests).concat(forceSkipTests);

		self[SETTINGS] = settings;

		describe('⇐ ' + name, () => {
			forIn(self, (method) => {
				if (!skipTests.includes(method)) {
					describe('.' + method, () => {
						self[method]();
					});
				}
			});

			forOwn(settings.extraTests, (value, key) => {
				if (self[key]) {
					describe('.' + key, () => {
						self[key](value);
					});
				}
			});
		});
	}
}
