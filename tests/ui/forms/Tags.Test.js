import { assert } from 'chai';
import keyCodes from 'keycodes';
import { Tags } from '../../../src';
import dom from '../../../src/utility/dom';
import { KEY_DOWN_EVENT } from '../../../src/utility/domConstants';
import TestUtil from '../../TestUtil';
import FormControlTests from './FormControlTests';

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
	testUtil.simulateClick(document.querySelectorAll('.popup .heading')[index]);
};

const clickDeleteButton = (index) => {
	testUtil.simulateClick(document.querySelectorAll('.icon-button')[index]);
};

const getRenderedTags = () => document.querySelectorAll('.tags-list-container .heading');

const getRenderedSuggestions = () => document.querySelectorAll('.popup .heading');

const isPopupRendered = () => document.querySelectorAll('.popup').length === 1;

describe('Tags', () => {

	formControlTests.run([], ['focus'], {
		onChange: {
			buildControl: function() {
				window.control = new Tags({
					container: window.testContainer
				});
			},
			validValue: 'test',
			setValueViaDom: function() {
				window.control.isFocused(true);
				addTag('test');
			}
		}
	});

	describe('Init', () => {
		it('should have a class tags', () => {
			window.control = new Tags({
				container: window.testContainer
			});

			assert.equal(document.querySelectorAll('.tags').length, 1);
		});

		it('should have an input element', () => {
			window.control = new Tags({
				container: window.testContainer
			});

			assert.equal(document.querySelectorAll('input').length, 1);
		});

		it('should set focus when the list container is clicked', () => {
			window.control = new Tags({
				container: window.testContainer
			});

			testUtil.simulateClick(document.querySelector('.tags-list-container'));

			assert.isTrue(window.control.isFocused());
		});
	});

	describe('Tags', () => {
		it('should add a tag when text is entered and Enter is pressed', () => {
			window.control = new Tags({
				container: window.testContainer
			});

			window.control.isFocused(true);
			addTag('test1');

			assert.deepEqual(window.control.value(), ['test1']);
		});

		it('should NOT add a tag when no text is entered and Enter is pressed', () => {
			window.control = new Tags({
				container: window.testContainer
			});

			window.control.isFocused(true);
			testUtil.hitEnter();

			assert.deepEqual(window.control.value(), []);
		});

		it('should add a tag when text is entered and the control loses focus', () => {
			window.control = new Tags({
				container: window.testContainer
			});

			window.control.isFocused(true);
			setInputValue('test2');
			window.control.isFocused(false);

			assert.deepEqual(window.control.value(), ['test2']);
		});

		it('should set the width of the text input when text is entered', () => {
			let inputElement;
			let fakeInputElement;

			window.control = new Tags({
				container: window.testContainer
			});

			inputElement = document.querySelector('.text-input');
			fakeInputElement = document.querySelector('.fake-input');

			window.control.isFocused(true);
			setInputValue('test string that is really long');

			assert.isAbove(dom.get.width(inputElement), (dom.get.width(fakeInputElement) - 2));
			assert.isBelow(dom.get.width(inputElement), (dom.get.width(fakeInputElement) + 10));
		});

		it('should remove a tag when the delete button is clicked', () => {
			window.control = new Tags({
				container: window.testContainer
			});

			window.control.isFocused(true);
			addTag('test1');
			addTag('test2');
			clickDeleteButton(0);

			assert.deepEqual(window.control.value(), ['test2']);
		});

		it('should maintain the order of tags when the first tag is deleted', () => {
			window.control = new Tags({
				container: window.testContainer
			});

			window.control.isFocused(true);
			addTag('test1');
			addTag('test2');
			addTag('test3');
			clickDeleteButton(0);

			assert.deepEqual(window.control.value(), ['test2', 'test3']);
		});

		it('should maintain the order of tags when a middle tag is deleted', () => {
			window.control = new Tags({
				container: window.testContainer
			});

			window.control.isFocused(true);
			addTag('test1');
			addTag('test2');
			addTag('test3');
			clickDeleteButton(1);

			assert.deepEqual(window.control.value(), ['test1', 'test3']);
		});

		it('should maintain the order of tags when the last tag is deleted', () => {
			window.control = new Tags({
				container: window.testContainer
			});

			window.control.isFocused(true);
			addTag('test1');
			addTag('test2');
			addTag('test3');
			clickDeleteButton(2);

			assert.deepEqual(window.control.value(), ['test1', 'test2']);
		});

		it('should be able to edit a tag by clicking on it', () => {
			window.control = new Tags({
				container: window.testContainer
			});

			window.control.isFocused(true);
			addTag('test1');
			addTag('test2');
			clickTag(0);

			assert.equal(document.querySelectorAll('.heading.hidden').length, 1);
		});

		it('should add a tag when text is entered and another tag is clicked', () => {
			window.control = new Tags({
				container: window.testContainer
			});

			window.control.isFocused(true);
			addTag('test1');
			addTag('test2');
			setInputValue('edit');
			clickTag(0);

			assert.equal(window.control.value().length, 3);
		});

		it('should be able to save an edited tag when enter is pressed', () => {
			window.control = new Tags({
				container: window.testContainer
			});

			window.control.isFocused(true);
			addTag('test1');
			clickTag(0);
			addTag('test2');

			assert.deepEqual(window.control.value(), ['test2']);
		});

		it('should remove a tag when the edit text is deleted and enter is pressed', () => {
			window.control = new Tags({
				container: window.testContainer
			});

			window.control.isFocused(true);
			addTag('test1');
			clickTag(0);
			addTag('');

			assert.deepEqual(window.control.value(), []);
		});

		it('should move the input element when a tag is being edited', () => {
			window.control = new Tags({
				container: window.testContainer
			});

			window.control.isFocused(true);
			addTag('test1');
			addTag('test2');
			addTag('test3');
			clickTag(1);

			assert.deepEqual(document.querySelector('.tags-list-container').children[1].children[0], testUtil.getTextInput());
		});

		it('should maintain the order of tags when the first tag is edited', () => {
			window.control = new Tags({
				container: window.testContainer
			});

			window.control.isFocused(true);
			addTag('test1');
			addTag('test2');
			addTag('test3');
			addTag('test4');
			clickTag(0);
			addTag('testEdit');

			assert.deepEqual(window.control.value(), ['testEdit', 'test2', 'test3', 'test4']);
		});

		it('should maintain the order of tags when a middle tag is edited', () => {
			window.control = new Tags({
				container: window.testContainer
			});

			window.control.isFocused(true);
			addTag('test1');
			addTag('test2');
			addTag('test3');
			addTag('test4');
			clickTag(1);
			addTag('testEdit');

			assert.deepEqual(window.control.value(), ['test1', 'testEdit', 'test3', 'test4']);
		});

		it('should maintain the order of tags when the last tag is edited', () => {
			window.control = new Tags({
				container: window.testContainer
			});

			window.control.isFocused(true);
			addTag('test1');
			addTag('test2');
			addTag('test3');
			addTag('test4');
			clickTag(3);
			addTag('testEdit');

			assert.deepEqual(window.control.value(), ['test1', 'test2', 'test3', 'testEdit']);
		});
	});

	describe('Value', () => {
		it('should accept a comma separated string as a value', () => {
			window.control = new Tags({
				container: window.testContainer
			});

			window.control.value('test1,test2,test 3');

			assert.equal(getRenderedTags().length, 3);
		});

		it('should not set focus when a value is set', () => {
			window.control = new Tags({
				container: window.testContainer
			});

			window.control.value('test1,test2,test 3');

			assert.isTrue(!window.control.isFocused());
		});

		it('should not show the popup when a value is set', () => {
			window.control = new Tags({
				container: window.testContainer
			});

			window.control.value('test1,test2,test 3');

			assert.isTrue(!isPopupRendered());
		});

		it('should accept an array of strings as a value', () => {
			window.control = new Tags({
				container: window.testContainer
			});

			window.control.value(['test1', 'test2', 'test 3']);

			assert.equal(getRenderedTags().length, 3);
		});

		it('should accept an array of objects with only title as a value', () => {
			window.control = new Tags({
				container: window.testContainer
			});

			window.control.value([{
				title: 'test 1 title'
			}, {
				title: 'test 2 title'
			}, {
				title: 'test 3 title'
			}]);

			assert.deepEqual(window.control.value(), ['test 1 title', 'test 2 title', 'test 3 title']);
		});

		it('should accept an array of objects with ID and title as a value', () => {
			window.control = new Tags({
				container: window.testContainer
			});

			window.control.value([{
				ID: 'test1',
				title: 'test 1 title'
			}, {
				ID: 'test2',
				title: 'test 2 title'
			}, {
				ID: 'test3',
				title: 'test 3 title'
			}]);

			assert.equal(getRenderedTags().length, 3);
		});

		it('should accept an array of objects with ID, title, and subTitle as a value', () => {
			window.control = new Tags({
				container: window.testContainer
			});

			window.control.value([{
				ID: 'test1',
				title: 'test 1 title',
				subTitle: 'sub title 1'
			}, {
				ID: 'test2',
				title: 'test 2 title',
				subTitle: 'sub title 2'
			}, {
				ID: 'test3',
				title: 'test 3 title',
				subTitle: 'sub title 3'
			}]);

			assert.equal(getRenderedTags().length, 3);
		});

		it('should only have tags for the second value when value is set twice', () => {
			window.control = new Tags({
				container: window.testContainer
			});

			window.control.value([{
				ID: 'test1',
				title: 'test 1 title',
				subTitle: 'sub title 1'
			}, {
				ID: 'test2',
				title: 'test 2 title',
				subTitle: 'sub title 2'
			}, {
				ID: 'test3',
				title: 'test 3 title',
				subTitle: 'sub title 3'
			}]);

			window.control.value([{
				ID: 'test1',
				title: 'test 1 title',
				subTitle: 'sub title 1'
			}]);

			assert.equal(getRenderedTags().length, 1);
		});

		it('should only have tags for the set value when value is set after adding tags manually', () => {
			window.control = new Tags({
				container: window.testContainer
			});

			addTag('test1');
			addTag('test2');
			addTag('test3');

			window.control.value([{
				ID: 'test1',
				title: 'test 1 title',
				subTitle: 'sub title 1'
			}]);

			assert.equal(getRenderedTags().length, 1);
		});
	});

	describe('Suggestions', () => {
		const keywordSuggestions = [
			'test 1',
			'test 2',
			'test 3'
		];
		const suggestionsWithTitles = [{
			ID: 'test1',
			title: 'test 1'
		}, {
			ID: 'test2',
			title: 'test 2'
		}, {
			ID: 'test3',
			title: 'test 3'
		}];
		const suggestionsWithSubTitles = [{
			ID: 'test1',
			title: 'test 1',
			subTitle: 'subTitle 1'
		}, {
			ID: 'test2',
			title: 'test 2',
			subTitle: 'subTitle 2'
		}, {
			ID: 'test3',
			title: 'test 3',
			subTitle: 'subTitle 3 is longer'
		}];

		testUtil.testMethod({
			methodName: 'suggestions',
			defaultSettings: {
				container: window.testContainer
			},
			defaultValue: [],
			testValue: [{
				ID: 1,
				title: 'test 1'
			}],
			secondTestValue: [{
				ID: 2,
				title: 'test 2'
			}]
		});

		it('should not show a popup when the control is focused and no suggestions are provided', () => {
			window.control = new Tags({
				container: window.testContainer
			});

			window.control.isFocused(true);

			return testUtil.defer()
				.then(() => {
					assert.isTrue(!isPopupRendered());
				});
		});

		it('should show a popup when the control is focused and suggestions are provided', () => {
			window.control = new Tags({
				container: window.testContainer,
				suggestions: keywordSuggestions
			});

			window.control.isFocused(true);

			return testUtil.defer()
				.then(() => {
					assert.isTrue(isPopupRendered());
				});
		});

		it('should remove the popup when the control loses focus', () => {
			window.control = new Tags({
				container: window.testContainer,
				suggestions: keywordSuggestions
			});

			window.control.isFocused(true).isFocused(false);

			return testUtil.delay(100)
				.then(() => {
					assert.isTrue(!isPopupRendered());
				});
		});

		it('should accept an array of strings as suggestions', () => {
			window.control = new Tags({
				container: window.testContainer,
				suggestions: keywordSuggestions
			});

			window.control.isFocused(true);

			return testUtil.defer()
				.then(() => {
					assert.equal(getRenderedSuggestions().length, 3);
				});
		});

		it('should accept an array of objects with ID and title as suggestions', () => {
			window.control = new Tags({
				container: window.testContainer,
				suggestions: suggestionsWithTitles
			});

			window.control.isFocused(true);

			return testUtil.defer()
				.then(() => {
					assert.equal(getRenderedSuggestions().length, 3);
				});
		});

		it('should accept an array of objects with ID, title, and subTitle as suggestions', () => {
			window.control = new Tags({
				container: window.testContainer,
				suggestions: suggestionsWithSubTitles
			});

			window.control.isFocused(true);

			return testUtil.defer()
				.then(() => {
					assert.equal(getRenderedSuggestions().length, 3);
				});
		});

		it('should filter suggestions with titles when text is added to the text control', () => {
			window.control = new Tags({
				container: window.testContainer,
				suggestions: suggestionsWithTitles
			});

			window.control.isFocused(true);
			setInputValue('2');

			return testUtil.defer()
				.then(() => {
					assert.equal(getRenderedSuggestions().length, 1);
				});
		});

		it('should show all suggestions if the filter text is removed', () => {
			window.control = new Tags({
				container: window.testContainer,
				suggestions: suggestionsWithTitles
			});

			window.control.isFocused(true);
			setInputValue('2');

			return testUtil.defer()
				.then(() => {
					setInputValue('');
					return testUtil.defer();
				})
				.then(() => {
					assert.equal(getRenderedSuggestions().length, 3);
				});
		});

		it('should remove the suggestions popup if a filter doesn\'t match any suggestions', () => {
			window.control = new Tags({
				container: window.testContainer,
				suggestions: suggestionsWithTitles
			});

			window.control.isFocused(true);
			setInputValue('nothing');

			return testUtil.defer()
				.then(() => {
					assert.isTrue(!isPopupRendered());
				});
		});

		it('should filter suggestions with subtitles when text is added to the text control', () => {
			window.control = new Tags({
				container: window.testContainer,
				suggestions: suggestionsWithSubTitles
			});

			window.control.isFocused(true);
			setInputValue('sub 2');

			return testUtil.defer()
				.then(() => {
					assert.equal(getRenderedSuggestions().length, 1);
				});
		});

		it('should show suggestions when editing an existing tag', () => {
			window.control = new Tags({
				container: window.testContainer,
				suggestions: suggestionsWithSubTitles
			});

			window.control.isFocused(true);
			addTag('test 1');
			addTag('sub 2');
			clickTag(1);

			return testUtil.defer()
				.then(() => {
					assert.equal(getRenderedSuggestions().length, 1);
				});
		});

		it('should show the typed text when editing a tag that was selected from the list', () => {
			window.control = new Tags({
				container: window.testContainer,
				suggestions: suggestionsWithSubTitles
			});

			window.control.isFocused(true);
			addTag('test 1');
			addTag('sub 2');
			clickTag(1);

			assert.equal(testUtil.getTextInput().value, 'sub 2');
		});

		it('should remember the typed input after selecting a suggestion and then editing that tag', () => {
			window.control = new Tags({
				container: window.testContainer,
				suggestions: suggestionsWithSubTitles
			});

			window.control.isFocused(true);
			setInputValue('te 2');
			clickOption(0);
			clickTag(0);

			assert.equal(testUtil.getTextInput().value, 'te 2');
		});

		it('should filter suggestions on previously typed text when editing a tag', () => {
			window.control = new Tags({
				container: window.testContainer,
				suggestions: suggestionsWithSubTitles
			});

			window.control.isFocused(true);
			addTag('test 1');
			addTag('sub 2');
			clickTag(1);

			return testUtil.defer()
				.then(() => {
					assert.equal(getRenderedSuggestions().length, 1);
				});
		});

		it('should update the suggestions if the background is clicked while editing a tag', () => {
			window.control = new Tags({
				container: window.testContainer,
				suggestions: suggestionsWithSubTitles
			});

			window.control.isFocused(true);
			addTag('test 1');
			addTag('sub 2');
			clickTag(1);

			return testUtil.defer()
				.then(() => {
					testUtil.simulateClick(document.querySelector('.tags-list-container'));

					return testUtil.defer();
				})
				.then(() => {
					assert.equal(getRenderedSuggestions().length, 3);
				});
		});

		it('should not have multiple popups after several tags have been clicked', () => {
			window.control = new Tags({
				container: window.testContainer,
				suggestions: suggestionsWithSubTitles
			});

			window.control.isFocused(true);
			addTag('test 1');
			addTag('sub 2');
			addTag('test 2');
			addTag('test 3');
			clickTag(1);
			clickTag(0);
			clickTag(3);

			return testUtil.defer()
				.then(() => {
					assert.isTrue(isPopupRendered());
				});
		});

		it('should not have multiple popups after several tags have been clicked and the background is clicked', () => {
			window.control = new Tags({
				container: window.testContainer,
				suggestions: suggestionsWithSubTitles
			});

			window.control.isFocused(true);
			addTag('test 1');
			addTag('sub 2');
			addTag('test 2');
			addTag('test 3');
			clickTag(1);
			clickTag(0);
			clickTag(3);
			testUtil.simulateClick(document.querySelector('.tags-list-container'));

			return testUtil.defer()
				.then(() => {
					assert.isTrue(isPopupRendered());
				});
		});

		it('should save a tag when a suggestion is clicked', () => {
			window.control = new Tags({
				container: window.testContainer,
				suggestions: suggestionsWithSubTitles
			});

			window.control.isFocused(true);
			return testUtil.defer()
				.then(() => {
					clickOption(1);

					assert.deepEqual(window.control.value(), ['test2']);
				});
		});

		it('should have one rendered tag when a suggestion is clicked', () => {
			window.control = new Tags({
				container: window.testContainer,
				suggestions: suggestionsWithSubTitles
			});

			window.control.isFocused(true);
			return testUtil.defer()
				.then(() => {
					clickOption(1);

					assert.equal(document.querySelectorAll('.heading').length, 1);
				});
		});

		it('should have one rendered tag when a suggestion is clicked after some text is entered', () => {
			window.control = new Tags({
				container: window.testContainer,
				suggestions: suggestionsWithSubTitles
			});

			window.control.isFocused(true);
			setInputValue('te');
			return testUtil.defer()
				.then(() => {
					clickOption(1);

					assert.equal(document.querySelectorAll('.heading').length, 1);
				});
		});

		it('should maintain the order of tags when the first tag is replaced with a suggestion', () => {
			window.control = new Tags({
				container: window.testContainer,
				suggestions: suggestionsWithSubTitles
			});

			window.control.isFocused(true);
			addTag('typed1');
			addTag('typed2');
			addTag('typed3');
			addTag('typed4');
			clickTag(0);
			setInputValue('');
			return testUtil.defer()
				.then(() => {
					clickOption(1);

					assert.deepEqual(window.control.value(), ['test2', 'typed2', 'typed3', 'typed4']);
				});
		});

		it('should maintain the order of tags when a middle tag is replaced with a suggestion', () => {
			window.control = new Tags({
				container: window.testContainer,
				suggestions: suggestionsWithSubTitles
			});

			window.control.isFocused(true);
			addTag('typed1');
			addTag('typed2');
			addTag('typed3');
			addTag('typed4');
			clickTag(1);
			setInputValue('');
			return testUtil.defer()
				.then(() => {
					clickOption(1);

					assert.deepEqual(window.control.value(), ['typed1', 'test2', 'typed3', 'typed4']);
				});
		});

		it('should maintain the order of tags when the last tag is replaced with a suggestion', () => {
			window.control = new Tags({
				container: window.testContainer,
				suggestions: suggestionsWithSubTitles
			});

			window.control.isFocused(true);
			addTag('typed1');
			addTag('typed2');
			addTag('typed3');
			addTag('typed4');
			clickTag(3);
			setInputValue('');
			return testUtil.defer()
				.then(() => {
					clickOption(1);

					assert.deepEqual(window.control.value(), ['typed1', 'typed2', 'typed3', 'test2']);
				});
		});

		it('should only add one tag if text is typed and an option is clicked', () => {
			window.control = new Tags({
				container: window.testContainer,
				suggestions: suggestionsWithSubTitles
			});

			window.control.isFocused(true);
			setInputValue('te 2');
			return testUtil.defer()
				.then(() => {
					clickOption(0);

					assert.equal(getRenderedTags().length, 1);
				});
		});

		it('should focus the first item in the popup when the down arrow is pressed', () => {
			window.control = new Tags({
				container: window.testContainer,
				suggestions: suggestionsWithSubTitles
			});

			window.control.isFocused(true);
			setInputValue('te 2');

			return testUtil.defer()
				.then(() => {
					testUtil.simulateKeyEvent(testUtil.getTextInput(), keyCodes('down'), KEY_DOWN_EVENT);

					assert.equal(getRenderedSuggestions()[0], document.activeElement);
				});
		});
	});

	describe('BreakOnSpaces', () => {
		testUtil.testMethod({
			methodName: 'breakOnSpaces',
			defaultSettings: {
				container: window.testContainer
			},
			defaultValue: false,
			testValue: true,
			secondTestValue: false
		});

		it('should add multiple tags when breakOnSpaces is false and a string with commas and semicolons is entered', () => {
			window.control = new Tags({
				container: window.testContainer,
				breakOnSpaces: false
			});

			window.control.isFocused(true);
			addTag('test 1,test 2;test 3');

			assert.equal(getRenderedTags().length, 3);
		});

		it('should add multiple tags when breakOnSpaces is true and a string with spaces is entered', () => {
			window.control = new Tags({
				container: window.testContainer,
				breakOnSpaces: true
			});

			window.control.isFocused(true);
			addTag('test1 test2 test3');

			assert.equal(getRenderedTags().length, 3);
		});

		it('should add multiple tags when breakOnSpaces is true and a string with spaces, commas, and semicolons is entered', () => {
			window.control = new Tags({
				container: window.testContainer,
				breakOnSpaces: true
			});

			window.control.isFocused(true);
			addTag('  test1    test2, test3;test4   ');

			assert.equal(getRenderedTags().length, 4);
		});

		it('should break on spaces when a string is set as a the value', () => {
			window.control = new Tags({
				container: window.testContainer,
				breakOnSpaces: true
			});

			window.control.value('  test1    test2, test3;test4   ');

			assert.equal(getRenderedTags().length, 4);
		});
	});
});
