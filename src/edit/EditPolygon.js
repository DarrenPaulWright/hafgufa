import { Path as Pathinator } from 'pathinator';
import origin from 'pathinator/src/utility/origin.js';
import { applySettings, Point, PrivateVars } from 'type-enforcer-ui';
import controlTypes from '../controlTypes.js';
import Path from '../svg/Path.js';
import setDefaults from '../utility/setDefaults.js';
import Shape, { initDragPoint } from './Shape.js';

const _ = new PrivateVars();

const updatePoint = Symbol();
const updatePath = Symbol();
const updateBounds = Symbol();
const addDragPoints = Symbol();
const removeDragPoints = Symbol();
const addDragEvents = Symbol();

export default class EditPolygon extends Shape {
	constructor(settings = {}) {
		super(setDefaults({
			type: controlTypes.EDIT_POLYGON
		}, settings));

		const self = this;

		const _self = _.set(self, {
			path: new Path({
				container: self
			}),
			pathinator: new Pathinator(),
			dragPoints: []
		});

		self
			.onSelect((isSelected) => {
				if (isSelected) {
					this[updatePath]();
				}
				else {
					this[removeDragPoints]();
				}
			})
			.onResize(() => {
				const min = self.bounds()[0];
				const position = _self.dragStartPosition || min;

				min.x = position.x - min.x;
				min.y = position.y - min.y;

				if (_self.dragPoints.length !== 0) {
					_self.pathinator
						.eachPoint((point, isControlPoint, index) => {
							if (_self.dragPoints[index] && !isControlPoint) {
								_self.dragPoints[index].position(point.x - min.x, point.y - min.y);
							}
						});
				}
			});

		applySettings(self, settings);

		self[addDragEvents]();
		this[updatePath]();
	}

	[addDragEvents]() {
		const self = this;
		const _self = _(self);
		let isClick = true;
		let eventOffset;

		self
			.onDragStart((event) => {
				eventOffset = new Point(event.offsetX, event.offsetY);
				_self.dragStartPosition = self.position();
			})
			.onDrag(() => {
				isClick = false;
			})
			.onDragEnd(() => {
				if (isClick) {
					self.addPoint(eventOffset);
				}
				else {
					const offset = self.position().subtract(_self.dragStartPosition);

					_self.pathinator
						.transform({
							translate: offset
						});
					_self.dragStartPosition = null;
					self[updatePath]();
					isClick = true;
				}
			});
	}

	[updatePoint](index, offset) {
		const self = this;
		const _self = _(self);

		_self.pathinator
			.update(index, [offset.x, offset.y])
			.export({
				translate: origin.subtract(self.position())
			})
			.then((data) => {
				_self.path.data(data);
				self[updateBounds]();
			});
	}

	[updatePath]() {
		const self = this;
		const _self = _(self);

		self[updateBounds]();

		_self.pathinator
			.export({
				translate: origin.subtract(self.position())
			})
			.then((data) => {
				_self.path.data(data);
				this[addDragPoints]();
			});
	}

	[updateBounds]() {
		const _self = _(this);
		const min = new Point(Infinity, Infinity);
		const max = new Point(0, 0);

		_self.pathinator
			.eachPoint((point) => {
				if (point.x < min.x) {
					min.x = point.x;
				}
				if (point.x > max.x) {
					max.x = point.x;
				}
				if (point.y < min.y) {
					min.y = point.y;
				}
				if (point.y > max.y) {
					max.y = point.y;
				}
			});

		this.bounds([min, max]);
	}

	[addDragPoints]() {
		if (this.isSelected()) {
			const self = this;
			const _self = _(self);

			this[removeDragPoints]();

			_self.pathinator
				.eachPoint((point, isControlPoint, index) => {
					if (!isControlPoint && !_self.dragPoints[index]) {
						_self.dragPoints[index] = self[initDragPoint]('move', (offset) => {
							self[updatePoint](index, offset);
						});
					}
				});

			self.resize(true);
		}
	}

	[removeDragPoints]() {
		const _self = _(this);

		_self.dragPoints.forEach((dragPoint) => {
			dragPoint.remove();
		});
		_self.dragPoints = [];
	}

	points(points) {
		const _self = _(this);

		if (arguments.length) {
			_self.pathinator.import(points);
			this[updatePath]();

			return this;
		}

		return _self.pathinator.export({
			toPolygon: true
		});
	}

	addPoint(...args) {
		const _self = _(this);

		_self.pathinator.line(...args, true);
		this[updatePath]();
	}

	get isClosed() {
		return false;
	}
}
