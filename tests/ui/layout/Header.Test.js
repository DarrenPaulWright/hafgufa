import { Header } from '../../../src';
import TestUtil from '../../TestUtil';
import ControlTests from '../ControlTests';

const testUtil = new TestUtil(Header);
const controlTests = new ControlTests(Header, testUtil);

describe('Header', () => {
	controlTests.run();
});
