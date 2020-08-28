import { Hyperlink } from '../../index.js';
import TestUtil from '../TestUtil.js';

describe('Hyperlink', () => {
	const testUtil = new TestUtil(Hyperlink);
	testUtil.run({
		skipTests: ['width', 'height', 'stopPropagation'],
		focusableElement: 'HyperLink'
	});
});
