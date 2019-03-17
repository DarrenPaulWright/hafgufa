import { castArray, isObject } from 'type-enforcer';

const CONTROLS = Symbol();
const IDS = Symbol();

/**
 * @class ControlManager
 * @constructor
 */
export default class ControlManager {
	constructor() {
		this[CONTROLS] = [];
		this[IDS] = {};
	}

	add(input) {
		const self = this;

		castArray(input).forEach((control) => {
			const cleanup = () => {
				self[CONTROLS].splice(self[CONTROLS].indexOf(control), 1);
				if (control.ID && control.ID()) {
					delete self[IDS][control.ID()];
				}
				control = null;
			};

			self[CONTROLS].push(control);
			if (control.ID && control.ID()) {
				self[IDS][control.ID()] = control;
			}

			if (control.onPreRemove) {
				control.onPreRemove(cleanup);
			}
			else {
				control.onRemove(cleanup);
			}
		});

		input = null;

		return this;
	}

	get(ID) {
		return this[IDS][ID];
	}

	each(callback) {
		this[CONTROLS].some(callback);
	}

	map(callback) {
		return this[CONTROLS].map(callback);
	}

	total() {
		return this[CONTROLS].length;
	}

	remove(input) {
		if (isObject(input)) {
			input.remove();
		}
		else if (input) {
			if (this.get(input)) {
				this.get(input).remove();
			}
		}
		else {
			while (this[CONTROLS].length) {
				this[CONTROLS][0].remove();
			}
		}
		input = null;

		return this;
	}
}
