import { delay } from 'async-agent';
import { event } from 'd3';
import keyCodes from 'keycodes';
import { AUTO, DockPoint, enforce, HUNDRED_PERCENT, isString, method } from 'type-enforcer';
import dom from '../../utility/dom';
import { KEY_DOWN_EVENT } from '../../utility/domConstants';
import objectHelper from '../../utility/objectHelper';
import { filteredTitle } from '../../utility/sortBy';
import stringHelper from '../../utility/stringHelper';
import controlTypes from '../controlTypes';
import Heading from '../elements/Heading';
import TextInput from '../forms/TextInput';
import { CLEAR_ICON } from '../icons';
import Container from '../layout/Container';
import ActionButtonMixin from '../mixins/ActionButtonMixin';
import FocusMixin from '../mixins/FocusMixin';
import Menu from '../other/Menu';
import FormControl from './FormControl';
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
 * @module Tags
 * @constructor
 */
export default class Tags extends ActionButtonMixin(FocusMixin(FormControl)) {
	constructor(settings = {}) {
		let self;
		let listContainer = new Container({
			classes: 'tags-list-container',
			removeClass: 'container',
			on: {
				click: () => {
					if (self[TEXT_INPUT].isFocused()) {
						self[saveTextChanges]();
					}
					else {
						self[TEXT_INPUT].focus();
					}
				}
			}
		});
		let textInput = new TextInput({
			container: listContainer,
			width: DEFAULT_TEXT_WIDTH,
			minWidth: DEFAULT_TEXT_WIDTH,
			textWidth: HUNDRED_PERCENT,
			changeDelay: 0,
			onEnter: (value) => {
				self[saveTextChanges](value);
			},
			onChange: (value) => {
				self[onChangeTextInput](value);
			},
			actionButtonIcon: ''
		});

		settings.type = settings.type || controlTypes.TAGS;
		settings.width = enforce.cssSize(settings.width, HUNDRED_PERCENT, true);
		settings.FocusMixin = settings.FocusMixin || {};
		settings.FocusMixin.mainControl = textInput;
		settings.FocusMixin.getFocus = () => {
			return self[TEXT_INPUT].isFocused() || (self[SUGGESTION_MENU] && self[SUGGESTION_MENU].isFocused()) || false;
		};
		settings.ActionButtonMixin = settings.ActionButtonMixin || {};
		settings.ActionButtonMixin.container = () => listContainer;

		super(settings);

		self = this;

		self[CURRENT_TAGS] = [];
		self[CURRENT_EDIT_OFFSET] = null;
		self[IS_MOVING_TEXT_INPUT] = false;
		self[MAX_TAG_WIDTH] = 600;

		self.addClass('tags');

		self[FAKE_INPUT] = dom.appendNewTo(self, 'fake-input', 'span');
		self[LIST_CONTAINER] = listContainer;
		self[LIST_CONTAINER].container(self);
		self[TEXT_INPUT] = textInput;
		self[onChangeTextInput]({
			value: ''
		});

		self.onFocus(() => {
			self[LIST_CONTAINER].addClass('focused');
			self[buildSuggestionPopup]();
			self[TEXT_INPUT].on(KEY_DOWN_EVENT, () => {
				if (event.keyCode === keyCodes('down')) {
					event.preventDefault();
					if (self[SUGGESTION_MENU] && !self[SUGGESTION_MENU].isFocused()) {
						self[SUGGESTION_MENU].isFocused(true);
					}
				}
			});
		});
		self.onBlur(self[onBlurTextInput]);

		objectHelper.applySettings(self, settings);

		self.onChange((newValue) => {
			self[TEXT_INPUT].placeholder(newValue.value.length ? '.' : self.placeholder());
		});

		self.onResize(() => {
			let padding = self[LIST_CONTAINER].width() - self[LIST_CONTAINER].innerWidth();
			padding += dom.get.margins.width(self[TEXT_INPUT]);

			self[MAX_TAG_WIDTH] = self.width() - padding;
			self[TEXT_INPUT].maxWidth(self[MAX_TAG_WIDTH]);
			self[CURRENT_TAGS].forEach((tag) => {
				tag.heading.maxWidth(self[MAX_TAG_WIDTH]);
			});
		});

		self.onRemove(() => {
			self[removeAllTags]();
			self[removeSuggestionPopup](true);
			self[TEXT_INPUT].remove();
			self[TEXT_INPUT] = null;
			self[LIST_CONTAINER].remove();
			self[LIST_CONTAINER] = null;
		});
	}

	/**
	 * When the text control loses focus, save the contents as a tag
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
	 * When the text control changes content, set the width
	 * @function onChangeTextInput
	 */
	[onChangeTextInput](newValue) {
		const self = this;

		self[FAKE_INPUT].textContent = newValue.value;

		if (self[CURRENT_TAGS].length || newValue.value.length) {
			self[TEXT_INPUT].width(dom.get.width(self[FAKE_INPUT]) + dom.get.paddings.width(self[TEXT_INPUT]) + 8);
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
	 * @function saveTextChanges
	 */
	[saveTextChanges]() {
		const self = this;
		const value = self[TEXT_INPUT].value();
		let totalIndex = 0;
		const setTag = (item, index) => {
			const newValue = {
				ID: item,
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
			const parsedSearch = stringHelper.parseSearch(value, self.breakOnSpaces());
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
	 * Add a new tag to the end of the list of tags
	 * @function addTag
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
						self[TEXT_INPUT].blur();
					}
					self[CURRENT_EDIT_OFFSET] = heading.data().tagOffset;
					heading.isVisible(false);
					self[moveTextInputTo](self[CURRENT_EDIT_OFFSET] - 1, self[CURRENT_TAGS][self[CURRENT_EDIT_OFFSET]].typedInput);
					self[TEXT_INPUT]
						.width(initialWidth)
						.minWidth(initialWidth)
						.focus();
				}
			};

			const heading = new Heading({
				container: self[LIST_CONTAINER],
				width: AUTO,
				ID: value.ID,
				maxWidth: self[MAX_TAG_WIDTH],
				title: value.title,
				showExpander: false,
				showCheckbox: false,
				buttons: [{
					icon: CLEAR_ICON,
					onClick: (data) => {
						self[removeTag](data);
					}
				}],
				data: {
					tagOffset: self[CURRENT_TAGS].length
				},
				onSelect: editTag,
				isSelectable: true
			});

			self[CURRENT_TAGS].push({
				heading: heading,
				ID: value.ID,
				typedInput: typedInput
			});

			self[moveTextInputTo](self[CURRENT_TAGS].length - 1);
			self[onChangeTextInput]({
				value: ''
			});

			self.triggerChange(true, skipCallback, isHardTrigger);
			heading.resize();
		}
	}

	/**
	 * Place the text control somewhere in the list of tags.
	 * @function moveTextInputTo
	 */
	[moveTextInputTo](offset, newValue) {
		const self = this;
		const isFocused = self[TEXT_INPUT].isFocused();

		self[IS_MOVING_TEXT_INPUT] = true;
		self[TEXT_INPUT].value('', true);

		if (self[CURRENT_TAGS].length > 1) {
			if (offset === -1) {
				dom.appendBefore(self[CURRENT_TAGS][1].heading, self[TEXT_INPUT]);
			}
			else {
				dom.appendAfter(self[CURRENT_TAGS][offset].heading, self[TEXT_INPUT]);
			}
		}
		else {
			dom.appendTo(self[LIST_CONTAINER], self[TEXT_INPUT]);
		}

		self[TEXT_INPUT].blur().value(newValue || '', true);

		if (isFocused) {
			self[TEXT_INPUT].focus();
		}
		if (self[SUGGESTION_MENU] && !self.isRemoved) {
			self[SUGGESTION_MENU].anchor(self[TEXT_INPUT].getInput());
		}
		self[IS_MOVING_TEXT_INPUT] = false;
	}

	/**
	 * When done editing, update the tag info and display the tag.
	 * @function updateTag
	 */
	[updateTag](newValue, typedInput) {
		const self = this;
		self[CURRENT_TAGS][self[CURRENT_EDIT_OFFSET]].ID = newValue.ID;
		self[CURRENT_TAGS][self[CURRENT_EDIT_OFFSET]].typedInput = typedInput;
		self[CURRENT_TAGS][self[CURRENT_EDIT_OFFSET]].heading
			.ID(newValue.ID)
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
			.focus();

		self.triggerChange();
	}

	/**
	 * Remove a tag
	 * @function removeTag
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
	 * Remove all tags
	 * @function removeAllTags
	 */
	[removeAllTags]() {
		const self = this;

		self[CURRENT_TAGS].forEach((tag) => {
			tag.heading.remove();
		});
		self[CURRENT_TAGS].length = 0;
	}

	/**
	 * Build the base suggestion popup with virtual list control
	 * @function buildSuggestionPopup
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
					onSelect: (id) => {
						self[selectSuggestion](id);
					},
					isMultiSelect: false,
					keepMenuOpen: true,
					onRemove: function() {
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
	 * Determine which suggestions to put in the popup and add them
	 * @function updateSuggestionsList
	 */
	[updateSuggestionsList]() {
		const self = this;
		let filteredSuggestions = self.suggestions();
		const currentTypedInput = self[TEXT_INPUT].value();
		const tags = self[CURRENT_TAGS].map((item) => item.ID);

		if (!self.isRemoved && filteredSuggestions.length) {
			if (self[CURRENT_EDIT_OFFSET] !== null) {
				tags.splice(self[CURRENT_EDIT_OFFSET], 1);
			}

			filteredSuggestions = filteredSuggestions.filter((suggestion) => {
				return !tags.includes(suggestion.ID);
			});

			if (currentTypedInput) {
				filteredSuggestions = filteredSuggestions.filter((suggestion) => stringHelper.isEachInString(currentTypedInput, suggestion.title || '') ||
					stringHelper.isEachInString(currentTypedInput, suggestion.subTitle || ''));
				filteredTitle(filteredSuggestions, currentTypedInput);
			}

			if (filteredSuggestions.length) {
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
	 * When a suggestion is clicked save it's value as a tag
	 * @function selectSuggestion
	 */
	[selectSuggestion](suggestionID) {
		const self = this;
		const newValue = self.suggestions().find((item) => item.ID === suggestionID);

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
	 * @arg {String} [value]
	 * @returns {String|this}
	 */
	value: method.array({
		set: function(newValue) {
			const self = this;

			self[removeAllTags]();

			if (typeof newValue === 'string') {
				const parsedSearch = stringHelper.parseSearch(newValue, self.breakOnSpaces());
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
					ID: value,
					title: value
				}));
			}

			newValue.forEach((value) => {
				if (!value.ID) {
					value.ID = value.title;
				}
				self[addTag](value, null, true, false);
			});
			self.triggerChange(true, true, false);
		},
		get: function() {
			return this[CURRENT_TAGS].map((item) => item.ID);
		},
		other: String
	}),

	/**
	 * Get or set an array of suggestions.
	 * @method suggestions
	 * @member module:Tags
	 * @instance
	 * @arg {Array} [suggestions] - Can be an array of strings or objects
	 * @arg {Array} suggestions.ID - Must be a unique id
	 * @arg {Array} suggestions.title - The main string to display
	 * @arg {Array} [suggestions.subTitle] - A subTitle or alternate text to display
	 * @returns {Array|this}
	 */
	suggestions: method.array({
		set: function(suggestions) {
			const self = this;

			suggestions = suggestions.map((suggestion) => {
				if (isString(suggestion)) {
					suggestion = suggestion.replace(/[^0-9a-z]/gi, '');
					return {
						ID: suggestion.trim(),
						title: suggestion.trim()
					};
				}
				else {
					return suggestion;
				}
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
	 * @arg {String} [newSuggestionsDataSource]
	 * @returns {String|this}
	 */
	// suggestionsDataSource: method.object({
	// 	init: {},
	// 	before: function(oldValue) {
	// 		if (oldValue) {
	// 			if (suggestionsDataSourceOnChangeID) {
	// 				oldValue.store.offChange(suggestionsDataSourceOnChangeID);
	// 				suggestionsDataSourceOnChangeID = null;
	// 			}
	// 		}
	// 	},
	// 	set: function(newValue) {
	// 		if (newValue.store) {
	// 			if (newValue.key) {
	// 				suggestionsDataSourceOnChangeID = dataSource.uniqueBy(newValue, self.suggestions);
	// 			}
	// 		}
	// 	}
	// }),

	/**
	 * @method placeholder
	 * @member module:Tags
	 * @instance
	 * @arg {String} [newPlaceholder]
	 * @returns {String|this}
	 */
	placeholder: method.string({
		set: function(newValue) {
			this[TEXT_INPUT].placeholder(newValue);
		}
	}),

	/**
	 * Get or set whether the user input should be broken into seperate tags when a space is present in the input
	 * @method breakOnSpaces
	 * @member module:Tags
	 * @instance
	 * @arg {Boolean} [breakOnSpaces]
	 * @returns {Boolean|this}
	 */
	breakOnSpaces: method.boolean()
});
