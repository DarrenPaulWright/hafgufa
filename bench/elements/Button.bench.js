import { benchSettings } from 'karma-webpack-bundle';
import { Button } from '../../index.js';
import controlBenchCommon from '../controlBenchCommon.js';

suite('Button', () => {
	let sandbox = {};
	let settings;

	controlBenchCommon(Button);

	benchmark('label', () => {
		sandbox = new Button(settings);
	}, {
		...benchSettings,
		onCycle() {
			settings = {
				container: controlBenchCommon.buildContainer(),
				label: 'test'
			};
		}
	});
});
