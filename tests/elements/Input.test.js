import { Input } from '../../index.js';
import TestUtil from '../TestUtil.js';

describe('Input', () => {
	const testUtil = new TestUtil(Input);
	testUtil.run({ skipTests: ['width', 'height'] });
});
