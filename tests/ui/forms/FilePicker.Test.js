import { FilePicker } from '../../../src';
import TestUtil from '../../TestUtil';
import FormControlTests from './FormControlTests';

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
