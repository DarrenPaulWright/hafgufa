import { event } from 'd3';
import keyCodes from 'keycodes';
import { clone } from 'object-agent';
import { applySettings, AUTO, enforce, Enum, HUNDRED_PERCENT, method, ZERO_PIXELS } from 'type-enforcer';
import { Div } from '../../index';
import dom from '../../utility/dom';
import {
	CLICK_EVENT,
	DISPLAY,
	INLINE_BLOCK,
	KEY_DOWN_EVENT,
	PADDING_RIGHT,
	TAB_INDEX,
	TAB_INDEX_DISABLED,
	TAB_INDEX_ENABLED
} from '../../utility/domConstants';
import Control from '../Control';
import ControlManager from '../ControlManager';
import controlTypes from '../controlTypes';
import CheckBox from '../elements/CheckBox';
import { CARET_DOWN_ICON, CARET_RIGHT_ICON, ERROR_ICON } from '../icons';
import Toolbar from '../layout/Toolbar';
import FocusMixin from '../mixins/FocusMixin';
import Button from './Button';
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

const CONTROLS = Symbol();
const EXPANDER = 'expander';
const CHECKBOX = 'checkbox';
const TITLE_CONTAINER = 'title';
const ICON_CONTROL = 'icon';
const IMAGE_CONTROL = 'image';
const TOOLBAR = 'toolbar';
const IGNORE_EVENTS = Symbol();

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
		settings.element = enforce.enum(settings.level, HEADING_LEVELS, HEADING_LEVELS.SIX);
		settings.FocusMixin = {};
		settings.FocusMixin.setFocus = () => self[setFocus]();

		super(settings);

		const self = this;
		self[CONTROLS] = new ControlManager();
		self.classes('heading');
		self.on(CLICK_EVENT, () => {
			self[mainClickEvent]();
		});

		self[CONTROLS].add(new Div({
			id: TITLE_CONTAINER,
			container: self,
			classes: 'title-container',
			content: new Span({
				id: TITLE_ID
			})
		}));

		applySettings(self, settings);

		self.onResize(() => {
				if (self.width().isAuto) {
					self[CONTROLS].get(TITLE_CONTAINER)
						.width(AUTO)
						.css(PADDING_RIGHT, self[CONTROLS].get(TOOLBAR) ? self[CONTROLS].get(TOOLBAR)
							.borderWidth() : ZERO_PIXELS);
				}
				else {
					self[CONTROLS].get(TITLE_CONTAINER)
						.width(HUNDRED_PERCENT)
						.width(self.innerWidth() - dom.get.left(self[CONTROLS].get(TITLE_CONTAINER)) - (self[CONTROLS].get(TOOLBAR) ? self[CONTROLS].get(TOOLBAR)
							.borderWidth() : ZERO_PIXELS))
						.css(PADDING_RIGHT, ZERO_PIXELS);
				}

				self[CONTROLS].get(TITLE_CONTAINER)
					.classes(LARGE_SINGLE_LINE_CLASS, !self.subTitle() && !self.isInline());
			})
			.onRemove(() => {
				self[CONTROLS].remove();
			});
	}

	[setFocus]() {
		if (this.isFocusable()) {
			this.element().focus();
		}
	}

	[setClickable]() {
		this.classes(IS_CLICKABLE_CLASS, (this.isExpandable() || this.isSelectable() || this.showCheckbox() || this.onSelect()));
	}

	/**
	 * Toggle the selected state of this heading and fire the onSelect callback
	 * @function mainClickEvent
	 */
	[mainClickEvent]() {
		if (this.isExpandable() && (!this.isSelectable() || this.shouldMainClickExpand())) {
			this[toggleIsExpanded]();
		}
		else {
			this[toggleChecked]();
		}
	};

	/**
	 * Toggle the selected state of this heading and fire the onSelect callback
	 * @function toggleChecked
	 */
	[toggleChecked]() {
		if (event && (this.isSelectable() || this.isExpandable())) {
			event.stopPropagation();
		}

		if (!this[IGNORE_EVENTS]) {
			this.isSelected(!this.isSelected());
			if (this.onSelect()) {
				this.onSelect()();
			}
		}
	}

	[setCheckBoxValue]() {
		this[IGNORE_EVENTS] = true;
		if (this[CONTROLS].get(CHECKBOX)) {
			if (this.isIndeterminate()) {
				this[CONTROLS].get(CHECKBOX).isIndeterminate(true);
			}
			else {
				this[CONTROLS].get(CHECKBOX).isChecked(this.isSelected());
			}
		}
		this[IGNORE_EVENTS] = false;
	}

	/**
	 * Toggle the expanded state of this heading and fire the onExpand callback
	 * @function toggleIsExpanded
	 */
	[toggleIsExpanded]() {
		event.stopPropagation();

		this.isExpanded(!this.isExpanded());
		if (this.onExpand()) {
			this.onExpand()();
		}
	}

	[updateExpander]() {
		if (this[CONTROLS].get(EXPANDER)) {
			this[CONTROLS].get(EXPANDER)
				.icon(this.isExpandable() ? (this.isExpanded() ? CARET_DOWN_ICON : CARET_RIGHT_ICON) : '');
		}
	}

	[keyDownEvent]() {
		if (event.keyCode === keyCodes('enter')) {
			event.preventDefault();
			this[toggleChecked]();
		}
	}

}

Object.assign(Heading.prototype, {
	level: method.enum({
		enum: HEADING_LEVELS,
		init: HEADING_LEVELS.SIX,
		set(level) {
			this.element(level);
		}
	}),

	isInline: method.boolean({
		init: true,
		set(isInline) {
			this.classes('not-inline', !isInline);

			this.resize(true);
		}
	}),

	canWrap: method.boolean({
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
	title: method.string({
		set(title) {
			this[CONTROLS].get(TITLE_CONTAINER).get(TITLE_ID).text(title);
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
	subTitle: method.string({
		set(subTitle) {
			if (subTitle !== '') {
				if (!this[CONTROLS].get(SUB_TITLE_ID)) {
					this[CONTROLS].get(TITLE_CONTAINER)
						.append(new Span({
							id: SUB_TITLE_ID,
							classes: 'subtitle'
						}));
				}
				this[CONTROLS].get(SUB_TITLE_ID).text(subTitle);
			}
			else {
				this[CONTROLS].get(TITLE_CONTAINER).removeContent(SUB_TITLE_ID);
			}

			this.resize(true);
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
	error: method.string({
		set(error) {
			if (error !== '') {
				if (!this[CONTROLS].get(TITLE_CONTAINER).get(ERROR_ID)) {
					this[CONTROLS].get(TITLE_CONTAINER).append(new Span({
						id: ERROR_ID,
						classes: 'error'
					}));
				}
				this[CONTROLS].get(TITLE_CONTAINER)
					.get(ERROR_ID)
					.text(ERROR_ICON + error);
			}
			else {
				this[CONTROLS].get(TITLE_CONTAINER)
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
	icon: method.string({
		set(newValue) {
			if (newValue === '') {
				this[CONTROLS].remove(ICON_CONTROL);
			}
			else {
				if (!this[CONTROLS].get(ICON_CONTROL)) {
					this[CONTROLS].add(new Icon({
						id: ICON_CONTROL
					}));
				}

				this[CONTROLS].get(ICON_CONTROL)
					.icon(newValue)
					.tooltip(this.iconTooltip());

				dom.appendBefore(this[CONTROLS].get(TITLE_CONTAINER), this[CONTROLS].get(ICON_CONTROL));
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
	iconTooltip: method.string({
		set(iconTooltip) {
			if (this[CONTROLS].get(ICON_CONTROL)) {
				this[CONTROLS].get(ICON_CONTROL).tooltip(iconTooltip);
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
	image: method.string({
		set(image) {
			if (image === '') {
				this[CONTROLS].remove(IMAGE_CONTROL);
			}
			else {
				if (!this[CONTROLS].get(IMAGE_CONTROL)) {
					this[CONTROLS].add(new Image({
						id: IMAGE_CONTROL
					})
						.css(DISPLAY, INLINE_BLOCK));
					dom.appendBefore(this[CONTROLS].get(ICON_CONTROL) || this[CONTROLS].get(TITLE_CONTAINER), this[CONTROLS].get(IMAGE_CONTROL));
				}
				this[CONTROLS].get(IMAGE_CONTROL).source(image);
			}
		}
	}),

	/**
	 * Get or set the data array to build buttons on teh right side of the header.
	 * @method buttons
	 * @member module:Heading
	 * @instance
	 * @arg {Array} [buttons] - See Toolbar.addButton for settings of each item in array.
	 * @returns {Array|this}
	 */
	buttons: method.array({
		set(newValue) {
			const self = this;

			if (newValue.length) {
				if (!this[CONTROLS].get(TOOLBAR)) {
					this[CONTROLS].add(new Toolbar({
						id: TOOLBAR,
						container: self.element(),
						stopPropagation: true
					}));
				}

				this[CONTROLS].get(TOOLBAR).empty();

				newValue.forEach((button) => {
					button = clone(button);
					const onClick = button.onClick;
					const isEnabled = button.isEnabled;

					if (!button.classes) {
						button.classes = 'icon-button';
					}
					if (button.onClick) {
						button.onClick = () => {
							onClick(self.data());
						};
					}
					if (typeof button.isEnabled === 'function') {
						button.isEnabled = () => isEnabled(self.data());
					}

					this[CONTROLS].get(TOOLBAR).addButton(button);
				});
			}
			else {
				this[CONTROLS].remove(TOOLBAR);
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
	isSelectable: method.boolean({
		set(newValue) {
			if (this[CONTROLS].get(CHECKBOX)) {
				this[CONTROLS].get(CHECKBOX).isVisible(newValue);
			}
			this[setClickable]();
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
	isSelected: method.boolean({
		set(newValue) {
			if (newValue) {
				this.isIndeterminate(false);
			}
			this[setCheckBoxValue]();
			this.classes('selected', newValue);
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
	isIndeterminate: method.boolean({
		set(isIndeterminate) {
			if (isIndeterminate) {
				this.isSelected(false);
			}
			this[setCheckBoxValue]();
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
	isExpandable: method.boolean({
		set() {
			this[updateExpander]();
			this[setClickable]();
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
	isExpanded: method.boolean({
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
	shouldMainClickExpand: method.boolean(),

	/**
	 * Get or set the visibility of the expander on this heading
	 * @method showExpander
	 * @member module:Heading
	 * @instance
	 * @arg {Boolean} showExpander
	 * @returns {Boolean|this}
	 */
	showExpander: method.boolean({
		set(newValue) {
			const self = this;

			if (newValue) {
				this[CONTROLS].add(new Button({
					id: EXPANDER,
					classes: 'icon-button',
					onClick() {
						self[toggleIsExpanded]();
					}
				}));
				dom.prependTo(this, this[CONTROLS].get(EXPANDER));
			}
			else {
				this[CONTROLS].remove(EXPANDER);
			}

			this[updateExpander]();
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
	showCheckbox: method.boolean({
		set(showCheckbox) {
			const self = this;

			if (showCheckbox) {
				this[CONTROLS].add(new CheckBox({
					id: CHECKBOX,
					container: this.element(),
					isVisible: this.isSelectable(),
					onChange() {
						self[toggleChecked]();
					}
				}));
				dom.appendBefore(this[CONTROLS].get(IMAGE_CONTROL) || this[CONTROLS].get(ICON_CONTROL) || this[CONTROLS].get(TITLE_CONTAINER), this[CONTROLS].get(CHECKBOX));
			}
			else {
				this[CONTROLS].remove(CHECKBOX);
			}
			this[setClickable]();
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
	onSelect: method.function({
		set() {
			this[setClickable]();
		},
		other: undefined
	}),

	/**
	 * Get or set the onExpand callback for this heading
	 * @method onExpand
	 * @member module:Heading
	 * @instance
	 * @arg {Function} onExpand
	 * @returns {Function|this}
	 */
	onExpand: method.function({
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
	data: method.object({
		other: undefined
	}),

	isFocusable: method.boolean({
		set(newValue) {
			const self = this;

			if (newValue) {
				self.attr(TAB_INDEX, TAB_INDEX_ENABLED)
					.on(KEY_DOWN_EVENT, () => self[keyDownEvent]());
			}
			else {
				self.attr(TAB_INDEX, TAB_INDEX_DISABLED)
					.on(KEY_DOWN_EVENT, null);
			}
		}
	})

});
