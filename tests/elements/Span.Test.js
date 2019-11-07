import { Span } from '../../src';
import ControlTests from '../ControlTests';
import TestUtil from '../TestUtil';

describe('Span', () => {
	const testUtil = new TestUtil(Span);
	const controlTests = new ControlTests(Span, testUtil);

	controlTests.run(['width', 'height']);
});
