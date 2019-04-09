import { SearchBar } from '../../../src';
import TestUtil from '../../TestUtil';
import ControlTests from '../ControlTests';

const testUtil = new TestUtil(SearchBar);
const controlTests = new ControlTests(SearchBar, testUtil);

describe('SearchBar', () => {
	controlTests.run();
});
