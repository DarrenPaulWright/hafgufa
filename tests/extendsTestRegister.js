const tests = [];

class ExtendsTestRegister {
	register(name, TestRunner) {
		if (!this.get(name)) {
			tests.push({ name, TestRunner });
		}
	}

	get(name) {
		return tests.find((test) => test.name === name);
	}
}

export default new ExtendsTestRegister();
