import { Popup } from '../../../src';
import TestUtil from '../../TestUtil';
import ControlTests from '../ControlTests';

const testUtil = new TestUtil(Popup);
const controlTests = new ControlTests(Popup, testUtil, {
	extraSettings: {
		isFocusable: true
	},
	focusableElement: '.popup'
});

describe('Popup', () => {
	controlTests.run(['container', 'ID', 'stopPropagation'], ['focus']);
});
