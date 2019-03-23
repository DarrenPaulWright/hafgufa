import { Popup } from '../../../src';
import TestUtil from '../../TestUtil';
import ControlBaseTests from '../ControlBaseTests';

const testUtil = new TestUtil(Popup);
const controlBaseTests = new ControlBaseTests(Popup, testUtil, {
	extraSettings: {
		isFocusable: true
	},
	focusableElement: '.popup'
});

describe('Popup', () => {
	controlBaseTests.run(['container', 'ID', 'stopPropagation'], ['focus']);
});
