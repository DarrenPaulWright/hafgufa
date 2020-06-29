import { defer } from 'async-agent';
import {
	applySettings,
	AUTO,
	DockPoint,
	HUNDRED_PERCENT,
	isFunction,
	methodBoolean,
	methodObject,
	methodString,
	methodThickness,
	PIXELS,
	Thickness
} from 'type-enforcer-ui';
import BackDrop from '../elements/BackDrop';
import Heading, { HEADING_LEVELS } from '../elements/Heading';
import { CLEAR_ICON } from '../icons';
import Toolbar from '../layout/Toolbar';
import Removable from '../mixins/Removable';
import { ABSOLUTE_CLASS, BODY, MARGIN_BOTTOM, MARGIN_TOP } from '../utility/domConstants';
import Container from './Container';
import './Dialog.less';
import Popup from './Popup';

const DIALOG_BASE_CLASS = 'dialog';
const DIALOG_CONTENT_CLASS = 'dialog-content';
const DIALOG_HEADER_CLASS = ABSOLUTE_CLASS + 'popup-header dialog-header';
const DIALOG_FOOTER_CLASS = ABSOLUTE_CLASS + 'popup-footer dialog-footer';

const onResizePopup = Symbol();

const POPUP = Symbol();
const HEADING = Symbol();
const OUTER_CONTENT_CONTAINER = Symbol();
const CONTENT_CONTAINER = Symbol();
const FOOTER = Symbol();
const BACKDROP = Symbol();
const IS_POPUP_REMOVING = Symbol();
const IS_AUTO = Symbol();

/**
 * Display a dialog with a title, content, and a footer.
 *
 * @class Dialog
 * @constructor
 *
 * @arg {Object} settings
 */
export default class Dialog extends Removable {
	constructor(settings = {}) {
		settings.height = settings.height || AUTO;
		settings.width = settings.width || '30rem';

		super(settings);

		const self = this;

		self[IS_POPUP_REMOVING] = false;

		self[OUTER_CONTENT_CONTAINER] = new Container({
			height: HUNDRED_PERCENT
		});

		self[CONTENT_CONTAINER] = new Container({
			container: self[OUTER_CONTENT_CONTAINER],
			classes: DIALOG_CONTENT_CLASS,
			height: settings.height === AUTO ? AUTO : HUNDRED_PERCENT
		});

		if (!settings.anchor) {
			self[BACKDROP] = new BackDrop({
				onPreRemove() {
					self.remove();
				}
			});
		}

		self[IS_AUTO] = settings.height === AUTO;

		self[POPUP] = new Popup({
			anchorDockPoint: DockPoint.POINTS.TOP_CENTER,
			popupDockPoint: DockPoint.POINTS.BOTTOM_CENTER,
			hideOnEscapeKey: true,
			fade: true,
			...settings,
			height: settings.height === AUTO ? HUNDRED_PERCENT : settings.height,
			container: BODY,
			content: self[OUTER_CONTENT_CONTAINER],
			isSticky: settings.anchor === undefined,
			showArrow: settings.anchor !== undefined,
			onResize() {
				self[onResizePopup]();
			}
		});

		self[POPUP].addClass(DIALOG_BASE_CLASS)
			.onRemove(() => {
				self[IS_POPUP_REMOVING] = true;
				self.remove();
			})
			.onResize(settings.onResize);

		applySettings(self, settings, ['title, footer'], ['content']);

		self.onRemove(() => {
			if (self[OUTER_CONTENT_CONTAINER]) {
				self[OUTER_CONTENT_CONTAINER].remove();
			}
			if (self[BACKDROP]) {
				self[BACKDROP].remove();
			}
			if (self[POPUP] && !self[IS_POPUP_REMOVING]) {
				self[POPUP].remove();
			}
			if (self[FOOTER]) {
				self[FOOTER].remove();
			}
			self.title('');
		});
	}

	[onResizePopup]() {
		const self = this;

		if (self[POPUP]) {
			const headerHeight = self[HEADING] ? self[HEADING].borderHeight() : 0;
			const footerHeight = self[FOOTER] ? self[FOOTER].borderHeight() : 0;

			self[OUTER_CONTENT_CONTAINER]
				.css(MARGIN_TOP, headerHeight + PIXELS)
				.css(MARGIN_BOTTOM, footerHeight + PIXELS)
				.height(self[POPUP].height().isAuto ? AUTO : self[POPUP].borderHeight() - headerHeight - footerHeight + PIXELS)
				.width(self[POPUP].width().isAuto ? AUTO : HUNDRED_PERCENT);

			if (self[IS_AUTO]) {
				self[POPUP].maxHeight(self[CONTENT_CONTAINER].outerHeight() + headerHeight + footerHeight);
			}
		}
	}

	get contentContainer() {
		return this[CONTENT_CONTAINER];
	}
}

Object.assign(Dialog.prototype, {
	title: methodString({
		set(newValue) {
			const self = this;

			if (newValue) {
				if (!self[HEADING]) {
					self[HEADING] = new Heading({
						container: self[POPUP],
						classes: DIALOG_HEADER_CLASS,
						level: HEADING_LEVELS.TWO
					});

					if (!self[POPUP].anchor()) {
						self[HEADING].buttons([{
							icon: CLEAR_ICON,
							onClick() {
								self.remove();
							}
						}]);
					}
				}
				self[HEADING].title(newValue);
			}
			else if (self[HEADING]) {
				self[HEADING].remove();
				self[HEADING] = null;
			}
		}
	}),

	footer: methodObject({
		set(newValue) {
			const self = this;

			if (newValue) {
				if (!self[FOOTER]) {
					self[FOOTER] = new Toolbar({
						container: self[POPUP],
						classes: DIALOG_FOOTER_CLASS
					});
				}
				self[FOOTER].content(newValue.buttons);
			}
			else if (self[FOOTER]) {
				self[FOOTER].remove();
				self[FOOTER] = null;
			}
		},
		other: undefined
	}),

	content(content) {
		this[CONTENT_CONTAINER].content(isFunction(content) ? content(this) : content);
		this[POPUP].resize(true);
	},

	get(id) {
		return this[CONTENT_CONTAINER].get(id);
	},

	disableButton(button) {
		this[FOOTER].updateButton(button, {
			isEnabled: false
		});
	},

	toggleButtons(isEnabled) {
		this[FOOTER].toggleButtons(isEnabled);
	},

	enableButton(button) {
		this[FOOTER].updateButton(button, {
			isEnabled: true
		});
	},

	updateButton(button, properties) {
		this[FOOTER].updateButton(button, properties);
	},

	/**
	 * Get or set the padding of the content container.
	 *
	 * @method padding
	 * @member module:Dialog
	 * @instance
	 *
	 * @arg {String} [newPadding]
	 *
	 * @returns {String|this}
	 */
	padding: methodThickness({
		init: new Thickness('1rem 1.25rem'),
		set(padding) {
			this[CONTENT_CONTAINER].padding(padding);
		}
	}),

	/**
	 * Changes the view of the control to look disabled and prevents mouse and keyboard interaction
	 * @method isEnabled
	 * @member module:Dialog
	 * @instance
	 * @arg   {Boolean} [input=true] - If a value is provided then set, otherwise get the current state.
	 * @returns {Boolean|this} - Only returned if no value is provided
	 */
	isEnabled: methodBoolean({
		init: true,
		set(newValue) {
			this[CONTENT_CONTAINER].isEnabled(!newValue);
		}
	}),

	hideButton(button) {
		this[FOOTER].hideButton(button);
	},

	each(callback) {
		this[CONTENT_CONTAINER].each(callback);
	},

	resize() {
		const self = this;

		if (self[POPUP]) {
			defer(() => {
				self[POPUP].resize(true);
			});
		}
	}
});
