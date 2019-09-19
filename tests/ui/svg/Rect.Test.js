import { Rect } from '../../../src';
import TestUtil from '../../TestUtil';
import ControlTests from '../ControlTests';

const testUtil = new TestUtil(Rect, true);
const controlTests = new ControlTests(Rect, testUtil);

describe('Rect', () => {
	controlTests.run(['height', 'width']);
});
