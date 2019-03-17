import { BackDrop } from '../../../src';
import TestUtil from '../../TestUtil';
import ControlBaseTests from '../ControlBaseTests';

const testUtil = new TestUtil(BackDrop);
const controlBaseTests = new ControlBaseTests(BackDrop, testUtil);

describe('BackDrop', () => {
	controlBaseTests.run(['container', 'stopPropagation']);
});
