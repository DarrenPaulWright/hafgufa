import { get, set } from 'object-agent';
import shortid from 'shortid';
import {
	applySettings,
	AUTO,
	HUNDRED_PERCENT,
	isArray,
	methodBoolean,
	methodFunction,
	methodString
} from 'type-enforcer-ui';
import controlTypes from '../controlTypes.js';
import toast from '../display/toast.js';
import Button from '../elements/Button.js';
import Grid from '../grid/Grid.js';
import { COLUMN_TYPES, FILTER_TYPES, SORT_TYPES } from '../grid/gridConstants.js';
import { ADD_ICON, DELETE_ICON } from '../icons.js';
import Dialog from '../layout/Dialog.js';
import { MARGIN_TOP } from '../utility/domConstants.js';
import locale from '../utility/locale.js';
import setDefaults from '../utility/setDefaults.js';
import DateInput from './DateInput.js';
import Description from './Description.js';
import './EditableGrid.less';
import FormControl from './FormControl.js';
import Picker from './Picker.js';
import TextInput from './TextInput.js';

const ADD_BUTTON_MARGIN_TOP = 6;

const CURRENT_VALUE = Symbol();
const GRID = Symbol();
const ADD_NEW_BUTTON = Symbol();
const ADD_NEW_DIALOG = Symbol();
const IS_EDITING = Symbol();

const deleteItem = Symbol();
const buildControlSettings = Symbol();
const getControlForDialog = Symbol();
const buildDialogContent = Symbol();
const buildDialogButtons = Symbol();
const saveDialogData = Symbol();
const showDialog = Symbol();

/**
 * Display a grid control that allows the user to add new data and edit existing data.
 *
 * @module EditableGrid
 * @extends FormControl
 * @class
 *
 * @param {object} settings - Accepts all control and FormControl settings plus:
 * @param {Array} [settings.columns[]] - Grid control columns
 * @param {Array} [settings.columns[].showDescriptionOnEdit]
 * @param {Function} [settings.onDelete] - Callback for when an item is deleted. If not provided, onChange will be triggered.
 * @param {boolean} [settings.showAddAnother=true]
 * @param {string} [settings.dialogWidth=34rem]
 */
export default class EditableGrid extends FormControl {
	constructor(settings = {}) {
		super(setDefaults({
			type: controlTypes.EDITABLE_GRID,
			width: HUNDRED_PERCENT,
			height: AUTO,
			showAddButton: true
		}, settings));

		const self = this;
		self[CURRENT_VALUE] = [];
		self[IS_EDITING] = false;

		self.addClass('editable-grid');

		self[GRID] = new Grid({
			container: self,
			columns: settings.columns,
			height: settings.height === AUTO ? AUTO : '14rem',
			onSelect(id) {
				self[showDialog](id);
			},
			hideFooter: true
		});

		applySettings(self, settings, [], ['value']);

		self.onResize(() => {
				if (!self.height().isAuto) {
					const addNewButtonHeight = self[ADD_NEW_BUTTON] ?
						self[ADD_NEW_BUTTON].outerHeight() :
						0;

					self[GRID]
						.height(self.innerHeight() - self.contentContainer.element.offsetTop - addNewButtonHeight)
						.resize();
				}
			})
			.onRemove(() => {
				if (self[ADD_NEW_DIALOG]) {
					self[ADD_NEW_DIALOG].remove();
				}
			});
	}

	[deleteItem](row) {
		const self = this;
		let isDeleted = true;
		let rowValue = self[CURRENT_VALUE].find((item) => item.id === row.id);

		self[GRID].clearSelected();
		self[GRID].removeRow({ id: row.id });

		self[CURRENT_VALUE] = self[CURRENT_VALUE].filter((item) => item.id !== row.id);
		self.triggerChange();

		if (self[ADD_NEW_DIALOG]) {
			self[ADD_NEW_DIALOG].remove();
		}

		toast.info({
			title: locale.get('itemDeleted'),
			subTitle: locale.get('clickToUndo'),
			onClick() {
				isDeleted = false;
				self[GRID].addRow(row);
				self[CURRENT_VALUE].push(rowValue);
				self.triggerChange();
			},
			onRemove() {
				rowValue = null;
				if (isDeleted) {
					if (self.onDelete()) {
						self.onDelete()({
							id: self.id(),
							control: self,
							value: row.id
						});
					}
					else {
						self.triggerChange();
					}
				}
			}
		});
	}

	[saveDialogData](row) {
		const self = this;
		let isValid = true;

		if (self[ADD_NEW_DIALOG]) {
			self[ADD_NEW_DIALOG].each((control) => {
				control.validate();

				if (isValid) {
					isValid = control.error() === '';
				}
			});

			if (isValid) {
				if (self[IS_EDITING]) {
					if (self.onRowChange()) {
						self.onRowChange()(self.mapDataOut() ? self.mapDataOut()(row) : row);
					}
					self[GRID].updateRowData(row.id, row);
				}
				else {
					if (self.onAdd()) {
						self.onAdd()(self.mapDataOut() ? self.mapDataOut()(row) : row);
					}
					self[CURRENT_VALUE].push(row);
					self[GRID].addRow(row);
				}

				self.triggerChange();
				self[ADD_NEW_DIALOG].remove();
			}
		}
	}

	[buildControlSettings](control, column, row) {
		const self = this;

		const onChange = (value) => {
			set(row, column.path, value);

			if (self[IS_EDITING]) {
				self[GRID].updateRowData(row.id, row);
				self.triggerChange();
			}
		};

		const controlSettings = {
			...column.editOptions,
			control,
			id: column.path,
			title: column.title,
			width: HUNDRED_PERCENT,
			isEnabled: (column.editOptions.isEnabled === undefined) ?
				true :
				column.editOptions.isEnabled && !self[IS_EDITING],
			value: get(row, column.path) || column.editOptions.value || '',
			onChange
		};

		if (control === Description) {
			controlSettings.isEnabled = true;
			controlSettings.isRequired = false;
		}
		else if (control === Picker) {
			controlSettings.onChange = (value) => {
				onChange(value.length === 0 ?
					'' :
					value.map((item) => item.title).join(', '));
			};
		}
		else if (control === TextInput) {
			if (controlSettings.textWidth === undefined) {
				controlSettings.textWidth = '14rem';
			}
		}
		else if (control === DateInput) {
			controlSettings.dateFormat = column.type === COLUMN_TYPES.DATE ?
				self.dateFormat() :
				(column.type === COLUMN_TYPES.TIME ?
					self.timeFormat() :
					self.dateFormat() + ' ' + self.timeFormat());
			console.log('controlSettings:', controlSettings);
		}

		return controlSettings;
	}

	[getControlForDialog](column) {
		const self = this;
		const isDateType = column.type === COLUMN_TYPES.DATE ||
			column.type === COLUMN_TYPES.TIME ||
			column.type === COLUMN_TYPES.DATE_TIME;

		if (column.canEdit !== false) {
			if (
				isDateType ||
				column.type === COLUMN_TYPES.TEXT ||
				column.type === COLUMN_TYPES.EMAIL ||
				column.type === COLUMN_TYPES.LINK ||
				column.type === COLUMN_TYPES.NUMBER
			) {
				if (column.showDescriptionOnEdit === true && self[IS_EDITING]) {
					return Description;
				}
				if (isDateType) {
					return DateInput;
				}
				if (column.filterType === FILTER_TYPES.DROPDOWN) {
					return Picker;
				}
				if (column.editOptions.control) {
					return column.editOptions.control;
				}

				return TextInput;
			}
		}
	}

	[buildDialogContent](row) {
		const self = this;
		const output = [];

		if (self[GRID].columns()) {
			self[GRID].columns()
				.forEach((column) => {
					const control = self[getControlForDialog](column);

					if (control) {
						output.push(self[buildControlSettings](control, column, row));
					}
				});
		}

		return output;
	}

	[buildDialogButtons](row) {
		const self = this;

		const buttons = [{
			label: locale.get('done'),
			classes: 'action-button',
			onClick() {
				self[saveDialogData](row);
			}
		}];

		if (!self[IS_EDITING] && self.showAddAnother()) {
			buttons.push({
				label: locale.get('addAnother'),
				classes: 'action-button',
				onClick() {
					self[saveDialogData](row);
					self[showDialog]();
				}
			});
		}

		if (self[IS_EDITING] && self.canDelete()) {
			buttons.push({
				label: locale.get('delete'),
				classes: 'form-button',
				align: 'right',
				icon: DELETE_ICON,
				onClick() {
					self[deleteItem](row);
				}
			});
		}

		return buttons;
	}

	[showDialog](id) {
		const self = this;

		self[IS_EDITING] = id !== undefined;

		const row = self[IS_EDITING] ?
			self[CURRENT_VALUE].find((item) => item.id === id) :
			{
				id: shortid.generate(),
				cells: self[GRID].columns().map(() => ({ text: '' }))
			};

		if (self[ADD_NEW_DIALOG]) {
			self[ADD_NEW_DIALOG].remove();
		}

		self[ADD_NEW_DIALOG] = new Dialog({
			title: self[IS_EDITING] ? locale.get('edit') : locale.get('addDialogTitle'),
			width: self.dialogWidth(),
			footer: { buttons: self[buildDialogButtons](row) },
			content: self[buildDialogContent](row),
			onRemove() {
				self[GRID].clearSelected();
				self[ADD_NEW_DIALOG] = null;
			}
		});

		self[ADD_NEW_DIALOG].each((control) => {
			control.isFocused(true);
			return true;
		});

		self[ADD_NEW_DIALOG].resize();
	}

	value(newValue) {
		const self = this;
		let newRowId;
		let output = self[CURRENT_VALUE];

		if (arguments.length !== 0) {
			if (self.processDataIn()) {
				newValue = self.processDataIn()(newValue);
			}

			if (isArray(newValue)) {
				self[CURRENT_VALUE] = self.mapDataIn() === undefined ?
					newValue :
					newValue.map(self.mapDataIn());

				self[GRID].rows(self[CURRENT_VALUE]);

				if (newRowId) {
					self[GRID].selectRow(newRowId);
				}
			}

			return self;
		}

		if (self.mapDataOut()) {
			output = output.map(self.mapDataOut());
		}

		if (self.processDataOut()) {
			output = self.processDataOut()(output);
		}

		return output;
	}

	disableAddButton() {
		if (this[ADD_NEW_BUTTON]) {
			this[ADD_NEW_BUTTON].isEnabled(false);
		}
	}

	enableAddButton() {
		if (this[ADD_NEW_BUTTON]) {
			this[ADD_NEW_BUTTON].isEnabled(true);
		}
	}

	columns(columns) {
		columns.forEach((column) => {
			column.editOptions = column.editOptions || {};
		});

		this[GRID].columns(columns);
	}

	add() {
		this[showDialog]();
	}
}

Object.assign(EditableGrid.prototype, {
	mapDataIn: methodFunction(),

	processDataIn: methodFunction(),

	mapDataOut: methodFunction(),

	processDataOut: methodFunction(),

	showAddButton: methodBoolean({
		init: false,
		set(showAddButton) {
			const self = this;

			self.classes('has-add-button', showAddButton);

			if (showAddButton) {
				self[ADD_NEW_BUTTON] = new Button({
					container: self.element,
					classes: 'form-button add-new-button',
					label: locale.get('addNew') || '',
					icon: ADD_ICON,
					onClick() {
						self.add();
					},
					css: set({}, MARGIN_TOP, ADD_BUTTON_MARGIN_TOP)
				});
			}
			else if (self[ADD_NEW_BUTTON]) {
				self[ADD_NEW_BUTTON].remove();
				self[ADD_NEW_BUTTON] = null;
			}

			self.resize();
		}
	}),

	showAddAnother: methodBoolean({
		init: true
	}),

	canDelete: methodBoolean({
		init: true
	}),

	dialogWidth: methodString({
		init: '34rem'
	}),

	onAdd: methodFunction(),

	onRowChange: methodFunction(),

	onDelete: methodFunction(),

	dateFormat: methodString({
		init: 'MM/dd/yyyy'
	}),

	timeFormat: methodString({
		init: 'hh:mm:ss'
	})
});

EditableGrid.COLUMN_TYPES = COLUMN_TYPES;
EditableGrid.SORT_TYPES = SORT_TYPES;
EditableGrid.FILTER_TYPES = FILTER_TYPES;
