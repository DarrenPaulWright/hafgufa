import { assert } from 'chai';
import { dom, Image } from '../../../src';
import TestUtil from '../../TestUtil';
import ControlTests from '../ControlTests';

const testUtil = new TestUtil(Image);
const controlTests = new ControlTests(Image, testUtil);

describe('Image', () => {

	controlTests.run();

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
