import { defer, throttle } from 'async-agent';
import { clone } from 'object-agent';
import {
	applySettings,
	AUTO,
	CssSize,
	enforceCssSize,
	HUNDRED_PERCENT,
	INITIAL,
	isNumber,
	methodArray,
	methodBoolean,
	methodCssSize,
	methodFunction,
	methodNumber,
	methodObject,
	methodString,
	PIXELS,
	Thickness,
	ZERO_PIXELS
} from 'type-enforcer-ui';
import Control from '../Control';
import ControlRecycler from '../ControlRecycler';
import controlTypes from '../controlTypes';
import Div from '../elements/Div';
import Span from '../elements/Span';
import FocusMixin from '../mixins/FocusMixin';
import d3Helper from '../utility/d3Helper';
import {
	ABSOLUTE,
	BOX_SIZING,
	CONTENT_BOX,
	DISPLAY,
	DOCUMENT,
	FONT_SIZE,
	HEIGHT,
	HIDDEN,
	INLINE_BLOCK,
	LEFT,
	MIN_HEIGHT,
	OVERFLOW_X,
	OVERFLOW_Y,
	PADDING,
	POSITION,
	RELATIVE,
	SCROLL_EVENT,
	SCROLL_LEFT,
	SCROLL_TOP,
	TAB_INDEX,
	TAB_INDEX_DISABLED,
	TAB_INDEX_ENABLED,
	TOP,
	WIDTH
} from '../utility/domConstants';
import clamp from '../utility/math/clamp';
import MultiItemFocus from '../utility/MultiItemFocus';
import DragContainer from './DragContainer';
import './VirtualList.less';

const forRange = (first, last, callback) => {
	while (first <= last) {
		callback(first);
		first++;
	}
};

const forRangeRight = (first, last, callback) => {
	while (first >= last) {
		callback(first);
		first--;
	}
};

const measure = {
	width(control) {
		return control.borderWidth();
	},
	height(control) {
		return control.borderHeight();
	}
};

const SCROLL_BUFFER = 8;
const NO_ITEM_ID_ERROR_MESSAGE = 'All items in a virtual list control must have a unique id.';
const VIRTUAL_LIST_CLASS = 'virtual-list';
const VIRTUAL_ITEM_CLASS = 'virtual-item';
const EMPTY_CONTENT_CLASS = 'empty-content-message';
const MAX_RENDER_ATTEMPTS = 3;
const STEP_SIZE = 1000000;
const VERTICAL = 'vertical';
const HORIZONTAL = 'horizontal';

const EXTENT = Symbol();
const ALT_EXTENT = Symbol();
const ALT_EXTENT_VALUE = Symbol();
const POSITION_ORIGIN = Symbol();
const ALT_POSITION_ORIGIN = Symbol();
const EXTENT_SCROLL_ORIGIN = Symbol();
const EXTENT_PADDING = Symbol();
const EMPTY_CONTENT_CONTAINER = Symbol();
const CONTENT_CONTAINER = Symbol();
const CONTROL_RECYCLER = Symbol();

const ITEM_SIZE = Symbol();
const TOTAL_ITEMS = Symbol();
const VIEWPORT_SIZE = Symbol();
const VIEWPORT_ITEMS_LENGTH = Symbol();
const CACHED_ITEMS_LENGTH = Symbol();
const PAGE_SIZE = Symbol();
const CURRENT_SCROLL_OFFSET = Symbol();
const RENDER_ATTEMPTS = Symbol();
const CURRENT_START_INDEX = Symbol();
const CURRENT_END_INDEX = Symbol();
const CURRENT_ITEM_OFFSET = Symbol();
const CURRENT_STEP_OFFSET = Symbol();
const MULTI_ITEM_FOCUS = Symbol();
const INNER_PADDING = Symbol();
const IS_RENDERING = Symbol();
const IS_RENDERING_REQUESTED = Symbol();

const setItemSize = Symbol();
const setScrollSize = Symbol();
const setVirtualContentSizes = Symbol();
const setVirtualContentAltExtent = Symbol();
const resetVirtualizedItemPositions = Symbol();
const render = Symbol();
const renderChunk = Symbol();
const renderItem = Symbol();
const setItemPosition = Symbol();
const onScroll = Symbol();
const showEmptyContentMessage = Symbol();
const updateEmptyContentSize = Symbol();
const removeEmptyContentMessage = Symbol();
const focusItem = Symbol();
const setScroll = Symbol();
const getFirstItemAltSize = Symbol();
const setAltExtentValue = Symbol();
const setExtent = Symbol();

/**
 * Only render the items in a list that are visible to the user
 *
 * @class VirtualList
 * @extends Control
 * @constructor
 *
 * @param {Object} settings
 */
export default class VirtualList extends FocusMixin(Control) {
	constructor(settings = {}) {
		let self;

		settings.type = settings.type || controlTypes.VIRTUAL_LIST;
		settings.height = enforceCssSize(settings.height, HUNDRED_PERCENT, true);
		settings.FocusMixin = settings.FocusMixin || {};
		settings.FocusMixin.setFocus = () => {
			if (self.isFocusable()) {
				self[MULTI_ITEM_FOCUS].first();
			}
		};
		settings.FocusMixin.getFocus = () => {
			return self.isFocusable() ? self.element.contains(DOCUMENT.activeElement) : false;
		};

		super(settings);

		self = this;

		self[EXTENT] = HEIGHT;
		self[ALT_EXTENT] = WIDTH;
		self[ALT_EXTENT_VALUE] = HUNDRED_PERCENT;
		self[POSITION_ORIGIN] = TOP;
		self[ALT_POSITION_ORIGIN] = LEFT;
		self[EXTENT_SCROLL_ORIGIN] = SCROLL_TOP;
		self[EXTENT_PADDING] = VERTICAL;
		self[CONTROL_RECYCLER] = new ControlRecycler();

		self[ITEM_SIZE] = 1;
		self[TOTAL_ITEMS] = 0;
		self[VIEWPORT_SIZE] = 0;
		self[VIEWPORT_ITEMS_LENGTH] = 10;
		self[CACHED_ITEMS_LENGTH] = 30;
		self[PAGE_SIZE] = 0;
		self[CURRENT_SCROLL_OFFSET] = 0;
		self[RENDER_ATTEMPTS] = 0;
		self[CURRENT_START_INDEX] = 0;
		self[CURRENT_END_INDEX] = -1;
		self[CURRENT_ITEM_OFFSET] = 0;
		self[CURRENT_STEP_OFFSET] = 0;
		self[INNER_PADDING] = new Thickness(0);
		self[IS_RENDERING] = false;
		self[IS_RENDERING_REQUESTED] = false;

		self[setVirtualContentAltExtent] = throttle(function() {
			const self = this;
			let maxAltExtent = 0;

			if (!self.isRemoved && ((self.isHorizontal() && self.height().isAuto) || self.width().isAuto)) {
				const scrollBuffer = self[VIEWPORT_SIZE] - SCROLL_BUFFER;

				self[CONTROL_RECYCLER].each((control) => {
					const controlOffset = parseInt(control.css(self[POSITION_ORIGIN]), 10);

					if (controlOffset > self[CURRENT_SCROLL_OFFSET] - scrollBuffer &&
						controlOffset < self[CURRENT_SCROLL_OFFSET] + scrollBuffer) {
						maxAltExtent = Math.max(maxAltExtent, control[self[ALT_EXTENT] === HEIGHT ? 'borderHeight' : 'borderWidth']());
					}
				});

				d3Helper.animate(self[CONTENT_CONTAINER])
					.style(self[ALT_EXTENT], maxAltExtent + PIXELS);
			}
		}, 100);

		self[CONTENT_CONTAINER] = new DragContainer({
			container: self,
			canThrow: true
		});
		self[CONTENT_CONTAINER]
			.css(FONT_SIZE, INITIAL)
			.css(POSITION, RELATIVE)
			.css(DISPLAY, INLINE_BLOCK)
			.css(TOP, ZERO_PIXELS)
			.css(LEFT, ZERO_PIXELS);

		self.addClass(VIRTUAL_LIST_CLASS)
			.on(SCROLL_EVENT, (event) => self[onScroll](event))
			.css(POSITION, RELATIVE)
			.css(FONT_SIZE, ZERO_PIXELS)
			.css(BOX_SIZING, CONTENT_BOX);

		applySettings(self, settings, ['height']);

		self[setExtent]();

		self.onResize(() => {
			self[setScrollSize]();
			self[render]();
			self[updateEmptyContentSize]();
		});

		self.onRemove(() => {
			self.isFocusable(false);
			self[CONTROL_RECYCLER].remove();
			self[CONTROL_RECYCLER] = null;
			self[CONTENT_CONTAINER].remove();
			self[CONTENT_CONTAINER] = null;
		});

		self.refresh();
	}

	/**
	 * Measure the size of an item to determine the size of all items.
	 *
	 * @name setItemSize
	 * @private
	 *
	 * @param {Object} control  - must be a control that inherits from module:ControlBase
	 */
	[setItemSize](control) {
		const self = this;

		if (!self.itemSize() && self.isVirtualized() && !self.isRemoved) {
			control[self[EXTENT]](ZERO_PIXELS);
			control[self[EXTENT]](AUTO);
			self[ITEM_SIZE] = measure[self[EXTENT]](control);

			if (self[ITEM_SIZE] > 0) {
				self[setScrollSize]();

				self[setAltExtentValue]();
				self[setScrollSize]();
				self[render]();

				self[RENDER_ATTEMPTS] = 0;
			}
			else if (self[RENDER_ATTEMPTS] < MAX_RENDER_ATTEMPTS) {
				self[RENDER_ATTEMPTS]++;
				defer(() => {
					self[setItemSize](control);
				});
			}
		}
	}

	/**
	 * Set the size of the virtual content div and determine the caching size.
	 * @function setScrollSize
	 */
	[setScrollSize]() {
		const self = this;

		self[INNER_PADDING].set(self.css(PADDING) || 0);

		if (self[TOTAL_ITEMS]) {
			self[setVirtualContentSizes]();
		}
		if (self[EXTENT] === HEIGHT && self.height().isAuto && self[TOTAL_ITEMS]) {
			self.css(HEIGHT, self[ITEM_SIZE] * self[TOTAL_ITEMS]);
		}

		self[VIEWPORT_SIZE] = measure[self[EXTENT]](self) - self[INNER_PADDING][self[EXTENT_PADDING]];
		self[VIEWPORT_ITEMS_LENGTH] = Math.ceil(self[VIEWPORT_SIZE] / self[ITEM_SIZE]);

		self[PAGE_SIZE] = Math.max(self[VIEWPORT_ITEMS_LENGTH] - 1, 1) * self[ITEM_SIZE];

		if (self.isVirtualized()) {
			self[CACHED_ITEMS_LENGTH] = Math.round(self[VIEWPORT_ITEMS_LENGTH] + (self[VIEWPORT_ITEMS_LENGTH] * self.extraRenderedItemsRatio() * 2) + 1);
		}
		else {
			self[CACHED_ITEMS_LENGTH] = self[TOTAL_ITEMS];
		}
	}

	/**
	 * Set the size of the virtual content div
	 * @function setVirtualContentSizes
	 */
	[setVirtualContentSizes]() {
		const self = this;
		const totalSize = self[ITEM_SIZE] * self[TOTAL_ITEMS];

		const getOffset = () => {
			if (self.isCentered() && totalSize < self[VIEWPORT_SIZE]) {
				return (self[VIEWPORT_SIZE] - totalSize) / 2;
			}
			else if (self.snapToLeadingEdge() && !self.isAtEnd()) {
				return self[CURRENT_STEP_OFFSET] + (self[CURRENT_SCROLL_OFFSET] % self[ITEM_SIZE]) + self[INNER_PADDING][self[POSITION_ORIGIN]];
			}
			else {
				return self[CURRENT_STEP_OFFSET] + self[INNER_PADDING][self[POSITION_ORIGIN]];
			}
		};

		self[INNER_PADDING].set(self.css(PADDING) || 0);

		self[CONTENT_CONTAINER].css(self[EXTENT], (totalSize - self[CURRENT_STEP_OFFSET]) + self[INNER_PADDING][self[EXTENT_PADDING]] + PIXELS)
			.css(self[POSITION_ORIGIN], getOffset() + PIXELS);
	}

	/**
	 * Set the position of each of the currently rendered items.
	 * @function resetVirtualizedItemPositions
	 */
	[resetVirtualizedItemPositions]() {
		const self = this;

		self[CONTROL_RECYCLER].each((control) => {
			control.css(self[POSITION_ORIGIN], ((control.virtualIndex * self[ITEM_SIZE]) - self[CURRENT_STEP_OFFSET]) + PIXELS);
		});
	}

	/**
	 * Render a chunk of items based on a start index and the caching size. Only remove items that don't need to be
	 * displayed and only add new items.
	 * @function renderChunk
	 * @param {Number} startIndex
	 */
	[renderChunk](startIndex) {
		const self = this;
		let endIndex;

		const discardControl = (index) => {
			const item = self.itemData()[index];

			if (item) {
				let control = self[CONTROL_RECYCLER].getControl(item.id);

				if (control && !control.isRemoved) {
					if (control.isFocused()) {
						self.element.focus();
					}
					self[CONTROL_RECYCLER].discardControl(control.id());
					control = null;
				}
			}
		};

		if (self[IS_RENDERING]) {
			self[IS_RENDERING_REQUESTED] = startIndex;
		}
		else {
			if (self[CONTROL_RECYCLER] && self[CONTROL_RECYCLER].control()) {
				endIndex = Math.min(self[TOTAL_ITEMS] - 1, startIndex + self[CACHED_ITEMS_LENGTH]);

				self[IS_RENDERING] = true;

				if (startIndex * self[ITEM_SIZE] > self[CURRENT_STEP_OFFSET] + (2 * STEP_SIZE)) {
					self[CURRENT_STEP_OFFSET] += STEP_SIZE;
					self[setVirtualContentSizes]();
					self[resetVirtualizedItemPositions]();
				}
				else if (self[CURRENT_STEP_OFFSET] && (startIndex * self[ITEM_SIZE] < self[CURRENT_STEP_OFFSET] + STEP_SIZE)) {
					self[CURRENT_STEP_OFFSET] -= STEP_SIZE;
					self[setVirtualContentSizes]();
					self[resetVirtualizedItemPositions]();
				}

				if (endIndex < self[CURRENT_START_INDEX] || startIndex > self[CURRENT_END_INDEX]) {
					if (self.isFocused()) {
						self.isFocused(true);
					}
					self[CONTROL_RECYCLER].discardAllControls();

					forRange(startIndex, endIndex, (index) => self[renderItem](index));

					if (startIndex === 0) {
						self[setAltExtentValue]();
					}
				}
				else {
					forRange(self[CURRENT_START_INDEX], startIndex - 1, discardControl);

					forRange(endIndex + 1, self[CURRENT_END_INDEX], discardControl);

					forRangeRight(self[CURRENT_START_INDEX] - 1, startIndex, (index) => self[renderItem](index, true));

					forRange(self[CURRENT_END_INDEX] + 1, endIndex, (index) => self[renderItem](index));
				}

				self[IS_RENDERING] = false;

				if (self[IS_RENDERING_REQUESTED] !== false) {
					const newStartIndex = clone(self[IS_RENDERING_REQUESTED]);
					self[IS_RENDERING_REQUESTED] = false;
					self[renderChunk](newStartIndex);
				}

				if (!self.isVirtualized() && endIndex > -1) {
					self.updateItemPositions();
				}

				self[CURRENT_START_INDEX] = startIndex;
				self[CURRENT_END_INDEX] = endIndex;

				if (self.onLayoutChange()) {
					self.onLayoutChange()();
				}
			}
		}
	}

	/**
	 * Render a specific item.
	 * @function renderItem
	 * @param {Number}  index
	 * @param {Boolean} doPrepend
	 * @param {Boolean} doSetSize
	 */
	[renderItem](index, doPrepend, doSetSize) {
		const self = this;
		let newSize;
		let newPosition;
		const itemData = self.itemData()[index] || {};

		if (!itemData.id) {
			throw (NO_ITEM_ID_ERROR_MESSAGE);
		}

		if (self[CONTROL_RECYCLER] && self[CONTROL_RECYCLER].control()) {
			const control = self[CONTROL_RECYCLER].getRecycledControl(doPrepend);

			if (!control.isRemoved) {
				if (self.isVirtualized()) {
					newSize = self[ITEM_SIZE] > 1 ? self[ITEM_SIZE] : '';
					newPosition = ((index * self[ITEM_SIZE]) - self[CURRENT_STEP_OFFSET]) + PIXELS;
				}
				else {
					newSize = '';
					newPosition = ZERO_PIXELS;
				}

				control
					.addClass(VIRTUAL_ITEM_CLASS)
					.css(POSITION, ABSOLUTE)
					.css(self[POSITION_ORIGIN], newPosition)
					.css(self[ALT_POSITION_ORIGIN], ZERO_PIXELS)
					.css(self[EXTENT], newSize)
					.css(self[ALT_EXTENT], self[ALT_EXTENT_VALUE])
					.id(itemData.id);

				if (doPrepend) {
					self[CONTENT_CONTAINER].prepend(control);
				}
				else {
					self[CONTENT_CONTAINER].append(control);
				}

				if (self.onItemRender()) {
					self.onItemRender()(control, itemData);
				}

				control.virtualIndex = index;

				if (self.isFocusable() && control.isFocusable) {
					control.isFocusable(true);

					if (self.isFocused() && index === self[MULTI_ITEM_FOCUS].current()) {
						control.isFocused(true);
					}
				}

				if (doSetSize) {
					self[setItemSize](control);
				}
			}
		}
	}

	/**
	 * Set the position to the current offset and increment the current offset for the next item.
	 * @function setItemPosition
	 * @param {Number}  index
	 */
	[setItemPosition](index) {
		const self = this;
		const control = self[CONTROL_RECYCLER].getControlAtOffset(index);

		control.css(self[POSITION_ORIGIN], self[CURRENT_ITEM_OFFSET] + PIXELS);

		self[CURRENT_ITEM_OFFSET] += measure[self[EXTENT]](control);
	}

	/**
	 * Whenever the list is scrolled save the position and only rerender the contents if we've moved at least half of
	 * the viewport height.
	 * @function onScroll
	 */
	[onScroll](event) {
		const self = this;

		event.preventDefault();
		self[CURRENT_SCROLL_OFFSET] = event.target[self[EXTENT_SCROLL_ORIGIN]];
		self[render]();
	}

	/**
	 * Calculate the new start position and render.
	 * @function render
	 */
	[render]() {
		const self = this;
		let index = 0;

		if (self.isVirtualized()) {
			index = Math.floor((self[CURRENT_SCROLL_OFFSET] / self[ITEM_SIZE]) - (self[VIEWPORT_ITEMS_LENGTH] * self.extraRenderedItemsRatio()));

			index = Math.max(self.keepAltRows() ? (index - (index % 2)) : index, 0);
		}

		if (!self.isHorizontal() && self.snapToLeadingEdge()) {
			defer(() => {
				self[setVirtualContentSizes]();
			});
		}

		if (isNumber(index)) {
			self[renderChunk](index);
			self[setVirtualContentAltExtent]();
		}
	}

	/**
	 * Display a message that there are no items to display.
	 * @function showEmptyContentMessage
	 */
	[showEmptyContentMessage]() {
		const self = this;

		if (self.emptyContentMessage() && !self[EMPTY_CONTENT_CONTAINER]) {
			self[EMPTY_CONTENT_CONTAINER] = new Div({
				container: self[CONTENT_CONTAINER],
				classes: EMPTY_CONTENT_CLASS,
				content: {
					control: Span,
					text: self.emptyContentMessage()
				}
			});

			self[updateEmptyContentSize]();
		}
	}

	[updateEmptyContentSize]() {
		const self = this;

		if (self[EMPTY_CONTENT_CONTAINER]) {
			const newSize = self[EMPTY_CONTENT_CONTAINER].borderHeight();
			self[CONTENT_CONTAINER].css(HEIGHT, newSize);
			self.css(MIN_HEIGHT, newSize);
		}
	}

	/**
	 * Remove the empty content message.
	 * @function removeEmptyContentMessage
	 */
	[removeEmptyContentMessage]() {
		const self = this;

		if (self[EMPTY_CONTENT_CONTAINER]) {
			self[EMPTY_CONTENT_CONTAINER].remove();
			self[EMPTY_CONTENT_CONTAINER] = null;
		}
	}

	/**
	 * Set focus on an item. if the item is not rendered, scroll to it first.
	 * @function focusItem
	 */
	[focusItem](index) {
		const self = this;
		let control;

		if (index < self[CURRENT_START_INDEX]) {
			self[setScroll](index * self[ITEM_SIZE]);
		}
		else if (index > self[CURRENT_END_INDEX]) {
			self[setScroll](index * self[ITEM_SIZE] - (self[VIEWPORT_SIZE] - self[ITEM_SIZE]));
		}
		else {
			control = self[CONTROL_RECYCLER].getControlAtOffset(index - self[CURRENT_START_INDEX]);

			if (control) {
				if (parseInt(control.css(TOP), 10) < (self[CURRENT_SCROLL_OFFSET] + self[ITEM_SIZE])) {
					self[setScroll](self[CURRENT_SCROLL_OFFSET] - self[ITEM_SIZE]);
				}
				control.isFocused(true);
			}
		}
	}

	/**
	 * Scroll to a specific offset.
	 * @function setScroll
	 */
	[setScroll](offset) {
		const self = this;

		offset = Math.floor(offset / self[ITEM_SIZE]) * self[ITEM_SIZE];
		self[CURRENT_SCROLL_OFFSET] = clamp(offset, 0, (self[ITEM_SIZE] * self[TOTAL_ITEMS]) - self[VIEWPORT_SIZE] + self.startOffset()
			.toPixels(true) + self.endOffset().toPixels(true));

		d3Helper.animate(self)
			.tween('scrollTween', d3Helper.propertyTween(self[EXTENT_SCROLL_ORIGIN], self[CURRENT_SCROLL_OFFSET]));
	}

	/**
	 * Get the alt size of the first rendered item.
	 * @function getFirstItemAltSize
	 */
	[getFirstItemAltSize]() {
		const self = this;
		const item = self[CONTROL_RECYCLER].getControlAtOffset(0);

		return item ? item[self[ALT_EXTENT] === HEIGHT ? 'borderHeight' : 'borderWidth']() + PIXELS : AUTO;
	}

	/**
	 * Determines what the alt size should be for each item.
	 * @function setAltExtentValue
	 */
	[setAltExtentValue]() {
		const self = this;

		if (!self.isRemoved) {
			const isAutoSize = self[self[ALT_EXTENT]]().isAuto;
			self[ALT_EXTENT_VALUE] = isAutoSize ? self[getFirstItemAltSize]() : HUNDRED_PERCENT;

			self[CONTENT_CONTAINER].css(self[ALT_EXTENT], self[ALT_EXTENT_VALUE]);
			self[setVirtualContentSizes]();
		}
	}

	/**
	 * Prepare the list for either horizontal or vertical positioning.
	 * @function setExtent
	 */
	[setExtent]() {
		const self = this;
		let overflow;
		let altOverflow;

		if (self.isHorizontal()) {
			self[EXTENT] = WIDTH;
			self[ALT_EXTENT] = HEIGHT;
			self[POSITION_ORIGIN] = LEFT;
			self[ALT_POSITION_ORIGIN] = TOP;
			self[EXTENT_SCROLL_ORIGIN] = SCROLL_LEFT;
			overflow = OVERFLOW_X;
			altOverflow = OVERFLOW_Y;
			self[EXTENT_PADDING] = HORIZONTAL;
		}
		else {
			self[EXTENT] = HEIGHT;
			self[ALT_EXTENT] = WIDTH;
			self[POSITION_ORIGIN] = TOP;
			self[ALT_POSITION_ORIGIN] = LEFT;
			self[EXTENT_SCROLL_ORIGIN] = SCROLL_TOP;
			overflow = OVERFLOW_Y;
			altOverflow = OVERFLOW_X;
			self[EXTENT_PADDING] = VERTICAL;
		}

		self[setAltExtentValue]();

		self.css(overflow, self.hideScrollBars() ? HIDDEN : AUTO)
			.css(altOverflow, HIDDEN);
	}
}

Object.assign(VirtualList.prototype, {
	/**
	 * A callback that gets called whenever the layout changes
	 *
	 * @method onLayoutChange
	 * @member module:VirtualList
	 * @instance
	 *
	 * @param {function} [onLayoutChange]
	 *
	 * @returns {function|this}
	 */
	onLayoutChange: methodFunction({
		other: null
	}),

	/**
	 * Get or set whether the list is rendered vertically or horizontally
	 * @method isHorizontal
	 * @member module:VirtualList
	 * @instance
	 * @param {boolean} [isHorizontal]
	 * @returns {boolean|this}
	 */
	isHorizontal: methodBoolean({
		set(isHorizontal) {
			const self = this;

			if (isHorizontal && !self[CONTENT_CONTAINER].restrictVerticalDrag()) {
				self[CONTENT_CONTAINER]
					.canDrag(true)
					.restrictVerticalDrag(true)
					.scrollOnDrag(true);
			}
			self[setExtent]();
			self.refresh();
		}
	}),

	/**
	 * Get or set the data for the items. Setting new data forces a refresh of the list.
	 * @method itemData
	 * @member module:VirtualList
	 * @instance
	 * @param {Object[]} [newItemData]
	 * @returns {Object[]|this}
	 */
	itemData: methodArray({
		set(newValue) {
			const self = this;

			self[TOTAL_ITEMS] = newValue.length;
			if (self.isFocusable()) {
				self[MULTI_ITEM_FOCUS].length(self[TOTAL_ITEMS]);
			}
			self.refresh();
		}
	}),

	/**
	 * @method isVirtualized
	 * @member module:VirtualList
	 * @instance
	 * @param {Boolean} [newIsVirtualized]
	 * @returns {Boolean|this}
	 */
	isVirtualized: methodBoolean({
		init: true
	}),

	/**
	 * @method itemSize
	 * @member module:VirtualList
	 * @instance
	 * @param {string} [newItemSize]
	 * @returns {string|this}
	 */
	itemSize: methodCssSize({
		set(newValue) {
			this[ITEM_SIZE] = newValue.toPixels(true) || 1;
			this.refresh();
		}
	}),

	keepAltRows: methodBoolean({
		init: true
	}),

	/**
	 * Get or set the list item control.
	 * @method itemControl
	 * @member module:VirtualList
	 * @instance
	 * @param {Object} [newControl]
	 * @returns {Object|this}
	 */
	itemControl: methodFunction({
		bind: false,
		set(newValue) {
			if (this[CONTROL_RECYCLER]) {
				this[CONTROL_RECYCLER].control(newValue);
			}
		}
	}),

	/**
	 * Get or set the amount controls to render beyond the visible viewport (as a ratio of
	 * the items rendered within the viewport).
	 *
	 * @method extraRenderedItemsRatio
	 * @member module:VirtualList
	 * @instance
	 *
	 * @param {Number} [newExtraRenderedItemsRatio]
	 *
	 * @returns {Object|this}
	 */
	extraRenderedItemsRatio: methodNumber({
		init: 0.1,
		set: render,
		min: 0
	}),

	/**
	 * Get or set the default settings that are used whenever a list item control is
	 * instantiated.
	 *
	 * @method itemDefaultSettings
	 * @member module:VirtualList
	 * @instance
	 *
	 * @param {Object} [newOptions]
	 *
	 * @returns {Object|this}
	 */
	itemDefaultSettings: methodObject({
		set(newValue) {
			this[CONTROL_RECYCLER].defaultSettings(newValue);
		},
		other: undefined
	}),

	/**
	 * Set a callback function that gets executed whenever an item is rendered.
	 * @method onItemRender
	 * @member module:VirtualList
	 * @instance
	 * @param {Function} callback
	 * @returns {Function|this}
	 */
	onItemRender: methodFunction({
		set: render,
		other: undefined
	}),

	/**
	 * Get an Array of all the visible controls
	 *
	 * @method getRenderedControls
	 * @member module:VirtualList
	 * @instance
	 *
	 * @returns {Object[]}
	 */
	getRenderedControls() {
		return this[CONTROL_RECYCLER].getRenderedControls();
	},

	/**
	 * Get first visible item
	 *
	 * @method getFirstRenderedItem
	 * @member module:VirtualList
	 * @instance
	 *
	 * @returns {Object[]}
	 */
	firstVisibleItem() {
		const self = this;
		const index = Math.ceil(self[CURRENT_SCROLL_OFFSET] / self[ITEM_SIZE]);
		let output;

		self[CONTROL_RECYCLER].each((control) => {
			if (control.virtualIndex === index) {
				output = control;
			}
		});

		return output;
	},

	/**
	 * Updates the offsets of each item when isVirtualized is false.
	 * @method updateItemPositions
	 * @member module:VirtualList
	 * @instance
	 * @returns {this}
	 */
	updateItemPositions() {
		const self = this;

		if (!self.isVirtualized()) {
			self[CURRENT_ITEM_OFFSET] = 0;
			forRange(0, self[CONTROL_RECYCLER].totalVisibleControls() - 1, (index) => self[setItemPosition](index));

			if (self.height().isAuto && self[TOTAL_ITEMS]) {
				self[CONTENT_CONTAINER].height(self[CURRENT_ITEM_OFFSET]);
			}
		}

		return self;
	},

	/**
	 * Set the height of the list to the height of the contents.
	 * @method fitHeightToContents
	 * @member module:VirtualList
	 * @instance
	 * @returns {this}
	 */
	fitHeightToContents() {
		this.css(HEIGHT, this[CONTENT_CONTAINER].borderHeight());

		return this;
	},

	/**
	 * Auto-scroll to an item.
	 * @method scrollToIndex
	 * @member module:VirtualList
	 * @instance
	 * @param {Number} index - index of an item that is currently displayed
	 */
	scrollToIndex(index) {
		const self = this;

		self[setScroll]((Math.max(0, index) * self[ITEM_SIZE]) - (self[ITEM_SIZE] - SCROLL_BUFFER));
	},

	/**
	 * Auto-scroll on page forward. One page is defined as the number of items that fit entirely in the viewport at one
	 * time.
	 *
	 * @method nextPage
	 * @member module:VirtualList
	 * @instance
	 */
	nextPage() {
		this[setScroll](this[CURRENT_SCROLL_OFFSET] + this[PAGE_SIZE]);
	},

	/**
	 * Auto-scroll on page back. One page is defined as the number of items that fit entirely in the viewport at one
	 * time.
	 *
	 * @method prevPage
	 * @member module:VirtualList
	 * @instance
	 */
	prevPage() {
		this[setScroll](this[CURRENT_SCROLL_OFFSET] - this[PAGE_SIZE]);
	},

	/**
	 * See if the content is scrolled to the beginning
	 *
	 * @method isAtStart
	 * @member module:VirtualList
	 * @instance
	 *
	 * @returns {boolean}
	 */
	isAtStart() {
		return this[CURRENT_SCROLL_OFFSET] < SCROLL_BUFFER;
	},

	/**
	 * See if the content is scrolled to the end
	 *
	 * @method isAtEnd
	 * @member module:VirtualList
	 * @instance
	 *
	 * @returns {boolean}
	 */
	isAtEnd() {
		const self = this;

		return self[CURRENT_SCROLL_OFFSET] + self[VIEWPORT_SIZE] > (self[ITEM_SIZE] * self[TOTAL_ITEMS]) - SCROLL_BUFFER + self.startOffset()
			.toPixels(true) + self.endOffset().toPixels(true) - self[INNER_PADDING][self[EXTENT_PADDING]];
	},

	startOffset: methodCssSize({
		init: new CssSize(),
		set(startOffset) {
			const self = this;

			self[CONTENT_CONTAINER].css(self.isHorizontal() ? 'margin-left' : 'margin-top', startOffset.toPixels());
		}
	}),

	endOffset: methodCssSize({
		init: new CssSize(),
		set(endOffset) {
			const self = this;

			self[CONTENT_CONTAINER].css(self.isHorizontal() ? 'margin-right' : 'margin-bottom', endOffset.toPixels());
		}
	}),

	/**
	 * Hide the scrollbars. This disables all mouse interaction, so other means of navigation must be implemented.
	 *
	 * @method hideScrollBars
	 * @member module:VirtualList
	 * @instance
	 *
	 * @param {boolean}
	 *
	 * @returns {boolean|this}
	 */
	hideScrollBars: methodBoolean({
		set: setExtent
	}),

	/**
	 * Centers items in the viewport if there are fewer than fit in the viewport
	 *
	 * @method isCentered
	 * @member module:VirtualList
	 * @instance
	 *
	 * @param {boolean}
	 *
	 * @returns {boolean|this}
	 */
	isCentered: methodBoolean(),

	/**
	 * When the user is done scrolling, animate the scroll to the nearest leading edge of an item
	 *
	 * @method snapToLeadingEdge
	 * @member module:VirtualList
	 * @instance
	 *
	 * @param {boolean}
	 *
	 * @returns {boolean|this}
	 */
	snapToLeadingEdge: methodBoolean({
		set(snapToLeadingEdge) {
			const self = this;

			if (self.isHorizontal()) {
				self[CONTENT_CONTAINER].snapGridSize(snapToLeadingEdge ? self[ITEM_SIZE] : 0);
			}
			else {
				self[setVirtualContentSizes]();
			}
		}
	}),

	emptyContentMessage: methodString(),

	/**
	 * Remove all the items and re-render them at the current scroll position.
	 * @method refresh
	 * @member module:VirtualList
	 * @instance
	 */
	refresh() {
		const self = this;

		self[CURRENT_START_INDEX] = 0;
		self[CURRENT_END_INDEX] = -1;

		self[CONTROL_RECYCLER].discardAllControls();

		if (self.itemData() && self[TOTAL_ITEMS] > 0) {
			self[removeEmptyContentMessage]();

			if (!self.itemSize() && self.isVirtualized()) {
				self[renderItem](0, false, true);
			}
			else if (!self.isRemoved) {
				self[setAltExtentValue]();
				self[setScrollSize]();
				self[render]();
			}
		}
		else {
			self[showEmptyContentMessage]();
		}
	},

	isFocusable: methodBoolean({
		set(newValue) {
			const self = this;

			if (newValue) {
				self.attr(TAB_INDEX, TAB_INDEX_ENABLED);
				self[MULTI_ITEM_FOCUS] = new MultiItemFocus(self)
					.onSetFocus((index) => self[focusItem](index))
					.length(self[TOTAL_ITEMS]);

			}
			else {
				self.attr(TAB_INDEX, TAB_INDEX_DISABLED);
				self[MULTI_ITEM_FOCUS].remove();
			}
		}
	})

});
