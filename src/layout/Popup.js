import { clear, defer, delay } from 'async-agent';
import keyCodes from 'keycodes';
import shortid from 'shortid';
import {
	applySettings,
	AUTO,
	DockPoint,
	isElement,
	methodAny,
	methodBoolean,
	methodDockPoint,
	methodFunction,
	windowResize,
	ZERO_PIXELS
} from 'type-enforcer-ui';
import controlTypes from '../controlTypes';
import Div from '../elements/Div';
import { CONTENT_CONTAINER } from '../mixins/ControlHeadingMixin';
import MergeContentContainerMixin from '../mixins/MergeContentContainerMixin';
import defaults from '../utility/defaults.js';
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
const ACTUAL_POPUP_DOCK_POINT = Symbol();
const CAN_SLIDE_HORIZONTAL = Symbol();
const CAN_SLIDE_VERTICAL = Symbol();
const IS_MOUSE_OVER = Symbol();
const MOUSE_LEAVE_TIMER = Symbol();
const ARROW = Symbol();

const onMouseEnter = Symbol();
const onMouseLeave = Symbol();
const onMouseMove = Symbol();
const onWindowClick = Symbol();
const onWindowBlur = Symbol();
const onEscapeKey = Symbol();

const initEvents = Symbol();
const parseElementStyle = Symbol();
const getDockPointOffsetHeight = Symbol();
const getDockPointOffsetWidth = Symbol();
const optimizePosition = Symbol();
const setAnimation = Symbol();
const setSlidability = Symbol();
const checkSlidability = Symbol();
const positionPopup = Symbol();
const placePopup = Symbol();
const positionToBody = Symbol();
const positionToAnchor = Symbol();
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
class Popup extends MergeContentContainerMixin(Container) {
	constructor(settings = {}) {
		defaults(settings, {
			type: controlTypes.POPUP,
			container: BODY,
			id: 'popup_' + shortid.generate(),
			isSticky: false,
			fade: settings.zoom || settings.fade,
			stopPropagation: true
		});

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
			container: self.element
		})
			.on(CONTENT_CHANGE_EVENT, () => {
				self.resize(true);
			});

		self[initEvents]();

		self.onResize(() => {
				if (self.onPreResize()) {
					self.onPreResize()();
				}

				const isMouseAnchor = self.anchor() === Popup.MOUSE;

				if (!isMouseAnchor || (isMouseAnchor && self.canTrackMouse())) {
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
			applySettings(self, settings, ['anchorDockPoint', 'popupDockPoint', 'anchor']);
		}
	}

	static [parseElementStyle](styles, styleName) {
		return parseFloat(styles.getPropertyValue(styleName)) || 0;
	}

	static [getDockPointOffsetHeight](dockPoint, element) {
		const styles = getComputedStyle(element);
		const height = element.offsetHeight + Popup[parseElementStyle](styles, MARGIN_TOP) + Popup[parseElementStyle](
			styles,
			MARGIN_BOTTOM
		);

		if (dockPoint.has(POINTS.BOTTOM)) {
			return height;
		}
		else if (dockPoint.primary() !== POINTS.TOP && dockPoint.secondary() === POINTS.CENTER) {
			return height / 2;
		}

		return 0;
	}

	static [getDockPointOffsetWidth](dockPoint, element) {
		const styles = getComputedStyle(element);
		const width = element.offsetWidth + Popup[parseElementStyle](styles, MARGIN_LEFT) + Popup[parseElementStyle](
			styles,
			MARGIN_RIGHT
		);

		if (dockPoint.has(POINTS.RIGHT)) {
			return width;
		}
		else if (dockPoint.primary() !== POINTS.LEFT && dockPoint.secondary() === POINTS.CENTER) {
			return width / 2;
		}

		return 0;
	}

	static [optimizePosition](pos) {
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
	}

	[initEvents]() {
		const self = this;

		self[onWindowClick] = () => {
			if (!self[IS_ACTIVE]) {
				self.remove();
			}
		};

		self[onWindowBlur] = () => {
			self.remove();
		};

		self[onMouseEnter] = (event) => {
			if (event.target === self.element) {
				self[IS_ACTIVE] = true;
			}
			if (self.hideOnMouseLeave() && !self.isSticky()) {
				self[IS_MOUSE_OVER] = true;
				clear(self[MOUSE_LEAVE_TIMER]);
			}
		};

		self[onMouseLeave] = (event) => {
			if (event.target === self.element) {
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

		self[onMouseMove] = () => {
			self[IS_ACTIVE] = false;
			self[positionPopup]();
		};

		self[onEscapeKey] = (event) => {
			if (event.keyCode === keyCodes('escape')) {
				self.remove();
			}
		};

		self.on(MOUSE_ENTER_EVENT, self[onMouseEnter])
			.on(MOUSE_LEAVE_EVENT, self[onMouseLeave]);
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
		const currentScrollOffset = self.element.scrollTop;

		self[placePopup]({
			top: 0,
			left: 0,
			width: AUTO,
			height: AUTO
		}, true);
		self[ACTUAL_POPUP_DOCK_POINT] = self.popupDockPoint();

		const bounds = {
			top: 0,
			left: 0,
			width: self.borderWidth(),
			height: self.borderHeight(),
			marginsVertical: self.marginHeight,
			marginsHorizontal: self.marginWidth
		};

		self[self.anchor() === undefined ? positionToBody : positionToAnchor](bounds);

		self[placePopup](bounds);
		self[positionArrow]();

		self.element.scrollTop = currentScrollOffset;

		if (!self[IS_INITIALIZED]) {
			self[IS_INITIALIZED] = true;
			self[setAnimation]();
		}
	}

	[placePopup](bounds, isPre) {
		const self = this;

		self.css(LEFT, bounds.left - 1)
			.css(TOP, bounds.top);

		if (!self.width().isFixed && (!isPre || !self.width().isPercent)) {
			self.css(WIDTH, bounds.width);
		}

		if (!self.height().isFixed && (!isPre || !self.height().isPercent)) {
			self.css(HEIGHT, bounds.height);
		}
	}

	[positionToBody](bounds) {
		const self = this;

		if (self.width().isPercent && !self.maxWidth()) {
			bounds.width = Math.ceil((windowResize.width - bounds.marginsHorizontal) * (self.width().value / 100));
		}
		else {
			bounds.width = Math.min(
				bounds.width,
				windowResize.width - bounds.marginsHorizontal
			);
		}

		if (self.height().isPercent && !self.maxHeight()) {
			bounds.height = Math.ceil((windowResize.height - bounds.marginsVertical) * (self.height().value() / 100));
		}
		else {
			bounds.height = Math.min(
				bounds.height,
				windowResize.height - bounds.marginsVertical
			);
		}

		bounds.left = Math.max(
			0,
			(windowResize.width - bounds.width - bounds.marginsHorizontal) / 2
		);
		bounds.top = Math.max(
			0,
			(windowResize.height - bounds.height - bounds.marginsVertical) / 2
		);
	}

	[positionToAnchor](bounds) {
		const self = this;
		let anchor = self.anchor();
		let anchorLeft = 0;
		let anchorTop = 0;
		let anchorWidth = 0;
		let anchorHeight = 0;
		let anchorDockWidth = 0;
		let anchorDockHeight = 0;
		let optimizedLayout;

		anchor = anchor.element || anchor;

		if (isElement(anchor)) {
			const boundsRect = anchor.getBoundingClientRect();

			anchorLeft = boundsRect.left;
			anchorTop = boundsRect.top;
			anchorWidth = anchor.offsetWidth;
			anchorHeight = anchor.offsetHeight;
			anchorDockWidth = Popup[getDockPointOffsetWidth](self.anchorDockPoint(), anchor);
			anchorDockHeight = Popup[getDockPointOffsetHeight](self.anchorDockPoint(), anchor);
		}
		else if (anchor === Popup.MOUSE) {
			anchorLeft = mouse.x;
			anchorTop = mouse.y;

			if (!self.canTrackMouse()) {
				BODY.removeEventListener(MOUSE_MOVE_EVENT, self[onMouseMove]);
			}
		}

		bounds.top = anchorTop + anchorDockHeight;
		bounds.top -= Popup[getDockPointOffsetHeight](self.popupDockPoint(), self.element);

		bounds.left = anchorLeft + anchorDockWidth;
		bounds.left -= Popup[getDockPointOffsetWidth](self.popupDockPoint(), self.element);

		optimizedLayout = Popup[optimizePosition]({
			offset: bounds.top,
			size: bounds.height,
			margin: Math.max(bounds.marginsVertical, WINDOW_PADDING),
			anchorOffset: anchorTop,
			anchorSize: anchorHeight,
			anchorDockSize: anchorDockHeight,
			maxSize: windowResize.height,
			canSlide: self[CAN_SLIDE_VERTICAL]
		});
		bounds.top = optimizedLayout.offset;
		bounds.height = optimizedLayout.size;
		if (optimizedLayout.didSwitch) {
			self[ACTUAL_POPUP_DOCK_POINT].swapVertical();
		}

		optimizedLayout = Popup[optimizePosition]({
			offset: bounds.left,
			size: bounds.width,
			margin: Math.max(bounds.marginsHorizontal, WINDOW_PADDING),
			anchorOffset: anchorLeft,
			anchorSize: anchorWidth,
			anchorDockSize: anchorDockWidth,
			maxSize: windowResize.width,
			canSlide: self[CAN_SLIDE_HORIZONTAL]
		});
		bounds.left = optimizedLayout.offset;
		bounds.width = optimizedLayout.size;
		if (optimizedLayout.didSwitch) {
			self[ACTUAL_POPUP_DOCK_POINT].swapHorizontal();
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
	showArrow: methodBoolean({
		set(showArrow) {
			const self = this;

			if (showArrow) {
				self[ARROW] = new Div({
					container: self.element,
					classes: ARROW_CLASS
				});
			}
			else {
				self[ARROW].remove();
				self[ARROW] = null;
			}
		}
	}),

	anchor: methodAny({
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
		}
	}),

	anchorDockPoint: methodDockPoint({
		init: new DockPoint(POINTS.BOTTOM_CENTER),
		set: setSlidability
	}),

	popupDockPoint: methodDockPoint({
		init: new DockPoint(POINTS.TOP_CENTER),
		set: setSlidability
	}),

	isSticky: methodBoolean({
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

	hideOnMouseLeave: methodBoolean(),

	hideOnEscapeKey: methodBoolean({
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
	canTrackMouse: methodBoolean({
		init: true
	}),

	zoom: methodBoolean(),

	onPreResize: methodFunction()
});

export default Popup;
