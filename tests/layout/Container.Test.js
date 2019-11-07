import { Container } from '../../src';
import ControlTests from '../ControlTests';
import TestUtil from '../TestUtil';

describe('Container', () => {
	const testUtil = new TestUtil(Container);
	const controlTests = new ControlTests(Container, testUtil);

	controlTests.run([], ['focus']);
});
