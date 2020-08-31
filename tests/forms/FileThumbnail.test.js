import { assert } from 'type-enforcer';
import { FileThumbnail } from '../../index.js';
import TestUtil from '../TestUtil.js';

describe('FileThumbnail', () => {
	const testUtil = new TestUtil(FileThumbnail);
	testUtil.run({
		mainCssClass: 'file-thumbnail'
	});

	describe('.imageSource', () => {
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

	describe('.previewSize', () => {
		testUtil.testMethod({
			methodName: 'previewSize',
			defaultValue: 'small',
			testValue: 'medium',
			secondTestValue: 'large'
		});
	});
});
