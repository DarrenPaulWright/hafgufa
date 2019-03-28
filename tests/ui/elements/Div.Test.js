import { Div } from '../../../src';
import TestUtil from '../../TestUtil';
import ControlTests from '../ControlTests';

const testUtil = new TestUtil(Div);
const controlTests = new ControlTests(Div, testUtil);

describe('Div', () => {
	controlTests.run();
});
