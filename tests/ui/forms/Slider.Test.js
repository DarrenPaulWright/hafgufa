import { Slider } from '../../../src';
import TestUtil from '../../TestUtil';
import FormControlTests from './FormControlTests';

const testUtil = new TestUtil(Slider);

const formControlTests = new FormControlTests(Slider, testUtil);

describe('Slider', () => {
	formControlTests.run();
});
