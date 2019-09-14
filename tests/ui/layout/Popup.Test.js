import { Popup } from '../../../src';
import TestUtil from '../../TestUtil';
import ControlTests from '../ControlTests';

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
