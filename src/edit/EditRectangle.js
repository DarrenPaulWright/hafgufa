import { applySettings, PrivateVars } from 'type-enforcer-ui';
import controlTypes from '../controlTypes.js';
import Rect from '../svg/Rect.js';
import setDefaults from '../utility/setDefaults.js';
import Shape, { initDragPoint } from './Shape.js';

const _ = new PrivateVars();

export default class EditRectangle extends Shape {
	constructor(settings = {}) {
		super(setDefaults({
			type: controlTypes.EDIT_RECTANGLE
		}, settings));

		const self = this;

		_.set(self, {
			rect: new Rect({
				container: self,
				x: '0.5px',
				y: '0.5px'
			})
		});

		const _self = _(self);

		self
			.onSelect((isSelected) => {
				if (isSelected) {
					_self.topLeft = self[initDragPoint]('nw-resize', (offset) => {
						self.bounds([offset, _self.bottomRight.position()]);
					});
					_self.topRight = self[initDragPoint]('ne-resize', (offset) => {
						self.bounds([offset, _self.bottomLeft.position()]);
					});
					_self.bottomLeft = self[initDragPoint]('sw-resize', (offset) => {
						self.bounds([offset, _self.topRight.position()]);
					});
					_self.bottomRight = self[initDragPoint]('se-resize', (offset) => {
						self.bounds([offset, _self.topLeft.position()]);
					});
				}
				else {
					_self.topLeft.remove();
					_self.topRight.remove();
					_self.bottomRight.remove();
					_self.bottomLeft.remove();
				}
			})
			.onResize(() => {
				const bounds = self.bounds();
				const top = bounds[0].y;
				const left = bounds[0].x;
				const right = bounds[1].x;
				const bottom = bounds[1].y;

				_self.rect
					.width(right - left)
					.height(bottom - top);

				if (_self.bottomRight) {
					_self.topLeft.position(left, top);
					_self.topRight.position(right, top);
					_self.bottomRight.position(right, bottom);
					_self.bottomLeft.position(left, bottom);
				}
			})
			.onRemove(() => {
				if (_self.topLeft) {
					_self.topLeft.remove();
					_self.topRight.remove();
					_self.bottomRight.remove();
					_self.bottomLeft.remove();
				}
			});

		applySettings(self, settings);
	}
}
