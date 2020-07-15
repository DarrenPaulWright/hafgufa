import { assert } from 'type-enforcer';
import { locale, TextInput } from '../..';
import TestUtil from '../TestUtil';
import FormControlTests from './FormControlTests';

describe('TextInput', () => {
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

	formControlTests.run(['changeDelay'], null, {
		onChange: {
			buildControl() {
				testUtil.control = new TextInput({
					container: testUtil.container,
					changeDelay: 0
				});
			},
			validValue: 'test',
			setValueViaDom() {
				testUtil.typeText('4');
				testUtil.trigger(testUtil.getTextInput(), 'change');
			}
		}
	});

	describe('.rows', () => {
		testUtil.testMethod({
			methodName: 'rows',
			defaultSettings: {
				container: testUtil.container
			},
			defaultValue: 1,
			testValue: 5,
			secondTestValue: 9
		});

		it('should have an input element if rows is 1', () => {
			testUtil.control = new TextInput({
				container: testUtil.container,
				rows: 1
			});

			assert.is(testUtil.count('input'), 1);
		});

		it('should have an input element if rows is set multiple times', () => {
			testUtil.control = new TextInput({
				container: testUtil.container,
				rows: 1
			});

			testUtil.control.rows(1);

			assert.is(testUtil.count('input'), 1);
		});

		it('should have an input element if rows is set greater than 1 then back to 1', () => {
			testUtil.control = new TextInput({
				container: testUtil.container,
				rows: 5
			});

			testUtil.control.rows(1);

			assert.is(testUtil.count('input'), 1);
		});

		it('should have a textarea element if rows is greater than 1', () => {
			testUtil.control = new TextInput({
				container: testUtil.container,
				rows: 5
			});

			assert.is(testUtil.count('textarea'), 1);
		});

		it('should have a textarea element if rows is 1 then set to greater than 1', () => {
			testUtil.control = new TextInput({
				container: testUtil.container,
				rows: 1
			});

			testUtil.control.rows(5);

			assert.is(testUtil.count('textarea'), 1);
		});

		it(
			'should have a textarea element with a set height if rows is greater than 1 and height is set to a percent',
			() => {
				testUtil.control = new TextInput({
					container: testUtil.container,
					title: 'Test Title',
					rows: 5,
					height: '90%'
				});
				testUtil.control.resize(true);

				assert.notIs(testUtil.first('textarea').style.height, '');
			}
		);

		it(
			'should have a textarea element WITHOUT a set height if rows is greater than 1 and height is set to a fixed amount',
			() => {
				testUtil.control = new TextInput({
					container: testUtil.container,
					title: 'Test Title',
					rows: 5,
					height: '200px'
				});
				testUtil.control.resize();

				assert.notIs(testUtil.first('textarea').style.height, '200px');
			}
		);
	});

	describe('GetValue', () => {
		it('should return a value that has been set in the input element', () => {
			testUtil.control = new TextInput({
				container: testUtil.container,
				rows: 1
			});

			testUtil.first('input').value = 'Some Value';

			assert.is(testUtil.control.value(), 'Some Value');
		});

		it('should return a blank value that has been set in the input element', () => {
			testUtil.control = new TextInput({
				container: testUtil.container,
				rows: 1
			});

			testUtil.first('input').value = '';

			assert.is(testUtil.control.value(), '');
		});

		it('should return a value that has been set in the textarea element', () => {
			testUtil.control = new TextInput({
				container: testUtil.container,
				rows: 5
			});

			testUtil.first('textarea').value = 'Some Value';

			assert.is(testUtil.control.value(), 'Some Value');
		});

		it('should return an empty value that has been set in the textarea element', () => {
			testUtil.control = new TextInput({
				container: testUtil.container,
				rows: 5
			});

			testUtil.first('textarea').value = '';

			assert.is(testUtil.control.value(), '');
		});
	});

	describe('SetValue', () => {
		it('should set the value of an input element', () => {
			testUtil.control = new TextInput({
				container: testUtil.container,
				rows: 1
			});

			testUtil.control.value('Some Value');

			assert.is(testUtil.first('input').value, 'Some Value');
		});

		it('should set the value of an input element to blank', () => {
			testUtil.control = new TextInput({
				container: testUtil.container,
				rows: 1
			});

			testUtil.control.value('');

			assert.is(testUtil.first('input').value, '');
		});

		it('should set the value of an textarea element', () => {
			testUtil.control = new TextInput({
				container: testUtil.container,
				rows: 5
			});

			testUtil.control.value('Some Value');

			assert.is(testUtil.first('textarea').value, 'Some Value');
		});

		it('should set the value of an textarea element to blank', () => {
			testUtil.control = new TextInput({
				container: testUtil.container,
				rows: 5
			});

			testUtil.control.value('');

			assert.is(testUtil.first('textarea').value, '');
		});
	});

	describe('GetInput', () => {
		it('should return an input element when getInput is called and rows equals 1', () => {
			testUtil.control = new TextInput({
				container: testUtil.container,
				rows: 1
			});

			assert.is(testUtil.control.getInput().element, testUtil.first('input'));
		});

		it('should return a textarea element when getItnput is called and rows is more than 1', () => {
			testUtil.control = new TextInput({
				container: testUtil.container,
				rows: 5
			});

			assert.is(testUtil.control.getInput().element, testUtil.first('textarea'));
		});
	});

	describe('IsSoftValidation', () => {
		testUtil.testMethod({
			methodName: 'isSoftValidation',
			defaultSettings: {
				container: testUtil.container
			},
			defaultValue: true,
			testValue: false
		});
	});

	describe('MinLength', () => {
		testUtil.testMethod({
			methodName: 'minLength',
			defaultSettings: {
				container: testUtil.container
			},
			defaultValue: undefined,
			testValue: 10,
			secondTestValue: 73
		});

		it('should show an error if the input value has fewer characters than the minLength', () => {
			testUtil.control = new TextInput({
				container: testUtil.container,
				title: 'Test Title',
				minLength: 10
			});

			testUtil.control.value('12345');
			testUtil.control.validate();

			assert.notIs(testUtil.control.error(), '');
		});

		it('should NOT show an error if the input value has the same characters as the minLength', () => {
			testUtil.control = new TextInput({
				container: testUtil.container,
				minLength: 5
			});

			testUtil.control.value('12345');
			testUtil.control.validate();

			assert.is(testUtil.control.error(), '');
		});
	});

	describe('MaxLength', () => {
		testUtil.testMethod({
			methodName: 'maxLength',
			defaultSettings: {
				container: testUtil.container
			},
			defaultValue: undefined,
			testValue: 10,
			secondTestValue: 73
		});

		it('should set the maxLength attribute of the input control if maxLength is set', () => {
			testUtil.control = new TextInput({
				container: testUtil.container,
				isSoftValidation: false
			});

			testUtil.control.maxLength(100);

			assert.is(testUtil.first('input').maxLength, 100);
		});

		it(
			'should set the maxLength attribute of the textArea control if maxLength is set and rows is greater than 1',
			() => {
				testUtil.control = new TextInput({
					container: testUtil.container,
					maxLength: 100,
					isSoftValidation: false,
					rows: 5
				});

				assert.is(testUtil.first('textarea').maxLength, 100);
			}
		);

		it('should show an error if the input value has more characters than the maxLength', () => {
			testUtil.control = new TextInput({
				container: testUtil.container,
				isSoftValidation: true,
				maxLength: 4
			});

			testUtil.control.value('12345');
			testUtil.control.validate();

			assert.notIs(testUtil.control.error(), '');
		});

		it('should NOT show an error if the input value has the same characters as the maxLength', () => {
			testUtil.control = new TextInput({
				container: testUtil.container,
				isSoftValidation: true,
				maxLength: 5
			});

			testUtil.control.value('12345');
			testUtil.control.validate();

			assert.is(testUtil.control.error(), '');
		});
	});

	describe('MinValue', () => {
		testUtil.testMethod({
			methodName: 'minValue',
			defaultSettings: {
				container: testUtil.container
			},
			defaultValue: undefined,
			testValue: 10,
			secondTestValue: 73
		});

		it('should show an error if the input value is not a number and minValue is set', () => {
			testUtil.control = new TextInput({
				container: testUtil.container,
				minValue: 4
			});

			testUtil.control.value('4 miles');
			testUtil.control.validate();

			assert.notIs(testUtil.control.error(), '');
		});

		it('should show an error if the input value is less than the minValue', () => {
			testUtil.control = new TextInput({
				container: testUtil.container,
				minValue: 4
			});

			testUtil.control.value('2');
			testUtil.control.validate();

			assert.notIs(testUtil.control.error(), '');
		});

		it('should NOT show an error if the input value is the same as the minValue', () => {
			testUtil.control = new TextInput({
				container: testUtil.container,
				minValue: 5
			});

			testUtil.control.value('5');
			testUtil.control.validate();

			assert.is(testUtil.control.error(), '');
		});

		it('should show an error if the input value is NaN and minValue is set', () => {
			testUtil.control = new TextInput({
				container: testUtil.container,
				minValue: 4
			});

			testUtil.control.value('NaN');
			testUtil.control.validate();

			assert.notIs(testUtil.control.error(), '');
		});
	});

	describe('MaxValue', () => {
		testUtil.testMethod({
			methodName: 'maxValue',
			defaultSettings: {
				container: testUtil.container
			},
			defaultValue: undefined,
			testValue: 10,
			secondTestValue: 73
		});

		it('should show an error if the input value is not a number and maxValue is set', () => {
			testUtil.control = new TextInput({
				container: testUtil.container,
				maxValue: 4
			});

			testUtil.control.value('4 miles');
			testUtil.control.validate();

			assert.notIs(testUtil.control.error(), '');
		});

		it('should show an error if the input value is greater than the maxValue', () => {
			testUtil.control = new TextInput({
				container: testUtil.container,
				maxValue: 4
			});

			testUtil.control.value('6');
			testUtil.control.validate();

			assert.notIs(testUtil.control.error(), '');
		});

		it('should NOT show an error if the input value is the same as the maxValue', () => {
			testUtil.control = new TextInput({
				container: testUtil.container,
				maxValue: 5
			});

			testUtil.control.value('5');
			testUtil.control.validate();

			assert.is(testUtil.control.error(), '');
		});

		it('should show an error if the input value is NaN and maxValue is set', () => {
			testUtil.control = new TextInput({
				container: testUtil.container,
				maxValue: 4
			});

			testUtil.control.value('NaN');
			testUtil.control.validate();

			assert.notIs(testUtil.control.error(), '');
		});
	});

	describe('IsInt', () => {
		testUtil.testMethod({
			methodName: 'isInt',
			defaultSettings: {
				container: testUtil.container
			},
			defaultValue: false,
			testValue: true
		});

		it('should show an error if the input value is not a number and isInt is true', () => {
			testUtil.control = new TextInput({
				container: testUtil.container,
				isInt: true
			});

			testUtil.control.value('4 miles');
			testUtil.control.validate();

			assert.notIs(testUtil.control.error(), '');
		});

		it('should show an error if the input value is not an integer and isInt is true', () => {
			testUtil.control = new TextInput({
				container: testUtil.container,
				isInt: true
			});

			testUtil.control.value('6.4');
			testUtil.control.validate();

			assert.notIs(testUtil.control.error(), '');
		});

		it(
			'should show an error if the input value is not an integer and isInt is true and minValue and maxValue are set',
			() => {
				testUtil.control = new TextInput({
					container: testUtil.container,
					isInt: true,
					minValue: 2,
					maxValue: 10
				});

				testUtil.control.value('6.4');
				testUtil.control.validate();

				assert.notIs(testUtil.control.error(), '');
			}
		);

		it('should NOT show an error if the input value is an integer and isInt is true', () => {
			testUtil.control = new TextInput({
				container: testUtil.container,
				isInt: true
			});

			testUtil.control.value('5');
			testUtil.control.validate();

			assert.is(testUtil.control.error(), '');
		});

		it('should show an error if the input value is NaN and isInt is true', () => {
			testUtil.control = new TextInput({
				container: testUtil.container,
				isInt: true
			});

			testUtil.control.value('NaN');
			testUtil.control.validate();

			assert.notIs(testUtil.control.error(), '');
		});
	});

	describe('IsNumber', () => {
		testUtil.testMethod({
			methodName: 'isNumber',
			defaultSettings: {
				container: testUtil.container
			},
			defaultValue: false,
			testValue: true
		});

		it('should show an error if the input value is not a number and isNumber is true', () => {
			testUtil.control = new TextInput({
				container: testUtil.container,
				isNumber: true
			});

			testUtil.control.value('4 miles');
			testUtil.control.validate();

			assert.notIs(testUtil.control.error(), '');
		});

		it('should NOT show an error if the input value is a number and isNumber is true', () => {
			testUtil.control = new TextInput({
				container: testUtil.container,
				isNumber: true
			});

			testUtil.control.value('5.2');
			testUtil.control.validate();

			assert.is(testUtil.control.error(), '');
		});

		it('should show an error if the input value is NaN and isNumber is true', () => {
			testUtil.control = new TextInput({
				container: testUtil.container,
				isNumber: true
			});

			testUtil.control.value('NaN');
			testUtil.control.validate();

			assert.notIs(testUtil.control.error(), '');
		});
	});

	describe('Placeholder', () => {
		testUtil.testMethod({
			methodName: 'placeholder',
			defaultSettings: {
				container: testUtil.container
			},
			defaultValue: '',
			testValue: 'test placeholder',
			secondTestValue: 'another test'
		});

		it('should set the placeholder attribute of the input control if placeholder is set', () => {
			testUtil.control = new TextInput({
				container: testUtil.container,
				placeholder: 'test'
			});

			assert.is(testUtil.first('input').placeholder, 'test');
		});
	});

	describe('Prefix', () => {
		testUtil.testMethod({
			methodName: 'prefix',
			defaultSettings: {
				container: testUtil.container
			},
			defaultValue: '',
			testValue: '$',
			secondTestValue: '@'
		});

		it('should have a div with class input-prefix when prefix is set', () => {
			testUtil.control = new TextInput({
				container: testUtil.container,
				prefix: 'test'
			});

			assert.is(testUtil.count('.input-prefix'), 1);
		});

		it('should have a div with class input-prefix when prefix is set multiple times', () => {
			testUtil.control = new TextInput({
				container: testUtil.container,
				prefix: 'test'
			});

			testUtil.control.prefix('2');
			testUtil.control.prefix('3');
			testUtil.control.prefix('4');

			assert.is(testUtil.count('.input-prefix'), 1);
		});

		it('should NOT have a div with class input-prefix when prefix is set and then set to an empty string', () => {
			testUtil.control = new TextInput({
				container: testUtil.container,
				prefix: 'test'
			});

			testUtil.control.prefix('');

			assert.is(testUtil.count('.input-prefix'), 0);
		});
	});

	describe('IsPassowrd', () => {
		testUtil.testMethod({
			methodName: 'isPassword',
			defaultSettings: {
				container: testUtil.container
			},
			defaultValue: false,
			testValue: true
		});

		it('should have an input with type password when isPassword is set to true', () => {
			testUtil.control = new TextInput({
				container: testUtil.container,
				isPassword: true
			});

			assert.is(testUtil.first('input').type, 'password');
		});

		it('should have an input with type text when isPassword is set to false', () => {
			testUtil.control = new TextInput({
				container: testUtil.container,
				isPassword: true
			});

			testUtil.control.isPassword(false);

			assert.is(testUtil.first('input').type, 'text');
		});
	});

	describe('ChangeDelay', () => {
		testUtil.testMethod({
			methodName: 'changeDelay',
			defaultSettings: {
				container: testUtil.container
			},
			defaultValue: 200,
			testValue: 500
		});

		it('should have a changeDelay of 500 if rows is greater than 1', () => {
			testUtil.control = new TextInput({
				container: testUtil.container,
				rows: 5
			});

			assert.is(testUtil.control.changeDelay(), 500);
		});

		it('should still have a changeDelay of 200 when triggerChange is called', () => {
			testUtil.control = new TextInput({
				container: testUtil.container
			});

			testUtil.control.triggerChange();

			assert.is(testUtil.control.changeDelay(), 200);
		});
	});
});
