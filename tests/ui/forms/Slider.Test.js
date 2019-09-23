import { Slider } from '../../../src';
import TestUtil from '../../TestUtil';
import FormControlTests from './FormControlTests';

describe('Slider', () => {
	const testUtil = new TestUtil(Slider);
	const formControlTests = new FormControlTests(Slider, testUtil);

	formControlTests.run();
});
