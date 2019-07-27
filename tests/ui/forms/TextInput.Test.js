import { assert } from 'chai';
import { TextInput } from '../../../src';
import locale from '../../../src/utility/locale';
import query from '../../query';
import TestUtil from '../../TestUtil';
import FormControlTests from './FormControlTests';

const testUtil = new TestUtil(TextInput);
const formControlTests = new FormControlTests(TextInput, testUtil, {
	mainCssClass: 'form-control'
});

locale.set({
	'requiredField': 'Please enter a value',
	'invalidInt': 'This value should an integer',
	'invalidNumber': 'This value should be a number',
	'invalidMaxValue': 'This number should be <maxValue> or less',
	'invalidMinValue': 'This number should be at least <minValue>',
	'invalidNumberFractionDigits': 'This number should have <maxFractionDigits> or less fractional digits',
	'invalidNumberTotalDigits': 'This number should have <maxNumberDigits> or less digits',
	'invalidMaxLength': 'This value should have <maxLength> or less characters',
	'invalidMinLength': 'This value should have <maxLength> or more characters'
});

describe('TextInput', () => {

	formControlTests.run(['changeDelay'], null, {
		onChange: {
			buildControl: function() {
				window.control = new TextInput({
					container: window.testContainer,
					changeDelay: 0
				});
			},
			validValue: 'test',
			setValueViaDom: function() {
				const input = document.querySelector('input[type=text]');
				input.value = '4';
				testUtil.trigger(input, 'change');
			}
		}
	});

	describe('.rows', () => {
		testUtil.testMethod({
			methodName: 'rows',
			defaultSettings: {
				container: window.testContainer
			},
			defaultValue: 1,
			testValue: 5,
			secondTestValue: 9
		});

		it('should have an input element if rows is 1', () => {
			window.control = new TextInput({
				container: window.testContainer,
				rows: 1
			});

			assert.equal(query.count('input'), 1);
		});

		it('should have an input element if rows is set multiple times', () => {
			window.control = new TextInput({
				container: window.testContainer,
				rows: 1
			});

			window.control.rows(1);

			assert.equal(query.count('input'), 1);
		});

		it('should have an input element if rows is set greater than 1 then back to 1', () => {
			window.control = new TextInput({
				container: window.testContainer,
				rows: 5
			});

			window.control.rows(1);

			assert.equal(query.count('input'), 1);
		});

		it('should have a textarea element if rows is greater than 1', () => {
			window.control = new TextInput({
				container: window.testContainer,
				rows: 5
			});

			assert.equal(query.count('textarea'), 1);
		});

		it('should have a textarea element if rows is 1 then set to greater than 1', () => {
			window.control = new TextInput({
				container: window.testContainer,
				rows: 1
			});

			window.control.rows(5);

			assert.equal(query.count('textarea'), 1);
		});

		it('should have a textarea element with a set height if rows is greater than 1 and height is set to a percent', () => {
			window.control = new TextInput({
				container: window.testContainer,
				title: 'Test Title',
				rows: 5,
				height: '90%'
			});
			window.control.resize(true);

			assert.isOk(query.first('textarea').style.height);
		});

		it('should have a textarea element WITHOUT a set height if rows is greater than 1 and height is set to a fixed amount', () => {
			window.control = new TextInput({
				container: window.testContainer,
				title: 'Test Title',
				rows: 5,
				height: '200px'
			});
			window.control.resize();

			assert.isNotTrue(query.first('textarea').style.height);
		});
	});

	describe('GetValue', () => {
		it('should return a value that has been set in the input element', () => {
			window.control = new TextInput({
				container: window.testContainer,
				rows: 1
			});

			query.first('input').value = 'Some Value';

			assert.equal(window.control.value(), 'Some Value');
		});

		it('should return a blank value that has been set in the input element', () => {
			window.control = new TextInput({
				container: window.testContainer,
				rows: 1
			});

			query.first('input').value = '';

			assert.equal(window.control.value(), '');
		});

		it('should return a value that has been set in the textarea element', () => {
			window.control = new TextInput({
				container: window.testContainer,
				rows: 5
			});

			query.first('textarea').value = 'Some Value';

			assert.equal(window.control.value(), 'Some Value');
		});

		it('should return an empty value that has been set in the textarea element', () => {
			window.control = new TextInput({
				container: window.testContainer,
				rows: 5
			});

			query.first('textarea').value = '';

			assert.equal(window.control.value(), '');
		});
	});

	describe('SetValue', () => {
		it('should set the value of an input element', () => {
			window.control = new TextInput({
				container: window.testContainer,
				rows: 1
			});

			window.control.value('Some Value');

			assert.equal(query.first('input').value, 'Some Value');
		});

		it('should set the value of an input element to blank', () => {
			window.control = new TextInput({
				container: window.testContainer,
				rows: 1
			});

			window.control.value('');

			assert.equal(query.first('input').value, '');
		});

		it('should set the value of an textarea element', () => {
			window.control = new TextInput({
				container: window.testContainer,
				rows: 5
			});

			window.control.value('Some Value');

			assert.equal(query.first('textarea').value, 'Some Value');
		});

		it('should set the value of an textarea element to blank', () => {
			window.control = new TextInput({
				container: window.testContainer,
				rows: 5
			});

			window.control.value('');

			assert.equal(query.first('textarea').value, '');
		});
	});

	describe('GetInput', () => {
		it('should return an input element when getInput is called and rows equals 1', () => {
			window.control = new TextInput({
				container: window.testContainer,
				rows: 1
			});

			assert.equal(window.control.getInput(), query.first('input'));
		});

		it('should return a textarea element when getItnput is called and rows is more than 1', () => {
			window.control = new TextInput({
				container: window.testContainer,
				rows: 5
			});

			assert.equal(window.control.getInput(), query.first('textarea'));
		});
	});

	describe('IsSoftValidation', () => {
		testUtil.testMethod({
			methodName: 'isSoftValidation',
			defaultSettings: {
				container: window.testContainer
			},
			defaultValue: true,
			testValue: false
		});
	});

	describe('MinLength', () => {
		testUtil.testMethod({
			methodName: 'minLength',
			defaultSettings: {
				container: window.testContainer
			},
			defaultValue: undefined,
			testValue: 10,
			secondTestValue: 73
		});

		it('should show an error if the input value has fewer characters than the minLength', () => {
			window.control = new TextInput({
				container: window.testContainer,
				title: 'Test Title',
				minLength: 10
			});

			window.control.value('12345');
			window.control.validate();

			assert.isOk(window.control.error());
		});

		it('should NOT show an error if the input value has the same characters as the minLength', () => {
			window.control = new TextInput({
				container: window.testContainer,
				minLength: 5
			});

			window.control.value('12345');
			window.control.validate();

			assert.isNotTrue(window.control.error());
		});
	});

	describe('MaxLength', () => {
		testUtil.testMethod({
			methodName: 'maxLength',
			defaultSettings: {
				container: window.testContainer
			},
			defaultValue: undefined,
			testValue: 10,
			secondTestValue: 73
		});

		it('should set the maxLength attribute of the input control if maxLength is set', () => {
			window.control = new TextInput({
				container: window.testContainer,
				isSoftValidation: false
			});

			window.control.maxLength(100);

			assert.equal(query.first('input').maxLength, 100);
		});

		it('should set the maxLength attribute of the textArea control if maxLength is set and rows is greater than 1', () => {
			window.control = new TextInput({
				container: window.testContainer,
				maxLength: 100,
				isSoftValidation: false,
				rows: 5
			});

			assert.equal(query.first('textarea').maxLength, 100);
		});

		it('should show an error if the input value has more characters than the maxLength', () => {
			window.control = new TextInput({
				container: window.testContainer,
				isSoftValidation: true,
				maxLength: 4
			});

			window.control.value('12345');
			window.control.validate();

			assert.isOk(window.control.error());
		});

		it('should NOT show an error if the input value has the same characters as the maxLength', () => {
			window.control = new TextInput({
				container: window.testContainer,
				isSoftValidation: true,
				maxLength: 5
			});

			window.control.value('12345');
			window.control.validate();

			assert.isNotTrue(window.control.error());
		});
	});

	describe('MinValue', () => {
		testUtil.testMethod({
			methodName: 'minValue',
			defaultSettings: {
				container: window.testContainer
			},
			defaultValue: undefined,
			testValue: 10,
			secondTestValue: 73
		});

		it('should show an error if the input value is not a number and minValue is set', () => {
			window.control = new TextInput({
				container: window.testContainer,
				minValue: 4
			});

			window.control.value('4 miles');
			window.control.validate();

			assert.isOk(window.control.error());
		});

		it('should show an error if the input value is less than the minValue', () => {
			window.control = new TextInput({
				container: window.testContainer,
				minValue: 4
			});

			window.control.value('2');
			window.control.validate();

			assert.isOk(window.control.error());
		});

		it('should NOT show an error if the input value is the same as the minValue', () => {
			window.control = new TextInput({
				container: window.testContainer,
				minValue: 5
			});

			window.control.value('5');
			window.control.validate();

			assert.isNotTrue(window.control.error());
		});

		it('should show an error if the input value is NaN and minValue is set', () => {
			window.control = new TextInput({
				container: window.testContainer,
				minValue: 4
			});

			window.control.value('NaN');
			window.control.validate();

			assert.isOk(window.control.error());
		});
	});

	describe('MaxValue', () => {
		testUtil.testMethod({
			methodName: 'maxValue',
			defaultSettings: {
				container: window.testContainer
			},
			defaultValue: undefined,
			testValue: 10,
			secondTestValue: 73
		});

		it('should show an error if the input value is not a number and maxValue is set', () => {
			window.control = new TextInput({
				container: window.testContainer,
				maxValue: 4
			});

			window.control.value('4 miles');
			window.control.validate();

			assert.isOk(window.control.error());
		});

		it('should show an error if the input value is greater than the maxValue', () => {
			window.control = new TextInput({
				container: window.testContainer,
				maxValue: 4
			});

			window.control.value('6');
			window.control.validate();

			assert.isOk(window.control.error());
		});

		it('should NOT show an error if the input value is the same as the maxValue', () => {
			window.control = new TextInput({
				container: window.testContainer,
				maxValue: 5
			});

			window.control.value('5');
			window.control.validate();

			assert.isNotTrue(window.control.error());
		});

		it('should show an error if the input value is NaN and maxValue is set', () => {
			window.control = new TextInput({
				container: window.testContainer,
				maxValue: 4
			});

			window.control.value('NaN');
			window.control.validate();

			assert.isOk(window.control.error());
		});
	});

	describe('IsInt', () => {
		testUtil.testMethod({
			methodName: 'isInt',
			defaultSettings: {
				container: window.testContainer
			},
			defaultValue: false,
			testValue: true
		});

		it('should show an error if the input value is not a number and isInt is true', () => {
			window.control = new TextInput({
				container: window.testContainer,
				isInt: true
			});

			window.control.value('4 miles');
			window.control.validate();

			assert.isOk(window.control.error());
		});

		it('should show an error if the input value is not an integer and isInt is true', () => {
			window.control = new TextInput({
				container: window.testContainer,
				isInt: true
			});

			window.control.value('6.4');
			window.control.validate();

			assert.isOk(window.control.error());
		});

		it('should show an error if the input value is not an integer and isInt is true and minValue and maxValue are set', () => {
			window.control = new TextInput({
				container: window.testContainer,
				isInt: true,
				minValue: 2,
				maxValue: 10
			});

			window.control.value('6.4');
			window.control.validate();

			assert.isOk(window.control.error());
		});

		it('should NOT show an error if the input value is an integer and isInt is true', () => {
			window.control = new TextInput({
				container: window.testContainer,
				isInt: true
			});

			window.control.value('5');
			window.control.validate();

			assert.isNotTrue(window.control.error());
		});

		it('should show an error if the input value is NaN and isInt is true', () => {
			window.control = new TextInput({
				container: window.testContainer,
				isInt: true
			});

			window.control.value('NaN');
			window.control.validate();

			assert.isOk(window.control.error());
		});
	});

	describe('IsNumber', () => {
		testUtil.testMethod({
			methodName: 'isNumber',
			defaultSettings: {
				container: window.testContainer
			},
			defaultValue: false,
			testValue: true
		});

		it('should show an error if the input value is not a number and isNumber is true', () => {
			window.control = new TextInput({
				container: window.testContainer,
				isNumber: true
			});

			window.control.value('4 miles');
			window.control.validate();

			assert.isOk(window.control.error());
		});

		it('should NOT show an error if the input value is a number and isNumber is true', () => {
			window.control = new TextInput({
				container: window.testContainer,
				isNumber: true
			});

			window.control.value('5.2');
			window.control.validate();

			assert.isNotTrue(window.control.error());
		});

		it('should show an error if the input value is NaN and isNumber is true', () => {
			window.control = new TextInput({
				container: window.testContainer,
				isNumber: true
			});

			window.control.value('NaN');
			window.control.validate();

			assert.isOk(window.control.error());
		});
	});

	describe('Placeholder', () => {
		testUtil.testMethod({
			methodName: 'placeholder',
			defaultSettings: {
				container: window.testContainer
			},
			defaultValue: '',
			testValue: 'test placeholder',
			secondTestValue: 'another test'
		});

		it('should set the placeholder attribute of the input control if placeholder is set', () => {
			window.control = new TextInput({
				container: window.testContainer,
				placeholder: 'test'
			});

			assert.equal(query.first('input').placeholder, 'test');
		});
	});

	describe('Prefix', () => {
		testUtil.testMethod({
			methodName: 'prefix',
			defaultSettings: {
				container: window.testContainer
			},
			defaultValue: '',
			testValue: '$',
			secondTestValue: '@'
		});

		it('should have a div with class input-prefix when prefix is set', () => {
			window.control = new TextInput({
				container: window.testContainer,
				prefix: 'test'
			});

			assert.equal(query.count('.input-prefix'), 1);
		});

		it('should have a div with class input-prefix when prefix is set multiple times', () => {
			window.control = new TextInput({
				container: window.testContainer,
				prefix: 'test'
			});

			window.control.prefix('2');
			window.control.prefix('3');
			window.control.prefix('4');

			assert.equal(query.count('.input-prefix'), 1);
		});

		it('should NOT have a div with class input-prefix when prefix is set and then set to an empty string', () => {
			window.control = new TextInput({
				container: window.testContainer,
				prefix: 'test'
			});

			window.control.prefix('');

			assert.equal(query.count('.input-prefix'), 0);
		});
	});

	describe('IsPassowrd', () => {
		testUtil.testMethod({
			methodName: 'isPassword',
			defaultSettings: {
				container: window.testContainer
			},
			defaultValue: false,
			testValue: true
		});

		it('should have an input with type password when isPassword is set to true', () => {
			window.control = new TextInput({
				container: window.testContainer,
				isPassword: true
			});

			assert.equal(query.first('input').type, 'password');
		});

		it('should have an input with type text when isPassword is set to false', () => {
			window.control = new TextInput({
				container: window.testContainer,
				isPassword: true
			});

			window.control.isPassword(false);

			assert.equal(query.first('input').type, 'text');
		});
	});

	describe('ChangeDelay', () => {
		testUtil.testMethod({
			methodName: 'changeDelay',
			defaultSettings: {
				container: window.testContainer
			},
			defaultValue: 200,
			testValue: 500
		});

		it('should have a changeDelay of 500 if rows is greater than 1', () => {
			window.control = new TextInput({
				container: window.testContainer,
				rows: 5
			});

			assert.equal(window.control.changeDelay(), 500);
		});

		it('should still have a changeDelay of 200 when triggerChange is called', () => {
			window.control = new TextInput({
				container: window.testContainer
			});

			window.control.triggerChange();

			assert.equal(window.control.changeDelay(), 200);
		});
	});
});
