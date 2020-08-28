import { FilePicker } from '../../index.js';
import TestUtil from '../TestUtil.js';

describe('FilePicker', () => {
	const testUtil = new TestUtil(FilePicker);
	testUtil.run({
		mainCssClass: 'file-picker'
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
