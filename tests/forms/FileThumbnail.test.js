import { assert } from 'type-enforcer';
import { FileThumbnail } from '../../index.js';
import ControlTests from '../ControlTests.js';
import TestUtil from '../TestUtil.js';

describe('FileThumbnail', () => {
	const testUtil = new TestUtil(FileThumbnail);
	const controlTests = new ControlTests(FileThumbnail, testUtil, {
		mainCssClass: 'file-thumbnail'
	});

	controlTests.run();

	describe('ImageSource', () => {
		testUtil.testMethod({
			methodName: 'imageSource',
			defaultValue: undefined,
			testValue: 'test.gif',
			secondTestValue: 'test.jpg'
		});

		it('should have an image element when imageSource is set', () => {
			testUtil.control = new FileThumbnail({
				container: testUtil.container,
				imageSource: 'http://www.examle.com/test.jpg'
			});

			assert.is(testUtil.first('img').getAttribute('src'), 'http://www.examle.com/test.jpg');
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
