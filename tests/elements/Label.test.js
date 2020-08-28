import { Label } from '../../index.js';
import TestUtil from '../TestUtil.js';

describe('Label', () => {
	const testUtil = new TestUtil(Label);
	testUtil.run({ skipTests: ['width', 'height'] });
});
