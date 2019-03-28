import { BackDrop } from '../../../src';
import TestUtil from '../../TestUtil';
import ControlTests from '../ControlTests';

const testUtil = new TestUtil(BackDrop);
const controlTests = new ControlTests(BackDrop, testUtil);

describe('BackDrop', () => {
	controlTests.run(['container', 'stopPropagation']);
});
