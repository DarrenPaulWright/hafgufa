import { clear, defer, delay } from 'async-agent';
import { event, select } from 'd3';
import keyCodes from 'keycodes';
import { AUTO, DockPoint, enforce, isElement, method, ZERO_PIXELS } from 'type-enforcer';
import dom from '../../utility/dom';
import {
	ABSOLUTE,
	BLOCK,
	BLUR_EVENT,
	BODY,
	BOTTOM,
	CLICK_EVENT,
	CLIP_PATH,
	DISPLAY,
	EMPTY_STRING,
	HEIGHT,
	KEY_UP_EVENT,
	LEFT,
	MOUSE_ENTER_EVENT,
	MOUSE_LEAVE_EVENT,
	MOUSE_MOVE_EVENT,
	POSITION,
	RIGHT,
	TOP,
	WIDTH,
	WINDOW,
	Z_INDEX
} from '../../utility/domConstants';
import * as mouse from '../../utility/mouse';
import objectHelper from '../../utility/objectHelper';
import controlTypes from '../controlTypes';
import Container from './Container';
import './Popup.less';

const POPUP_CLASS = 'popup';
const POPUP_ZOOM_INITIAL_CLASS = 'popup-zoom-initial';
const POPUP_ZOOM_IN_CLASS = 'popup-zoom-in';
const POPUP_ZOOM_BASE_CLASS = 'fixed-';
const POPUP_CLASS_SEPARATOR = '-';
const ARROW_WRAPPER_CLASS = 'popup-arrow-wrapper';
const ARROW_CLASS = 'popup-arrow';
const MOUSE_LEAVE_BUFFER = 200;
const ARROW_CLIP_OFFSET = '49% ';
const ARROW_CLIP_NONE = '0 ';
const POINTS = DockPoint.POINTS;
const WINDOW_PADDING = 4;

const IS_INITIALIZED = Symbol();
const IS_ACTIVE = Symbol();
const CURRENT_WIDTH = Symbol();
const CURRENT_HEIGHT = Symbol();
const ACTUAL_POPUP_DOCK_POINT = Symbol();
const CAN_SLIDE_HORIZONTAL = Symbol();
const CAN_SLIDE_VERTICAL = Symbol();
const IS_MOUSE_OVER = Symbol();
const MOUSE_LEAVE_TIMER = Symbol();
const IS_MOUSE_POSITION_SET = Symbol();
const FORCE_RESIZE = Symbol();
const ARROW_WRAPPER = Symbol();
const ARROW = Symbol();

let windowWidth = 0;
let windowHeight = 0;

const onMouseEnter = function() {
	const self = this;

	if (event.target === self.element()) {
		self[IS_ACTIVE] = true;
	}
	if (self.hideOnMouseLeave() && !self.isSticky()) {
		self[IS_MOUSE_OVER] = true;
		clear(self[MOUSE_LEAVE_TIMER]);
	}
};

const onMouseLeave = function() {
	const self = this;

	if (event.target === self.element()) {
		self[IS_ACTIVE] = false;
	}
	if (self.hideOnMouseLeave() && !self.isSticky()) {
		self[IS_MOUSE_OVER] = false;
		self[MOUSE_LEAVE_TIMER] = delay(() => {
			if (!self[IS_MOUSE_OVER]) {
				self.remove();
			}
		}, MOUSE_LEAVE_BUFFER);
	}
};

const onMouseMove = function() {
	this[IS_ACTIVE] = false;
	positionPopup.call(this);
};

const setAnimation = function() {
	let newClass = POPUP_ZOOM_BASE_CLASS;

	const appendSecondary = (primary) => {
		if (primary) {
			newClass += primary + POPUP_CLASS_SEPARATOR;
		}
		if (this[ACTUAL_POPUP_DOCK_POINT].has(POINTS.RIGHT)) {
			newClass += RIGHT;
		}
		else if (this[ACTUAL_POPUP_DOCK_POINT].has(POINTS.LEFT)) {
			newClass += LEFT;
		}
	};

	if (this.zoom()) {
		if (this[ACTUAL_POPUP_DOCK_POINT].has(POINTS.TOP)) {
			appendSecondary(TOP);
		}
		else if (this[ACTUAL_POPUP_DOCK_POINT].has(POINTS.BOTTOM)) {
			appendSecondary(BOTTOM);
		}
		else {
			appendSecondary();
		}

		this.addClass(newClass);

		defer(() => {
			this.addClass(POPUP_ZOOM_INITIAL_CLASS);

			defer(() => {
				this.addClass(POPUP_ZOOM_IN_CLASS);
			});
		});
	}
};

const setSlidability = function() {
	this[CAN_SLIDE_HORIZONTAL] = checkSlidability.call(this, POINTS.TOP, POINTS.BOTTOM);
	this[CAN_SLIDE_VERTICAL] = checkSlidability.call(this, POINTS.LEFT, POINTS.RIGHT);
	this[ACTUAL_POPUP_DOCK_POINT] = this.popupDockPoint();
};

const checkSlidability = function(dockOption1, dockOption2) {
	const anchorDockPoint = this.anchorDockPoint();
	const popupDockPoint = this.popupDockPoint();

	return (anchorDockPoint.primary() === dockOption1 && popupDockPoint.primary() === dockOption2) ||
		(anchorDockPoint.primary() === dockOption2 && popupDockPoint.primary() === dockOption1) ||
		(anchorDockPoint.secondary() === dockOption1 && popupDockPoint.secondary() === dockOption2) ||
		(anchorDockPoint.secondary() === dockOption2 && popupDockPoint.secondary() === dockOption1);
};

const getDockPointOffsetHeight = (dockPoint, element) => {
	if (dockPoint.has(POINTS.BOTTOM)) {
		return dom.get.outerHeight(element);
	}
	else if (dockPoint.primary() !== POINTS.TOP && dockPoint.secondary() === POINTS.CENTER) {
		return dom.get.outerHeight(element) / 2;
	}
	else {
		return 0;
	}
};

const getDockPointOffsetWidth = (dockPoint, element) => {
	if (dockPoint.has(POINTS.RIGHT)) {
		return dom.get.outerWidth(element);
	}
	else if (dockPoint.primary() !== POINTS.LEFT && dockPoint.secondary() === POINTS.CENTER) {
		return dom.get.outerWidth(element) / 2;
	}
	else {
		return 0;
	}
};

const positionPopup = function() {
	const currentScrollOffset = this.element().scrollTop;
	const marginsVertical = dom.get.margins.height(this);
	const marginsHorizontal = dom.get.margins.width(this);
	let popupTop = 0;
	let popupLeft = 0;
	let popupWidth;
	let popupHeight;
	let optimizedLayout;
	let slideOffset = 0;
	let anchorLeft = 0;
	let anchorTop = 0;
	let anchorWidth = 0;
	let anchorHeight = 0;
	let anchorDockWidth = 0;
	let anchorDockHeight = 0;

	if (!this.width().isFixed && !this.width().isPercent) {
		this.css({
			width: AUTO,
			left: ZERO_PIXELS
		});
	}
	if (!this.height().isFixed && !this.height().isPercent) {
		this.css({
			height: AUTO,
			top: ZERO_PIXELS
		});
	}
	popupWidth = this.borderWidth();
	popupHeight = this.borderHeight();
	this[ACTUAL_POPUP_DOCK_POINT] = this.popupDockPoint();

	if (!this.anchor()) {
		if (this.width().isPercent && !this.maxWidth()) {
			popupWidth = Math.ceil((windowWidth - marginsHorizontal) * (this.width().value / 100));
		}
		else {
			popupWidth = Math.min(popupWidth, windowWidth - marginsHorizontal);
		}

		if (this.height().isPercent && !this.maxHeight()) {
			popupHeight = Math.ceil((windowHeight - marginsVertical) * (this.height().value() / 100));
		}
		else {
			popupHeight = Math.min(popupHeight, windowHeight - marginsVertical);
		}

		popupLeft = Math.max(0, ((windowWidth - popupWidth - marginsHorizontal) / 2));
		popupTop = Math.max(0, ((windowHeight - popupHeight - marginsVertical) / 2));
	}
	else {
		if (isElement(this.anchor())) {
			anchorLeft = dom.get.left(this.anchor(), true);
			anchorTop = dom.get.top(this.anchor(), true);

			anchorWidth = dom.get.width(this.anchor());
			anchorHeight = dom.get.height(this.anchor());
			anchorDockWidth = getDockPointOffsetWidth(this.anchorDockPoint(), this.anchor());
			anchorDockHeight = getDockPointOffsetHeight(this.anchorDockPoint(), this.anchor());
		}
		else if (this.anchor() === Popup.MOUSE) {
			anchorLeft = mouse.x;
			anchorTop = mouse.y;
		}

		popupTop = anchorTop + anchorDockHeight;
		popupTop -= getDockPointOffsetHeight(this.popupDockPoint(), this.element());

		popupLeft = anchorLeft + anchorDockWidth;
		popupLeft -= getDockPointOffsetWidth(this.popupDockPoint(), this.element());

		optimizedLayout = optimizePosition({
			offset: popupTop,
			size: popupHeight,
			margin: Math.max(marginsVertical, WINDOW_PADDING),
			anchorOffset: anchorTop,
			anchorSize: anchorHeight,
			anchorDockSize: anchorDockHeight,
			maxSize: windowHeight,
			canSlide: this[CAN_SLIDE_VERTICAL]
		});
		popupTop = optimizedLayout.offset;
		popupHeight = optimizedLayout.size;
		if (optimizedLayout.didSwitch) {
			this[ACTUAL_POPUP_DOCK_POINT].swapVertical();
		}
		slideOffset = optimizedLayout.slideOffset || slideOffset;

		optimizedLayout = optimizePosition({
			offset: popupLeft,
			size: popupWidth,
			margin: Math.max(marginsHorizontal, WINDOW_PADDING),
			anchorOffset: anchorLeft,
			anchorSize: anchorWidth,
			anchorDockSize: anchorDockWidth,
			maxSize: windowWidth,
			canSlide: this[CAN_SLIDE_HORIZONTAL]
		});
		popupLeft = optimizedLayout.offset;
		popupWidth = optimizedLayout.size;
		if (optimizedLayout.didSwitch) {
			this[ACTUAL_POPUP_DOCK_POINT].swapHorizontal();
		}
		slideOffset = optimizedLayout.slideOffset || slideOffset;
	}

	this.css(LEFT, popupLeft - 1);
	this.css(TOP, popupTop);

	if (!this.height().isFixed) {
		this.css(HEIGHT, popupHeight);
	}
	if (!this.width().isFixed) {
		this.css(WIDTH, popupWidth + 1);
	}

	positionArrow.call(this, popupWidth, popupHeight, slideOffset);

	this.element().scrollTop = currentScrollOffset;

	if (!this[IS_INITIALIZED]) {
		this[IS_INITIALIZED] = true;
		setAnimation.call(this);
	}

	if (event && this.anchor() === Popup.MOUSE && !this.canTrackMouse()) {
		this[IS_MOUSE_POSITION_SET] = true;
		select(BODY).on(MOUSE_MOVE_EVENT, null);
	}
};

const optimizePosition = (pos) => {
	let didSwitch = false;
	let slideOffset = 0;

	const forceToPositiveSide = () => {
		didSwitch = true;
		pos.offset = pos.anchorOffset + pos.anchorSize;
		pos.size = Math.min(pos.maxSize - pos.anchorOffset - pos.anchorSize - (2 * pos.margin), pos.size);
	};

	const forceToNegativeSide = () => {
		didSwitch = true;
		pos.size = Math.min(pos.size, pos.anchorOffset - pos.margin);
		pos.offset = Math.max(pos.margin, pos.anchorOffset - pos.size);
	};

	if (pos.offset < pos.margin) {
		if (pos.canSlide) {
			pos.offset = 0;
			pos.size = Math.min(pos.maxSize - pos.margin, pos.size);
			slideOffset = (pos.anchorOffset + pos.anchorDockSize) - ((pos.size + pos.margin) / 2);
		}
		else if (pos.maxSize - pos.anchorOffset - pos.anchorSize > pos.anchorOffset) {
			forceToPositiveSide();
		}
		else {
			forceToNegativeSide();
		}
	}
	else if (pos.offset + pos.size > pos.maxSize - pos.margin) {
		if (pos.canSlide) {
			slideOffset = pos.offset - (pos.maxSize - pos.size - pos.margin);
			pos.offset = pos.maxSize - pos.size - pos.margin;
			pos.size = Math.min(pos.maxSize - (2 * pos.margin), pos.size);
		}
		else if (pos.maxSize - pos.anchorOffset - pos.anchorSize > pos.anchorOffset) {
			forceToPositiveSide();
		}
		else {
			forceToNegativeSide();
		}
	}

	return {
		offset: pos.offset,
		size: pos.size,
		didSwitch: didSwitch,
		slideOffset: slideOffset
	};
};

const positionArrow = function(popupWidth, popupHeight, slideOffset) {
	if (this[ARROW]) {
		const direction = this[ACTUAL_POPUP_DOCK_POINT].primary();
		let clipPath = 'inset(';

		switch (direction) {
			case BOTTOM:
				clipPath += ARROW_CLIP_OFFSET + ARROW_CLIP_NONE + ARROW_CLIP_NONE + ARROW_CLIP_NONE;
				break;
			case LEFT:
				clipPath += ARROW_CLIP_NONE + ARROW_CLIP_OFFSET + ARROW_CLIP_NONE + ARROW_CLIP_NONE;
				break;
			case TOP:
				clipPath += ARROW_CLIP_NONE + ARROW_CLIP_NONE + ARROW_CLIP_OFFSET + ARROW_CLIP_NONE;
				break;
			case RIGHT:
				clipPath += ARROW_CLIP_NONE + ARROW_CLIP_NONE + ARROW_CLIP_NONE + ARROW_CLIP_OFFSET;
				break;
		}

		clipPath += ')';

		if (direction === LEFT || direction === RIGHT) {
			dom.css(this[ARROW_WRAPPER], LEFT, (direction === LEFT) ? EMPTY_STRING : popupWidth)
				.css(this[ARROW_WRAPPER], TOP, (popupHeight / 2) + slideOffset)
				.css(this[ARROW_WRAPPER], CLIP_PATH, clipPath);
		}
		else {
			dom.css(this[ARROW_WRAPPER], TOP, (direction === TOP) ? EMPTY_STRING : popupHeight)
				.css(this[ARROW_WRAPPER], LEFT, (popupWidth / 2) + slideOffset)
				.css(this[ARROW_WRAPPER], CLIP_PATH, clipPath);
		}
	}
};

/**
 * Adds a div to the top of the body and positions it relative to an anchor.
 *
 * @class Popup
 * @extends Container
 * @constructor
 *
 * @arg {Object}        settings - Accepts all controlBase settings plus:
 * @arg {String}        [settings.classes] - A space separated list of css classes to apply to the popup.
 * @arg {Object|String} [settings.anchor] - DOM element or 'mouse' to follow the cursor.
 * @arg {DockPoint}     [settings.anchorDockPoint] - The dock point on the anchor
 * @arg {DockPoint}     [settings.popupDockPoint] - The dock point on the popup
 * @arg {Boolean}       [settings.isSticky=false] - Keep the popup when it loses focus or mouse leave? Primarily
 *    intended for use when debugging.
 * @arg {String}        [settings.animation=none] - 'none', 'fade', 'zoom'
 * @arg {Boolean}       [settings.hideOnMouseLeave=false] - Hide the popup when the mouse leaves the popup?
 * @arg {Boolean}       [settings.hideOnEscapeKey=false] - Hide the popup when the escape key is pressed?
 * @arg {String|Object} [settings.content] - HTML string, a DOM element, or another control
 * @arg {Function}      [settings.onResize] - Callback that gets executed  whenever the popup size is set.
 * @arg {Function}      [settings.onRemove] - Callback that gets executed when this.remove is called.
 * @arg {boolean}       skipFocusable
 */
class Popup extends Container {
	constructor(settings = {}) {
		settings.type = settings.type || controlTypes.POPUP;
		settings.container = enforce.element(settings.container, BODY);
		settings.ID = settings.ID || 'popup_' + Math.round(Math.random() * 10000);
		settings.isSticky = enforce.boolean(settings.isSticky, false);
		settings.fade = settings.zoom || settings.fade;

		super(settings);

		const self = this;

		self[CAN_SLIDE_HORIZONTAL] = false;
		self[CAN_SLIDE_VERTICAL] = false;
		self[IS_MOUSE_OVER] = true;

		self.addClass(POPUP_CLASS)
			.css(DISPLAY, BLOCK)
			.css(POSITION, ABSOLUTE)
			.css(TOP, ZERO_PIXELS)
			.css(LEFT, ZERO_PIXELS);

		if (settings.type === controlTypes.POPUP) {
			objectHelper.applySettings(self, settings);
		}

		self.on(MOUSE_ENTER_EVENT, () => {
				onMouseEnter.call(self);
			})
			.on(MOUSE_LEAVE_EVENT, () => {
				onMouseLeave.call(self);
			})
			.onResize((newWindowWidth, newWindowHeight) => {
				const isMouseAnchor = self.anchor() === Popup.MOUSE;

				if (windowWidth !== newWindowWidth || windowHeight !== newWindowHeight ||
					self[CURRENT_WIDTH] !== self.borderWidth() || self[CURRENT_HEIGHT] !== self.borderHeight() || self[FORCE_RESIZE]) {
					windowWidth = newWindowWidth;
					windowHeight = newWindowHeight;
					self[CURRENT_WIDTH] = self.borderWidth();
					self[CURRENT_HEIGHT] = self.borderHeight();

					if ((!isMouseAnchor) || (isMouseAnchor && self.canTrackMouse()) || (isMouseAnchor && !self[IS_MOUSE_POSITION_SET]) || self[FORCE_RESIZE]) {
						self[FORCE_RESIZE] = false;
						positionPopup.call(self);
					}
				}
			}, true)
			.onPreRemove(() => {
				if (self.zoom()) {
					self.removeClass(POPUP_ZOOM_IN_CLASS);
				}
			})
			.onRemove(() => {
				self.showArrow(false)
					.isSticky(true)
					.anchor(undefined);
			});
	}

	resize(isForced) {
		if (isForced) {
			this[FORCE_RESIZE] = true;
		}
		super.resize(isForced);
	}
}

Popup.MOUSE = 'mouse';

Object.assign(Popup.prototype, {
	showArrow: method.boolean({
		set: function(showArrow) {
			if (showArrow) {
				this[ARROW_WRAPPER] = dom.prependNewTo(this, ARROW_WRAPPER_CLASS);
				this[ARROW] = dom.prependNewTo(this[ARROW_WRAPPER], ARROW_CLASS);
			}
			else {
				dom.remove(this[ARROW_WRAPPER]);
				this[ARROW_WRAPPER] = null;
				dom.remove(this[ARROW]);
				this[ARROW] = null;
			}
		}
	}),

	anchor: method.element({
		before: function(oldValue) {
			if (isElement(oldValue)) {
				select(oldValue)
					.on(MOUSE_ENTER_EVENT, null)
					.on(MOUSE_LEAVE_EVENT, null);
			}
			else if (oldValue === Popup.MOUSE) {
				select(BODY).on(MOUSE_MOVE_EVENT, null);
			}
		},
		set: function(newValue) {
			const self = this;

			if (isElement(newValue)) {
				self.css(Z_INDEX, dom.css(newValue, Z_INDEX) + 1);
				select(newValue)
					.on(MOUSE_ENTER_EVENT, () => {
						onMouseEnter.call(self);
					})
					.on(MOUSE_LEAVE_EVENT, () => {
						onMouseLeave.call(self);
					});
			}
			else if (newValue === Popup.MOUSE) {
				select(BODY).on(MOUSE_MOVE_EVENT, () => onMouseMove.call(self));
			}
		},
		other: [undefined, Popup.MOUSE]
	}),

	anchorDockPoint: method.dockPoint({
		init: new DockPoint(POINTS.BOTTOM_CENTER),
		set: setSlidability
	}),

	popupDockPoint: method.dockPoint({
		init: new DockPoint(POINTS.TOP_CENTER),
		set: setSlidability
	}),

	isSticky: method.boolean({
		init: true,
		set: function(newValue) {
			const self = this;
			const suffix = '.' + self.ID();

			const onWindowClick = () => {
				if (!self[IS_ACTIVE]) {
					self.remove();
				}
			};

			const onWindowBlur = () => {
				self.remove();
			};

			select(WINDOW)
				.on(CLICK_EVENT + suffix, !newValue ? onWindowClick : null)
				.on(BLUR_EVENT + suffix, !newValue ? onWindowBlur : null);
		}
	}),

	hideOnMouseLeave: method.boolean(),

	hideOnEscapeKey: method.boolean({
		set: function(hideOnEscapeKey) {
			const self = this;

			const onEscapeKey = () => {
				if (event.keyCode === keyCodes('escape')) {
					self.remove();
				}
			};

			select(WINDOW).on(KEY_UP_EVENT, hideOnEscapeKey ? onEscapeKey : null);
		}
	}),

	/**
	 * If true then the popup will follow the mouse, if false then it will stay where the mouse was when
	 * instantiated
	 * @method canTrackMouse
	 * @member module:Popup
	 * @instance
	 * @arg {Boolean} canTrackMouse
	 * @returns {Boolean|this}
	 */
	canTrackMouse: method.boolean({
		init: true
	}),

	zoom: method.boolean()
});

export default Popup;
