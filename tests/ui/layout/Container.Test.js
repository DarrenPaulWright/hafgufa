import Container from '../../../src/ui/layout/Container';
import TestUtil from '../../TestUtil';
import ControlBaseTests from '../ControlBaseTests';

const testUtil = new TestUtil(Container);
const controlBaseTests = new ControlBaseTests(Container, testUtil);

describe('Container', () => {
	controlBaseTests.run([], ['focus']);
});
