import { Div } from '../../../src';
import TestUtil from '../../TestUtil';
import ControlTests from '../ControlTests';

describe('Div', () => {
	const testUtil = new TestUtil(Div);
	const controlTests = new ControlTests(Div, testUtil);

	controlTests.run();
});
