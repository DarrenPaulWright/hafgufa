import { Hyperlink } from '../../../src';
import TestUtil from '../../TestUtil';
import ControlTests from '../ControlTests';

describe('Hyperlink', () => {
	const testUtil = new TestUtil(Hyperlink);
	const controlTests = new ControlTests(Hyperlink, testUtil, {
		focusableElement: 'HyperLink'
	});

	controlTests.run(['width', 'height']);
});
