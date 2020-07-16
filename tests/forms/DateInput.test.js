import { DateInput } from '../../index.js';
import TestUtil from '../TestUtil.js';
import FormControlTests from './FormControlTests.js';

describe('DateInput', () => {
	const testUtil = new TestUtil(DateInput);
	const formControlTests = new FormControlTests(DateInput, testUtil);

	formControlTests.run();
});
