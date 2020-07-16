import { clone, erase, forOwn, set } from 'object-agent';
import shortid from 'shortid';
import {
	applySettings,
	AUTO,
	enforceBoolean,
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
import assign from '../utility/assign.js';
import { MARGIN_TOP } from '../utility/domConstants.js';
import locale from '../utility/locale.js';
import setDefaults from '../utility/setDefaults.js';
import Conversion from './Conversion.js';
import Description from './Description.js';
import './EditableGrid.less';
import FormControl from './FormControl.js';
import Picker from './Picker.js';
import TextInput from './TextInput.js';

const NEW_ROW_ID = 'new';
const ADD_BUTTON_MARGIN_TOP = 6;

const CURRENT_VALUE = Symbol();
const GRID = Symbol();
const ADD_NEW_BUTTON = Symbol();
const ADD_NEW_DIALOG = Symbol();
const IS_WAITING_FOR_ROW_ID = Symbol();
const IS_DATA_DIRTY = Symbol();
const IS_EDITING = Symbol();
const CURRENT_PREFILL_VALUES = Symbol();

const deleteItem = Symbol();
const getCurrentValueWithNewRowId = Symbol();
const getUniqueNewRowId = Symbol();
const updateDialogControls = Symbol();
const updateGrid = Symbol();
const onEditControlChange = Symbol();
const filterOptions = Symbol();
const prefill = Symbol();
const addControl = Symbol();
const getControlType = Symbol();
const buildDialogContent = Symbol();
const buildDialogButtons = Symbol();
const showDialog = Symbol();

/**
 * Display a grid control that allows the user to add new data and edit existing data.
 *
 * @module EditableGrid
 * @extends FormControl
 * @constructor
 *
 * @param {object} settings - Accepts all control and FormControl settings plus:
 * @param {Array} [settings.columns[]] - Grid control columns
 * @param {Array} [settings.columns[].showDescriptionOnEdit]
 * @param {Function} [settings.onDelete] - Callback for when an item is deleted. If not provided, onChange will be triggered.
 * @param {boolean} [settings.autoGenerateIds=true]
 * @param {boolean} [settings.showAddAnother=true]
 * @param {string} [settings.dialogWidth=34rem]
 */
export default class EditableGrid extends FormControl {
	constructor(settings = {}) {
		super(setDefaults({
			type: controlTypes.EDITABLE_GRID,
			width: HUNDRED_PERCENT,
			height: AUTO
		}, settings));

		const self = this;
		self[CURRENT_VALUE] = [];
		self[IS_WAITING_FOR_ROW_ID] = false;
		self[IS_DATA_DIRTY] = false;
		self[IS_EDITING] = false;
		self[CURRENT_PREFILL_VALUES] = {};

		self.addClass('editable-grid');

		self[GRID] = new Grid({
			container: self,
			columns: settings.columns,
			height: settings.height === AUTO ? AUTO : '14rem',
			onSelect: (id) => self[showDialog](id),
			hideFooter: true
		});

		self[ADD_NEW_BUTTON] = new Button({
			container: self.element,
			classes: 'form-button add-new-button',
			label: locale.get('addNew') || '',
			icon: ADD_ICON,
			onClick() {
				self[showDialog]();
			},
			css: set({}, MARGIN_TOP, ADD_BUTTON_MARGIN_TOP)
		});

		applySettings(self, settings, [], ['value']);

		self.onResize(() => {
				if (!self.height().isAuto) {
					self[GRID]
						.height(self.innerHeight() - self.contentContainer.element.offsetTop - self[ADD_NEW_BUTTON].outerHeight())
						.resize();
				}
			})
			.onRemove(() => {
				if (self[ADD_NEW_DIALOG]) {
					self[ADD_NEW_DIALOG].remove();
				}
			});
	}

	[deleteItem](rowData) {
		const self = this;
		let isDeleted = true;
		let rowValue = self[CURRENT_VALUE].find((item) => item.id === rowData.id);

		self[GRID].clearSelected();
		self[GRID].removeRow({
			id: rowData.id
		});
		self[CURRENT_VALUE] = self[CURRENT_VALUE].filter((value) => value.id !== rowData.id);
		self.triggerChange();

		if (self[ADD_NEW_DIALOG]) {
			self[ADD_NEW_DIALOG].remove();
		}

		toast.info({
			title: locale.get('itemDeleted'),
			subTitle: locale.get('clickToUndo'),
			onClick() {
				isDeleted = false;
				self[GRID].addRow(rowData);
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
							value: rowData.id
						});
					}
					else {
						self.triggerChange();
					}
				}
			}
		});
	}

	[getCurrentValueWithNewRowId]() {
		const self = this;
		let newGridRow;

		self[CURRENT_VALUE].forEach((gridRow) => {
			if (gridRow.id === NEW_ROW_ID) {
				newGridRow = gridRow;
				return false;
			}
			return true;
		});

		return newGridRow;
	}

	[getUniqueNewRowId](newValue) {
		const self = this;
		const currentRowIds = self[CURRENT_VALUE].map((item) => item.id);
		let newRowId;

		newValue.some((value) => {
			if (!currentRowIds.includes(value.id)) {
				newRowId = value.id;
				return true;
			}
		});

		return newRowId;
	}

	[updateDialogControls](id, newValueRow) {
		const self = this;

		if (self[ADD_NEW_DIALOG]) {
			self[ADD_NEW_DIALOG].each((control, index) => {
				control.id = id;
				control.value(newValueRow.values[index].text);
			});
		}
	}

	[updateGrid]() {
		const self = this;

		self[GRID].rows(self[CURRENT_VALUE] = self[CURRENT_VALUE].map((row) => {
			return {
				cells: row.values ? row.values.map((cell) => {
					return {
						...cell,
						id: row.id
					};
				}) : [],
				id: row.id,
				originalData: row,
				edited: row.edited || self[CURRENT_VALUE].edited,
				values: row.values
			};
		}));
	}

	[onEditControlChange](cellData, id, columnIndex) {
		const self = this;

		const setRowIdAndUpdateCellData = () => {
			let rowFound = false;

			cellData.id = id;

			self[CURRENT_VALUE].forEach((row) => {
				if (row.id === cellData.id) {
					rowFound = true;
					row.values[columnIndex] = cellData;
					row.edited = true;
					return false;
				}
			});

			if (!rowFound) {
				self[CURRENT_VALUE].push({
					values: initializeNewCells(),
					id,
					edited: true
				});
			}

			self[updateGrid]();
		};

		const initializeNewCells = () => {
			const newRowCells = [];

			for (let stubColumnIndex = 0; stubColumnIndex < self[GRID].columns().length; stubColumnIndex++) {
				if (stubColumnIndex === columnIndex) {
					newRowCells[stubColumnIndex] = cellData;
				}
				else {
					newRowCells[stubColumnIndex] = {
						id,
						text: ''
					};
				}
			}

			return newRowCells;
		};

		if (self[IS_WAITING_FOR_ROW_ID]) {
			self[IS_DATA_DIRTY] = true;
			setRowIdAndUpdateCellData();
		}
		else {
			if (id === NEW_ROW_ID) {
				self[IS_WAITING_FOR_ROW_ID] = true;
				cellData.id = NEW_ROW_ID;
				self[CURRENT_VALUE].push({
					values: initializeNewCells(),
					id: NEW_ROW_ID,
					edited: true
				});
				self[updateGrid]();
				self[GRID].selectRow(NEW_ROW_ID);
			}
			else {
				setRowIdAndUpdateCellData();
			}
			self.triggerChange();
		}
	}

	[filterOptions](values, column) {
		if (!column.editOptions.filterOptionsByContent) {
			return values;
		}

		const newChildren = [];
		let output;

		values.children.forEach((child) => {
			newChildren.push(child);
		});

		output = clone(values);
		output.children = newChildren;

		return output;
	}

	[prefill](editOptions, changedControl, newValue) {
		const self = this;

		const hasOverRideableValue = (control, prefillId) => {
			const controlValue = control.value();

			if (isArray(controlValue)) {
				return (controlValue.length === 0 || (controlValue.length === 1 && controlValue[0].id === self[CURRENT_PREFILL_VALUES][prefillId]));
			}

			return (!controlValue || controlValue === self[CURRENT_PREFILL_VALUES][prefillId]);
		};

		const prefillControl = (control, id, value) => {
			control.value(value);
			control.triggerChange(true);
			self[CURRENT_PREFILL_VALUES][id] = value;
		};

		if (editOptions) {
			forOwn(editOptions.prefill, (prefillValue, prefillId) => {
				const control = self[ADD_NEW_DIALOG].get(prefillId);

				if (control && hasOverRideableValue(control, prefillId)) {
					if (prefillValue === null) {
						prefillControl(control, prefillId, newValue);
					}
					else if (prefillValue.store && editOptions.dataSource) {
						editOptions.dataSource.store.get(changedControl.id())
							.then((localItem) => prefillValue.store.getTitle(localItem[prefillValue.key]))
							.then((title) => {
								prefillControl(control, prefillId, title.id);
							});
					}
				}
			});
		}
	}

	[addControl](type, column, rowData, columnCount) {
		const self = this;
		const editOptions = column.editOptions || {};
		const controlSettings = {
			title: column.title,
			width: HUNDRED_PERCENT,
			isEnabled: (typeof editOptions.isEnabled === 'undefined') ? true : editOptions.isEnabled && !self[IS_EDITING],
			isRequired: editOptions.isRequired
		};
		const cellData = rowData.originalData.values[columnCount];

		editOptions.defaultValue = editOptions.defaultValue || '';

		switch (type) {
			case controlTypes.TEXT:
			case controlTypes.EMAIL:
			case controlTypes.LINK:
			case controlTypes.NUMBER:
				assign(controlSettings, {
					control: TextInput,
					textWidth: editOptions.textWidth || '14rem',
					onChange(newValue) {
						cellData.text = newValue;
						self[prefill](column.editOptions, this, newValue);
						self[onEditControlChange](cellData, rowData.id, columnCount, newValue);
					},
					value: cellData.text || editOptions.defaultValue
				});
				break;
			case controlTypes.DESCRIPTION:
				assign(controlSettings, {
					control: Description,
					textWidth: editOptions.textWidth || '20rem',
					isEnabled: true,
					isRequired: false,
					value: cellData.text || editOptions.defaultValue
				});
				break;
			case controlTypes.CONVERSION:
				assign(controlSettings, {
					control: Conversion,
					onChange(newValue) {
						cellData.text = newValue;
						self[prefill](column.editOptions, this, newValue);
						self[onEditControlChange](cellData, rowData.id, columnCount, newValue);
					},
					value: cellData.text || editOptions.defaultValue
				});
				break;
			case controlTypes.PICKER:
				assign(controlSettings, {
					control: Picker,
					showAll: enforceBoolean(column.showAll, true),
					showSelectAll: column.showSelectAll,
					onChange(newValue) {
						if (newValue.length) {
							cellData.text = newValue.map((item) => item.title).join(', ');
						}
						else {
							cellData.text = '';
						}
						if (newValue.length) {
							self[prefill](column.editOptions, this, newValue[0]);
						}
						self[onEditControlChange](cellData, rowData.id, columnCount);
					},
					value: cellData.text || editOptions.defaultValue
				});

				if (editOptions.dataSource) {
					erase(editOptions, 'options');
					erase(editOptions, 'preferred');
				}
				else {
					editOptions.options = self[filterOptions](editOptions.options, column, cellData);
				}

				break;
		}

		assign(controlSettings, editOptions);

		return controlSettings;
	}

	[getControlType](column) {
		const self = this;
		let controlType;

		if (
			column.type === COLUMN_TYPES.TEXT ||
			column.type === COLUMN_TYPES.EMAIL ||
			column.type === COLUMN_TYPES.LINK ||
			column.type === COLUMN_TYPES.NUMBER
		) {
			if (column.showDescriptionOnEdit && self[IS_EDITING]) {
				controlType = controlTypes.DESCRIPTION;
			}
			else if (column.filterType === FILTER_TYPES.DROPDOWN) {
				controlType = controlTypes.PICKER;
			}
			else if (column.editOptions && column.editOptions.controlType) {
				controlType = column.editOptions.controlType;
			}
			else {
				controlType = controlTypes.TEXT;
			}
		}

		return controlType;
	}

	[buildDialogContent](rowData = {}) {
		const self = this;
		const output = [];

		rowData.originalData = rowData.originalData || {};
		rowData.originalData.values = rowData.originalData.values || [];
		rowData.id = rowData.id || (self.autoGenerateIds() ? shortid.generate() : NEW_ROW_ID);
		self[CURRENT_PREFILL_VALUES] = {};

		if (self[GRID].columns()) {
			self[GRID].columns().forEach((column, columnCount) => {
				const controlType = self[getControlType](column);

				if (!rowData.originalData.values[columnCount]) {
					rowData.originalData.values[columnCount] = {
						text: ''
					};
				}

				if (controlType) {
					output.push(self[addControl](
						controlType,
						column,
						rowData,
						columnCount
					));
				}
			});
		}

		return output;
	}

	[buildDialogButtons](rowData) {
		const self = this;

		const buttons = [{
			label: locale.get('done'),
			classes: 'action-button',
			onClick() {
				if (self[CURRENT_VALUE]) {
					self[CURRENT_VALUE].forEach((row) => {
						row.edited = false;
					});
				}
				if (self[ADD_NEW_DIALOG]) {
					self[ADD_NEW_DIALOG].remove();
				}
			}
		}];

		if (!self[IS_EDITING] && self.showAddAnother()) {
			buttons.push({
				label: locale.get('addAnother'),
				classes: 'action-button',
				onClick() {
					self[ADD_NEW_DIALOG].remove();
					self[showDialog]();
				}
			});
		}

		if (self[IS_EDITING]) {
			buttons.push({
				label: locale.get('delete'),
				classes: 'form-button',
				align: 'right',
				icon: DELETE_ICON,
				onClick() {
					self[deleteItem](rowData);
				}
			});
		}

		return buttons;
	}

	[showDialog](id) {
		const self = this;
		const rowData = self[CURRENT_VALUE].find((row) => row.id === id);

		self[IS_EDITING] = !!rowData;

		if (self[ADD_NEW_DIALOG]) {
			self[ADD_NEW_DIALOG].remove();
		}

		self[ADD_NEW_DIALOG] = new Dialog({
			title: self[IS_EDITING] ? locale.get('edit') : locale.get('addDialogTitle'),
			footer: {
				buttons: self[buildDialogButtons](rowData)
			},
			content: self[buildDialogContent](rowData),
			onRemove() {
				self[GRID].clearSelected();
				self[ADD_NEW_DIALOG] = null;
			}
		});
	}

	value(newValue) {
		const self = this;
		let newRowId;
		let newGridRow;
		let output = [];

		if (arguments.length) {
			if (self.processDataIn()) {
				newValue = self.processDataIn()(newValue);
			}

			if (isArray(newValue)) {
				if (self[IS_WAITING_FOR_ROW_ID]) {
					newRowId = self[getUniqueNewRowId](newValue);
					if (newRowId) {
						newGridRow = self[getCurrentValueWithNewRowId]();
						if (newGridRow) {
							self[updateDialogControls](newRowId, newGridRow);
						}
					}
					self[IS_WAITING_FOR_ROW_ID] = false;
				}

				if (self.mapDataIn()) {
					self[CURRENT_VALUE] = newValue.map(self.mapDataIn());
				}
				else {
					self[CURRENT_VALUE] = newValue;
				}

				self[updateGrid]();

				if (newRowId) {
					self[GRID].selectRow(newRowId);
				}

				if (self[IS_DATA_DIRTY]) {
					self.triggerChange();
					self[IS_DATA_DIRTY] = false;
				}
			}

			return self;
		}

		if (self.mapDataOut()) {
			output = self[CURRENT_VALUE].map(self.mapDataOut());
		}

		if (self.processDataOut()) {
			output = self.processDataOut()(self.mapDataOut() ? output : self[CURRENT_VALUE]);
		}

		if (!(self.mapDataOut() || self.processDataOut())) {
			self[CURRENT_VALUE].forEach((row) => {
				const rowOutput = {
					id: row.id === NEW_ROW_ID ? '' : row.id,
					edited: row.edited || false,
					values: []
				};

				row.values.forEach((cell, count) => {
					if (count < self[GRID].columns().length) {
						rowOutput.values.push({
							id: cell.id === NEW_ROW_ID ? '' : cell.id,
							text: cell.text || ''
						});
					}
				});

				output.push(rowOutput);
			});
		}

		return output;
	}

	disableAddButton() {
		this[ADD_NEW_BUTTON].isEnabled(false);
	}

	enableAddButton() {
		this[ADD_NEW_BUTTON].isEnabled(true);
	}

	columns(columns) {
		this[GRID].columns(columns);
	}
}

Object.assign(EditableGrid.prototype, {
	mapDataIn: methodFunction(),

	processDataIn: methodFunction(),

	mapDataOut: methodFunction(),

	processDataOut: methodFunction(),

	showAddAnother: methodBoolean({
		init: true
	}),

	autoGenerateIds: methodBoolean({
		init: true
	}),

	dialogWidth: methodString({
		init: '34rem'
	}),

	onDelete: methodFunction()
});

EditableGrid.COLUMN_TYPES = COLUMN_TYPES;
EditableGrid.SORT_TYPES = SORT_TYPES;
EditableGrid.FILTER_TYPES = FILTER_TYPES;
