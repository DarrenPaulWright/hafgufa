import { benchSettings } from 'karma-webpack-bundle';
import { Button } from '../../index';
import controlBenchCommon from '../controlBenchCommon';

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
