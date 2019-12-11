import { benchSettings } from 'karma-webpack-bundle';
import { ControlRecycler } from '../index';

suite('ControlRecycler', () => {
	let sandbox = {};

	benchmark('init', () => {
		sandbox = new ControlRecycler();
	}, benchSettings);
});
