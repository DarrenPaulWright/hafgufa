import { assert } from 'chai';
import { Thickness } from 'type-enforcer-ui';
import ControlHeadingMixinTests from '../mixins/ControlHeadingMixinTests';

export default function GraphBaseTests(Control, testUtil, settings) {
	const self = this;

	ControlHeadingMixinTests.call(self, Control, testUtil, settings);

	self.svgElement = () => {
		it('should return an svg element when svgElement is called', () => {
			testUtil.control = new Control({
				container: testUtil.container
			});

			assert.isTrue(testUtil.control.svgElement() instanceof SVGElement);
		});
	};

	self.graphPadding = () => {
		testUtil.testMethod({
			methodName: 'graphPadding',
			defaultSettings: {
				container: testUtil.container
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
				container: testUtil.container
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
				container: testUtil.container
			},
			defaultValue: [],
			testValue: [{}],
			secondTestValue: [{}, {}]
		});
	};

}
