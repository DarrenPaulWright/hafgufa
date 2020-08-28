import { Container } from '../../index.js';
import TestUtil from '../TestUtil.js';

describe('Container', () => {
	const testUtil = new TestUtil(Container);
	testUtil.run({
		extraTests: { focus: true }
	});
});
