import { Popup } from '../../index.js';
import TestUtil from '../TestUtil.js';

describe('Popup', () => {
	const testUtil = new TestUtil(Popup);
	testUtil.run({
		skipTests: ['container', 'id', 'stopPropagation'],
		settings: {
			isFocusable: true
		},
		focusableElement: '.popup'
	});
});
