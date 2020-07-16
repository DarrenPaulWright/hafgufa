import { SearchBar } from '../../index.js';
import ControlTests from '../ControlTests.js';
import TestUtil from '../TestUtil.js';

describe('SearchBar', () => {
	const testUtil = new TestUtil(SearchBar);
	const controlTests = new ControlTests(SearchBar, testUtil);

	controlTests.run();
});
