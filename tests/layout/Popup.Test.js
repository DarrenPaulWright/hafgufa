import { Popup } from '../../src';
import ControlTests from '../ControlTests';
import TestUtil from '../TestUtil';

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
