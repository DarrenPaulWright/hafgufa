import { repeat } from 'object-agent';
import { applySettings, DockPoint, isElement, method } from 'type-enforcer';
import dom from '../../utility/dom';
import { MOUSE_ENTER_EVENT, MOUSE_LEAVE_EVENT } from '../../utility/domConstants';
import Control from '../Control';
import controlTypes from '../controlTypes';
import CheckBox from '../elements/CheckBox';
import Icon from '../elements/Icon';
import Image from '../elements/Image';
import Toolbar from '../layout/Toolbar';
import Tooltip from '../layout/Tooltip';
import './GridCell.less';
import { CELL_ALIGNMENT, COLUMN_TYPES, DISPLAY_TYPES } from './gridConstants';

const MAX_TOOLTIP_WIDTH = '20rem';
const MAX_TOOLTIP_LENGTH = 600;
const ELLIPSIS = '…';
const TOOLTIP_DELAY_SECONDS = 0.5;
const CELL_CLASS = 'grid-cell';
const NO_WRAP_CLASS = 'can-wrap';
const NO_PADDING_CLASS = 'no-padding';

const TOOLBAR = Symbol();
const TOOLTIP_CONTROL = Symbol();
const DISPLAY_TYPE = Symbol();
const CURRENT_CONTENT = Symbol();
const CHECKBOX = Symbol();
const ICON_CONTROL = Symbol();
const IMAGE_CONTROL = Symbol();

const checkOverflow = Symbol();
const addHtml = Symbol();
const addImage = Symbol();
const addIcon = Symbol();
const addCheckbox = Symbol();
const addActionButtons = Symbol();
const showTooltip = Symbol();
const removeTooltip = Symbol();

/**
 * Controls the display of one cell in the grid control
 * @module GridCell
 * @extends Control
 * @constructor
 *
 * @arg {Object}   settings - Accepts all control settings plus:
 */
export default class GridCell extends Control {
	constructor(settings = {}) {
		settings.type = settings.type || controlTypes.GRID_CELL;

		super(settings);

		const self = this;

		self.classes(CELL_CLASS);
		self.css({
			'display': 'inline-block',
			'box-sizing': 'border-box',
			'white-space': 'nowrap',
			'overflow': 'hidden',
			'text-overflow': 'ellipsis'
		});

		applySettings(self, settings);

		self
			.onResize(() => self[checkOverflow]())
			.onRemove(() => {
				self[removeTooltip]();
			});
	}

	/**
	 * Checks if the text fits within the cell or not, shows a tooltip with the rest of the text if not.
	 * @function checkOverflow
	 */
	[checkOverflow]() {
		const self = this;
		let displayText = self[CURRENT_CONTENT];

		if (self[DISPLAY_TYPE] === DISPLAY_TYPES.TEXT &&
			self.element() &&
			dom.get.scrollWidth(self) > self.borderWidth()) {

			if (displayText.length > MAX_TOOLTIP_LENGTH) {
				displayText = displayText.substring(0, MAX_TOOLTIP_LENGTH) + ELLIPSIS;
			}
		}
		else {
			displayText = null;
		}

		self.tooltip(displayText);
	}

	/**
	 * Add HTML content to the cell.
	 * @function addHtml
	 */
	[addHtml](displayText) {
		const self = this;

		if (isElement(displayText)) {
			self.element().textContent = '';
			dom.appendTo(self, displayText);
		}
		else {
			dom.content(self, displayText);
		}

		self[CURRENT_CONTENT] = displayText;
	}

	/**
	 * Add an img element to the cell.
	 * @function addImage
	 */
	[addImage](content) {
		const self = this;

		self.element().textContent = '';

		if (!self[IMAGE_CONTROL]) {
			self[IMAGE_CONTROL] = new Image({
				container: self
			});
		}
		else if (!content || !content.src) {
			self[IMAGE_CONTROL].remove();
			self[IMAGE_CONTROL] = null;
		}

		if (self[IMAGE_CONTROL]) {
			self[IMAGE_CONTROL]
				.source(content.src)
				.height(content.height)
				.width(content.width)
				.margin(content.margin);
		}

		self[CURRENT_CONTENT] = content.src;
	}

	/**
	 * Add an icon to the cell.
	 * @function addIcon
	 */
	[addIcon](icon) {
		const self = this;

		if (!self[ICON_CONTROL]) {
			if (icon) {
				self.element().textContent = '';

				self[ICON_CONTROL] = new Icon({
					container: self
				});
			}
		}
		else if (!icon) {
			self[ICON_CONTROL].remove();
			self[ICON_CONTROL] = null;
		}

		if (self[ICON_CONTROL]) {
			self[ICON_CONTROL].icon(icon);
		}

		self[CURRENT_CONTENT] = icon;
	}

	/**
	 * Add a checkbox to the cell.
	 * @function addCheckbox
	 */
	[addCheckbox]() {
		const self = this;

		if (!self[CHECKBOX]) {
			self[CHECKBOX] = new CheckBox({
				container: self,
				stopPropagation: true,
				onChange(isChecked) {
					if (self.onSelect()) {
						self.onSelect()(isChecked);
					}
				}
			});
		}
		self[CHECKBOX].isChecked(self.isSelected(), true);
	}

	/**
	 * Add action buttons to the cell.
	 * @function addActionButtons
	 */
	[addActionButtons](content) {
		const self = this;

		if (content.columnButtons) {
			if (!self[TOOLBAR]) {
				self[TOOLBAR] = new Toolbar({
					container: self.element(),
					stopPropagation: true,
					content: content.columnButtons.map((settings) => {
						return {
							...settings,
							classes: settings.classes || 'icon-button',
							onClick() {
								if (settings.onClick) {
									settings.onClick(self.rowData());
								}
								if (self.onSelect()) {
									self.onSelect()(true);
								}
							}
						};
					})
				});
			}

			repeat(content.columnButtons.length, (buttonIndex) => {
				const button = self[TOOLBAR].getButtonAtIndex(buttonIndex);
				const buttonData = content.columnButtons[buttonIndex];

				if (buttonData.disabled || !self.isEnabled() ||
					(content.buttons && content.buttons[buttonIndex] && content.buttons[buttonIndex].disabled)) {

					button.isEnabled(false);

					if (buttonData.disabled && buttonData.disabled.title) {
						button.label(buttonData.disabled.title);
					}
				}
				else {
					button.isEnabled(true);
					button.label(null);
				}
			});
		}
	}

	/**
	 * Show a tooltip
	 * @function showTooltip
	 */
	[showTooltip]() {
		const self = this;

		self[TOOLTIP_CONTROL] = new Tooltip({
			content: self.tooltip(),
			anchor: self.element(),
			anchorDockPoint: DockPoint.POINTS.TOP_CENTER,
			tooltipDockPoint: DockPoint.POINTS.BOTTOM_CENTER,
			maxWidth: MAX_TOOLTIP_WIDTH,
			delay: TOOLTIP_DELAY_SECONDS
		});
	}

	/**
	 * Remove the tooltip
	 * @function removeTooltip
	 */
	[removeTooltip]() {
		const self = this;

		if (self[TOOLTIP_CONTROL]) {
			self[TOOLTIP_CONTROL].remove();
			self[TOOLTIP_CONTROL] = null;
		}
	}
}

Object.assign(GridCell.prototype, {
	/**
	 * @method isChild
	 * @member module:GridCell
	 * @instance
	 * @arg {Object} [data]
	 * @returns {Object|this}
	 */
	rowData: method.object({
		init: {}
	}),

	/**
	 * @method dataType
	 * @member module:GridCell
	 * @instance
	 * @arg {String} [dataType]
	 * @returns {String|this}
	 */
	dataType: method.enum({
		init: COLUMN_TYPES.NONE,
		enum: COLUMN_TYPES,
		set() {
			const self = this;

			self.resetClasses();
			if (self[TOOLBAR]) {
				self[TOOLBAR].remove();
				self[TOOLBAR] = null;
			}
			if (self[CHECKBOX]) {
				self[CHECKBOX].remove();
				self[CHECKBOX] = null;
			}
			self[CURRENT_CONTENT] = null;
			self.element().textContent = '';
		}
	}),

	/**
	 * @method content
	 * @member module:GridCell
	 * @instance
	 * @arg {Object} [content]
	 * @returns {Object|this}
	 */
	content: method.object({
		set(content) {
			const self = this;
			let align = CELL_ALIGNMENT.NONE;
			self[DISPLAY_TYPE] = DISPLAY_TYPES.TEXT;

			switch (self.dataType()) {
				case COLUMN_TYPES.TEXT:
					self[addHtml](content.text || '');
					break;

				case COLUMN_TYPES.EMAIL:
					self[addHtml](dom.buildEmailLink(content.text));
					break;

				case COLUMN_TYPES.LINK:
					self[addHtml](dom.buildLink(content.text));
					break;

				case COLUMN_TYPES.NUMBER:
					self[addHtml](content.text);
					align = CELL_ALIGNMENT.RIGHT;
					break;

				case COLUMN_TYPES.DATE:
				case COLUMN_TYPES.DATE_TIME:
				case COLUMN_TYPES.TIME:
					self[addHtml](content.text);
					align = CELL_ALIGNMENT.CENTER;
					break;

				case COLUMN_TYPES.IMAGE:
					self[DISPLAY_TYPE] = DISPLAY_TYPES.IMAGE;

					if (content.src) {
						self[addImage](content);
					}
					else {
						self[addIcon](content.icon);
					}
					align = CELL_ALIGNMENT.CENTER;
					break;

				case COLUMN_TYPES.ACTIONS:
					self[DISPLAY_TYPE] = DISPLAY_TYPES.BUTTONS;

					self[addActionButtons](content);
					break;

				case COLUMN_TYPES.CHECKBOX:
					self[DISPLAY_TYPE] = DISPLAY_TYPES.CHECKBOX;

					self[addCheckbox]();
					break;
			}

			self.textAlign(align);
			self.classes(NO_PADDING_CLASS, self[DISPLAY_TYPE] === COLUMN_TYPES.IMAGE);

			self[checkOverflow]();
		}
	}),

	/**
	 * @method displayType
	 * @member module:GridCell
	 * @instance
	 * @returns {String}
	 */
	displayType() {
		return this[DISPLAY_TYPE];
	},

	onSelect: method.function(),

	/**
	 * @method isSelected
	 * @member module:GridCell
	 * @instance
	 * @arg {Boolean} isSelected
	 * @returns {Boolean|this}
	 */
	isSelected: method.boolean({
		set(isSelected) {
			const self = this;

			if (self[CHECKBOX]) {
				self[CHECKBOX].isChecked(isSelected, true);
			}
		}
	}),

	/**
	 * @method wordWrap
	 * @member module:GridCell
	 * @instance
	 * @arg {Boolean} newCanWordWrap
	 * @returns {Boolean|this}
	 */
	wordWrap: method.boolean({
		set(newValue) {
			this.classes(NO_WRAP_CLASS, newValue);
		}
	}),

	/**
	 * @method textAlign
	 * @member module:GridCell
	 * @instance
	 * @arg {Boolean} newTextAlign
	 * @returns {Boolean|this}
	 */
	textAlign: method.enum({
		init: CELL_ALIGNMENT.NONE,
		enum: CELL_ALIGNMENT,
		set(newValue) {
			const self = this;

			self.classes('align-right', newValue === CELL_ALIGNMENT.RIGHT);
			self.classes('align-center', newValue === CELL_ALIGNMENT.CENTER);
			self.classes('align-left', newValue === CELL_ALIGNMENT.LEFT);
		}
	}),

	/**
	 * @method isEnabled
	 * @member module:GridCell
	 * @instance
	 * @arg {Boolean} newIsEnabled
	 * @returns {Boolean|this}
	 */
	isEnabled: method.boolean({
		init: true
	}),

	/**
	 * @method tooltip
	 * @member module:GridCell
	 * @instance
	 * @arg {String} newTooltip
	 * @returns {String|this}
	 */
	tooltip: method.string({
		set(newValue) {
			const self = this;

			self.set(MOUSE_ENTER_EVENT, () => self[showTooltip](), (newValue !== ''));
			self.set(MOUSE_LEAVE_EVENT, () => self[removeTooltip](), (newValue !== ''));
			self[removeTooltip]();
		}
	}),

	resetClasses() {
		const self = this;

		self.classes(self.classes(), false);
		self.addClass(CELL_CLASS);
		self.wordWrap(self.wordWrap(), true);
		self.classes(NO_PADDING_CLASS, self.displayType() === COLUMN_TYPES.IMAGE);
		self.textAlign(self.textAlign(), true);
	}
});
