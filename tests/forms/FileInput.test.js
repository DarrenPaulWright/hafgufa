import { FileInput } from '../../index.js';
import ControlTests from '../ControlTests.js';
import TestUtil from '../TestUtil.js';

describe('FileInput', () => {
	const testUtil = new TestUtil(FileInput);
	const controlBaseTests = new ControlTests(FileInput, testUtil, {
		mainCssClass: 'file-input'
	});

	controlBaseTests.run(['stopPropagation']);

	describe('IsMulti', () => {
		testUtil.testMethod({
			methodName: 'isMulti',
			defaultValue: false,
			testValue: true,
			secondTestValue: false
		});
	});

	describe('PreviewSize', () => {
		testUtil.testMethod({
			methodName: 'previewSize',
			defaultValue: 'small',
			testValue: 'medium',
			secondTestValue: 'large',
			testValueClass: [{
				class: 'small',
				testValue: 'small'
			}, {
				class: 'medium',
				testValue: 'medium'
			}, {
				class: 'large',
				testValue: 'large'
			}, {
				class: 'extra-large',
				testValue: 'extra-large'
			}]
		});
	});
});
