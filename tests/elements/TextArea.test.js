import { TextArea } from '../../index.js';
import TestUtil from '../TestUtil.js';

describe('TextArea', () => {
	const testUtil = new TestUtil(TextArea);
	testUtil.run({ skipTests: ['width', 'height'] });
});
