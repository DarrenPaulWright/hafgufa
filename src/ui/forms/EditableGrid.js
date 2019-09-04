import { difference, remove } from 'lodash';
import { clone, forOwn, set } from 'object-agent';
import shortid from 'shortid';
import { applySettings, AUTO, enforce, HUNDRED_PERCENT, isArray, method } from 'type-enforcer';
import dom from '../../utility/dom';
import { MARGIN_TOP } from '../../utility/domConstants';
import locale from '../../utility/locale';
import controlTypes from '../controlTypes';
import toast from '../display/toast';
import Button from '../elements/Button';
import Grid from '../grid/Grid';
import { COLUMN_TYPES, FILTER_TYPES, SORT_TYPES } from '../grid/gridConstants';
import { ADD_ICON, DELETE_ICON } from '../icons';
import Dialog from '../layout/Dialog';
import Conversion from './Conversion';
import Description from './Description';
import './EditableGrid.less';
import FormControl from './FormControl';
import Picker from './Picker';
import TextInput from './TextInput';

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
const getCurrentValueWithNewRowID = Symbol();
const getUniqueNewRowID = Symbol();
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
 * display a grid control that allows the user to add new data and edit existing data.
 * @module EditableGrid
 * @extends FormControl
 * @constructor
 *
 * @arg {Object}   settings                 - Accepts all control and FormControl settings plus:
 * @arg {Array}    [settings.columns[]]     - Grid control columns
 * @arg {Array}    [settings.columns[].showDescriptionOnEdit]
 * @arg {Function} [settings.onDelete]      - Callback for when an item is deleted. If not provided, onChange will be triggered.
 * @arg {boolean} [settings.autoGenerateIDs=true]
 * @arg {boolean} [settings.showAddAnother=true]
 * @arg {String}   [settings.dialogWidth=34rem]
 */
export default class EditableGrid extends FormControl {
	constructor(settings = {}) {
		settings.type = settings.type || controlTypes.EDITABLE_GRID;
		settings.width = enforce.cssSize(settings.width, HUNDRED_PERCENT, true);
		settings.height = enforce.cssSize(settings.height, AUTO, true);

		super(settings);

		const self = this;
		self[CURRENT_VALUE] = [];
		self[IS_WAITING_FOR_ROW_ID] = false;
		self[IS_DATA_DIRTY] = false;
		self[IS_EDITING] = false;
		self[CURRENT_PREFILL_VALUES] = {};

		self.addClass('editable-grid');

		self[GRID] = new Grid({
			container: self.contentContainer(),
			columns: settings.columns,
			height: settings.height === AUTO ? AUTO : '14rem',
			onSelect: (rowId) => self[showDialog](rowId),
			hideFooter: true
		});

		self[ADD_NEW_BUTTON] = new Button({
			container: self.element(),
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
					.height(self.innerHeight() - dom.get.top(self.contentContainer()) - dom.get.outerHeight(self[ADD_NEW_BUTTON]))
					.resize();
			}
		}, true);

		self.onRemove(() => {
			self[ADD_NEW_BUTTON].remove();

			if (self[ADD_NEW_DIALOG]) {
				self[ADD_NEW_DIALOG].remove();
			}

			self[GRID].remove();
		});
	}

	[deleteItem](rowData) {
		const self = this;
		let isDeleted = true;
		let rowValue = self[CURRENT_VALUE].find((item) => item.rowID === rowData.rowID);

		self[GRID].clearSelected();
		self[GRID].removeRow({
			rowID: rowData.rowID
		});
		remove(self[CURRENT_VALUE], {
			rowID: rowData.rowID
		});
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
						self.onDelete().call(self, {
							id: self.ID(),
							control: self,
							value: rowData.rowID
						});
					}
					else {
						self.triggerChange();
					}
				}
			}
		});
	}

	[getCurrentValueWithNewRowID]() {
		const self = this;
		let newGridRow;

		self[CURRENT_VALUE].forEach((gridRow) => {
			if (gridRow.rowID === NEW_ROW_ID) {
				newGridRow = gridRow;
				return false;
			}
			return true;
		});

		return newGridRow;
	}

	[getUniqueNewRowID](newValue) {
		const self = this;
		const currentRowIDs = self[CURRENT_VALUE].map((item) => item.rowID);
		const returnedRowIDs = newValue.map((item) => item.rowID);
		const uniqueRowIDs = difference(returnedRowIDs, currentRowIDs);
		let newRowID;

		if (uniqueRowIDs.length) {
			newRowID = uniqueRowIDs[0];
		}

		return newRowID;
	}

	[updateDialogControls](rowID, newValueRow) {
		const self = this;

		if (self[ADD_NEW_DIALOG]) {
			self[ADD_NEW_DIALOG].each((control, index) => {
				control.rowID = rowID;
				control.value(newValueRow.values[index].text);
			});
		}
	}

	[updateGrid]() {
		const self = this;

		self[GRID].rows(self[CURRENT_VALUE] = self[CURRENT_VALUE].map((row) => {
			return {
				cells: row.values.map((cell) => {
					return {
						...cell,
						rowID: row.rowID
					};
				}),
				rowID: row.rowID,
				originalData: row,
				edited: row.edited || self[CURRENT_VALUE].edited,
				values: row.values
			};
		}));
	}

	[onEditControlChange](cellData, rowID, columnIndex) {
		const self = this;

		const setRowIdAndUpdateCellData = () => {
			let rowFound = false;

			cellData.rowID = rowID;

			self[CURRENT_VALUE].forEach((row) => {
				console.log('row:', row);
				if (row.rowID === cellData.rowID) {
					rowFound = true;
					row.values[columnIndex] = cellData;
					row.edited = true;
					return false;
				}
			});

			if (!rowFound) {
				self[CURRENT_VALUE].push({
					values: initializeNewCells(),
					rowID: rowID,
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
						rowID: rowID,
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
			if (rowID === NEW_ROW_ID) {
				self[IS_WAITING_FOR_ROW_ID] = true;
				cellData.rowID = NEW_ROW_ID;
				self[CURRENT_VALUE].push({
					values: initializeNewCells(),
					rowID: NEW_ROW_ID,
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

	[prefill](editOptions, newValue) {
		const self = this;
		let control;

		const hasOverRideableValue = (control, prefillID) => {
			const controlValue = control.value();

			if (isArray(controlValue)) {
				return (controlValue.length === 0 || (controlValue.length === 1 && controlValue[0].ID === self[CURRENT_PREFILL_VALUES][prefillID]));
			}
			else {
				return (!controlValue || controlValue === self[CURRENT_PREFILL_VALUES][prefillID]);
			}
		};

		const prefillControl = (control, ID, value) => {
			control.value(value);
			control.triggerChange(true);
			self[CURRENT_PREFILL_VALUES][ID] = value;
		};

		if (editOptions) {
			forOwn(editOptions.prefill, (prefillValue, prefillID) => {
				control = self[ADD_NEW_DIALOG].get(prefillID);

				if (control && hasOverRideableValue(control, prefillID)) {
					if (prefillValue === null) {
						prefillControl(control, prefillID, newValue.title);
					}
					else if (prefillValue.store && editOptions.dataSource) {
						editOptions.dataSource.store.get(newValue.ID)
							.then((localItem) => prefillValue.store.getTitle(localItem[prefillValue.key]))
							.then((title) => {
								prefillControl(control, prefillID, title.ID);
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
				Object.assign(controlSettings, {
					control: TextInput,
					textWidth: editOptions.textWidth || '14rem',
					onChange(newValue) {
						cellData.text = newValue.value;
						self[prefill](column.editOptions, newValue.value);
						self[onEditControlChange](cellData, rowData.rowID, columnCount, newValue);
					},
					value: cellData.text || editOptions.defaultValue
				});
				break;
			case controlTypes.DESCRIPTION:
				Object.assign(controlSettings, {
					control: Description,
					textWidth: editOptions.textWidth || '20rem',
					isEnabled: true,
					isRequired: false,
					value: cellData.text || editOptions.defaultValue
				});
				break;
			case controlTypes.CONVERSION:
				Object.assign(controlSettings, {
					control: Conversion,
					onChange(newValue) {
						cellData.text = newValue.value;
						self[prefill](column.editOptions, newValue.value);
						self[onEditControlChange](cellData, rowData.rowID, columnCount, newValue);
					},
					value: cellData.text || editOptions.defaultValue
				});
				break;
			case controlTypes.PICKER:
				Object.assign(controlSettings, {
					control: Picker,
					showAll: enforce.boolean(column.showAll, true),
					showSelectAll: column.showSelectAll,
					onChange(newValue) {
						if (newValue.value.length) {
							cellData.text = newValue.value.map((item) => item.title).join(', ');
						}
						else {
							cellData.text = '';
						}
						if (newValue.value.length) {
							self[prefill](column.editOptions, newValue.value[0]);
						}
						self[onEditControlChange](cellData, rowData.rowID, columnCount);
					},
					value: cellData.text || editOptions.defaultValue
				});

				if (editOptions.dataSource) {
					delete editOptions.options;
					delete editOptions.preferred;
				}
				else {
					editOptions.options = self[filterOptions](editOptions.options, column, cellData);
				}

				break;
		}

		Object.assign(controlSettings, editOptions);

		return controlSettings;
	}

	[getControlType](column) {
		const self = this;
		let controlType;

		if (column.type === COLUMN_TYPES.TEXT ||
			column.type === COLUMN_TYPES.EMAIL ||
			column.type === COLUMN_TYPES.LINK ||
			column.type === COLUMN_TYPES.NUMBER) {
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
		rowData.rowID = rowData.rowID || (self.autoGenerateIDs() ? shortid.generate() : NEW_ROW_ID);
		self[CURRENT_PREFILL_VALUES] = {};

		if (self[GRID].columns()) {
			self[GRID].columns().forEach((column, columnCount) => {
				let controlType = self[getControlType](column);

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

	[showDialog](rowId) {
		const self = this;
		const rowData = self[CURRENT_VALUE].find((row) => row.rowID === rowId);
		console.log('show dialog');

		self[IS_EDITING] = !!rowData;

		if (self[ADD_NEW_DIALOG]) {
			self[ADD_NEW_DIALOG].remove();
		}

		self[ADD_NEW_DIALOG] = new Dialog({
			title: self[IS_EDITING] ? locale.get('edit') : locale.get('addDialogTitle'),
			width: HUNDRED_PERCENT,
			maxWidth: self.dialogWidth(),
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
		let newRowID;
		let newGridRow;
		let output = [];

		if (arguments.length) {
			if (self.processDataIn()) {
				newValue = self.processDataIn()(newValue);
			}

			if (isArray(newValue)) {
				if (self[IS_WAITING_FOR_ROW_ID]) {
					newRowID = self[getUniqueNewRowID](newValue);
					if (newRowID) {
						newGridRow = self[getCurrentValueWithNewRowID]();
						if (newGridRow) {
							self[updateDialogControls](newRowID, newGridRow);
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

				if (newRowID) {
					self[GRID].selectRow(newRowID);
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
					rowID: row.rowID === NEW_ROW_ID ? '' : row.rowID,
					edited: row.edited || false,
					values: []
				};

				row.values.forEach((cell, count) => {
					if (count < self[GRID].columns().length) {
						rowOutput.values.push({
							rowID: cell.rowID === NEW_ROW_ID ? '' : cell.rowID,
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
	mapDataIn: method.function(),

	processDataIn: method.function(),

	mapDataOut: method.function(),

	processDataOut: method.function(),

	showAddAnother: method.boolean({
		init: true
	}),

	autoGenerateIDs: method.boolean({
		init: true
	}),

	dialogWidth: method.string({
		init: '34rem'
	}),

	onDelete: method.function()
});

EditableGrid.COLUMN_TYPES = COLUMN_TYPES;
EditableGrid.SORT_TYPES = SORT_TYPES;
EditableGrid.FILTER_TYPES = FILTER_TYPES;
