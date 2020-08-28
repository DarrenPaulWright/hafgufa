import { EditRectangle } from '../../index.js';
import TestUtil from '../TestUtil.js';

describe('EditRectangle', () => {
	const testUtil = new TestUtil(EditRectangle, true);
	testUtil.run({ skipTests: ['height', 'width'] });
});
