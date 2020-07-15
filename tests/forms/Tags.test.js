import { wait } from 'async-agent';
import keyCodes from 'keycodes';
import { assert } from 'type-enforcer';
import { KEY_DOWN_EVENT, Tags } from '../..';
import TestUtil from '../TestUtil';
import FormControlTests from './FormControlTests';

describe('Tags', () => {
	const testUtil = new TestUtil(Tags);
	const formControlTests = new FormControlTests(Tags, testUtil, {
		mainCssClass: 'tags',
		focusableElement: 'input[type=text]'
	});

	const addTag = (text) => {
		testUtil.typeText(text);
		testUtil.hitEnter();
	};

	const setInputValue = (text) => {
		testUtil.typeText(text);
		testUtil.trigger(testUtil.getTextInput(), 'change');
	};

	const clickTag = (index) => {
		testUtil.simulateClick(getRenderedTags()[index]);
	};

	const clickOption = (index) => {
		testUtil.simulateClick(testUtil.nth('.popup .heading', index, true));
	};

	const clickDeleteButton = (index) => {
		testUtil.simulateClick(testUtil.nth('.icon-button', index));
	};

	const getRenderedTags = () => testUtil.all('.tags-list-container .heading', true);

	const getRenderedSuggestions = () => testUtil.all('.popup .heading', true);

	const isPopupRendered = () => testUtil.count('.popup', true) === 1;

	formControlTests.run([], ['focus'], {
		onChange: {
			buildControl() {
				testUtil.control = new Tags({
					container: testUtil.container
				});
			},
			validValue: 'test',
			setValueViaDom() {
				testUtil.control.isFocused(true);
				addTag('test');
			}
		}
	});

	describe('Init', () => {
		it('should have a class tags', () => {
			testUtil.control = new Tags({
				container: testUtil.container
			});

			assert.is(testUtil.count('.tags'), 1);
		});

		it('should have an input element', () => {
			testUtil.control = new Tags({
				container: testUtil.container
			});

			assert.is(testUtil.count('input'), 1);
		});

		it('should set focus when the list container is clicked', () => {
			testUtil.control = new Tags({
				container: testUtil.container
			});

			testUtil.simulateClick(testUtil.first('.tags-list-container'));

			assert.is(testUtil.control.isFocused(), true);
		});
	});

	describe('Tags', () => {
		it('should add a tag when text is entered and Enter is pressed', () => {
			testUtil.control = new Tags({
				container: testUtil.container
			});

			testUtil.control.isFocused(true);
			addTag('test1');

			assert.equal(testUtil.control.value(), ['test1']);
		});

		it('should NOT add a tag when no text is entered and Enter is pressed', () => {
			testUtil.control = new Tags({
				container: testUtil.container
			});

			testUtil.control.isFocused(true);
			testUtil.hitEnter();

			assert.equal(testUtil.control.value(), []);
		});

		it('should add a tag when text is entered and the control loses focus', () => {
			testUtil.control = new Tags({
				container: testUtil.container
			});

			testUtil.control.isFocused(true);
			setInputValue('test2');
			testUtil.control.isFocused(false);

			assert.equal(testUtil.control.value(), ['test2']);
		});

		it('should set the width of the text input when text is entered', () => {
			let inputElement;
			let fakeInputElement;

			testUtil.control = new Tags({
				container: testUtil.container
			});

			inputElement = testUtil.first('.text-input');
			fakeInputElement = testUtil.first('.fake-input');

			testUtil.control.isFocused(true);
			setInputValue('test string that is really long');

			assert.moreThan(inputElement.offsetWidth, fakeInputElement.offsetWidth - 2);
			assert.lessThan(inputElement.offsetWidth, fakeInputElement.offsetWidth + 10);
		});

		it('should remove a tag when the delete button is clicked', () => {
			testUtil.control = new Tags({
				container: testUtil.container
			});

			testUtil.control.isFocused(true);
			addTag('test1');
			addTag('test2');
			clickDeleteButton(0);

			assert.equal(testUtil.control.value(), ['test2']);
		});

		it('should maintain the order of tags when the first tag is deleted', () => {
			testUtil.control = new Tags({
				container: testUtil.container
			});

			testUtil.control.isFocused(true);
			addTag('test1');
			addTag('test2');
			addTag('test3');
			clickDeleteButton(0);

			assert.equal(testUtil.control.value(), ['test2', 'test3']);
		});

		it('should maintain the order of tags when a middle tag is deleted', () => {
			testUtil.control = new Tags({
				container: testUtil.container
			});

			testUtil.control.isFocused(true);
			addTag('test1');
			addTag('test2');
			addTag('test3');
			clickDeleteButton(1);

			assert.equal(testUtil.control.value(), ['test1', 'test3']);
		});

		it('should maintain the order of tags when the last tag is deleted', () => {
			testUtil.control = new Tags({
				container: testUtil.container
			});

			testUtil.control.isFocused(true);
			addTag('test1');
			addTag('test2');
			addTag('test3');
			clickDeleteButton(2);

			assert.equal(testUtil.control.value(), ['test1', 'test2']);
		});

		it('should be able to edit a tag by clicking on it', () => {
			testUtil.control = new Tags({
				container: testUtil.container
			});

			testUtil.control.isFocused(true);
			addTag('test1');
			addTag('test2');
			clickTag(0);

			assert.is(testUtil.count('.heading.hidden'), 1);
		});

		it('should add a tag when text is entered and another tag is clicked', () => {
			testUtil.control = new Tags({
				container: testUtil.container
			});

			testUtil.control.isFocused(true);
			addTag('test1');
			addTag('test2');
			setInputValue('edit');
			clickTag(0);

			assert.is(testUtil.control.value().length, 3);
		});

		it('should be able to save an edited tag when enter is pressed', () => {
			testUtil.control = new Tags({
				container: testUtil.container
			});

			testUtil.control.isFocused(true);
			addTag('test1');
			clickTag(0);
			addTag('test2');

			assert.equal(testUtil.control.value(), ['test2']);
		});

		it('should remove a tag when the edit text is deleted and enter is pressed', () => {
			testUtil.control = new Tags({
				container: testUtil.container
			});

			testUtil.control.isFocused(true);
			addTag('test1');
			clickTag(0);
			addTag('');

			assert.equal(testUtil.control.value(), []);
		});

		it('should move the input element when a tag is being edited', () => {
			testUtil.control = new Tags({
				container: testUtil.container
			});

			testUtil.control.isFocused(true);
			addTag('test1');
			addTag('test2');
			addTag('test3');
			clickTag(1);

			assert.equal(
				testUtil.first('.tags-list-container').children[1].children[0].children[0],
				testUtil.getTextInput()
			);
		});

		it('should maintain the order of tags when the first tag is edited', () => {
			testUtil.control = new Tags({
				container: testUtil.container
			});

			testUtil.control.isFocused(true);
			addTag('test1');
			addTag('test2');
			addTag('test3');
			addTag('test4');
			clickTag(0);
			addTag('testEdit');

			assert.equal(testUtil.control.value(), ['testEdit', 'test2', 'test3', 'test4']);
		});

		it('should maintain the order of tags when a middle tag is edited', () => {
			testUtil.control = new Tags({
				container: testUtil.container
			});

			testUtil.control.isFocused(true);
			addTag('test1');
			addTag('test2');
			addTag('test3');
			addTag('test4');
			clickTag(1);
			addTag('testEdit');

			assert.equal(testUtil.control.value(), ['test1', 'testEdit', 'test3', 'test4']);
		});

		it('should maintain the order of tags when the last tag is edited', () => {
			testUtil.control = new Tags({
				container: testUtil.container
			});

			testUtil.control.isFocused(true);
			addTag('test1');
			addTag('test2');
			addTag('test3');
			addTag('test4');
			clickTag(3);
			addTag('testEdit');

			assert.equal(testUtil.control.value(), ['test1', 'test2', 'test3', 'testEdit']);
		});
	});

	describe('Value', () => {
		it('should accept a comma separated string as a value', () => {
			testUtil.control = new Tags({
				container: testUtil.container
			});

			testUtil.control.value('test1,test2,test 3');

			assert.is(getRenderedTags().length, 3);
		});

		it('should not set focus when a value is set', () => {
			testUtil.control = new Tags({
				container: testUtil.container
			});

			testUtil.control.value('test1,test2,test 3');

			assert.is(!testUtil.control.isFocused(), true);
		});

		it('should not show the popup when a value is set', () => {
			testUtil.control = new Tags({
				container: testUtil.container
			});

			testUtil.control.value('test1,test2,test 3');

			assert.is(!isPopupRendered(), true);
		});

		it('should accept an array of strings as a value', () => {
			testUtil.control = new Tags({
				container: testUtil.container
			});

			testUtil.control.value(['test1', 'test2', 'test 3']);

			assert.is(getRenderedTags().length, 3);
		});

		it('should accept an array of objects with only title as a value', () => {
			testUtil.control = new Tags({
				container: testUtil.container
			});

			testUtil.control.value([{
				title: 'test 1 title'
			}, {
				title: 'test 2 title'
			}, {
				title: 'test 3 title'
			}]);

			assert.equal(testUtil.control.value(), ['test 1 title', 'test 2 title', 'test 3 title']);
		});

		it('should accept an array of objects with id and title as a value', () => {
			testUtil.control = new Tags({
				container: testUtil.container
			});

			testUtil.control.value([{
				id: 'test1',
				title: 'test 1 title'
			}, {
				id: 'test2',
				title: 'test 2 title'
			}, {
				id: 'test3',
				title: 'test 3 title'
			}]);

			assert.is(getRenderedTags().length, 3);
		});

		it('should accept an array of objects with id, title, and subTitle as a value', () => {
			testUtil.control = new Tags({
				container: testUtil.container
			});

			testUtil.control.value([{
				id: 'test1',
				title: 'test 1 title',
				subTitle: 'sub title 1'
			}, {
				id: 'test2',
				title: 'test 2 title',
				subTitle: 'sub title 2'
			}, {
				id: 'test3',
				title: 'test 3 title',
				subTitle: 'sub title 3'
			}]);

			assert.is(getRenderedTags().length, 3);
		});

		it('should only have tags for the second value when value is set twice', () => {
			testUtil.control = new Tags({
				container: testUtil.container
			});

			testUtil.control.value([{
				id: 'test1',
				title: 'test 1 title',
				subTitle: 'sub title 1'
			}, {
				id: 'test2',
				title: 'test 2 title',
				subTitle: 'sub title 2'
			}, {
				id: 'test3',
				title: 'test 3 title',
				subTitle: 'sub title 3'
			}]);

			testUtil.control.value([{
				id: 'test1',
				title: 'test 1 title',
				subTitle: 'sub title 1'
			}]);

			assert.is(getRenderedTags().length, 1);
		});

		it('should only have tags for the set value when value is set after adding tags manually', () => {
			testUtil.control = new Tags({
				container: testUtil.container
			});

			addTag('test1');
			addTag('test2');
			addTag('test3');

			testUtil.control.value([{
				id: 'test1',
				title: 'test 1 title',
				subTitle: 'sub title 1'
			}]);

			assert.is(getRenderedTags().length, 1);
		});
	});

	describe('Suggestions', () => {
		const keywordSuggestions = [
			'test 1',
			'test 2',
			'test 3'
		];
		const suggestionsWithTitles = [{
			id: 'test1',
			title: 'test 1'
		}, {
			id: 'test2',
			title: 'test 2'
		}, {
			id: 'test3',
			title: 'test 3'
		}];
		const suggestionsWithSubTitles = [{
			id: 'test1',
			title: 'test 1',
			subTitle: 'subTitle 1'
		}, {
			id: 'test2',
			title: 'test 2',
			subTitle: 'subTitle 2'
		}, {
			id: 'test3',
			title: 'test 3',
			subTitle: 'subTitle 3 is longer'
		}];

		testUtil.testMethod({
			methodName: 'suggestions',
			defaultSettings: {
				container: testUtil.container
			},
			defaultValue: [],
			testValue: [{
				id: 1,
				title: 'test 1'
			}],
			secondTestValue: [{
				id: 2,
				title: 'test 2'
			}]
		});

		it('should not show a popup when the control is focused and no suggestions are provided', () => {
			testUtil.control = new Tags({
				container: testUtil.container
			});

			testUtil.control.isFocused(true);

			assert.is(!isPopupRendered(), true);
		});

		it('should show a popup when the control is focused and suggestions are provided', () => {
			testUtil.control = new Tags({
				container: testUtil.container,
				suggestions: keywordSuggestions
			});

			testUtil.control.isFocused(true);

			assert.is(isPopupRendered(), true);
		});

		it('should remove the popup when the control loses focus', () => {
			testUtil.control = new Tags({
				container: testUtil.container,
				suggestions: keywordSuggestions
			});

			testUtil.control.isFocused(true).isFocused(false);

			return wait(100)
				.then(() => {
					assert.is(!isPopupRendered(), true);
				});
		});

		it('should accept an array of strings as suggestions', () => {
			testUtil.control = new Tags({
				container: testUtil.container,
				suggestions: keywordSuggestions
			});

			testUtil.control.isFocused(true);

			assert.is(getRenderedSuggestions().length, 3);
		});

		it('should accept an array of objects with id and title as suggestions', () => {
			testUtil.control = new Tags({
				container: testUtil.container,
				suggestions: suggestionsWithTitles
			});

			testUtil.control.isFocused(true);

			assert.is(getRenderedSuggestions().length, 3);
		});

		it('should accept an array of objects with id, title, and subTitle as suggestions', () => {
			testUtil.control = new Tags({
				container: testUtil.container,
				suggestions: suggestionsWithSubTitles
			});

			testUtil.control.isFocused(true);

			assert.is(getRenderedSuggestions().length, 3);
		});

		it('should filter suggestions with titles when text is added to the text control', () => {
			testUtil.control = new Tags({
				container: testUtil.container,
				suggestions: suggestionsWithTitles
			});

			testUtil.control.isFocused(true);
			setInputValue('2');

			assert.is(getRenderedSuggestions().length, 1);
		});

		it('should show all suggestions if the filter text is removed', () => {
			testUtil.control = new Tags({
				container: testUtil.container,
				suggestions: suggestionsWithTitles
			});

			testUtil.control.isFocused(true);
			setInputValue('2');

			setInputValue('');
			return wait(1)
				.then(() => {
					assert.is(getRenderedSuggestions().length, 3);
				});
		});

		it('should remove the suggestions popup if a filter doesn\'t match any suggestions', () => {
			testUtil.control = new Tags({
				container: testUtil.container,
				suggestions: suggestionsWithTitles
			});

			testUtil.control.isFocused(true);
			setInputValue('nothing');

			assert.is(!isPopupRendered(), true);
		});

		it('should filter suggestions with subtitles when text is added to the text control', () => {
			testUtil.control = new Tags({
				container: testUtil.container,
				suggestions: suggestionsWithSubTitles
			});

			testUtil.control.isFocused(true);
			setInputValue('sub 2');

			assert.is(getRenderedSuggestions().length, 1);
		});

		it('should show suggestions when editing an existing tag', () => {
			testUtil.control = new Tags({
				container: testUtil.container,
				suggestions: suggestionsWithSubTitles
			});

			testUtil.control.isFocused(true);
			addTag('test 1');
			addTag('sub 2');
			clickTag(1);

			assert.is(getRenderedSuggestions().length, 1);
		});

		it('should show the typed text when editing a tag that was selected from the list', () => {
			testUtil.control = new Tags({
				container: testUtil.container,
				suggestions: suggestionsWithSubTitles
			});

			testUtil.control.isFocused(true);
			addTag('test 1');
			addTag('sub 2');
			clickTag(1);

			assert.is(testUtil.getTextInput().value, 'sub 2');
		});

		it('should remember the typed input after selecting a suggestion and then editing that tag', () => {
			testUtil.control = new Tags({
				container: testUtil.container,
				suggestions: suggestionsWithSubTitles
			});

			testUtil.control.isFocused(true);
			setInputValue('te 2');
			clickOption(0);
			clickTag(0);

			assert.is(testUtil.getTextInput().value, 'te 2');
		});

		it('should filter suggestions on previously typed text when editing a tag', () => {
			testUtil.control = new Tags({
				container: testUtil.container,
				suggestions: suggestionsWithSubTitles
			});

			testUtil.control.isFocused(true);
			addTag('test 1');
			addTag('sub 2');
			clickTag(1);

			assert.is(getRenderedSuggestions().length, 1);
		});

		it('should update the suggestions if the background is clicked while editing a tag', () => {
			testUtil.control = new Tags({
				container: testUtil.container,
				suggestions: suggestionsWithSubTitles
			});

			testUtil.control.isFocused(true);
			addTag('test 1');
			addTag('sub 2');
			clickTag(1);

			testUtil.simulateClick(testUtil.first('.tags-list-container'));

			assert.is(getRenderedSuggestions().length, 3);
		});

		it('should not have multiple popups after several tags have been clicked', () => {
			testUtil.control = new Tags({
				container: testUtil.container,
				suggestions: suggestionsWithSubTitles
			});

			testUtil.control.isFocused(true);
			addTag('test 1');
			addTag('sub 2');
			addTag('test 2');
			addTag('test 3');
			clickTag(1);
			clickTag(0);
			clickTag(3);

			assert.is(isPopupRendered(), true);
		});

		it('should not have multiple popups after several tags have been clicked and the background is clicked', () => {
			testUtil.control = new Tags({
				container: testUtil.container,
				suggestions: suggestionsWithSubTitles
			});

			testUtil.control.isFocused(true);
			addTag('test 1');
			addTag('sub 2');
			addTag('test 2');
			addTag('test 3');
			clickTag(1);
			clickTag(0);
			clickTag(3);
			testUtil.simulateClick(testUtil.first('.tags-list-container'));

			assert.is(isPopupRendered(), true);
		});

		it('should save a tag when a suggestion is clicked', () => {
			testUtil.control = new Tags({
				container: testUtil.container,
				suggestions: suggestionsWithSubTitles
			});

			testUtil.control.isFocused(true);
			clickOption(1);

			assert.equal(testUtil.control.value(), ['test2']);
		});

		it('should have one rendered tag when a suggestion is clicked', () => {
			testUtil.control = new Tags({
				container: testUtil.container,
				suggestions: suggestionsWithSubTitles
			});

			testUtil.control.isFocused(true);
			clickOption(1);

			assert.is(testUtil.count('.heading'), 1);
		});

		it('should have one rendered tag when a suggestion is clicked after some text is entered', () => {
			testUtil.control = new Tags({
				container: testUtil.container,
				suggestions: suggestionsWithSubTitles
			});

			testUtil.control.isFocused(true);
			setInputValue('te');
			clickOption(1);

			assert.is(testUtil.count('.heading'), 1);
		});

		it('should maintain the order of tags when the first tag is replaced with a suggestion', () => {
			testUtil.control = new Tags({
				container: testUtil.container,
				suggestions: suggestionsWithSubTitles
			});

			testUtil.control.isFocused(true);
			addTag('typed1');
			addTag('typed2');
			addTag('typed3');
			addTag('typed4');
			clickTag(0);
			setInputValue('');
			clickOption(1);

			assert.equal(testUtil.control.value(), ['test2', 'typed2', 'typed3', 'typed4']);
		});

		it('should maintain the order of tags when a middle tag is replaced with a suggestion', () => {
			testUtil.control = new Tags({
				container: testUtil.container,
				suggestions: suggestionsWithSubTitles
			});

			testUtil.control.isFocused(true);
			addTag('typed1');
			addTag('typed2');
			addTag('typed3');
			addTag('typed4');
			clickTag(1);
			setInputValue('');
			clickOption(1);

			assert.equal(testUtil.control.value(), ['typed1', 'test2', 'typed3', 'typed4']);
		});

		it('should maintain the order of tags when the last tag is replaced with a suggestion', () => {
			testUtil.control = new Tags({
				container: testUtil.container,
				suggestions: suggestionsWithSubTitles
			});

			testUtil.control.isFocused(true);
			addTag('typed1');
			addTag('typed2');
			addTag('typed3');
			addTag('typed4');
			clickTag(3);
			setInputValue('');
			clickOption(1);

			assert.equal(testUtil.control.value(), ['typed1', 'typed2', 'typed3', 'test2']);
		});

		it('should only add one tag if text is typed and an option is clicked', () => {
			testUtil.control = new Tags({
				container: testUtil.container,
				suggestions: suggestionsWithSubTitles
			});

			testUtil.control.isFocused(true);
			setInputValue('te 2');
			clickOption(0);

			assert.is(getRenderedTags().length, 1);
		});

		it('should focus the first item in the popup when the down arrow is pressed', () => {
			testUtil.control = new Tags({
				container: testUtil.container,
				suggestions: suggestionsWithSubTitles
			});

			testUtil.control.isFocused(true);
			setInputValue('te 2');

			testUtil.simulateKeyEvent(testUtil.getTextInput(), keyCodes('down'), KEY_DOWN_EVENT);

			assert.is(getRenderedSuggestions()[0], document.activeElement);
		});
	});

	describe('BreakOnSpaces', () => {
		testUtil.testMethod({
			methodName: 'breakOnSpaces',
			defaultSettings: {
				container: testUtil.container
			},
			defaultValue: false,
			testValue: true,
			secondTestValue: false
		});

		it(
			'should add multiple tags when breakOnSpaces is false and a string with commas and semicolons is entered',
			() => {
				testUtil.control = new Tags({
					container: testUtil.container,
					breakOnSpaces: false
				});

				testUtil.control.isFocused(true);
				addTag('test 1,test 2;test 3');

				assert.is(getRenderedTags().length, 3);
			}
		);

		it('should add multiple tags when breakOnSpaces is true and a string with spaces is entered', () => {
			testUtil.control = new Tags({
				container: testUtil.container,
				breakOnSpaces: true
			});

			testUtil.control.isFocused(true);
			addTag('test1 test2 test3');

			assert.is(getRenderedTags().length, 3);
		});

		it(
			'should add multiple tags when breakOnSpaces is true and a string with spaces, commas, and semicolons is entered',
			() => {
				testUtil.control = new Tags({
					container: testUtil.container,
					breakOnSpaces: true
				});

				testUtil.control.isFocused(true);
				addTag('  test1    test2, test3;test4   ');

				assert.is(getRenderedTags().length, 4);
			}
		);

		it('should break on spaces when a string is set as a the value', () => {
			testUtil.control = new Tags({
				container: testUtil.container,
				breakOnSpaces: true
			});

			testUtil.control.value('  test1    test2, test3;test4   ');

			assert.is(getRenderedTags().length, 4);
		});
	});
});
