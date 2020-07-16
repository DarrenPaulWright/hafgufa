import { benchSettings } from 'karma-webpack-bundle';
import { Span } from '../../index.js';
import controlBenchCommon from '../controlBenchCommon.js';

suite('Span', () => {
	let span = new Span();

	controlBenchCommon(Span);

	benchmark('text', () => {
		span.text('test');
	}, {
		...benchSettings,
		onCycle() {
			span = new Span();
		}
	});

	benchmark('html (text only)', () => {
		span.html('test');
	}, {
		...benchSettings,
		onCycle() {
			span = new Span();
		}
	});

	benchmark('html (actual html)', () => {
		span.html('<br>test');
	}, {
		...benchSettings,
		onCycle() {
			span = new Span();
		}
	});
});
