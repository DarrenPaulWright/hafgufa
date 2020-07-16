import { Header } from '../../index.js';
import ControlTests from '../ControlTests.js';
import TestUtil from '../TestUtil.js';

describe('Header', () => {
	const testUtil = new TestUtil(Header);
	const controlTests = new ControlTests(Header, testUtil);

	controlTests.run();
});
