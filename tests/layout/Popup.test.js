import { Popup } from '../../index.js';
import TestUtil from '../TestUtil.js';

describe('Popup', () => {
	const testUtil = new TestUtil(Popup);
	testUtil.run({
		skipTests: ['container', 'id', 'stopPropagation'],
		extraTests: { focus: true },
		extraSettings: {
			isFocusable: true
		},
		focusableElement: '.popup'
	});
});
