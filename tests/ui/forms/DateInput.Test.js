import { DateInput } from '../../../src';
import TestUtil from '../../TestUtil';
import FormControlTests from './FormControlTests';

const testUtil = new TestUtil(DateInput);
const formControlTests = new FormControlTests(DateInput, testUtil);

describe('DateInput', () => {
	formControlTests.run();
});
