import { DragPoint } from '../../index.js';
import TestUtil from '../TestUtil.js';

describe('DragPoint', () => {
	const testUtil = new TestUtil(DragPoint, true);
	testUtil.run({ skipTests: ['height', 'width', 'center', 'stretch'] });
});
