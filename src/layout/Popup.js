import { clear, defer, delay } from 'async-agent';
import keyCodes from 'keycodes';
import shortid from 'shortid';
import { applySettings, AUTO, DockPoint, enforce, isElement, method, ZERO_PIXELS } from 'type-enforcer-ui';
import controlTypes from '../controlTypes';
import Div from '../elements/Div';
import { CONTENT_CONTAINER } from '../mixins/ControlHeadingMixin';
import MergeContentContainerMixin from '../mixins/MergeContentContainerMixin';
import {
	ABSOLUTE,
	BLOCK,
	BLUR_EVENT,
	BODY,
	BOTTOM,
	CLICK_EVENT,
	CONTENT_CHANGE_EVENT,
	DISPLAY,
	HEIGHT,
	KEY_UP_EVENT,
	LEFT,
	MARGIN_BOTTOM,
	MARGIN_LEFT,
	MARGIN_RIGHT,
	MARGIN_TOP,
	MOUSE_ENTER_EVENT,
	MOUSE_LEAVE_EVENT,
	MOUSE_MOVE_EVENT,
	POSITION,
	RIGHT,
	TOP,
	WIDTH,
	WINDOW,
	Z_INDEX
} from '../utility/domConstants';
import * as mouse from '../utility/mouse';
import windowResize from '../utility/windowResize';
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
const ARROW = Symbol();

const parseElementStyle = (styles, styleName) => parseFloat(styles.getPropertyValue(styleName)) || 0;

const getDockPointOffsetHeight = (dockPoint, element) => {
	const styles = getComputedStyle(element);
	const height = element.offsetHeight + parseElementStyle(styles, MARGIN_TOP) + parseElementStyle(styles, MARGIN_BOTTOM);

	if (dockPoint.has(POINTS.BOTTOM)) {
		return height;
	}
	else if (dockPoint.primary() !== POINTS.TOP && dockPoint.secondary() === POINTS.CENTER) {
		return height / 2;
	}

	return 0;
};

const getDockPointOffsetWidth = (dockPoint, element) => {
	const styles = getComputedStyle(element);
	const width = element.offsetWidth + parseElementStyle(styles, MARGIN_LEFT) + parseElementStyle(styles, MARGIN_RIGHT);

	if (dockPoint.has(POINTS.RIGHT)) {
		return width;
	}
	else if (dockPoint.primary() !== POINTS.LEFT && dockPoint.secondary() === POINTS.CENTER) {
		return width / 2;
	}

	return 0;
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
const onWindowClick = Symbol();
const onWindowBlur = Symbol();
const onEscapeKey = Symbol();

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
class Popup extends MergeContentContainerMixin(Container) {
	constructor(settings = {}) {
		settings.type = settings.type || controlTypes.POPUP;
		settings.container = enforce.element(settings.container, BODY);
		settings.id = settings.id || 'popup_' + shortid.generate();
		settings.isSticky = enforce.boolean(settings.isSticky, false);
		settings.fade = settings.zoom || settings.fade;
		settings.stopPropagation = true;

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

		self[CONTENT_CONTAINER] = new Container({
			container: self.element()
		});
		self[CONTENT_CONTAINER].on(CONTENT_CHANGE_EVENT, () => {
			self.resize(true);
		});

		self[onWindowClick] = () => {
			if (!self[IS_ACTIVE]) {
				self.remove();
			}
		};
		self[onWindowBlur] = () => {
			self.remove();
		};
		self[onMouseEnter] = (event) => {
			if (event.target === self.element()) {
				self[IS_ACTIVE] = true;
			}
			if (self.hideOnMouseLeave() && !self.isSticky()) {
				self[IS_MOUSE_OVER] = true;
				clear(self[MOUSE_LEAVE_TIMER]);
			}
		};
		self[onMouseLeave] = (event) => {
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
		self[onMouseMove] = (event) => {
			self[IS_ACTIVE] = false;
			self[positionPopup](event);
		};
		self[onEscapeKey] = (event) => {
			if (event.keyCode === keyCodes('escape')) {
				self.remove();
			}
		};

		self.on(MOUSE_ENTER_EVENT, self[onMouseEnter])
			.on(MOUSE_LEAVE_EVENT, self[onMouseLeave])
			.onResize((width, height) => {
				const isMouseAnchor = self.anchor() === Popup.MOUSE;
				self[CURRENT_WIDTH] = width;
				self[CURRENT_HEIGHT] = height;

				if ((!isMouseAnchor) || (isMouseAnchor && self.canTrackMouse()) || (isMouseAnchor && !self[IS_MOUSE_POSITION_SET])) {
					self[positionPopup]();
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

		if (self.type === controlTypes.POPUP) {
			applySettings(self, settings);
		}
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

	[positionPopup](event) {
		const self = this;
		const currentScrollOffset = self.element().scrollTop;
		const marginsVertical = self.marginHeight;
		const marginsHorizontal = self.marginWidth;
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
				popupWidth = Math.ceil((windowResize.width - marginsHorizontal) * (self.width().value / 100));
			}
			else {
				popupWidth = Math.min(popupWidth, windowResize.width - marginsHorizontal);
			}

			if (self.height().isPercent && !self.maxHeight()) {
				popupHeight = Math.ceil((windowResize.height - marginsVertical) * (self.height().value() / 100));
			}
			else {
				popupHeight = Math.min(popupHeight, windowResize.height - marginsVertical);
			}

			popupLeft = Math.max(0, ((windowResize.width - popupWidth - marginsHorizontal) / 2));
			popupTop = Math.max(0, ((windowResize.height - popupHeight - marginsVertical) / 2));
		}
		else {
			if (isElement(self.anchor())) {
				const boundsRect = self.anchor().getBoundingClientRect();

				anchorLeft = boundsRect.left;
				anchorTop = boundsRect.top;

				anchorWidth = self.anchor().offsetWidth;
				anchorHeight = self.anchor().offsetHeight;
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
				maxSize: windowResize.height,
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
				maxSize: windowResize.width,
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
			BODY.removeEventListener(MOUSE_MOVE_EVENT, self[onMouseMove]);
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
}

Popup.MOUSE = 'mouse';

Object.assign(Popup.prototype, {
	showArrow: method.boolean({
		set(showArrow) {
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
		before(oldValue) {
			const self = this;

			if (isElement(oldValue)) {
				oldValue.removeEventListener(MOUSE_ENTER_EVENT, self[onMouseEnter]);
				oldValue.removeEventListener(MOUSE_LEAVE_EVENT, self[onMouseLeave]);
			}
			else if (oldValue === Popup.MOUSE) {
				BODY.removeEventListener(MOUSE_MOVE_EVENT, self[onMouseMove]);
			}
		},
		set(anchor) {
			const self = this;

			if (isElement(anchor)) {
				self.css(Z_INDEX, (anchor.style[Z_INDEX] || 0) + 1);
				anchor.addEventListener(MOUSE_ENTER_EVENT, self[onMouseEnter]);
				anchor.addEventListener(MOUSE_LEAVE_EVENT, self[onMouseLeave]);
			}
			else if (anchor === Popup.MOUSE) {
				BODY.addEventListener(MOUSE_MOVE_EVENT, self[onMouseMove]);
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
		set(isSticky) {
			const self = this;

			if (isSticky) {
				WINDOW.removeEventListener(CLICK_EVENT, self[onWindowClick]);
				WINDOW.removeEventListener(BLUR_EVENT, self[onWindowBlur]);
			}
			else {
				WINDOW.addEventListener(CLICK_EVENT, self[onWindowClick]);
				WINDOW.addEventListener(BLUR_EVENT, self[onWindowBlur]);
			}
		}
	}),

	hideOnMouseLeave: method.boolean(),

	hideOnEscapeKey: method.boolean({
		set(hideOnEscapeKey) {
			const self = this;

			if (hideOnEscapeKey) {
				WINDOW.addEventListener(KEY_UP_EVENT, self[onEscapeKey]);
			}
			else {
				WINDOW.removeEventListener(KEY_UP_EVENT, self[onEscapeKey]);
			}
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
