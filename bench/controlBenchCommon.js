import { benchSettings } from 'karma-webpack-bundle';

const controlBenchCommon = function(Control) {
	let sandbox;
	let settings;

	benchmark('no settings', () => {
		sandbox = new Control();
	}, benchSettings);

	benchmark('container only', () => {
		sandbox = new Control(settings);
	}, {
		...benchSettings,
		onCycle() {
			settings = {
				container: controlBenchCommon.buildContainer()
			};
		}
	});
};

controlBenchCommon.buildContainer = () => {
	const element = document.createElement('div');

	document.body.append(element);

	return element;
};

export default controlBenchCommon;
