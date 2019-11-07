import { Header } from '../..';
import ControlTests from '../ControlTests';
import TestUtil from '../TestUtil';

describe('Header', () => {
	const testUtil = new TestUtil(Header);
	const controlTests = new ControlTests(Header, testUtil);

	controlTests.run();
});
