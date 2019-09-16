import { forOwn } from 'object-agent';
import { castArray, isString } from 'type-enforcer';
import PrivateVars from '../utility/PrivateVars';

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
		if (control.ID && control.ID()) {
			_(this).ids[control.ID()] = control;
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

			if (control.ID()) {
				delete _self.ids[control.ID()];
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

		forOwn(_self.ids, (thisControl, ID) => {
			if (thisControl === control) {
				delete _self.ids[ID];
				return true;
			}
		});

		self[indexControl](control);
	}

	get(ID) {
		const _self = _(this);
		let output = _self.ids[ID];

		if (!output) {
			_self.controls.some((data) => {
				return data.control.get ? Boolean(output = data.control.get(ID)) : false;
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
			if (!input.ID) {
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
