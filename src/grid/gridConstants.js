import { Enum } from 'type-enforcer-ui';

export const COLUMN_TYPES = new Enum({
	TEXT: 'text',
	EMAIL: 'email',
	LINK: 'link',
	NUMBER: 'number',
	DATE: 'date',
	TIME: 'time',
	DATE_TIME: 'datetime',
	ACTIONS: 'actions',
	IMAGE: 'image',
	CHECKBOX: 'checkbox',
	NONE: 'none'
});
export const FILTER_TYPES = new Enum({
	DROPDOWN: 'dropDown',
	AUTO_COMPLETE: 'autoComplete',
	NUMBER: 'number',
	DATE: 'date',
	NONE: 'none'
});
export const SORT_TYPES = new Enum({
	ASC: 'asc',
	DESC: 'desc',
	NONE: 'none'
});
export const CELL_ALIGNMENT = new Enum({
	LEFT: 'left',
	CENTER: 'center',
	RIGHT: 'right',
	NONE: 'none'
});
export const DISPLAY_TYPES = new Enum({
	TEXT: 'text',
	IMAGE: 'image',
	BUTTONS: 'buttons',
	CHECKBOX: 'checkbox'
});
export const CONTEXT_MENU_COLUMN_PREFIX = 'column-';
export const CONTEXT_MENU_SORT_PREFIX = 'sort-';
