import { Header } from '../../../src';
import TestUtil from '../../TestUtil';
import ControlBaseTests from '../ControlBaseTests';

const testUtil = new TestUtil(Header);
const controlBaseTests = new ControlBaseTests(Header, testUtil);

describe('Header', () => {
	controlBaseTests.run();
});
