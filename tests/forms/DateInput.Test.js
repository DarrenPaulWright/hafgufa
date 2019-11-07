import { DateInput } from '../..';
import TestUtil from '../TestUtil';
import FormControlTests from './FormControlTests';

describe('DateInput', () => {
	const testUtil = new TestUtil(DateInput);
	const formControlTests = new FormControlTests(DateInput, testUtil);

	formControlTests.run();
});
