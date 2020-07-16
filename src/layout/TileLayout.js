import { debounce, forRange, throttle } from 'async-agent';
import { clone, fill } from 'object-agent';
import { isNumber } from 'type-enforcer';
import {
	applySettings,
	AUTO,
	CssSize,
	Enum,
	HUNDRED_PERCENT,
	methodArray,
	methodCssSize,
	methodEnum,
	methodFunction,
	methodInteger,
	methodNumber,
	methodObject,
	PIXELS
} from 'type-enforcer-ui';
import ControlRecycler from '../ControlRecycler.js';
import controlTypes from '../controlTypes.js';
import {
	ABSOLUTE,
	CONTENT_CHANGE_EVENT,
	HIDDEN,
	LEFT,
	OVERFLOW_Y,
	PADDING_LEFT,
	PADDING_TOP,
	POSITION,
	SCROLL_EVENT,
	TOP
} from '../utility/domConstants.js';
import clamp from '../utility/math/clamp.js';
import setDefaults from '../utility/setDefaults.js';
import Container from './Container.js';
import './TileLayout.less';

const COLUMN_SPAN = 'columnSpan';
const CONTROL_INDEX_ATTR = 'tileIndex';
const NO_ITEM_ID_ERROR_MESSAGE = 'All items in a tile layout must have a unique id.';
export const TILE_COLUMN_ALIGN = new Enum({
	LEFT: 'left',
	CENTER: 'center',
	RIGHT: 'right',
	STRETCH: 'stretch'
});

const maxInRange = (rangeIndex, columnSpan, columnOffsets) => {
	let max = columnOffsets[rangeIndex] || 0;

	for (const end = rangeIndex + columnSpan - 1; rangeIndex < end; rangeIndex++) {
		max = max > (columnOffsets[rangeIndex + 1] || 0) ? max : (columnOffsets[rangeIndex + 1] || 0);
	}

	return max;
};

const minInRange = (columnChunks, columnSpan, columnOffsets) => {
	let currentMax;
	let testMax = maxInRange(0, columnSpan, columnOffsets);
	let testIndex = 0;

	for (let index = 1; index < columnChunks; index++) {
		currentMax = maxInRange(index, columnSpan, columnOffsets);
		if (currentMax < testMax) {
			testMax = currentMax;
			testIndex = index;
		}
	}

	return {
		y: testMax,
		x: testIndex,
		span: columnSpan
	};
};

const fitInGaps = (offset, controlHeight, columnSpan, gaps) => {
	let isUsingGap = false;

	if (gaps.length && columnSpan === 1) {
		gaps.forEach((gap) => {
			if (gap.height >= controlHeight) {
				isUsingGap = true;
				offset.x = gap.column;
				offset.y = gap.offset;
				gap.height = gap.height - controlHeight;
				return false;
			}
		});
	}

	return isUsingGap;
};

const saveOffset = (offset, columnSpan, controlHeight, columnOffsets, gaps) => {
	for (let index = offset.x; index < (offset.x + columnSpan); index++) {
		if (columnSpan > 1 && offset.y > (columnOffsets[index] || 0)) {
			gaps.push({
				column: index,
				offset: columnOffsets[index] || 0,
				height: offset.y - (columnOffsets[index] || 0)
			});
		}
		offset.bottom = offset.y + controlHeight;
		columnOffsets[index] = offset.bottom;
	}
};

const VIRTUAL_SCROLL_ELEMENT = Symbol();
const CONTROL_RECYCLER = Symbol();
const IS_VIRTUALIZED = Symbol();
const RENDERED_TILE_MARGIN = Symbol();
const RENDERED_COLUMN_WIDTH = Symbol();
const COLUMN_COUNT = Symbol();
const COLUMN_OFFSETS = Symbol();
const GAPS = Symbol();
const LAYOUT_WIDTH = Symbol();
const LAYOUT_HEIGHT = Symbol();
const RENDER_CUTOFF_TOP = Symbol();
const RENDER_CUTTOFF_BOTTOM = Symbol();
const LEFT_MARGIN = Symbol();
const MAX_DESIRED_COLUMNS = Symbol();
const RENDERED_WIDTHS = Symbol();
const RENDERED_HEIGHTS = Symbol();
const TILE_OFFSETS = Symbol();
const RENDERED_CONTROLS = Symbol();
const CURRENT_SCROLL_HEIGHT = Symbol();
const PREVIOUS_COLUMN_COUNT = Symbol();
const PREVIOUS_COLUMN_ALIGN = Symbol();
const PREVIOUS_CUTTOFF_BOTTOM = Symbol();
const PREVIOUS_CUTTOFF_TOP = Symbol();
const CUTOFF_HEIGHT = Symbol();
const CUTOFF_MAX = Symbol();
const CUTOFF_INDEX_TOP = Symbol();
const CUTOFF_INDEX_BOTTOM = Symbol();
const IS_RENDERING = Symbol();
const RENDER_REQUIRED = Symbol();

const setScrollPositions = Symbol();
const resetColumnOffsets = Symbol();
const onNewContent = Symbol();
const attachControl = Symbol();
const detachControl = Symbol();
const registerControl = Symbol();
const fadeControl = Symbol();
const calculateControlWidth = Symbol();
const findNextOffset = Symbol();
const placeControl = Symbol();
const renderTile = Symbol();
const discardTile = Symbol();
const placeControls = Symbol();
const calculateColumns = Symbol();

/**
 * Displays a masonry style layout control.
 *
 * @class TileLayout
 * @constructor
 *
 * @param {object} [settings]
 */
export default class TileLayout extends Container {
	constructor(settings = {}) {
		super(setDefaults({
			type: controlTypes.TILE_LAYOUT,
			width: HUNDRED_PERCENT,
			height: HUNDRED_PERCENT
		}, settings));

		const self = this;
		self[VIRTUAL_SCROLL_ELEMENT] = new Container();
		self[CONTROL_RECYCLER] = new ControlRecycler();
		self[IS_VIRTUALIZED] = false;
		self[RENDERED_TILE_MARGIN] = 20;
		self[RENDERED_COLUMN_WIDTH] = 200;
		self[COLUMN_COUNT] = 0;
		self[COLUMN_OFFSETS] = [];
		self[GAPS] = [];
		self[LAYOUT_WIDTH] = 0;
		self[LAYOUT_HEIGHT] = 0;
		self[RENDER_CUTOFF_TOP] = 0;
		self[RENDER_CUTTOFF_BOTTOM] = 0;
		self[LEFT_MARGIN] = 0;
		self[MAX_DESIRED_COLUMNS] = 10;
		self[RENDERED_WIDTHS] = [];
		self[RENDERED_HEIGHTS] = [];
		self[TILE_OFFSETS] = [];
		self[RENDERED_CONTROLS] = [];
		self[CURRENT_SCROLL_HEIGHT] = 0;
		self[PREVIOUS_COLUMN_COUNT] = 0;
		self[PREVIOUS_CUTTOFF_BOTTOM] = 0;
		self[PREVIOUS_CUTTOFF_TOP] = 0;
		self[CUTOFF_MAX] = 0;
		self[CUTOFF_INDEX_TOP] = 0;
		self[CUTOFF_INDEX_BOTTOM] = 0;
		self[IS_RENDERING] = false;
		self[RENDER_REQUIRED] = false;

		self
			.addClass('tile-layout')
			.on(SCROLL_EVENT, throttle(() => {
				if (!self.height().isAuto) {
					self[setScrollPositions]();
					self[placeControls]();
				}
			}, 100))
			.on(CONTENT_CHANGE_EVENT, () => self[onNewContent]());

		self[LAYOUT_WIDTH] = self.innerWidth();

		self[VIRTUAL_SCROLL_ELEMENT]
			.container(self)
			.css(POSITION, ABSOLUTE)
			.width('1px');

		applySettings(self, settings);

		self.onResize(throttle(() => {
				const availableWidth = self.innerWidth();

				if (!self.height().isAuto) {
					self[LAYOUT_HEIGHT] = self.innerHeight();
					self[setScrollPositions]();
				}

				if (availableWidth !== self[LAYOUT_WIDTH]) {
					self[LAYOUT_WIDTH] = availableWidth;
					self[PREVIOUS_CUTTOFF_BOTTOM] = 0;
					self[calculateColumns]();
				}

				if (self.height().isAuto) {
					const newHeight = Math.max(...self[COLUMN_OFFSETS]);
					self.minHeight(newHeight + self.paddingHeight)
						.css(OVERFLOW_Y, HIDDEN);
				}
				else {
					self.css(OVERFLOW_Y, AUTO);
				}
			}, 100))
			.resize();
	}

	[setScrollPositions]() {
		const self = this;

		if (!self[IS_RENDERING] && !self.height().isAuto && !self.isRemoved) {
			const scrollTop = self.element.scrollTop;
			self[RENDER_CUTOFF_TOP] = scrollTop - (self[LAYOUT_HEIGHT] * self.extraRenderedItemsRatio());
			self[RENDER_CUTTOFF_BOTTOM] = scrollTop + self[LAYOUT_HEIGHT] + (self[LAYOUT_HEIGHT] * self.extraRenderedItemsRatio());
		}
	}

	[resetColumnOffsets]() {
		const self = this;

		self[CUTOFF_MAX] = -1;
		self[RENDERED_WIDTHS].length = 0;
		self[RENDERED_HEIGHTS].length = 0;
		self[TILE_OFFSETS].length = 0;
		self[RENDERED_CONTROLS].length = 0;
		self[GAPS].length = 0;

		const paddingTop = parseInt(self.css(PADDING_TOP), 10);
		self[COLUMN_OFFSETS] = fill(self[COLUMN_COUNT], () => paddingTop);
	}

	[onNewContent]() {
		const self = this;
		let columnSpan;

		self.element.scrollTop = 0;
		self[CURRENT_SCROLL_HEIGHT] = 0;
		self[PREVIOUS_CUTTOFF_BOTTOM] = 0;

		self[resetColumnOffsets]();

		self[MAX_DESIRED_COLUMNS] = 1;
		if (!self[IS_VIRTUALIZED]) {
			self.each((control) => {
				columnSpan = control.attr(COLUMN_SPAN) || 1;
				self[MAX_DESIRED_COLUMNS] = columnSpan < self[MAX_DESIRED_COLUMNS] ? self[MAX_DESIRED_COLUMNS] : columnSpan;
			}, true);
		}
		else {
			const defaultSettings = self[CONTROL_RECYCLER].defaultSettings() || {};
			defaultSettings.container = self.element;
			self[CONTROL_RECYCLER].defaultSettings(defaultSettings);

			self.tileData().forEach((tile) => {
				self[MAX_DESIRED_COLUMNS] = (tile.columnSpan || 1) < self[MAX_DESIRED_COLUMNS] ? self[MAX_DESIRED_COLUMNS] : (tile.columnSpan || 1);
			});
		}

		self[calculateColumns]();
	}

	[attachControl](control) {
		const self = this;

		if (control.container() !== self.element) {
			control.container(self.element);
		}
	}

	[detachControl](control) {
		if (control.container()) {
			control.container(null);
		}
	}

	[registerControl](control) {
		const self = this;

		if (!control.isRegistered) {
			control
				.onResize((width, height) => {
					if (self[IS_VIRTUALIZED]) {
						const index = parseInt(control.attr(CONTROL_INDEX_ATTR));

						if (self[TILE_OFFSETS][index] && !self[TILE_OFFSETS][index].removed && index >= self[CUTOFF_INDEX_TOP] && index <= self[CUTOFF_INDEX_BOTTOM]) {
							const newHeight = height + self[RENDERED_TILE_MARGIN];
							if (newHeight !== self[RENDERED_HEIGHTS][index]) {
								self[RENDERED_HEIGHTS][index] = height + self[RENDERED_TILE_MARGIN];
								self[placeControls](index);
							}
						}
					}
					else {
						self.refresh();
					}
				})
				.onRemove(() => {
					self.refresh();
				});

			control.isRegistered = true;
		}
	}

	[fadeControl](control, doFade) {
		if (control.fade) {
			control.fade(doFade);
		}
	}

	[calculateControlWidth](columnSpan) {
		const self = this;

		return (self[RENDERED_COLUMN_WIDTH] + self[RENDERED_TILE_MARGIN]) * columnSpan - self[RENDERED_TILE_MARGIN];
	}

	[findNextOffset](control, index, isPreviouslyRendered, doPrepend) {
		const self = this;
		let offset = {
			x: 0,
			y: 0,
			span: 1,
			bottom: 0
		};
		let isNewWidth = false;
		const columnSpan = self[TILE_OFFSETS][index] ?
			self[TILE_OFFSETS][index].span :
			Math.min(control.attr(COLUMN_SPAN) || 1, self[COLUMN_COUNT]);
		const columnWidth = self[calculateControlWidth](columnSpan);

		if (control && (isPreviouslyRendered || !self[RENDERED_WIDTHS][index] || self[RENDERED_WIDTHS][index] !== columnWidth)) {
			self[attachControl](control);
			self[RENDERED_WIDTHS][index] = columnWidth;

			if (!self[IS_VIRTUALIZED]) {
				control
					.attr(COLUMN_SPAN, columnSpan)
					.css(POSITION, ABSOLUTE)
					.width(self[calculateControlWidth](columnSpan));
			}
			self[registerControl](control);

			isNewWidth = true;
		}

		if (!self[RENDERED_HEIGHTS][index] || isNewWidth) {
			self[attachControl](control);
			self[RENDERED_HEIGHTS][index] = control.borderHeight() + self[RENDERED_TILE_MARGIN];
		}

		if (control && isPreviouslyRendered) {
			offset = self[TILE_OFFSETS][index];
		}
		else {
			offset.columnOffsets = clone(self[COLUMN_OFFSETS]);
			offset.gaps = clone(self[GAPS]);

			if (!fitInGaps(offset, self[RENDERED_HEIGHTS][index], columnSpan, self[GAPS])) {
				offset = {
					...offset,
					...minInRange(self[COLUMN_COUNT] - columnSpan + 1, columnSpan, self[COLUMN_OFFSETS])
				};
				saveOffset(offset, columnSpan, self[RENDERED_HEIGHTS][index], self[COLUMN_OFFSETS], self[GAPS]);
			}
			self[TILE_OFFSETS][index] = offset;
		}

		if (!doPrepend) {
			self[CUTOFF_HEIGHT] = Math.min(...self[COLUMN_OFFSETS]);
			self[CUTOFF_INDEX_BOTTOM] = index;
			self[CUTOFF_MAX] = Math.max(index, self[CUTOFF_MAX]);
		}

		self[RENDERED_CONTROLS][index] = self[IS_VIRTUALIZED] || self.height().isAuto || (offset.y + self[RENDERED_HEIGHTS][index] > self[RENDER_CUTOFF_TOP] && offset.y < self[RENDER_CUTTOFF_BOTTOM]);
	}

	[placeControl](control, index) {
		const self = this;

		control
			.css(TOP, self[TILE_OFFSETS][index].y + PIXELS)
			.css(
				LEFT,
				self[LEFT_MARGIN] + (self[TILE_OFFSETS][index].x * (self[RENDERED_COLUMN_WIDTH] + self[RENDERED_TILE_MARGIN])) + PIXELS
			);
		self[fadeControl](control, true);
	}

	[renderTile](index, doPrepend, skipPlacement) {
		const self = this;
		const itemData = self.tileData()[index];

		return new Promise((resolve) => {
			let control;

			const finishRender = () => {
				self[findNextOffset](control, index, index <= self[CUTOFF_MAX], doPrepend);
				if (!skipPlacement) {
					self[placeControl](control, index);
				}
				resolve();
			};

			if (itemData) {
				if (!itemData.id) {
					throw (NO_ITEM_ID_ERROR_MESSAGE);
				}

				if (self[CONTROL_RECYCLER] && self[CONTROL_RECYCLER].control()) {
					control = self[CONTROL_RECYCLER].getRecycledControl(doPrepend);
					control.attr(CONTROL_INDEX_ATTR, index);
					const columnSpan = Math.min(itemData.columnSpan || 1, self[COLUMN_COUNT]);

					control
						.id(itemData.id)
						.attr(COLUMN_SPAN, columnSpan)
						.css(POSITION, ABSOLUTE)
						.width(self[calculateControlWidth](columnSpan))
						.container(self.element, doPrepend);

					if (self[TILE_OFFSETS][index] && self[TILE_OFFSETS][index].removed) {
						control.borderHeight(self[RENDERED_HEIGHTS][index] - self[RENDERED_TILE_MARGIN]);
					}

					if (self.onTileRender()) {
						self.onTileRender()(control, itemData)
							.then(finishRender);
					}
					else {
						finishRender();
					}
				}
			}
		});
	}

	[discardTile](index) {
		const self = this;
		let control = self[CONTROL_RECYCLER].getControl(self.tileData()[index].id);

		if (control) {
			self[TILE_OFFSETS][index].removed = true;
			self[fadeControl](control, false);
			self[CONTROL_RECYCLER].discardControl(control.id());
			self[RENDERED_CONTROLS][index] = false;
			control = null;
		}
	}

	/**
	 * Place all the controls in the layout.
	 *
	 * @param startIndex
	 */
	[placeControls](startIndex) {
		const self = this;
		const isAutoHeight = self.height().isAuto;
		const total = self.tileData().length;

		const cleanUp = () => {
			const bottom = Math.max(...self[COLUMN_OFFSETS]);
			const isLast = (self.total() || self.tileData().length) === self[CUTOFF_INDEX_BOTTOM] + 1;

			if (bottom > self[CURRENT_SCROLL_HEIGHT] || isLast) {
				self[CURRENT_SCROLL_HEIGHT] = bottom + (isLast ? 0 : self[LAYOUT_HEIGHT]);
				self[VIRTUAL_SCROLL_ELEMENT].height(self[CURRENT_SCROLL_HEIGHT]);
			}

			self[IS_RENDERING] = false;
			if (self[RENDER_REQUIRED] !== false) {
				let newIndex;
				if (isNumber(self[RENDER_REQUIRED])) {
					newIndex = self[RENDER_REQUIRED];
				}
				self[RENDER_REQUIRED] = false;
				self[setScrollPositions]();
				self[placeControls](newIndex);
			}

			self.resize(true);
		};

		const virtualizedCleanUp = () => {
			self[PREVIOUS_CUTTOFF_BOTTOM] = self[RENDER_CUTTOFF_BOTTOM];
			self[PREVIOUS_CUTTOFF_TOP] = self[RENDER_CUTOFF_TOP];

			cleanUp();
		};

		const renderAndDiscardAllAboveCutoff = () => new Promise((resolve) => {
			if (self[TILE_OFFSETS].length === 0 && self[RENDER_CUTOFF_TOP] > 0) {
				forRange(0, total - 1, (index) => new Promise((resolve, reject) => {
					self[renderTile](index, false, true)
						.then(() => {
							self[discardTile](index);

							if (self[TILE_OFFSETS][index].y > self[RENDER_CUTOFF_TOP]) {
								reject();
							}
							else {
								resolve();
							}
						});
				}))
					.then(resolve);
			}
			else {
				resolve();
			}
		});

		const renderAll = () => new Promise((resolve) => {
			let start = 0;

			self[TILE_OFFSETS].forEach((tileOffset, index) => {
				if (tileOffset.bottom > self[RENDER_CUTOFF_TOP]) {
					start = index;
					return false;
				}
			});

			forRange(start, total - 1, (index) => new Promise((resolve, reject) => {
				if (!self[TILE_OFFSETS][index] || (self[TILE_OFFSETS][index].bottom > self[RENDER_CUTOFF_TOP] && self[TILE_OFFSETS][index].y < self[RENDER_CUTTOFF_BOTTOM])) {
					if (self[CUTOFF_INDEX_TOP] === -1) {
						self[CUTOFF_INDEX_TOP] = index;
					}
					self[renderTile](index)
						.then(() => {
							if (self[TILE_OFFSETS][index].y > self[RENDER_CUTTOFF_BOTTOM]) {
								reject();
							}
							else {
								resolve();
							}
						});
				}
				else {
					reject();
				}
			}))
				.then(resolve);
		});

		const removeFromTop = () => new Promise((resolve) => {
			if (self[RENDER_CUTOFF_TOP] > self[PREVIOUS_CUTTOFF_TOP]) {
				forRange(self[CUTOFF_INDEX_TOP], total - 1, (index) => new Promise((resolve, reject) => {
					if (self[TILE_OFFSETS][index].bottom < self[RENDER_CUTOFF_TOP]) {
						self[discardTile](index);
						self[CUTOFF_INDEX_TOP] = index + 1;
						resolve();
					}
					else {
						reject();
					}
				}))
					.then(resolve);
			}
			else {
				resolve();
			}
		});

		const removeFromBottom = () => new Promise((resolve) => {
			if (self[RENDER_CUTTOFF_BOTTOM] < self[PREVIOUS_CUTTOFF_BOTTOM]) {
				forRange(self[CUTOFF_INDEX_BOTTOM], 0, (index) => new Promise((resolve, reject) => {
					if (self[TILE_OFFSETS][index].y > self[RENDER_CUTTOFF_BOTTOM]) {
						self[discardTile](index);
						self[CUTOFF_INDEX_BOTTOM]--;
						resolve();
					}
					else {
						reject();
					}
				}))
					.then(resolve);
			}
			else {
				resolve();
			}
		});

		const addToTop = () => new Promise((resolve) => {
			if (self[RENDER_CUTOFF_TOP] < self[PREVIOUS_CUTTOFF_TOP]) {
				forRange(self[CUTOFF_INDEX_TOP] - 1, 0, (index) => new Promise((resolve, reject) => {
					if (!self[RENDERED_CONTROLS][index]) {
						self[renderTile](index, true)
							.then(() => {
								self[CUTOFF_INDEX_TOP]--;
								if (self[TILE_OFFSETS][index].bottom < self[RENDER_CUTOFF_TOP]) {
									reject();
								}
								else {
									resolve();
								}
							});
					}
					if (self[TILE_OFFSETS][index].bottom < self[RENDER_CUTOFF_TOP]) {
						reject();
					}
					else {
						resolve();
					}
				}))
					.then(resolve);
			}
			else {
				resolve();
			}
		});

		const addToBottom = () => new Promise((resolve) => {
			if (self[RENDER_CUTTOFF_BOTTOM] > self[PREVIOUS_CUTTOFF_BOTTOM]) {
				return forRange(self[CUTOFF_INDEX_BOTTOM] + 1, total - 1, (index) => new Promise((resolve2, reject) => {
					self[renderTile](index)
						.then(() => {
							if (self[TILE_OFFSETS][index].y > self[RENDER_CUTTOFF_BOTTOM]) {
								reject();
							}
							else {
								resolve2();
							}
						});
				}))
					.then(() => {
						resolve();
					});
			}
			else {
				resolve();
			}
		});

		if (self[IS_RENDERING]) {
			if (startIndex !== undefined) {
				if (isNumber(self[RENDER_REQUIRED])) {
					self[RENDER_REQUIRED] = startIndex;
				}
				else {
					self[RENDER_REQUIRED] = Math.min(self[RENDER_REQUIRED], startIndex);
				}
			}
			else if (isNumber(self[RENDER_REQUIRED])) {
				self[RENDER_REQUIRED] = true;
			}
		}
		else {
			self[IS_RENDERING] = true;

			if (!self[IS_VIRTUALIZED]) {
				self[GAPS].length = 0;

				self.each((control, index) => {
					self[findNextOffset](control, index);

					if (!isAutoHeight && self[CUTOFF_HEIGHT] > self[RENDER_CUTTOFF_BOTTOM]) {
						return false;
					}
				}, true);

				self.each((control, index) => {
					if (self[RENDERED_CONTROLS][index]) {
						self[placeControl](control, index);
						self[attachControl](control);
					}
					else {
						self[detachControl](control);
						self[fadeControl](control, false);
					}
				}, true);

				cleanUp();
			}
			else {
				if (startIndex !== undefined) {
					self[COLUMN_OFFSETS] = clone(self[TILE_OFFSETS][startIndex].columnOffsets);
					self[GAPS] = clone(self[TILE_OFFSETS][startIndex].self[GAPS]);

					for (let index = startIndex; index < self[TILE_OFFSETS].length; index++) {
						self[findNextOffset](null, index, true);

						const control = self[CONTROL_RECYCLER].getControl(self.tileData()[index].id);
						if (control) {
							self[placeControl](control, index);
						}
					}
				}

				if (self[RENDER_CUTOFF_TOP] > self[PREVIOUS_CUTTOFF_BOTTOM] || self[RENDER_CUTTOFF_BOTTOM] < self[PREVIOUS_CUTTOFF_TOP] || self[PREVIOUS_CUTTOFF_BOTTOM] === 0 || self[TILE_OFFSETS].length === 0) {

					self[CONTROL_RECYCLER].discardAllControls();
					self[RENDERED_CONTROLS].length = 0;
					self[CUTOFF_INDEX_TOP] = -1;

					renderAndDiscardAllAboveCutoff()
						.then(renderAll)
						.then(virtualizedCleanUp);
				}
				else {
					removeFromTop()
						.then(removeFromBottom)
						.then(addToTop)
						.then(addToBottom)
						.then(virtualizedCleanUp);
				}
			}
		}
	}
}

Object.assign(TileLayout.prototype, {
	/**
	 * Run initialization code to get the control ready to use.
	 *
	 * @function calculateColumns
	 */
	[calculateColumns]: debounce(function() {
		const self = this;

		if (self.total() || self[IS_VIRTUALIZED]) {
			self[RENDERED_TILE_MARGIN] = self.tileMargin().toPixels(true) * 2;
			self[RENDERED_COLUMN_WIDTH] = self.tileWidth().toPixels(true) + self[RENDERED_TILE_MARGIN];

			self[COLUMN_COUNT] = Math.max(self.total() || self.tileData().length, self[MAX_DESIRED_COLUMNS]);
			self[COLUMN_COUNT] = Math.min(
				self[COLUMN_COUNT],
				Math.floor((self[LAYOUT_WIDTH] + self[RENDERED_TILE_MARGIN]) / self[RENDERED_COLUMN_WIDTH])
			);
			self[COLUMN_COUNT] = clamp(self[COLUMN_COUNT], self.minColumns(), self.maxColumns());

			if (self.columnAlign() === TILE_COLUMN_ALIGN.STRETCH) {
				self[RENDERED_COLUMN_WIDTH] = Math.floor((self[LAYOUT_WIDTH] - ((self[COLUMN_COUNT] - 1) * self[RENDERED_TILE_MARGIN])) / self[COLUMN_COUNT]);
			}
			else {
				self[RENDERED_COLUMN_WIDTH] -= self[RENDERED_TILE_MARGIN];
			}

			self[LEFT_MARGIN] = 0;
			if (self.columnAlign() === TILE_COLUMN_ALIGN.CENTER || self.columnAlign() === TILE_COLUMN_ALIGN.RIGHT) {
				self[LEFT_MARGIN] = self[LAYOUT_WIDTH] - ((self[RENDERED_COLUMN_WIDTH] + self[RENDERED_TILE_MARGIN]) * self[COLUMN_COUNT]) + self[RENDERED_TILE_MARGIN];

				if (self.columnAlign() === TILE_COLUMN_ALIGN.CENTER) {
					self[LEFT_MARGIN] = self[LEFT_MARGIN] / 2;
				}
			}
			self[LEFT_MARGIN] += parseInt(self.css(PADDING_LEFT) || 0, 10);

			if (self[COLUMN_COUNT] !== self[PREVIOUS_COLUMN_COUNT] || self.columnAlign() !== self[PREVIOUS_COLUMN_ALIGN] || !self[IS_VIRTUALIZED]) {
				self[resetColumnOffsets]();
				self[PREVIOUS_COLUMN_COUNT] = self[COLUMN_COUNT];
				self[PREVIOUS_COLUMN_ALIGN] = self.columnAlign();
			}

			if (!self[RENDER_CUTTOFF_BOTTOM]) {
				self[setScrollPositions]();
			}
			self[placeControls]();
		}
	}, 0, {
		leading: true
	}),

	/**
	 * The default tile width in rem's
	 *
	 * @method tileWidth
	 * @member module:TileLayout
	 * @instance
	 *
	 * @param {string} [newTileWidth]
	 *
	 * @returns {string|this}
	 */
	tileWidth: methodCssSize({
		init: new CssSize('14rem'),
		set: calculateColumns
	}),

	/**
	 * The margin to be applied to each tile in rem's
	 *
	 * @method tileMargin
	 * @member module:TileLayout
	 * @instance
	 *
	 * @param {string} [newTileMargin]
	 *
	 * @returns {string|this}
	 */
	tileMargin: methodCssSize({
		init: new CssSize('0.6rem'),
		set: calculateColumns
	}),

	/**
	 * Align the columns within the available area
	 *
	 * @method columnAlign
	 * @member module:TileLayout
	 * @instance
	 *
	 * @param {string} [columnAlign] - TILE_COLUMN_ALIGN
	 *
	 * @returns {string|this}
	 */
	columnAlign: methodEnum({
		enum: TILE_COLUMN_ALIGN,
		init: TILE_COLUMN_ALIGN.CENTER,
		set: calculateColumns
	}),

	/**
	 * The min number of columns to render
	 *
	 * @method minColumns
	 * @member module:TileLayout
	 * @instance
	 *
	 * @param {number} [minColumns]
	 *
	 * @returns {number|this}
	 */
	minColumns: methodInteger({
		init: 1,
		min: 1,
		set: calculateColumns
	}),

	/**
	 * The max number of columns to render
	 *
	 * @method maxColumns
	 * @member module:TileLayout
	 * @instance
	 *
	 * @param {number} [maxColumns]
	 *
	 * @returns {number|this}
	 */
	maxColumns: methodInteger({
		init: 10,
		min: 1,
		set: calculateColumns
	}),

	/**
	 * A control to render for each tile. Use this if you need to render a large number of tiles,
	 * otherwise use .content()
	 *
	 * @method tileControl
	 * @member module:TileLayout
	 * @instance
	 *
	 * @param {object} [tileControl]
	 *
	 * @returns {object|this}
	 */
	tileControl: methodFunction({
		set(tileControl) {
			this[CONTROL_RECYCLER].control(tileControl);
		}
	}),

	/**
	 * The default settings that are used whenever a list item control is
	 * instantiated.
	 *
	 * @method tileDefaultSettings
	 * @member module:TileLayout
	 * @instance
	 *
	 * @param {object} [tileDefaultSettings]
	 *
	 * @returns {object|this}
	 */
	tileDefaultSettings: methodObject({
		set(defaultSettings) {
			this[CONTROL_RECYCLER].defaultSettings(defaultSettings);
		},
		other: undefined
	}),

	/**
	 * A callback function that gets executed whenever a tile is rendered. This is only used
	 * if .tileControl() is provided.
	 *
	 * @method onTileRender
	 * @member module:TileLayout
	 * @instance
	 *
	 * @param {Function} callback
	 *
	 * @returns {Function|this}
	 */
	onTileRender: methodFunction({
		set: calculateColumns,
		other: undefined
	}),

	/**
	 * The data for the tiles. Setting new data forces a refresh of the layout.
	 *
	 * @method tileData
	 * @member module:TileLayout
	 * @instance
	 *
	 * @param {object[]} [tileData]
	 *
	 * @returns {object[]|this}
	 */
	tileData: methodArray({
		set() {
			const self = this;

			self[IS_VIRTUALIZED] = true;
			self[onNewContent]();
		}
	}),

	/**
	 * Get or set the amount controls to render beyond the visible viewport (as a ratio of
	 * the items rendered within the viewport).
	 *
	 * @method extraRenderedItemsRatio
	 * @member module:TileLayout
	 * @instance
	 *
	 * @param {number} [newExtraRenderedItemsRatio]
	 *
	 * @returns {object|this}
	 */
	extraRenderedItemsRatio: methodNumber({
		init: 1,
		set() {
			const self = this;

			self[setScrollPositions]();
			self[calculateColumns]();
		},
		min: 0
	}),

	/**
	 * Force a relayout of the tiles
	 *
	 * @method refresh
	 * @member module:TileLayout
	 * @instance
	 */
	refresh: throttle(function() {
		const self = this;

		self[PREVIOUS_COLUMN_COUNT] = 0;
		self[calculateColumns]();
	}, 100)
});
