import { assert } from 'chai';
import FileThumbnail from '../../../src/ui/forms/FileThumbnail';
import dom from '../../../src/utility/dom';
import TestUtil from '../../TestUtil';
import ControlTests from '../ControlTests';

const testUtil = new TestUtil(FileThumbnail);
const controlBaseTests = new ControlTests(FileThumbnail, testUtil, {
	mainCssClass: 'file-thumbnail'
});

describe('FileThumbnail', () => {

	controlBaseTests.run();

	describe('ImageSource', () => {
		testUtil.testMethod({
			methodName: 'imageSource',
			defaultValue: undefined,
			testValue: 'test.gif',
			secondTestValue: 'test.jpg'
		});

		it('should have an image element when imageSource is set', () => {
			window.control = new FileThumbnail({
				container: window.testContainer,
				imageSource: 'http://www.examle.com/test.jpg'
			});

			assert.equal(dom.attr(document.querySelector('img'), 'src'), 'http://www.examle.com/test.jpg');
		});
	});

	describe('PreviewSize', () => {
		testUtil.testMethod({
			methodName: 'previewSize',
			defaultValue: 'small',
			testValue: 'medium',
			secondTestValue: 'large'
		});
	});
});
