import { Span } from '../../../src';
import TestUtil from '../../TestUtil';
import ControlTests from '../ControlTests';

describe('Span', () => {
	const testUtil = new TestUtil(Span);
	const controlTests = new ControlTests(Span, testUtil);

	controlTests.run(['width', 'height']);
});
