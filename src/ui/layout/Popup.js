import { clear, defer, delay } from 'async-agent';
import { event, select } from 'd3';
import keyCodes from 'keycodes';
import { applySettings, AUTO, DockPoint, enforce, isElement, method, ZERO_PIXELS } from 'type-enforcer';
import dom from '../../utility/dom';
import {
	ABSOLUTE,
	BLOCK,
	BLUR_EVENT,
	BODY,
	BOTTOM,
	CLICK_EVENT,
	DISPLAY,
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
import controlTypes from '../controlTypes';
import Div from '../elements/Div';
import Container from './Container';
import './Popup.less';

const POPUP_CLASS = 'popup';
const POPUP_ZOOM_INITIAL_CLASS = 'popup-zoom-initial';
const POPUP_ZOOM_IN_CLASS = 'popup-zoom-in';
const POPUP_ZOOM_BASE_CLASS = 'fixed-';
const POPUP_CLASS_SEPARATOR = '-';
const ARROW_CLASS = 'popup-arrow';
const MOUSE_LEAVE_BUFFER = 200;
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
const ARROW = Symbol();

let windowWidth = 0;
let windowHeight = 0;

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

const optimizePosition = (pos) => {
	let didSwitch = false;

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
		didSwitch: didSwitch
	};
};

const onMouseEnter = Symbol();
const onMouseLeave = Symbol();
const onMouseMove = Symbol();
const setAnimation = Symbol();
const setSlidability = Symbol();
const checkSlidability = Symbol();
const positionPopup = Symbol();
const positionArrow = Symbol();

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
			applySettings(self, settings);
		}

		self.on(MOUSE_ENTER_EVENT, () => {
				self[onMouseEnter]();
			})
			.on(MOUSE_LEAVE_EVENT, () => {
				self[onMouseLeave]();
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
						self[positionPopup]();
					}
				}
			})
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

	[onMouseEnter]() {
		const self = this;

		if (event.target === self.element()) {
			self[IS_ACTIVE] = true;
		}
		if (self.hideOnMouseLeave() && !self.isSticky()) {
			self[IS_MOUSE_OVER] = true;
			clear(self[MOUSE_LEAVE_TIMER]);
		}
	}

	[onMouseLeave]() {
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
	}

	[onMouseMove]() {
		this[IS_ACTIVE] = false;
		this[positionPopup]();
	}

	[setAnimation]() {
		const self = this;
		let newClass = POPUP_ZOOM_BASE_CLASS;

		const appendSecondary = (primary) => {
			if (primary) {
				newClass += primary + POPUP_CLASS_SEPARATOR;
			}
			if (self[ACTUAL_POPUP_DOCK_POINT].has(POINTS.RIGHT)) {
				newClass += RIGHT;
			}
			else if (self[ACTUAL_POPUP_DOCK_POINT].has(POINTS.LEFT)) {
				newClass += LEFT;
			}
		};

		if (self.zoom()) {
			if (self[ACTUAL_POPUP_DOCK_POINT].has(POINTS.TOP)) {
				appendSecondary(TOP);
			}
			else if (self[ACTUAL_POPUP_DOCK_POINT].has(POINTS.BOTTOM)) {
				appendSecondary(BOTTOM);
			}
			else {
				appendSecondary();
			}

			self.addClass(newClass);

			defer(() => {
				self.addClass(POPUP_ZOOM_INITIAL_CLASS);

				defer(() => {
					self.addClass(POPUP_ZOOM_IN_CLASS);
				});
			});
		}
	}

	[setSlidability]() {
		const self = this;
		self[CAN_SLIDE_HORIZONTAL] = self[checkSlidability](POINTS.TOP, POINTS.BOTTOM);
		self[CAN_SLIDE_VERTICAL] = self[checkSlidability](POINTS.LEFT, POINTS.RIGHT);
		self[ACTUAL_POPUP_DOCK_POINT] = self.popupDockPoint();
	}

	[checkSlidability](dockOption1, dockOption2) {
		const self = this;
		const anchorDockPoint = self.anchorDockPoint();
		const popupDockPoint = self.popupDockPoint();

		return (anchorDockPoint.primary() === dockOption1 && popupDockPoint.primary() === dockOption2) ||
			(anchorDockPoint.primary() === dockOption2 && popupDockPoint.primary() === dockOption1) ||
			(anchorDockPoint.secondary() === dockOption1 && popupDockPoint.secondary() === dockOption2) ||
			(anchorDockPoint.secondary() === dockOption2 && popupDockPoint.secondary() === dockOption1);
	}

	[positionPopup]() {
		const self = this;
		const currentScrollOffset = self.element().scrollTop;
		const marginsVertical = dom.get.margins.height(self);
		const marginsHorizontal = dom.get.margins.width(self);
		let popupTop = 0;
		let popupLeft = 0;
		let popupWidth;
		let popupHeight;
		let optimizedLayout;
		let anchorLeft = 0;
		let anchorTop = 0;
		let anchorWidth = 0;
		let anchorHeight = 0;
		let anchorDockWidth = 0;
		let anchorDockHeight = 0;

		if (!self.width().isFixed && !self.width().isPercent) {
			self.css({
				width: AUTO,
				left: ZERO_PIXELS
			});
		}
		if (!self.height().isFixed && !self.height().isPercent) {
			self.css({
				height: AUTO,
				top: ZERO_PIXELS
			});
		}
		popupWidth = self.borderWidth();
		popupHeight = self.borderHeight();
		self[ACTUAL_POPUP_DOCK_POINT] = self.popupDockPoint();

		if (!self.anchor()) {
			if (self.width().isPercent && !self.maxWidth()) {
				popupWidth = Math.ceil((windowWidth - marginsHorizontal) * (self.width().value / 100));
			}
			else {
				popupWidth = Math.min(popupWidth, windowWidth - marginsHorizontal);
			}

			if (self.height().isPercent && !self.maxHeight()) {
				popupHeight = Math.ceil((windowHeight - marginsVertical) * (self.height().value() / 100));
			}
			else {
				popupHeight = Math.min(popupHeight, windowHeight - marginsVertical);
			}

			popupLeft = Math.max(0, ((windowWidth - popupWidth - marginsHorizontal) / 2));
			popupTop = Math.max(0, ((windowHeight - popupHeight - marginsVertical) / 2));
		}
		else {
			if (isElement(self.anchor())) {
				anchorLeft = dom.get.left(self.anchor(), true);
				anchorTop = dom.get.top(self.anchor(), true);

				anchorWidth = dom.get.width(self.anchor());
				anchorHeight = dom.get.height(self.anchor());
				anchorDockWidth = getDockPointOffsetWidth(self.anchorDockPoint(), self.anchor());
				anchorDockHeight = getDockPointOffsetHeight(self.anchorDockPoint(), self.anchor());
			}
			else if (self.anchor() === Popup.MOUSE) {
				anchorLeft = mouse.x;
				anchorTop = mouse.y;
			}

			popupTop = anchorTop + anchorDockHeight;
			popupTop -= getDockPointOffsetHeight(self.popupDockPoint(), self.element());

			popupLeft = anchorLeft + anchorDockWidth;
			popupLeft -= getDockPointOffsetWidth(self.popupDockPoint(), self.element());

			optimizedLayout = optimizePosition({
				offset: popupTop,
				size: popupHeight,
				margin: Math.max(marginsVertical, WINDOW_PADDING),
				anchorOffset: anchorTop,
				anchorSize: anchorHeight,
				anchorDockSize: anchorDockHeight,
				maxSize: windowHeight,
				canSlide: self[CAN_SLIDE_VERTICAL]
			});
			popupTop = optimizedLayout.offset;
			popupHeight = optimizedLayout.size;
			if (optimizedLayout.didSwitch) {
				self[ACTUAL_POPUP_DOCK_POINT].swapVertical();
			}

			optimizedLayout = optimizePosition({
				offset: popupLeft,
				size: popupWidth,
				margin: Math.max(marginsHorizontal, WINDOW_PADDING),
				anchorOffset: anchorLeft,
				anchorSize: anchorWidth,
				anchorDockSize: anchorDockWidth,
				maxSize: windowWidth,
				canSlide: self[CAN_SLIDE_HORIZONTAL]
			});
			popupLeft = optimizedLayout.offset;
			popupWidth = optimizedLayout.size;
			if (optimizedLayout.didSwitch) {
				self[ACTUAL_POPUP_DOCK_POINT].swapHorizontal();
			}
		}

		self.css(LEFT, popupLeft - 1);
		self.css(TOP, popupTop);

		if (!self.height().isFixed) {
			self.css(HEIGHT, popupHeight);
		}
		if (!self.width().isFixed) {
			self.css(WIDTH, popupWidth + 1);
		}

		self[positionArrow]();

		self.element().scrollTop = currentScrollOffset;

		if (!self[IS_INITIALIZED]) {
			self[IS_INITIALIZED] = true;
			self[setAnimation]();
		}

		if (event && self.anchor() === Popup.MOUSE && !self.canTrackMouse()) {
			self[IS_MOUSE_POSITION_SET] = true;
			select(BODY).on(MOUSE_MOVE_EVENT, null);
		}
	}

	[positionArrow]() {
		const self = this;

		if (self[ARROW]) {
			const direction = self[ACTUAL_POPUP_DOCK_POINT].primary();

			self[ARROW]
				.classes(TOP, direction === TOP)
				.classes(RIGHT, direction === RIGHT)
				.classes(BOTTOM, direction === BOTTOM)
				.classes(LEFT, direction === LEFT);
		}
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
			const self = this;

			if (showArrow) {
				self[ARROW] = new Div({
					container: self.element(),
					classes: ARROW_CLASS
				});
			}
			else {
				self[ARROW].remove();
				self[ARROW] = null;
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
						self[onMouseEnter]();
					})
					.on(MOUSE_LEAVE_EVENT, () => {
						self[onMouseLeave]();
					});
			}
			else if (newValue === Popup.MOUSE) {
				select(BODY).on(MOUSE_MOVE_EVENT, () => self[onMouseMove]());
			}
		},
		other: [undefined, Popup.MOUSE]
	}),

	anchorDockPoint: method.dockPoint({
		init: new DockPoint(POINTS.BOTTOM_CENTER),
		set: function() {
			this[setSlidability]();
		}
	}),

	popupDockPoint: method.dockPoint({
		init: new DockPoint(POINTS.TOP_CENTER),
		set: function() {
			this[setSlidability]();
		}
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
