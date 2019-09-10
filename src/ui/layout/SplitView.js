import { set } from 'object-agent';
import { applySettings, CssSize, enforce, Enum, HUNDRED_PERCENT, method, ZERO_PIXELS } from 'type-enforcer';
import dom from '../../utility/dom';
import { ABSOLUTE, HEIGHT, LEFT, POSITION, SCROLL_HEIGHT, SCROLL_WIDTH, TOP, WIDTH } from '../../utility/domConstants';
import Control from '../Control';
import controlTypes from '../controlTypes';
import Resizer, { offsetToPixels } from '../elements/Resizer';
import IsWorkingMixin from '../mixins/IsWorkingMixin';
import { ORIENTATION as RESIZER_ORIENTATION } from '../uiConstants';
import Container from './Container';
import './SplitView.less';

const SPLIT_VIEW_CLASS = 'split-view';
const FIRST_VIEW_CLASS = 'first-view';
const SECOND_VIEW_CLASS = 'second-view';

const ORIENTATION = new Enum({
	ROWS: 'rows',
	COLUMNS: 'columns'
});

const IS_COLUMNS = Symbol();
const SIZE = Symbol();
const ALT_SIZE = Symbol();
const SIZE_ORIGIN = Symbol();
const ALT_SIZE_ORIGIN = Symbol();
const FIRST_VIEW = Symbol();
const SECOND_VIEW = Symbol();
const RESIZER = Symbol();

const resize = Symbol();
const positionViews = Symbol();

/**
 * Displays a split view where the separator between the two sides is draggable.
 *
 * @class SplitView
 * @extends Control
 * @constructor
 *
 * @arg {Object} settings
 */
export default class SplitView extends IsWorkingMixin(Control) {
	constructor(settings = {}) {
		settings.type = settings.type || controlTypes.SPLIT_VIEW;
		settings.width = enforce.cssSize(settings.width, HUNDRED_PERCENT, true);
		settings.height = enforce.cssSize(settings.height, HUNDRED_PERCENT, true);
		settings.orientation = enforce.enum(settings.orientation, ORIENTATION, ORIENTATION.COLUMNS);

		super(settings);

		const self = this;
		self[IS_COLUMNS] = true;
		self[SIZE] = WIDTH;
		self[ALT_SIZE] = HEIGHT;
		self[SIZE_ORIGIN] = LEFT;
		self[ALT_SIZE_ORIGIN] = TOP;
		self.addClass(SPLIT_VIEW_CLASS);

		self[FIRST_VIEW] = new Container({
			container: self,
			classes: FIRST_VIEW_CLASS,
			css: set({}, POSITION, ABSOLUTE),
			content: settings.firstViewContent
		});
		self[SECOND_VIEW] = new Container({
			container: self,
			classes: SECOND_VIEW_CLASS,
			css: set({}, POSITION, ABSOLUTE),
			content: settings.secondViewContent
		});

		applySettings(self, settings, ['orientation']);

		self.onResize(() => {
				self[resize]();
			})
			.onRemove(() => {
				self.isResizable(false);
			});
	}

	[resize]() {
		const self = this;
		const setStackedSize = (localSize, scrollType) => {
			self.css(localSize, Math.ceil(dom.get[scrollType](self[FIRST_VIEW]) + dom.get[scrollType](self[SECOND_VIEW])));
		};
		const setSingleSize = (localSize, scrollType) => {
			self[FIRST_VIEW][localSize]('0');
			self[SECOND_VIEW][localSize]('0');
			self.css(localSize, Math.ceil(Math.max(dom.get[scrollType](self[FIRST_VIEW]), dom.get[scrollType](self[SECOND_VIEW]))));
		};

		if (self.height().isAuto) {
			if (self[IS_COLUMNS]) {
				setSingleSize(HEIGHT, SCROLL_HEIGHT);
			}
			else {
				setStackedSize(HEIGHT, SCROLL_HEIGHT);
			}
		}
		if (self.width().isAuto) {
			if (self[IS_COLUMNS]) {
				setStackedSize(WIDTH, SCROLL_WIDTH);
			}
			else {
				setSingleSize(WIDTH, SCROLL_WIDTH);
			}
		}

		self[positionViews]();

		if (self[RESIZER] && !self[RESIZER].isDragging) {
			self[RESIZER].resize(true);
		}
	}

	/**
	 * Position all the views
	 *
	 * @function positionViews
	 */
	[positionViews]() {
		const self = this;
		const viewSize = self[SIZE] === WIDTH ? self.borderWidth() : self.borderHeight();
		const altViewSize = self[ALT_SIZE] === WIDTH ? self.borderWidth() : self.borderHeight();
		let splitOffset = offsetToPixels(self.splitOffset(), viewSize);

		self[FIRST_VIEW][self[SIZE]](splitOffset)
			[self[ALT_SIZE]](altViewSize).resize(true);

		self[SECOND_VIEW][self[SIZE]](viewSize - splitOffset)[self[ALT_SIZE]](altViewSize)
			.css(self[SIZE_ORIGIN], splitOffset)
			.css(self[ALT_SIZE_ORIGIN], ZERO_PIXELS)
			.resize(true);
	}

	get(id) {
		return this[FIRST_VIEW].get(id) || this[SECOND_VIEW].get(id);
	}

	/**
	 * Get a reference to the first view element
	 * @method firstView
	 * @member module:SplitView
	 * @instance
	 * @returns {Object}
	 */
	firstView() {
		return this[FIRST_VIEW];
	}

	/**
	 * Get a reference to the second view element
	 * @method secondView
	 * @member module:SplitView
	 * @instance
	 * @returns {Object}
	 */
	secondView() {
		return this[SECOND_VIEW];
	}
}

Object.assign(SplitView.prototype, {
	/**
	 * Set or Get the layout orientation of this control. Use SplitView.ORIENTATION
	 * @method orientation
	 * @member module:SplitView
	 * @instance
	 * @returns {String|Object}
	 */
	orientation: method.enum({
		init: ORIENTATION.COLUMNS,
		enum: ORIENTATION,
		set(orientation) {
			const self = this;

			self[IS_COLUMNS] = orientation === ORIENTATION.COLUMNS;
			self[SIZE] = self[IS_COLUMNS] ? WIDTH : HEIGHT;
			self[ALT_SIZE] = !self[IS_COLUMNS] ? WIDTH : HEIGHT;
			self[SIZE_ORIGIN] = self[IS_COLUMNS] ? LEFT : TOP;
			self[ALT_SIZE_ORIGIN] = !self[IS_COLUMNS] ? LEFT : TOP;

			if (self[RESIZER]) {
				self[RESIZER].orientation(self[IS_COLUMNS] ? RESIZER_ORIENTATION.VERTICAL : RESIZER_ORIENTATION.HORIZONTAL);
			}

			self.resize();
		}
	}),

	/**
	 * Set or Get the split offset of this control.
	 * @method splitOffset
	 * @member module:SplitView
	 * @instance
	 * @returns {String|Object}
	 */
	splitOffset: method.cssSize({
		set(splitOffset) {
			const self = this;

			if (self[RESIZER] && !self[RESIZER].isDragging) {
				self[RESIZER].splitOffset(splitOffset);
			}
			self[resize]();
		}
	}),

	/**
	 * Set or Get the isResizable property of this control. If true then a grabbable resizer allows the user to set the
	 * splitOffset.
	 * @method isResizeable
	 * @member module:SplitView
	 * @instance
	 * @returns {String|Object}
	 */
	isResizable: method.boolean({
		set(isResizable) {
			const self = this;

			if (isResizable) {
				if (!self[RESIZER]) {
					self[RESIZER] = new Resizer({
						container: self,
						orientation: self[IS_COLUMNS] ? RESIZER_ORIENTATION.VERTICAL : RESIZER_ORIENTATION.HORIZONTAL,
						splitOffset: self.splitOffset(),
						minOffset: self.minOffset(),
						maxOffset: self.maxOffset(),
						onOffsetChange(splitOffset) {
							self.splitOffset(new CssSize(splitOffset));
						},
						onOffsetChangeDone(splitOffset) {
							if (self.onOffsetChange()) {
								self.onOffsetChange()(splitOffset.toString());
							}
						}
					});
				}
			}
			else {
				if (self[RESIZER]) {
					self[RESIZER].remove();
					self[RESIZER] = null;
				}
			}

			self.resize();
		}
	}),

	/**
	 * Set or Get the minimum offset when resizing.
	 * @method minOffset
	 * @member module:SplitView
	 * @instance
	 * @arg {Number} [newMinOffset]
	 * @returns {Number|Object}
	 */
	minOffset: method.cssSize({
		set(minOffset) {
			const self = this;

			if (self[RESIZER]) {
				self[RESIZER].minOffset(minOffset.toPixels(true));
			}
		}
	}),

	/**
	 * Set or Get the maximum offset when resizing.
	 * @method maxOffset
	 * @member module:SplitView
	 * @instance
	 * @arg {Number} [newMaxOffset]
	 * @returns {Number|Object}
	 */
	maxOffset: method.cssSize({
		set(maxOffset) {
			const self = this;

			if (self[RESIZER]) {
				self[RESIZER].maxOffset(maxOffset.toPixels(true));
			}
		}
	}),

	onOffsetChange: method.function()
});

SplitView.ORIENTATION = ORIENTATION;
