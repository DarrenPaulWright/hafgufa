import shortid from 'shortid';
import { applySettings, Enum, methodEnum, methodFunction, Point } from 'type-enforcer-ui';
import ControlManager from '../ControlManager';
import controlTypes from '../controlTypes';
import { DELETE_ALL_ICON, DELETE_ICON } from '../icons';
import ContextMenuMixin from '../mixins/ContextMenuMixin';
import Svg from '../svg/Svg';
import EditPolygon from './EditPolygon.js';
import EditRectangle from './EditRectangle';
import './VectorEditor.less';

const HEIGHT = Symbol();
const WIDTH = Symbol();
const START = Symbol();
const CURRENT_SHAPE = Symbol();
const CONTROLS = Symbol();
const VALUE = Symbol();
const EDIT_MODES = new Enum({
	rectangle: 'rectangle',
	polygon: 'polygon'
});

const pixelsToRatios = Symbol();
const ratiosToPixels = Symbol();

const startDrawing = Symbol();
const updateDrawing = Symbol();
const stopDrawing = Symbol();

export default class VectorEditor extends ContextMenuMixin(Svg) {
	constructor(settings = {}) {
		settings.type = settings.type || controlTypes.VECTOR_EDITOR;

		super(settings);

		const self = this;
		self[VALUE] = [];
		self.addClass('vector-editor');

		self[CONTROLS] = new ControlManager();

		self.contextMenu([{
			id: 'deleteAll',
			title: 'Delete all',
			icon: DELETE_ALL_ICON,
			onSelect() {
				self.onDeleteAllShapes()();
			}
		}]);

		self.onResize((width, height) => {
				self[HEIGHT] = height;
				self[WIDTH] = width;

				self[CONTROLS].each((control) => {
					if (control.originalBounds) {
						control.bounds(self[ratiosToPixels](control.originalBounds));
					}
				});
			})
			.on('mousedown', (event) => {
				event.preventDefault();
				event.stopPropagation();

				if (
					self.editMode() === EDIT_MODES.polygon &&
					self[CURRENT_SHAPE] instanceof EditPolygon &&
					!self[CURRENT_SHAPE].isClosed
				) {
					self[CURRENT_SHAPE].addPoint([event.offsetX, event.offsetY]);
				}
				else {
					self[startDrawing](event);
				}
			});

		applySettings(self, settings);

		self.resize();
	}

	[pixelsToRatios](value) {
		const self = this;
		const change = new Point({
			x: 1 / self[WIDTH],
			y: 1 / self[HEIGHT]
		});

		return value.map((point) => point.multiply(change));
	}

	[ratiosToPixels](value) {
		const self = this;
		const change = new Point({
			x: self[WIDTH],
			y: self[HEIGHT]
		});

		return value.map((point) => point.multiply(change));
	}

	[startDrawing](event) {
		const self = this;

		self[CONTROLS].each((control) => {
			control.ignore(true);
		});

		self[START] = new Point(event.offsetX, event.offsetY);

		if (self.editMode() === EDIT_MODES.rectangle) {
			self[CURRENT_SHAPE] = new EditRectangle({
				container: self,
				onChange() {
					self.onChange()(this.id(), 'rectangle', self[pixelsToRatios](this.bounds()));
				}
			});
		}
		else if (self.editMode() === EDIT_MODES.polygon) {
			self[CURRENT_SHAPE] = new EditPolygon({
				container: self,
				onChange() {
					self.onChange()(this.id(), 'polygon', self[pixelsToRatios](this.points()));
				},
				points: self[START].toString()
			});
		}
		self[CURRENT_SHAPE].originalBounds = null;
		self[CURRENT_SHAPE]
			.container(self)
			.isFocused(true)
			.id(shortid.generate());

		self[CONTROLS].add(self[CURRENT_SHAPE]);

		self[updateDrawing](event);

		self.on('mousemove', (event) => {
				event.preventDefault();
				event.stopPropagation();

				self[updateDrawing](event);
			})
			.on('mouseup', (event) => {
				event.preventDefault();
				event.stopPropagation();

				self[stopDrawing]();

				self.off('mousemove')
					.off('mouseup');
			});
	}

	[updateDrawing](event) {
		const self = this;

		if (self.editMode() === EDIT_MODES.rectangle) {
			self[CURRENT_SHAPE]
				.bounds([{
					x: event.offsetX,
					y: event.offsetY
				}, self[START]]);
		}
	}

	[stopDrawing]() {
		const self = this;

		if (self.editMode() === EDIT_MODES.rectangle) {
			if (self[CURRENT_SHAPE].borderWidth() < 10 && self[CURRENT_SHAPE].borderHeight() < 10) {
				self[CONTROLS].discard(self[CURRENT_SHAPE].id());
			}
			else {
				self[HEIGHT] = self.borderHeight();
				self[WIDTH] = self.borderWidth();
				self[CURRENT_SHAPE].originalBounds = self[pixelsToRatios](self[CURRENT_SHAPE].bounds());

				if (self.editMode() === EDIT_MODES.rectangle) {
					self.onAdd()(self[CURRENT_SHAPE].id(), 'rectangle', self[CURRENT_SHAPE].originalBounds);
				}
				else if (self.editMode() === EDIT_MODES.polygon) {
					self.onAdd()(self[CURRENT_SHAPE].id(), 'polygon', self[CURRENT_SHAPE].points);
				}
			}
		}

		self[CONTROLS].each((control) => {
			control.ignore(false);
		});
	}

	value(value) {
		const self = this;

		self[CONTROLS].remove();

		self[VALUE] = value;

		self[VALUE].forEach((shape) => {
			const settings = {
				container: self,
				id: shape.id,
				contextMenu: [{
					id: 'delete',
					title: 'Delete',
					icon: DELETE_ICON,
					onSelect() {
						self.onDeleteShape()(shape.id);
					}
				}],
				onMouseEnter() {
					self.onHighlight()(this.id());
				},
				onMouseLeave() {
					self.onHighlight()();
				},
				originalBounds: shape.bounds
			};
			let control;

			if (shape.bounds) {
				control = new EditRectangle({
					...settings,
					onChange() {
						self.onChange()(this.id(), self[pixelsToRatios](this.bounds()));
					},
					bounds: self[ratiosToPixels](shape.bounds)
				});
			}
			else if (shape.polygon) {
				control = new EditPolygon({
					...settings,
					onChange() {
						self.onChange()(this.id(), self[pixelsToRatios](this.bounds()));
					},
					points: self[ratiosToPixels](shape.points)
				});
			}

			self[CONTROLS].add(control);
		});
	}

	highlight(id) {
		const isFade = id === null;

		this[CONTROLS].each((control) => {
			const isHighlight = control.id() === id;
			control
				.classes('highlight', isHighlight)
				.classes('faded', !isHighlight && !isFade);
		});
	}
}

Object.assign(VectorEditor.prototype, {
	editMode: methodEnum({
		enum: EDIT_MODES,
		init: EDIT_MODES.rectangle
	}),
	onChange: methodFunction(),
	onAdd: methodFunction(),
	onDeleteShape: methodFunction(),
	onDeleteAllShapes: methodFunction(),
	onHighlight: methodFunction()
});
