import { clone, deepEqual } from 'object-agent';
import { applySettings, methodFunction, methodInteger } from 'type-enforcer-ui';

const NO_ITEMS_INDEX = -1;

const HISTORY = Symbol();
const CURRENT_INDEX = Symbol();

const pushHistory = Symbol();

/**
 * A simple way to track and manipulate history objects.
 *
 * @class LocalHistory
 *
 * @param {object} settings
 */
export default class LocalHistory {
	constructor(settings = {}) {
		const self = this;
		self[HISTORY] = [];
		self[CURRENT_INDEX] = NO_ITEMS_INDEX;

		applySettings(self, settings);
	}

	/**
	 * Add or replace a history object on the history stack.
	 *
	 * @param {object} historyObject
	 *
	 * @returns {boolean} - Successful push = 'true'; Failed push = 'false'
	 */
	[pushHistory](historyObject) {
		const self = this;
		let pushed = false;

		if (!deepEqual(historyObject, self[HISTORY][self[CURRENT_INDEX]])) {
			if (self.hasFuture()) {
				while (self[HISTORY].length > self[CURRENT_INDEX] + 1) {
					self[HISTORY].pop();
				}
			}
			self[HISTORY].push(clone(historyObject));
			pushed = true;
			if (self.max() && self[HISTORY].length > self.max()) {
				self[HISTORY].shift();
			}
			self[CURRENT_INDEX] = self[HISTORY].length - 1;

			if (self.onPush()) {
				self.onPush()(self[HISTORY][self[CURRENT_INDEX]]);
			}
		}

		return pushed;
	}

	/**
	 * Save an object to history.
	 *
	 * @method push
	 * @memberOf LocalHistory
	 * @instance
	 * @param {Function} historyObject - Object to be returned when 'undo' is called.
	 */
	push(historyObject) {
		return this[pushHistory](historyObject);
	}

	/**
	 * Replace the most recent object in history.
	 *
	 * @method replace
	 * @memberOf LocalHistory
	 * @instance
	 * @param {Function} historyObject - Object to be returned when 'undo' is called.
	 */
	replace(historyObject) {
		const hasHistory = this.hasHistory();

		this[HISTORY].pop();
		return hasHistory ? this[pushHistory](historyObject) : false;
	}

	/**
	 * Undo and return the most recent history object.
	 *
	 * @method undo
	 * @memberOf LocalHistory
	 * @instance
	 * @returns {object} - Object added through 'push' or 'replace'.
	 */
	undo() {
		const self = this;

		if (self.hasHistory()) {
			self[CURRENT_INDEX] = Math.max(NO_ITEMS_INDEX, self[CURRENT_INDEX] - 1);

			if (self.onUndo()) {
				self.onUndo()(self[HISTORY][self[CURRENT_INDEX]]);
			}
		}

		return self[HISTORY][self[CURRENT_INDEX]];
	}

	redo() {
		const self = this;

		if (self.hasFuture()) {
			self[CURRENT_INDEX] = Math.min(self[HISTORY].length + 1, self[CURRENT_INDEX] + 1);

			if (self.onRedo()) {
				self.onRedo()(self[HISTORY][self[CURRENT_INDEX]]);
			}
		}

		return self;
	}

	/**
	 * Check if this instance has any history.
	 *
	 * @method hasHistory
	 * @memberOf LocalHistory
	 * @instance
	 * @returns {boolean}
	 */
	hasHistory() {
		return this[CURRENT_INDEX] > NO_ITEMS_INDEX + 1;
	}

	/**
	 * Check if this instance has any future items.
	 *
	 * @method hasFuture
	 * @memberOf LocalHistory
	 * @instance
	 *
	 * @returns {boolean}
	 */
	hasFuture() {
		return this[HISTORY].length > this[CURRENT_INDEX] + 1;
	}

	/**
	 * Delete all history objects.
	 *
	 * @method clear
	 * @memberOf LocalHistory
	 * @instance
	 */
	clear() {
		this[HISTORY].length = 0;
		this[CURRENT_INDEX] = NO_ITEMS_INDEX;
	}

	remove() {
		this.clear();
	}
}

Object.assign(LocalHistory.prototype, {
	max: methodInteger({
		init: 0
	}),
	onPush: methodFunction(),
	onUndo: methodFunction(),
	onRedo: methodFunction()
});
