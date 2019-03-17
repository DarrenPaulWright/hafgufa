import { assert } from 'chai';
import { Image } from '../../../src';
import dom from '../../../src/utility/dom';
import TestUtil from '../../TestUtil';
import ControlBaseTests from '../ControlBaseTests';

const testUtil = new TestUtil(Image);
const controlBaseTests = new ControlBaseTests(Image, testUtil);

describe('Image', () => {

	controlBaseTests.run();

	describe('.source', () => {
		it('should set the src attribute of the img when set', () => {
			window.control = new Image({
				container: window.testContainer,
				source: 'something'
			});

			assert.equal(dom.attr(window.control.element(), 'src'), 'something');
		});

		it('should set the src attribute of the img  to "#" when set to an empty string', () => {
			window.control = new Image({
				container: window.testContainer,
				source: 'something'
			});

			window.control.source('');

			assert.equal(dom.attr(window.control.element(), 'src'), ' ');
		});
	});
});
