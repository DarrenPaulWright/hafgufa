import { assert } from 'type-enforcer';
import { Image } from '../../index.js';
import ControlTests from '../ControlTests.js';
import TestUtil from '../TestUtil.js';

describe('Image', () => {
	const testUtil = new TestUtil(Image);
	const controlTests = new ControlTests(Image, testUtil);

	controlTests.run();

	describe('.source', () => {
		it('should set the src attribute of the img when set', () => {
			testUtil.control = new Image({
				container: testUtil.container,
				source: 'something'
			});

			assert.is(testUtil.control.element.getAttribute('src'), 'something');
		});

		it('should set the src attribute of the img  to "#" when set to an empty string', () => {
			testUtil.control = new Image({
				container: testUtil.container,
				source: 'something'
			});

			testUtil.control.source('');

			assert.is(testUtil.control.element.getAttribute('src'), ' ');
		});
	});
});
