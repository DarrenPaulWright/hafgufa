import { delay } from 'async-agent';
import keyCodes from 'keycodes';
import {
	applySettings,
	AUTO,
	DockPoint,
	HUNDRED_PERCENT,
	isString,
	methodArray,
	methodBoolean,
	methodString
} from 'type-enforcer-ui';
import controlTypes from '../controlTypes.js';
import Div from '../elements/Div.js';
import Heading from '../elements/Heading.js';
import Span from '../elements/Span.js';
import TextInput from '../forms/TextInput.js';
import { CLEAR_ICON } from '../icons.js';
import ActionButtonMixin from '../mixins/ActionButtonMixin.js';
import Menu from '../other/Menu.js';
import assign from '../utility/assign.js';
import { KEY_DOWN_EVENT } from '../utility/domConstants.js';
import search from '../utility/search.js';
import setDefaults from '../utility/setDefaults.js';
import { filteredTitle } from '../utility/sortBy.js';
import FormControl from './FormControl.js';
import './Tags.less';

const DEFAULT_TEXT_WIDTH = 20;
const MAX_SUGGESTION_HEIGHT = '20rem';

const TEXT_INPUT = Symbol();
const FAKE_INPUT = Symbol();
const LIST_CONTAINER = Symbol();
const SUGGESTION_MENU = Symbol();
const CURRENT_TAGS = Symbol();
const CURRENT_EDIT_OFFSET = Symbol();
const IS_MOVING_TEXT_INPUT = Symbol();
const MAX_TAG_WIDTH = Symbol();

const onBlurTextInput = Symbol();
const onChangeTextInput = Symbol();
const saveTextChanges = Symbol();
const addTag = Symbol();
const moveTextInputTo = Symbol();
const updateTag = Symbol();
const removeTag = Symbol();
const removeAllTags = Symbol();
const buildSuggestionPopup = Symbol();
const removeSuggestionPopup = Symbol();
const updateSuggestionsList = Symbol();
const selectSuggestion = Symbol();

/**
 * A control for adding tags.
 *
 * @module Tags
 * @constructor
 */
export default class Tags extends ActionButtonMixin(FormControl) {
	constructor(settings = {}) {
		const listContainer = new Div({
			classes: 'tags-list-container clearfix',
			on: {
				click() {
					if (self[TEXT_INPUT].isFocused()) {
						self[saveTextChanges]();
					}
					else {
						self[TEXT_INPUT].isFocused(true);
					}
				}
			}
		});

		super(setDefaults({
			type: controlTypes.TAGS,
			width: HUNDRED_PERCENT
		}, settings, {
			ActionButtonMixin: assign(settings.ActionButtonMixin, {
				container: () => listContainer
			}),
			FocusMixin: assign(settings.FocusMixin, {
				mainControl: new TextInput({
					container: listContainer,
					width: DEFAULT_TEXT_WIDTH,
					minWidth: DEFAULT_TEXT_WIDTH,
					textWidth: HUNDRED_PERCENT,
					changeDelay: 0,
					onEnter(value) {
						self[saveTextChanges](value);
					},
					onChange(value) {
						self[onChangeTextInput](value);
					},
					actionButtonIcon: ''
				}),
				getFocus() {
					return self[TEXT_INPUT].isFocused() || (self[SUGGESTION_MENU] && self[SUGGESTION_MENU].isFocused()) || false;
				}
			})
		}));

		const self = this;

		self[CURRENT_TAGS] = [];
		self[CURRENT_EDIT_OFFSET] = null;
		self[IS_MOVING_TEXT_INPUT] = false;
		self[MAX_TAG_WIDTH] = 600;

		self.addClass('tags');

		self[FAKE_INPUT] = new Span({
			container: self,
			classes: 'fake-input'
		});
		self[LIST_CONTAINER] = listContainer;
		self[LIST_CONTAINER].container(self);
		self[TEXT_INPUT] = settings.FocusMixin.mainControl;
		self[onChangeTextInput]('');

		self.onFocus(() => {
			self[LIST_CONTAINER].addClass('focused');
			self[buildSuggestionPopup]();
			self[TEXT_INPUT].on(KEY_DOWN_EVENT, (event) => {
				if (event.keyCode === keyCodes('down')) {
					event.preventDefault();
					if (self[SUGGESTION_MENU] && !self[SUGGESTION_MENU].isFocused()) {
						self[SUGGESTION_MENU].isFocused(true);
					}
				}
			});
		});
		self.onBlur(self[onBlurTextInput]);

		applySettings(self, settings);

		self.onChange((newValue) => {
				self[TEXT_INPUT].placeholder(newValue.length ? '.' : self.placeholder());
			})
			.onResize(() => {
				let padding = self[LIST_CONTAINER].width() - self[LIST_CONTAINER].innerWidth();
				padding += self[TEXT_INPUT].marginWidth;

				self[MAX_TAG_WIDTH] = self.innerWidth() - padding;
				self[TEXT_INPUT].maxWidth(self[MAX_TAG_WIDTH]);
				self[CURRENT_TAGS].forEach((tag) => {
					tag.heading.maxWidth(self[MAX_TAG_WIDTH]);
				});
			})
			.onRemove(() => {
				self[removeSuggestionPopup](true);
			});
	}

	/**
	 * When the text control loses focus, save the contents as a tag
	 *
	 * @function onBlurTextInput
	 */
	[onBlurTextInput]() {
		const self = this;

		if (!self.isRemoved && !self.isFocused()) {
			if (!self[IS_MOVING_TEXT_INPUT] && !self[SUGGESTION_MENU]) {
				self[saveTextChanges]();
			}
			self[LIST_CONTAINER].removeClass('focused');
			self[removeSuggestionPopup]();
			self[TEXT_INPUT].off(KEY_DOWN_EVENT);
		}
	}

	/**
	 * When the text control changes content, set the width.
	 *
	 * @param newValue
	 */
	[onChangeTextInput](newValue) {
		const self = this;

		self[FAKE_INPUT].text(newValue);

		if (self[CURRENT_TAGS].length || newValue.length !== 0) {
			self[TEXT_INPUT].width(self[FAKE_INPUT].borderWidth() + self[TEXT_INPUT].paddingWidth + 8);
		}
		else {
			self[TEXT_INPUT].width(HUNDRED_PERCENT);
		}

		if (self.isFocused()) {
			self[updateSuggestionsList]();
		}
	}

	/**
	 * Save the current value of the text control
	 */
	[saveTextChanges]() {
		const self = this;
		const value = self[TEXT_INPUT].value();
		let totalIndex = 0;
		const setTag = (item, index) => {
			const newValue = {
				id: item,
				title: item
			};

			if (self[CURRENT_EDIT_OFFSET] !== null && index === 0) {
				self[updateTag](newValue, item);
			}
			else {
				self[addTag](newValue, item, false, true);
			}
		};

		if (value) {
			const parsedSearch = search.parseNeedle(value, self.breakOnSpaces());
			parsedSearch.forEach((orValues, orIndex) => {
				orValues.forEach((item) => {
					setTag(item, totalIndex);
					totalIndex++;
				});
				if (orIndex < parsedSearch.length - 1) {
					setTag('OR', totalIndex);
					totalIndex++;
				}
			});
		}
		else if (self[CURRENT_EDIT_OFFSET] !== null) {
			self[removeTag]({
				tagOffset: self[CURRENT_EDIT_OFFSET]
			});
		}
	}

	/**
	 * Add a new tag to the end of the list of tags.
	 *
	 * @param value
	 * @param typedInput
	 * @param skipCallback
	 * @param isHardTrigger
	 */
	[addTag](value, typedInput, skipCallback, isHardTrigger) {
		const self = this;

		if (!self.isRemoved) {
			if (!typedInput) {
				typedInput = value.title;
			}

			const editTag = function() {
				const heading = this;
				const initialWidth = heading.width();

				if (!self.isRemoved) {
					if (self[TEXT_INPUT].value() !== '') {
						self[TEXT_INPUT].isFocused(false);
					}
					self[CURRENT_EDIT_OFFSET] = heading.data().tagOffset;
					heading.isVisible(false);
					self[moveTextInputTo](
						self[CURRENT_EDIT_OFFSET] - 1,
						self[CURRENT_TAGS][self[CURRENT_EDIT_OFFSET]].typedInput
					);
					self[TEXT_INPUT]
						.width(initialWidth)
						.minWidth(initialWidth)
						.isFocused(true);
				}
			};

			const heading = new Heading({
				container: self[LIST_CONTAINER],
				width: AUTO,
				id: value.id,
				maxWidth: self[MAX_TAG_WIDTH],
				title: value.title,
				showExpander: false,
				showCheckbox: false,
				buttons: [{
					icon: CLEAR_ICON,
					onClick(data) {
						self[removeTag](data);
					}
				}],
				data: {
					tagOffset: self[CURRENT_TAGS].length
				},
				onSelect: editTag,
				isSelectable: true
			});

			heading.resize(true);

			self[CURRENT_TAGS].push({
				heading,
				id: value.id,
				typedInput
			});

			self[moveTextInputTo](self[CURRENT_TAGS].length - 1);
			self[onChangeTextInput]('');

			self.triggerChange(true, skipCallback, isHardTrigger);
			heading.resize();
		}
	}

	/**
	 * Place the text control somewhere in the list of tags.
	 *
	 * @param offset
	 * @param newValue
	 */
	[moveTextInputTo](offset, newValue) {
		const self = this;
		const isFocused = self[TEXT_INPUT].isFocused();

		self[IS_MOVING_TEXT_INPUT] = true;
		self[TEXT_INPUT].value('', true);

		if (self[CURRENT_TAGS].length > 1) {
			self[LIST_CONTAINER].insertAt(self[TEXT_INPUT], Math.max(offset, 0) + 1);
		}
		else {
			self[LIST_CONTAINER].append(self[TEXT_INPUT]);
		}

		self[TEXT_INPUT].isFocused(false).value(newValue || '', true);

		if (isFocused) {
			self[TEXT_INPUT].isFocused(true);
		}
		if (self[SUGGESTION_MENU] && !self.isRemoved) {
			self[SUGGESTION_MENU].anchor(self[TEXT_INPUT].getInput().element);
		}
		self[IS_MOVING_TEXT_INPUT] = false;
	}

	/**
	 * When done editing, update the tag info and display the tag.
	 *
	 * @param newValue
	 * @param typedInput
	 */
	[updateTag](newValue, typedInput) {
		const self = this;
		self[CURRENT_TAGS][self[CURRENT_EDIT_OFFSET]].id = newValue.id;
		self[CURRENT_TAGS][self[CURRENT_EDIT_OFFSET]].typedInput = typedInput;
		self[CURRENT_TAGS][self[CURRENT_EDIT_OFFSET]].heading
			.id(newValue.id)
			.title(newValue.title)
			.subTitle(newValue.subTitle)
			.isVisible(true)
			.data({
				tagOffset: self[CURRENT_EDIT_OFFSET]
			});

		self[CURRENT_EDIT_OFFSET] = null;

		self[moveTextInputTo](self[CURRENT_TAGS].length - 1);
		self[TEXT_INPUT]
			.width(DEFAULT_TEXT_WIDTH)
			.minWidth(DEFAULT_TEXT_WIDTH)
			.isFocused(true);

		self.triggerChange();
	}

	/**
	 * Remove a tag.
	 *
	 * @param data
	 */
	[removeTag](data) {
		const self = this;
		const tagOffset = data.tagOffset;

		if (self[CURRENT_TAGS][tagOffset]) {
			self[CURRENT_TAGS][tagOffset].heading.remove();
			self[CURRENT_TAGS].splice(tagOffset, 1);
		}

		self[CURRENT_TAGS].forEach((tag, index) => {
			tag.tagOffset = index;
			tag.heading.data({
				tagOffset: index
			});
		});

		self.triggerChange();
		self[TEXT_INPUT].triggerChange();
	}

	/**
	 * Remove all tags.
	 */
	[removeAllTags]() {
		const self = this;

		self[CURRENT_TAGS].forEach((tag) => {
			tag.heading.remove();
		});
		self[CURRENT_TAGS].length = 0;
	}

	/**
	 * Build the base suggestion popup with virtual list control.
	 */
	[buildSuggestionPopup]() {
		const self = this;

		if (self.suggestions().length && self.isFocused() && !self.isRemoved) {
			if (!self[SUGGESTION_MENU]) {
				self[SUGGESTION_MENU] = new Menu({
					anchor: self[TEXT_INPUT].getInput(),
					anchorDockPoint: DockPoint.POINTS.BOTTOM_LEFT,
					popupDockPoint: DockPoint.POINTS.TOP_LEFT,
					classes: 'tags-menu',
					isSticky: true,
					onSelect(id) {
						self[selectSuggestion](id);
					},
					isMultiSelect: false,
					keepMenuOpen: true,
					onRemove() {
						self[SUGGESTION_MENU] = null;
						self[onBlurTextInput]();
					},
					maxHeight: MAX_SUGGESTION_HEIGHT
				});
			}

			self[updateSuggestionsList]();
		}
	}

	[removeSuggestionPopup](isImmediate) {
		const self = this;

		const doRemove = () => {
			if (self[SUGGESTION_MENU] && (isImmediate || !self.isFocused())) {
				self[SUGGESTION_MENU].remove();
			}
		};

		if (isImmediate) {
			doRemove();
		}
		else {
			delay(() => {
				doRemove();
			}, 100);
		}
	}

	/**
	 * Determine which suggestions to put in the popup and add them.
	 */
	[updateSuggestionsList]() {
		const self = this;
		let filteredSuggestions = self.suggestions();
		const currentTypedInput = self[TEXT_INPUT].value();
		const tags = self[CURRENT_TAGS].map((item) => item.id);

		if (!self.isRemoved && filteredSuggestions.length !== 0) {
			if (self[CURRENT_EDIT_OFFSET] !== null) {
				tags.splice(self[CURRENT_EDIT_OFFSET], 1);
			}

			filteredSuggestions = filteredSuggestions.filter((suggestion) => {
				return !tags.includes(suggestion.id);
			});

			if (currentTypedInput) {
				filteredSuggestions = filteredSuggestions.filter((suggestion) => {
					return search.find(currentTypedInput, suggestion.title || '') ||
						search.find(currentTypedInput, suggestion.subTitle || '');
				});
				filteredTitle(filteredSuggestions, currentTypedInput);
			}

			if (filteredSuggestions.length !== 0) {
				if (self[SUGGESTION_MENU]) {
					self[SUGGESTION_MENU].menuItems(filteredSuggestions);
				}
				else {
					self[buildSuggestionPopup]();
				}
			}
			else {
				self[removeSuggestionPopup](true);
			}
		}
	}

	/**
	 * When a suggestion is clicked save it's value as a tag.
	 *
	 * @param suggestionId
	 */
	[selectSuggestion](suggestionId) {
		const self = this;
		const newValue = self.suggestions().find((item) => item.id === suggestionId);

		if (self[CURRENT_EDIT_OFFSET] !== null) {
			self[updateTag](newValue, self[TEXT_INPUT].value());
		}
		else {
			self[addTag](newValue, self[TEXT_INPUT].value());
		}
	}
}

Object.assign(Tags.prototype, {
	/**
	 * @method value
	 * @member module:Tags
	 * @instance
	 * @param {string} [value]
	 * @returns {string|this}
	 */
	value: methodArray({
		set(newValue) {
			const self = this;

			self[removeAllTags]();

			if (isString(newValue)) {
				const parsedSearch = search.parseNeedle(newValue, self.breakOnSpaces());
				newValue = [];
				parsedSearch.forEach((orValues, orIndex) => {
					orValues.forEach((item) => {
						newValue.push(item);
					});
					if (orIndex < parsedSearch.length - 1) {
						newValue.push('OR');
					}
				});
			}

			if (isString(newValue[0])) {
				newValue = newValue.filter(Boolean).map((value) => ({
					id: value,
					title: value
				}));
			}

			newValue.forEach((value) => {
				if (!value.id) {
					value.id = value.title;
				}
				self[addTag](value, null, true, false);
			});
			self.triggerChange(true, true, false);
		},
		get() {
			return this[CURRENT_TAGS].map((item) => item.id);
		},
		other: String
	}),

	/**
	 * Get or set an array of suggestions.
	 *
	 * @method suggestions
	 * @member module:Tags
	 * @instance
	 * @param {Array} [suggestions] - Can be an array of strings or objects
	 * @param {Array} suggestions.id - Must be a unique id
	 * @param {Array} suggestions.title - The main string to display
	 * @param {Array} [suggestions.subTitle] - A subTitle or alternate text to display
	 * @returns {Array|this}
	 */
	suggestions: methodArray({
		set(suggestions) {
			const self = this;

			suggestions = suggestions.map((suggestion) => {
				if (isString(suggestion)) {
					suggestion = suggestion.replace(/[^\da-z]/ugi, '');
					return {
						id: suggestion.trim(),
						title: suggestion.trim()
					};
				}

				return suggestion;
			});

			self.suggestions(suggestions.reduce((result, suggestion) => {
				if (result.findIndex((item) => item.title === suggestion.title) === -1) {
					result.push(suggestion);
				}
				return result;
			}, []));
			if (self[SUGGESTION_MENU]) {
				self[updateSuggestionsList]();
			}
		}
	}),

	/**
	 * @method suggestionsDataSource
	 * @member module:Tags
	 * @instance
	 * @param {string} [newSuggestionsDataSource]
	 * @returns {string|this}
	 */
	// suggestionsDataSource: methodObject({
	// 	init: {},
	// 	before(oldValue) {
	// 		if (oldValue) {
	// 			if (suggestionsDataSourceOnChangeId) {
	// 				oldValue.store.offChange(suggestionsDataSourceOnChangeId);
	// 				suggestionsDataSourceOnChangeId = null;
	// 			}
	// 		}
	// 	},
	// 	set(newValue) {
	// 		if (newValue.store) {
	// 			if (newValue.key) {
	// 				suggestionsDataSourceOnChangeId = dataSource.uniqueBy(newValue, self.suggestions);
	// 			}
	// 		}
	// 	}
	// }),

	/**
	 * @method placeholder
	 * @member module:Tags
	 * @instance
	 * @param {string} [newPlaceholder]
	 * @returns {string|this}
	 */
	placeholder: methodString({
		set(newValue) {
			this[TEXT_INPUT].placeholder(newValue);
		}
	}),

	/**
	 * Get or set whether the user input should be broken into seperate tags when a space is present in the input
	 *
	 * @method breakOnSpaces
	 * @member module:Tags
	 * @instance
	 * @param {boolean} [breakOnSpaces]
	 * @returns {boolean|this}
	 */
	breakOnSpaces: methodBoolean()
});
