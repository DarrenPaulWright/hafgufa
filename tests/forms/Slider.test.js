import { Slider } from '../../index.js';
import TestUtil from '../TestUtil.js';
import FormControlTests from './FormControlTests.js';

describe('Slider', () => {
	const testUtil = new TestUtil(Slider);
	const formControlTests = new FormControlTests(Slider, testUtil);

	formControlTests.run();
});
