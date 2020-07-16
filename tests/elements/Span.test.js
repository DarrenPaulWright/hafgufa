import { Span } from '../../index.js';
import ControlTests from '../ControlTests.js';
import TestUtil from '../TestUtil.js';

describe('Span', () => {
	const testUtil = new TestUtil(Span);
	const controlTests = new ControlTests(Span, testUtil);

	controlTests.run(['width', 'height']);
});
