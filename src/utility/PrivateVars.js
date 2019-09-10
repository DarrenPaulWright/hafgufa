export default class PrivateVars extends WeakMap {
	constructor() {
		super();

		const output = (self) => this.get(self);
		output.set = (self, value = {}) => this.set(self, value);

		return output;
	}
}
