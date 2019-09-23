import { Header } from '../../../src';
import TestUtil from '../../TestUtil';
import ControlTests from '../ControlTests';

describe('Header', () => {
	const testUtil = new TestUtil(Header);
	const controlTests = new ControlTests(Header, testUtil);

	controlTests.run();
});
