import { Container } from '../../index.js';
import ControlTests from '../ControlTests.js';
import TestUtil from '../TestUtil.js';

describe('Container', () => {
	const testUtil = new TestUtil(Container);
	const controlTests = new ControlTests(Container, testUtil);

	controlTests.run([], ['focus']);
});
