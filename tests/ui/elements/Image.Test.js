import { assert } from 'chai';
import { dom, Image } from '../../../src';
import TestUtil from '../../TestUtil';
import ControlTests from '../ControlTests';

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

			assert.equal(dom.attr(testUtil.control.element(), 'src'), 'something');
		});

		it('should set the src attribute of the img  to "#" when set to an empty string', () => {
			testUtil.control = new Image({
				container: testUtil.container,
				source: 'something'
			});

			testUtil.control.source('');

			assert.equal(dom.attr(testUtil.control.element(), 'src'), ' ');
		});
	});
});
