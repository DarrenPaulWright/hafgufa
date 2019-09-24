import { Container } from '../../../src';
import TestUtil from '../../TestUtil';
import ControlTests from '../ControlTests';

describe('Container', () => {
	const testUtil = new TestUtil(Container);
	const controlTests = new ControlTests(Container, testUtil);

	controlTests.run([], ['focus']);
});
