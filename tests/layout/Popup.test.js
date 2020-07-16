import { Popup } from '../../index.js';
import ControlTests from '../ControlTests.js';
import TestUtil from '../TestUtil.js';

describe('Popup', () => {
	const testUtil = new TestUtil(Popup);
	const controlTests = new ControlTests(Popup, testUtil, {
		extraSettings: {
			isFocusable: true
		},
		focusableElement: '.popup'
	});

	controlTests.run(['container', 'id', 'stopPropagation'], ['focus']);
});
