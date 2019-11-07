import { Hyperlink } from '../../src';
import ControlTests from '../ControlTests';
import TestUtil from '../TestUtil';

describe('Hyperlink', () => {
	const testUtil = new TestUtil(Hyperlink);
	const controlTests = new ControlTests(Hyperlink, testUtil, {
		focusableElement: 'HyperLink'
	});

	controlTests.run(['width', 'height']);
});
