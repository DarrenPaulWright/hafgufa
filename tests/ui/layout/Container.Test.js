import Container from '../../../src/ui/layout/Container';
import TestUtil from '../../TestUtil';
import ControlTests from '../ControlTests';

const testUtil = new TestUtil(Container);
const controlTests = new ControlTests(Container, testUtil);

describe('Container', () => {
	controlTests.run([], ['focus']);
});
