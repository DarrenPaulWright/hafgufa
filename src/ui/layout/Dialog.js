import { defer } from 'async-agent';
import { applySettings, AUTO, DockPoint, HUNDRED_PERCENT, isFunction, method, PIXELS, Thickness } from 'type-enforcer';
import { ABSOLUTE_CLASS, BODY, MARGIN_BOTTOM, MARGIN_TOP } from '../../utility/domConstants';
import BackDrop from '../elements/BackDrop';
import Heading, { HEADING_LEVELS } from '../elements/Heading';
import { CLEAR_ICON } from '../icons';
import Toolbar from '../layout/Toolbar';
import Removable from '../mixins/Removable';
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
const CONTENT_CONTAINER = Symbol();
const FOOTER = Symbol();
const BACKDROP = Symbol();
const IS_POPUP_REMOVING = Symbol();

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
		super(settings);

		const self = this;

		self[IS_POPUP_REMOVING] = false;

		self[CONTENT_CONTAINER] = new Container({
			classes: DIALOG_CONTENT_CLASS,
			height: AUTO
		});

		if (!settings.anchor) {
			self[BACKDROP] = new BackDrop({
				onPreRemove: () => {
					self.remove();
				}
			});
		}

		self[POPUP] = new Popup(Object.assign({
			anchorDockPoint: DockPoint.POINTS.TOP_CENTER,
			popupDockPoint: DockPoint.POINTS.BOTTOM_CENTER,
			hideOnEscapeKey: true,
			fade: true
		}, settings, {
			container: BODY,
			content: self[CONTENT_CONTAINER],
			isSticky: settings.anchor === undefined,
			showArrow: settings.anchor !== undefined,
			onResize: () => {
				self[onResizePopup]();
			}
		}));

		self[POPUP].addClass(DIALOG_BASE_CLASS)
			.onRemove(() => {
				self[IS_POPUP_REMOVING] = true;
				self.remove();
			})
			.onResize(settings.onResize);

		applySettings(self, settings);

		self.onRemove(() => {
			if (self[CONTENT_CONTAINER]) {
				self[CONTENT_CONTAINER].remove();
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
		const headerHeight = self[HEADING] ? self[HEADING].borderHeight() : 0;
		const footerHeight = self[FOOTER] ? self[FOOTER].borderHeight() : 0;

		if (self[POPUP]) {
			self[CONTENT_CONTAINER].css(MARGIN_TOP, headerHeight + PIXELS)
				.css(MARGIN_BOTTOM, footerHeight + PIXELS)
				.height(self[POPUP].height().isAuto ? AUTO : self[POPUP].borderHeight() - headerHeight - footerHeight + PIXELS)
				.width(self[POPUP].width().isAuto ? AUTO : HUNDRED_PERCENT);
		}
	}
}

Object.assign(Dialog.prototype, {
	title: method.string({
		set: function(newValue) {
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
							onClick: self.remove
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

	footer: method.object({
		set: function(newValue) {
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

	contentContainer: function() {
		return this[CONTENT_CONTAINER];
	},

	content: function(content) {
		this[CONTENT_CONTAINER].content(isFunction(content) ? content(this) : content);
		this[POPUP].resize(true);
	},

	get: function(ID) {
		return this[CONTENT_CONTAINER].get(ID);
	},

	disableButton: function(button) {
		this[FOOTER].updateButton(button, {
			isEnabled: false
		});
	},

	toggleButtons: function(isEnabled) {
		this[FOOTER].toggleButtons(isEnabled);
	},

	enableButton: function(button) {
		this[FOOTER].updateButton(button, {
			isEnabled: true
		});
	},

	updateButton: function(button, properties) {
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
	padding: method.thickness({
		init: new Thickness('1rem 1.25rem'),
		set: function(padding) {
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
	isEnabled: method.boolean({
		init: true,
		set: function(newValue) {
			this[CONTENT_CONTAINER].isEnabled(!newValue);
		}
	}),

	hideButton: function(button) {
		this[FOOTER].hideButton(button);
	},

	each: function(callback) {
		this[CONTENT_CONTAINER].each(callback);
	},

	resize: function() {
		const self = this;

		if (self[POPUP]) {
			defer(() => {
				self[POPUP].resize(true);
			});
		}
	}
});
