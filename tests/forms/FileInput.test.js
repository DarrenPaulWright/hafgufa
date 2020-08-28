import { FileInput } from '../../index.js';
import TestUtil from '../TestUtil.js';

describe('FileInput', () => {
	const testUtil = new TestUtil(FileInput);
	testUtil.run({
		skipTests: ['stopPropagation'],
		mainCssClass: 'file-input'
	});

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
