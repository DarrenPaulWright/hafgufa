import { assert } from 'chai';
import { Thickness } from 'type-enforcer';
import ControlHeadingMixinTests from '../mixins/ControlHeadingMixinTests';

export default function GraphBaseTests(Control, testUtil, settings) {
	const self = this;

	ControlHeadingMixinTests.call(self, Control, testUtil, settings);

	self.svgElement = () => {
		it('should return an svg element when svgElement is called', () => {
			window.control = new Control({
				container: window.testContainer
			});

			assert.isTrue(window.control.svgElement() instanceof SVGElement);
		});
	};

	self.graphPadding = () => {
		testUtil.testMethod({
			methodName: 'graphPadding',
			defaultSettings: {
				container: window.testContainer
			},
			defaultValue: new Thickness(12),
			testValue: new Thickness(30),
			secondTestValue: new Thickness(50)
		});
	};

	self.color = () => {
		testUtil.testMethod({
			methodName: 'color',
			defaultSettings: {
				container: window.testContainer
			},
			defaultValue: '#b24f26',
			testValue: '#ffffff',
			secondTestValue: '#000000'
		});
	};

	self.data = () => {
		testUtil.testMethod({
			methodName: 'data',
			defaultSettings: {
				container: window.testContainer
			},
			defaultValue: [],
			testValue: [{}],
			secondTestValue: [{}, {}]
		});
	};

}
