import FilePicker from '../../../src/ui/forms/FilePicker';
import TestUtil from '../../TestUtil';
import FormControlTests from './FormControlTests';

const testUtil = new TestUtil(FilePicker);
const formControlTests = new FormControlTests(FilePicker, testUtil, {
	mainCssClass: 'file-picker'
});

describe('FilePicker', () => {

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
