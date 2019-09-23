import { BackDrop } from '../../../src';
import TestUtil from '../../TestUtil';
import ControlTests from '../ControlTests';

describe('BackDrop', () => {
	const testUtil = new TestUtil(BackDrop);
	const controlTests = new ControlTests(BackDrop, testUtil);

	controlTests.run(['container', 'stopPropagation']);
});
