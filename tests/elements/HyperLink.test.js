import { Hyperlink } from '../../index.js';
import ControlTests from '../ControlTests.js';
import TestUtil from '../TestUtil.js';

describe('Hyperlink', () => {
	const testUtil = new TestUtil(Hyperlink);
	const controlTests = new ControlTests(Hyperlink, testUtil, {
		focusableElement: 'HyperLink'
	});

	controlTests.run(['width', 'height', 'stopPropagation']);
});
