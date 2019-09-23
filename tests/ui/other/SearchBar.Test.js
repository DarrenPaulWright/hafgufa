import { SearchBar } from '../../../src';
import TestUtil from '../../TestUtil';
import ControlTests from '../ControlTests';

describe('SearchBar', () => {
	const testUtil = new TestUtil(SearchBar);
	const controlTests = new ControlTests(SearchBar, testUtil);

	controlTests.run();
});
