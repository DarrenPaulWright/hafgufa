import { FilePicker } from '../../index.js';
import TestUtil from '../TestUtil.js';
import FormControlTests from './FormControlTests.js';

describe('FilePicker', () => {
	const testUtil = new TestUtil(FilePicker);
	const formControlTests = new FormControlTests(FilePicker, testUtil, {
		mainCssClass: 'file-picker'
	});

	formControlTests.run();

	describe('PreviewSize', () => {
		testUtil.testMethod({
			methodName: 'previewSize',
			defaultValue: 'small',
			testValue: 'medium',
			secondTestValue: 'large'
		});
	});
});
