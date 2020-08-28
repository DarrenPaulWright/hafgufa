import { assert } from 'type-enforcer';
import { Thickness } from 'type-enforcer-ui';
import extendsTestRegister from '../extendsTestRegister.js';
import ExtendsTestRunner, { CONTROL, TEST_UTIL } from '../ExtendsTestRunner.js';

export default class GraphBaseTests extends ExtendsTestRunner {
	svgElement() {
		const self = this;

		it('should return an svg element when svgElement is called', () => {
			self[TEST_UTIL].control = new self[CONTROL](self.buildSettings());

			assert.is(self[TEST_UTIL].control.svgElement() instanceof SVGElement, true);
		});
	}

	graphPadding() {
		const self = this;

		self[TEST_UTIL].testMethod({
			methodName: 'graphPadding',
			defaultSettings: {
				container: self[TEST_UTIL].container
			},
			defaultValue: new Thickness(12),
			testValue: new Thickness(30),
			secondTestValue: new Thickness(50)
		});
	}

	color() {
		const self = this;

		self[TEST_UTIL].testMethod({
			methodName: 'color',
			defaultSettings: {
				container: self[TEST_UTIL].container
			},
			defaultValue: '#b24f26',
			testValue: '#ffffff',
			secondTestValue: '#000000'
		});
	}

	data() {
		const self = this;

		self[TEST_UTIL].testMethod({
			methodName: 'data',
			defaultSettings: {
				container: self[TEST_UTIL].container
			},
			defaultValue: [],
			testValue: [{}],
			secondTestValue: [{}, {}]
		});
	}
}

extendsTestRegister.register('GraphBase', GraphBaseTests);
