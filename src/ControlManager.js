import { forOwn } from 'object-agent';
import { castArray, isString, PrivateVars } from 'type-enforcer-ui';

const _ = new PrivateVars();

const indexControl = Symbol();
const discardControl = Symbol();

/**
 * @class ControlManager
 * @constructor
 */
export default class ControlManager {
	constructor() {
		_.set(this, {
			controls: [],
			ids: {}
		});
	}

	[indexControl](control) {
		if (control.id && control.id()) {
			_(this).ids[control.id()] = control;
		}
	}

	[discardControl](control, removeOnRemove = false) {
		const self = this;
		const _self = _(self);
		const index = _self.controls.findIndex((data) => data.control === control);

		if (index !== -1) {
			if (removeOnRemove) {
				const data = _self.controls[index];
				data.control.onPreRemove().discard(data.onPreRemoveId);
			}

			_self.controls.splice(index, 1);

			if (control.id()) {
				delete _self.ids[control.id()];
			}
		}
	}

	add(input) {
		const self = this;
		const _self = _(self);

		castArray(input).forEach((control) => {
			_self.controls.push({
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
		this[discardControl](isString(input) ? _(this).ids[input] : input, true);

		return this;
	}

	update(control) {
		const _self = _(this);
		const self = this;

		forOwn(_self.ids, (thisControl, id) => {
			if (thisControl === control) {
				delete _self.ids[id];
				return true;
			}
		});

		self[indexControl](control);
	}

	get(id) {
		const _self = _(this);
		let output = _self.ids[id];

		if (!output) {
			_self.controls.some((data) => {
				return data.control.get ? Boolean(output = data.control.get(id)) : false;
			});
		}

		return output;
	}

	each(callback) {
		if (callback) {
			_(this).controls.some((data, index) => callback(data.control, index));
		}
	}

	map(callback) {
		if (callback) {
			return _(this).controls.map((data, index) => callback(data.control, index));
		}
	}

	total() {
		return _(this).controls.length;
	}

	remove(input) {
		const self = this;
		const _self = _(self);
		const controls = _self.controls;

		if (input) {
			if (!input.id) {
				input = _self.ids[input];
			}
			if (input) {
				input.remove();
			}
		}
		else {
			while (controls.length) {
				controls[0].control.remove();
			}
		}

		return self;
	}
}
