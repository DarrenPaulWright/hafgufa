import { repeat } from 'object-agent';
import {
	applySettings,
	DockPoint,
	methodBoolean,
	methodEnum,
	methodFunction,
	methodObject,
	methodString
} from 'type-enforcer-ui';
import Control, { CHILD_CONTROLS } from '../Control.js';
import controlTypes from '../controlTypes.js';
import CheckBox from '../elements/CheckBox.js';
import Hyperlink from '../elements/Hyperlink.js';
import Icon from '../elements/Icon.js';
import Image from '../elements/Image.js';
import Span from '../elements/Span.js';
import Toolbar from '../layout/Toolbar.js';
import Tooltip from '../layout/Tooltip.js';
import { MOUSE_ENTER_EVENT, MOUSE_LEAVE_EVENT } from '../utility/domConstants.js';
import setDefaults from '../utility/setDefaults.js';
import './GridCell.less';
import { CELL_ALIGNMENT, COLUMN_TYPES, DISPLAY_TYPES } from './gridConstants.js';

const MAX_TOOLTIP_WIDTH = '20rem';
const MAX_TOOLTIP_LENGTH = 600;
const ELLIPSIS = '…';
const TOOLTIP_DELAY_SECONDS = 0.5;
const CELL_CLASS = 'grid-cell';
const NO_WRAP_CLASS = 'can-wrap';
const NO_PADDING_CLASS = 'no-padding';

const TOOLTIP_CONTROL = Symbol();
const DISPLAY_TYPE = Symbol();

const checkOverflow = Symbol();
const getControl = Symbol();
const addActionButtons = Symbol();
const showTooltip = Symbol();
const removeTooltip = Symbol();

/**
 * Controls the display of one cell in the grid control
 *
 * @module GridCell
 * @extends Control
 * @constructor
 *
 * @param {object}   settings - Accepts all control settings plus:
 */
export default class GridCell extends Control {
	constructor(settings = {}) {
		super(setDefaults({
			type: controlTypes.GRID_CELL
		}, settings));

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
	 *
	 * @function checkOverflow
	 */
	[checkOverflow]() {
		const self = this;
		let displayText = self.element.textContent;

		if (self[DISPLAY_TYPE] === DISPLAY_TYPES.TEXT &&
			self.element &&
			self.element.scrollWidth > self.borderWidth()) {

			if (displayText.length > MAX_TOOLTIP_LENGTH) {
				displayText = displayText.substring(0, MAX_TOOLTIP_LENGTH) + ELLIPSIS;
			}
		}
		else {
			displayText = null;
		}

		self.tooltip(displayText);
	}

	[getControl](id, control, settings = {}) {
		const self = this;

		if (!self[CHILD_CONTROLS].get(id)) {
			self[CHILD_CONTROLS].remove();
			new control({
				container: self,
				id,
				...settings
			});
		}

		return self[CHILD_CONTROLS].get(id);
	}

	/**
	 * Add action buttons to the cell.
	 *
	 * @param content
	 */
	[addActionButtons](content) {
		const self = this;

		self[getControl]('gridToolbar', Toolbar, {
			stopPropagation: true,
			content: content.columnButtons.map((settings) => {
				return {
					classes: 'icon-button',
					...settings,
					onClick(event) {
						if (settings.onClick) {
							settings.onClick(self.rowData());
						}
						if (self.onSelect()) {
							self.onSelect()(true, event);
						}
					}
				};
			})
		});

		repeat(content.columnButtons.length, (buttonIndex) => {
			const button = self[CHILD_CONTROLS].get('gridToolbar').getButtonAtIndex(buttonIndex);
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

	/**
	 * Show a tooltip
	 *
	 * @function showTooltip
	 */
	[showTooltip]() {
		const self = this;

		self[TOOLTIP_CONTROL] = new Tooltip({
			content: self.tooltip(),
			anchor: self,
			anchorDockPoint: DockPoint.POINTS.TOP_CENTER,
			tooltipDockPoint: DockPoint.POINTS.BOTTOM_CENTER,
			maxWidth: MAX_TOOLTIP_WIDTH,
			delay: TOOLTIP_DELAY_SECONDS
		});
	}

	/**
	 * Remove the tooltip
	 *
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
	 * @param {object} [data]
	 * @returns {object|this}
	 */
	rowData: methodObject({
		init: {}
	}),

	/**
	 * @method dataType
	 * @member module:GridCell
	 * @instance
	 * @param {string} [dataType]
	 * @returns {string|this}
	 */
	dataType: methodEnum({
		init: COLUMN_TYPES.NONE,
		enum: COLUMN_TYPES,
		set() {
			const self = this;

			self.resetClasses();
			self[CHILD_CONTROLS].remove();
		}
	}),

	/**
	 * @method content
	 * @member module:GridCell
	 * @instance
	 * @param {object} [content]
	 * @returns {object|this}
	 */
	content: methodObject({
		set(content) {
			const self = this;
			let align = CELL_ALIGNMENT.NONE;
			self[DISPLAY_TYPE] = DISPLAY_TYPES.TEXT;

			switch (self.dataType()) {
				case COLUMN_TYPES.TEXT:
					self[getControl]('gridSpan', Span)
						.text(content.text || '');
					break;

				case COLUMN_TYPES.EMAIL:
				case COLUMN_TYPES.LINK:
					self[getControl]('gridHyperlink', Hyperlink)
						.url(content.text);
					break;

				case COLUMN_TYPES.NUMBER:
					self[getControl]('gridSpan', Span)
						.text(content.text || '');
					align = CELL_ALIGNMENT.RIGHT;
					break;

				case COLUMN_TYPES.DATE:
				case COLUMN_TYPES.DATE_TIME:
				case COLUMN_TYPES.TIME:
					self[getControl]('gridSpan', Span)
						.text(content.text || '');
					align = CELL_ALIGNMENT.CENTER;
					break;

				case COLUMN_TYPES.IMAGE:
				case COLUMN_TYPES.ICON:
					self[DISPLAY_TYPE] = DISPLAY_TYPES.IMAGE;

					if (content.src) {
						self[getControl]('gridImage', Image)
							.isDisplayed(Boolean(content && content.src))
							.source(content.src)
							.height(content.height)
							.width(content.width)
							.margin(content.margin);
					}
					else {
						self[getControl]('gridIcon', Icon)
							.icon(content.icon);
					}
					align = CELL_ALIGNMENT.CENTER;
					break;

				case COLUMN_TYPES.ACTIONS:
					self[DISPLAY_TYPE] = DISPLAY_TYPES.BUTTONS;
					content.columnButtons = content.columnButtons || [];

					self[addActionButtons](content);
					break;

				case COLUMN_TYPES.CHECKBOX:
					self[DISPLAY_TYPE] = DISPLAY_TYPES.CHECKBOX;

					self[getControl]('gridCheckbox', CheckBox, {
						stopPropagation: true,
						onChange(isChecked, event) {
							if (self.onSelect()) {
								self.onSelect()(isChecked, event);
							}
						}
					}).isChecked(self.isSelected(), true);
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
	 * @returns {string}
	 */
	displayType() {
		return this[DISPLAY_TYPE];
	},

	onSelect: methodFunction(),

	/**
	 * @method isSelected
	 * @member module:GridCell
	 * @instance
	 * @param {boolean} isSelected
	 * @returns {boolean|this}
	 */
	isSelected: methodBoolean({
		set(isSelected) {
			const self = this;

			if (self[CHILD_CONTROLS].get('gridCheckbox')) {
				self[CHILD_CONTROLS].get('gridCheckbox').isChecked(isSelected, true);
			}
		}
	}),

	/**
	 * @method wordWrap
	 * @member module:GridCell
	 * @instance
	 * @param {boolean} newCanWordWrap
	 * @returns {boolean|this}
	 */
	wordWrap: methodBoolean({
		set(newValue) {
			this.classes(NO_WRAP_CLASS, newValue);
		}
	}),

	/**
	 * @method textAlign
	 * @member module:GridCell
	 * @instance
	 * @param {boolean} newTextAlign
	 * @returns {boolean|this}
	 */
	textAlign: methodEnum({
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
	 * @param {boolean} newIsEnabled
	 * @returns {boolean|this}
	 */
	isEnabled: methodBoolean({
		init: true
	}),

	/**
	 * @method tooltip
	 * @member module:GridCell
	 * @instance
	 * @param {string} newTooltip
	 * @returns {string|this}
	 */
	tooltip: methodString({
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
