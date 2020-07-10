import keyCodes from 'keycodes';
import { clone } from 'object-agent';
import {
	applySettings,
	AUTO,
	enforceEnum,
	Enum,
	HUNDRED_PERCENT,
	methodArray,
	methodBoolean,
	methodFunction,
	methodObject,
	methodQueue,
	methodString,
	ZERO_PIXELS
} from 'type-enforcer-ui';
import Control, { CHILD_CONTROLS } from '../Control';
import controlTypes from '../controlTypes';
import CheckBox from '../elements/CheckBox';
import { CARET_DOWN_ICON, CARET_RIGHT_ICON, ERROR_ICON } from '../icons';
import Toolbar from '../layout/Toolbar';
import FocusMixin from '../mixins/FocusMixin';
import {
	CLICK_EVENT,
	DISPLAY,
	INLINE_BLOCK,
	KEY_DOWN_EVENT,
	PADDING_RIGHT,
	TAB_INDEX,
	TAB_INDEX_DISABLED,
	TAB_INDEX_ENABLED
} from '../utility/domConstants';
import Button from './Button';
import Div from './Div';
import './Heading.less';
import Icon from './Icon';
import Image from './Image';
import Span from './Span';

const IS_CLICKABLE_CLASS = 'clickable';
const TITLE_ID = 'headingTitle';
const SUB_TITLE_ID = 'headingSubTitle';
const ERROR_ID = 'headingError';
const LARGE_SINGLE_LINE_CLASS = 'single-line';

export const HEADING_LEVELS = new Enum({
	ONE: 'h1',
	TWO: 'h2',
	THREE: 'h3',
	FOUR: 'h4',
	FIVE: 'h5',
	SIX: 'h6'
});

const EXPANDER = 'expander';
const CHECKBOX = 'checkbox';
const TITLE_CONTAINER = 'title';
const ICON_CONTROL = 'icon';
const IMAGE_CONTROL = 'image';
const TOOLBAR = 'toolbar';
const IGNORE_EVENTS = Symbol();
const IS_CLICKABLE = Symbol();

const setFocus = Symbol();
const setClickable = Symbol();
const mainClickEvent = Symbol();
const toggleChecked = Symbol();
const setCheckBoxValue = Symbol();
const toggleIsExpanded = Symbol();
const updateExpander = Symbol();
const keyDownEvent = Symbol();

/**
 * A generic header control.
 *
 * @control Heading
 * @extends Control
 * @constructor
 *
 * @arg {Object} settings - Accepts all controlBase settings plus settings for any of the methods on this control.
 */
export default class Heading extends FocusMixin(Control) {
	constructor(settings = {}) {
		settings.type = settings.type || controlTypes.HEADING;
		settings.element = enforceEnum(settings.level, HEADING_LEVELS, HEADING_LEVELS.SIX);
		settings.FocusMixin = {};
		settings.FocusMixin.setFocus = () => self[setFocus]();

		super(settings);

		const self = this;
		self.classes('heading');
		self[IS_CLICKABLE] = false;
		self.on(CLICK_EVENT, (event) => {
			self[mainClickEvent](event);
		});

		new Div({
			id: TITLE_CONTAINER,
			container: self,
			classes: 'title-container',
			content: new Span({
				id: TITLE_ID
			})
		});

		applySettings(self, settings);

		self.onResize(() => {
			if (self.width().isAuto) {
				self[CHILD_CONTROLS].get(TITLE_CONTAINER)
					.width(AUTO)
					.css(PADDING_RIGHT, self[CHILD_CONTROLS].get(TOOLBAR) ?
						self[CHILD_CONTROLS].get(TOOLBAR).borderWidth() :
						ZERO_PIXELS);
			}
			else {
				self[CHILD_CONTROLS].get(TITLE_CONTAINER)
					.width(HUNDRED_PERCENT)
					.width(self.innerWidth() - self[CHILD_CONTROLS].get(TITLE_CONTAINER)
						.element.offsetLeft - (self[CHILD_CONTROLS].get(TOOLBAR) ? self[CHILD_CONTROLS].get(TOOLBAR)
						.borderWidth() : ZERO_PIXELS))
					.css(PADDING_RIGHT, ZERO_PIXELS);
			}

			self[CHILD_CONTROLS].get(TITLE_CONTAINER)
				.classes(LARGE_SINGLE_LINE_CLASS, !self.subTitle() && !self.isInline());
		});
	}

	[setFocus]() {
		if (this.isFocusable()) {
			this.element.focus();
		}
	}

	[setClickable]() {
		const self = this;

		self[IS_CLICKABLE] = self.isExpandable() ||
			self.isSelectable() ||
			self.showCheckbox() ||
			self.onSelect().length !== 0;

		self.classes(IS_CLICKABLE_CLASS, self[IS_CLICKABLE]);
	}

	/**
	 * @function mainClickEvent
	 */
	[mainClickEvent](event) {
		const self = this;

		if (self.isExpandable() && (!self.isSelectable() || self.shouldMainClickExpand())) {
			self[toggleIsExpanded](event);
		}
		else {
			self[toggleChecked](event);
		}
	}

	/**
	 * Toggle the selected state of this heading and fire the onSelect callback
	 * @function toggleChecked
	 */
	[toggleChecked](event) {
		const self = this;

		if (event && self[IS_CLICKABLE]) {
			event.stopPropagation();
		}

		if (!self[IGNORE_EVENTS]) {
			self.isSelected(!self.isSelected());
			if (self.onSelect().length !== 0) {
				self.onSelect().trigger();
			}
		}
	}

	[setCheckBoxValue]() {
		const self = this;

		self[IGNORE_EVENTS] = true;
		if (self[CHILD_CONTROLS].get(CHECKBOX)) {
			if (self.isIndeterminate()) {
				self[CHILD_CONTROLS].get(CHECKBOX).isIndeterminate(true);
			}
			else {
				self[CHILD_CONTROLS].get(CHECKBOX).isChecked(self.isSelected());
			}
		}
		self[IGNORE_EVENTS] = false;
	}

	/**
	 * Toggle the expanded state of this heading and fire the onExpand callback
	 * @function toggleIsExpanded
	 */
	[toggleIsExpanded](event) {
		const self = this;

		event.stopPropagation();

		self.isExpanded(!self.isExpanded());
		if (self.onExpand()) {
			self.onExpand()();
		}
	}

	[updateExpander]() {
		const self = this;

		if (self[CHILD_CONTROLS].get(EXPANDER)) {
			self[CHILD_CONTROLS].get(EXPANDER)
				.icon(self.isExpandable() ? (self.isExpanded() ? CARET_DOWN_ICON : CARET_RIGHT_ICON) : '');
		}
	}

	[keyDownEvent](event) {
		if (event.keyCode === keyCodes('enter')) {
			event.preventDefault();
			this[toggleChecked](event);
		}
	}

}

Object.assign(Heading.prototype, {
	isInline: methodBoolean({
		init: true,
		set(isInline) {
			this.classes('not-inline', !isInline);

			this.resize(true);
		}
	}),

	canWrap: methodBoolean({
		set(canWrap) {
			this.classes('wrap', canWrap);
		}
	}),

	/**
	 * Get or set the displayed title for this heading
	 * @method title
	 * @member module:Heading
	 * @instance
	 * @arg {String} [title]
	 * @returns {String|this}
	 */
	title: methodString({
		set(title) {
			this[CHILD_CONTROLS].get(TITLE_CONTAINER).get(TITLE_ID).text(title);
		}
	}),

	/**
	 * Get or set the displayed subTitle for this heading
	 *
	 * @method subTitle
	 * @member module:Heading
	 * @instance
	 *
	 * @arg {String} [subTitle]
	 *
	 * @returns {String|this}
	 */
	subTitle: methodString({
		set(subTitle) {
			const self = this;

			if (subTitle !== '') {
				if (!self[CHILD_CONTROLS].get(SUB_TITLE_ID)) {
					self[CHILD_CONTROLS].get(TITLE_CONTAINER)
						.append(new Span({
							id: SUB_TITLE_ID,
							classes: 'subtitle'
						}));
				}
				self[CHILD_CONTROLS].get(SUB_TITLE_ID).text(subTitle);
			}
			else {
				self[CHILD_CONTROLS].get(TITLE_CONTAINER).removeContent(SUB_TITLE_ID);
			}

			self.resize(true);
		}
	}),

	/**
	 * Get or set the displayed error for this heading
	 *
	 * @method error
	 * @member module:Heading
	 * @instance
	 *
	 * @arg {String} [error]
	 *
	 * @returns {String|this}
	 */
	error: methodString({
		set(error) {
			const self = this;

			if (error !== '') {
				if (!self[CHILD_CONTROLS].get(TITLE_CONTAINER).get(ERROR_ID)) {
					self[CHILD_CONTROLS].get(TITLE_CONTAINER).append(new Span({
						id: ERROR_ID,
						classes: 'error'
					}));
				}
				self[CHILD_CONTROLS].get(TITLE_CONTAINER)
					.get(ERROR_ID)
					.text(ERROR_ICON + error);
			}
			else {
				self[CHILD_CONTROLS].get(TITLE_CONTAINER)
					.removeContent(ERROR_ID);
			}
		}
	}),

	/**
	 * Get or set the displayed icon for this heading
	 * @method icon
	 * @member module:Heading
	 * @instance
	 * @arg {String} icon
	 * @returns {String|this}
	 */
	icon: methodString({
		set(newValue) {
			const self = this;

			if (newValue === '') {
				self[CHILD_CONTROLS].remove(ICON_CONTROL);
			}
			else {
				if (!self[CHILD_CONTROLS].get(ICON_CONTROL)) {
					new Icon({
						container: self,
						id: ICON_CONTROL,
						prepend: self[CHILD_CONTROLS].get(TITLE_CONTAINER).element
					});
				}

				self[CHILD_CONTROLS].get(ICON_CONTROL)
					.icon(newValue)
					.tooltip(self.iconTooltip());
			}
		}
	}),

	/**
	 * Get or set tooltip string for the icon
	 * @method iconTooltip
	 * @member module:Heading
	 * @instance
	 * @arg {String} iconTooltip
	 * @returns {String|this}
	 */
	iconTooltip: methodString({
		set(iconTooltip) {
			if (this[CHILD_CONTROLS].get(ICON_CONTROL)) {
				this[CHILD_CONTROLS].get(ICON_CONTROL).tooltip(iconTooltip);
			}
		}
	}),

	/**
	 * Get or set the displayed image for this heading
	 * @method image
	 * @member module:Heading
	 * @instance
	 * @arg {String} image
	 * @returns {String|this}
	 */
	image: methodString({
		set(image) {
			const self = this;

			if (image === '') {
				self[CHILD_CONTROLS].remove(IMAGE_CONTROL);
			}
			else {
				if (!self[CHILD_CONTROLS].get(IMAGE_CONTROL)) {
					new Image({
						container: self,
						prepend: self[CHILD_CONTROLS].get(ICON_CONTROL) || self[CHILD_CONTROLS].get(TITLE_CONTAINER),
						id: IMAGE_CONTROL
					})
						.css(DISPLAY, INLINE_BLOCK);
				}
				self[CHILD_CONTROLS].get(IMAGE_CONTROL).source(image);
			}
		}
	}),

	/**
	 * Get or set the data array to build buttons on the right side of the header.
	 * @method buttons
	 * @member module:Heading
	 * @instance
	 * @arg {Array} [buttons] - See Toolbar.addButton for settings of each item in array.
	 * @returns {Array|this}
	 */
	buttons: methodArray({
		set(newValue) {
			const self = this;

			if (newValue.length) {
				if (!self[CHILD_CONTROLS].get(TOOLBAR)) {
					new Toolbar({
						id: TOOLBAR,
						container: self,
						stopPropagation: true
					});
				}

				self[CHILD_CONTROLS].get(TOOLBAR).empty();

				newValue.forEach((button) => {
					button = clone(button);
					const onClick = button.onClick;
					const isEnabled = button.isEnabled;

					if (!button.classes) {
						button.classes = 'icon-button';
					}
					if (button.onClick) {
						button.onClick = function() {
							onClick.call(this, self.data());
						};
					}
					if (typeof button.isEnabled === 'function') {
						button.isEnabled = () => isEnabled(self.data());
					}

					self[CHILD_CONTROLS].get(TOOLBAR).addButton(button);
				});
			}
			else {
				self[CHILD_CONTROLS].remove(TOOLBAR);
			}

			self.resize();
		}
	}),

	/**
	 * Get or set the selectable state for this heading
	 * @method isSelectable
	 * @member module:Heading
	 * @instance
	 * @arg {Boolean} isSelectable
	 * @returns {Boolean|this}
	 */
	isSelectable: methodBoolean({
		set(newValue) {
			const self = this;

			if (self[CHILD_CONTROLS].get(CHECKBOX)) {
				self[CHILD_CONTROLS].get(CHECKBOX).isVisible(newValue);
			}
			self[setClickable]();
		}
	}),

	/**
	 * Get or set the selected state for this heading
	 * @method isSelected
	 * @member module:Heading
	 * @instance
	 * @arg {Boolean} isSelected
	 * @returns {Boolean|this}
	 */
	isSelected: methodBoolean({
		set(newValue) {
			const self = this;

			if (newValue) {
				self.isIndeterminate(false);
			}
			self[setCheckBoxValue]();
			self.classes('selected', newValue);
		}
	}),

	/**
	 * Get or set the indeterminate state for this heading
	 * @method isIndeterminate
	 * @member module:Heading
	 * @instance
	 * @arg {Boolean} isIndeterminate
	 * @returns {Boolean|this}
	 */
	isIndeterminate: methodBoolean({
		set(isIndeterminate) {
			const self = this;

			if (isIndeterminate) {
				self.isSelected(false);
			}
			self[setCheckBoxValue]();
		}
	}),

	/**
	 * Get or set the expandable state for this heading
	 * @method isExpandable
	 * @member module:Heading
	 * @instance
	 * @arg {Boolean} isExpandable
	 * @returns {Boolean|this}
	 */
	isExpandable: methodBoolean({
		set() {
			const self = this;

			self[updateExpander]();
			self[setClickable]();
		}
	}),

	/**
	 * Get or set the expanded state for this heading
	 * @method isExpanded
	 * @member module:Heading
	 * @instance
	 * @arg {Boolean} isExpanded
	 * @returns {Boolean|this}
	 */
	isExpanded: methodBoolean({
		set() {
			this[updateExpander]();
		}
	}),

	/**
	 * Get or set a boolean that determines if clicking the main area of the
	 *      header should expand or
	 * @method shouldMainClickExpand
	 * @member module:Heading
	 * @instance
	 * @arg {Boolean} shouldMainClickExpand
	 * @returns {Boolean|this}
	 */
	shouldMainClickExpand: methodBoolean(),

	/**
	 * Get or set the visibility of the expander on this heading
	 * @method showExpander
	 * @member module:Heading
	 * @instance
	 * @arg {Boolean} showExpander
	 * @returns {Boolean|this}
	 */
	showExpander: methodBoolean({
		set(newValue) {
			const self = this;

			if (newValue) {
				new Button({
					container: self,
					prepend: true,
					id: EXPANDER,
					classes: 'icon-button',
					onClick(event) {
						self[toggleIsExpanded](event);
					}
				});
			}
			else {
				self[CHILD_CONTROLS].remove(EXPANDER);
			}

			self[updateExpander]();
		}
	}),

	/**
	 * Get or set the visibility of the checkbox on this heading
	 * @method showCheckbox
	 * @member module:Heading
	 * @instance
	 * @arg {Boolean} showCheckbox
	 * @returns {Boolean|this}
	 */
	showCheckbox: methodBoolean({
		set(showCheckbox) {
			const self = this;

			if (showCheckbox) {
				new CheckBox({
					id: CHECKBOX,
					container: self,
					prepend: self[CHILD_CONTROLS].get(IMAGE_CONTROL) ||
						self[CHILD_CONTROLS].get(ICON_CONTROL) ||
						self[CHILD_CONTROLS].get(TITLE_CONTAINER),
					isVisible: self.isSelectable(),
					onChange(isChecked, event) {
						self[toggleChecked](event);
					}
				});
			}
			else {
				self[CHILD_CONTROLS].remove(CHECKBOX);
			}
			self[setClickable]();
		}
	}),

	/**
	 * Get or set the onSelect callback for this heading
	 * @method onSelect
	 * @member module:Heading
	 * @instance
	 * @arg {Function} onSelect
	 * @returns {Function|this}
	 */
	onSelect: methodQueue({
		set() {
			this[setClickable]();
		}
	}),

	/**
	 * Get or set the onExpand callback for this heading
	 * @method onExpand
	 * @member module:Heading
	 * @instance
	 * @arg {Function} onExpand
	 * @returns {Function|this}
	 */
	onExpand: methodFunction({
		other: undefined
	}),

	/**
	 * Get or set data relavent to this header.
	 * @method data
	 * @member module:Heading
	 * @instance
	 * @arg {Object} data
	 * @returns {Object|this}
	 */
	data: methodObject({
		other: undefined
	}),

	isFocusable: methodBoolean({
		set(newValue) {
			const self = this;

			if (newValue) {
				self.attr(TAB_INDEX, TAB_INDEX_ENABLED)
					.on(KEY_DOWN_EVENT, (event) => self[keyDownEvent](event));
			}
			else {
				self.attr(TAB_INDEX, TAB_INDEX_DISABLED)
					.off(KEY_DOWN_EVENT);
			}
		}
	})

});
