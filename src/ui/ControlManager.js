import { castArray } from 'type-enforcer';

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
		let output = this[IDS][ID];

		if (!output) {
			this[CONTROLS].some((control) => {
				if (control.get) {
					output = control.get(ID);
					if (output) {
						return true;
					}
				}
			});
		}

		return output;
	}

	each(callback) {
		if (callback) {
			this[CONTROLS].some(callback);
		}
	}

	map(callback) {
		if (callback) {
			return this[CONTROLS].map(callback);
		}
	}

	total() {
		return this[CONTROLS].length;
	}

	remove(input) {
		if (input) {
			if (input.ID) {
				if (input.ID()) {
					input = input.ID();
				}
				else {
					input.remove();
					input = null;
				}
			}
			if (this.get(input)) {
				this.get(input).remove();
				delete this[IDS][input];
			}
		}
		else {
			while (this[CONTROLS].length) {
				this[CONTROLS][0].remove();
			}
			this[CONTROLS] = [];
			this[IDS] = {};
		}

		return this;
	}
}
