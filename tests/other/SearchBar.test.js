import { SearchBar } from '../..';
import ControlTests from '../ControlTests';
import TestUtil from '../TestUtil';

describe('SearchBar', () => {
	const testUtil = new TestUtil(SearchBar);
	const controlTests = new ControlTests(SearchBar, testUtil);

	controlTests.run();
});
