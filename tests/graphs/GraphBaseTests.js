import { assert } from 'type-enforcer';
import { Thickness } from 'type-enforcer-ui';
import ControlHeadingMixinTests from '../mixins/ControlHeadingMixinTests.js';

const CONTROL = Symbol();
const TEST_UTIL = Symbol();

export default class GraphBaseTests extends ControlHeadingMixinTests {
	constructor(Control, testUtil, settings) {
		super(Control, testUtil, settings);

		const self = this;

		self[CONTROL] = Control;
		self[TEST_UTIL] = testUtil;
	}

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
