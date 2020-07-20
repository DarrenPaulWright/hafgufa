import { erase, forOwn } from 'object-agent';
import { castArray, isString } from 'type-enforcer-ui';

const indexControl = Symbol();
const discardControl = Symbol();
const CONTROLS = Symbol();
const IDS = Symbol();

/**
 * @class ControlManager
 * @class
 */
export default class ControlManager {
	constructor() {
		this[CONTROLS] = [];
		this[IDS] = {};
	}

	[indexControl](control) {
		if (control.id !== undefined && control.id() !== undefined) {
			this[IDS][control.id()] = control;
		}
	}

	[discardControl](control, removeOnRemove = false) {
		const self = this;
		const index = self[CONTROLS].findIndex((data) => data.control === control);

		if (index !== -1) {
			if (removeOnRemove) {
				control.onPreRemove().discard(self[CONTROLS][index].onPreRemoveId);
			}

			self[CONTROLS].splice(index, 1);

			if (control.id()) {
				erase(self[IDS], control.id());
			}
		}
	}

	add(input) {
		const self = this;

		castArray(input).forEach((control) => {
			self[CONTROLS].push({
				control,
				onPreRemoveId: control.onPreRemove().add(function() {
					self[discardControl](this);
				})
			});

			self[indexControl](control);
		});

		return self;
	}

	discard(input) {
		const self = this;

		self[discardControl](isString(input) ? self[IDS][input] : input, true);

		return self;
	}

	update(control) {
		const self = this;

		forOwn(self[IDS], (thisControl, id) => {
			if (thisControl === control) {
				return erase(self[IDS], id);
			}
		});

		self[indexControl](control);
	}

	get(id) {
		return this[IDS][id] || this[CONTROLS].reduce((result, data) => {
			return result || (data.control.get !== undefined && data.control.get(id));
		}, undefined);
	}

	each(callback) {
		if (callback) {
			this[CONTROLS].some((data, index) => callback(data.control, index));
		}
	}

	map(callback) {
		if (callback) {
			return this[CONTROLS].map((data, index) => callback(data.control, index));
		}
	}

	remove(input) {
		const self = this;

		if (input !== undefined) {
			input.id === undefined && !(input = self[IDS][input]) || input.remove();
		}
		else {
			while (self[CONTROLS].length !== 0) {
				self[CONTROLS][0].control.remove();
			}
		}

		return self;
	}

	get length() {
		return this[CONTROLS].length;
	}
}
