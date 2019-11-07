import { assert } from 'chai';
import { Image } from '../../src';
import ControlTests from '../ControlTests';
import TestUtil from '../TestUtil';

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

			assert.equal(testUtil.control.element().getAttribute('src'), 'something');
		});

		it('should set the src attribute of the img  to "#" when set to an empty string', () => {
			testUtil.control = new Image({
				container: testUtil.container,
				source: 'something'
			});

			testUtil.control.source('');

			assert.equal(testUtil.control.element().getAttribute('src'), ' ');
		});
	});
});
