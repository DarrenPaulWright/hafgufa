import { clone, deepEqual } from 'object-agent';
import { applySettings, method } from 'type-enforcer';

const NO_ITEMS_INDEX = -1;

const HISTORY = Symbol();
const CURRENT_INDEX = Symbol();

const pushHistory = Symbol();

/**
 * A simple way to track and manipulate history objects.
 *
 * @class LocalHistory
 * @constructor
 *
 * @arg {Object} settings
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
	 * @function pushHistory
	 *
	 * @return {Boolean} - Successful push = 'true'; Failed push = 'false'
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
	 * @method push
	 * @member module:LocalHistory
	 * @instance
	 * @arg {Function} historyObject - Object to be returned when 'undo' is called.
	 */
	push(historyObject) {
		return this[pushHistory](historyObject);
	}

	/**
	 * Replace the most recent object in history.
	 * @method replace
	 * @member module:LocalHistory
	 * @instance
	 * @arg {Function} historyObject - Object to be returned when 'undo' is called.
	 */
	replace(historyObject) {
		const hasHistory = this.hasHistory();

		this[HISTORY].pop();
		return hasHistory ? this[pushHistory](historyObject) : false;
	}

	/**
	 * Undo and return the most recent history object.
	 * @method undo
	 * @member module:LocalHistory
	 * @instance
	 * @return {Object} - Object added through 'push' or 'replace'.
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
	 * @method hasHistory
	 * @member module:LocalHistory
	 * @instance
	 * @return {Boolean}
	 */
	hasHistory() {
		return this[CURRENT_INDEX] > NO_ITEMS_INDEX + 1;
	}

	/**
	 * Check if this instance has any future items.
	 *
	 * @method hasFuture
	 * @member module:LocalHistory
	 * @instance
	 *
	 * @return {Boolean}
	 */
	hasFuture() {
		return this[HISTORY].length > this[CURRENT_INDEX] + 1;
	}

	/**
	 * Delete all history objects.
	 * @method clear
	 * @member module:LocalHistory
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
	max: method.integer({
		init: 0
	}),
	onPush: method.function(),
	onUndo: method.function(),
	onRedo: method.function()
});
