import { Span } from '../../index.js';
import TestUtil from '../TestUtil.js';

describe('Span', () => {
	const testUtil = new TestUtil(Span);
	testUtil.run({ skipTests: ['width', 'height'] });
});
