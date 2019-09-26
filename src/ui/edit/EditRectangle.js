import { applySettings } from 'type-enforcer';
import PrivateVars from '../../utility/PrivateVars';
import controlTypes from '../controlTypes';
import Rect from '../svg/Rect';
import Shape, { initDragPoint } from './Shape';

const _ = new PrivateVars();

export default class EditRectangle extends Shape {
	constructor(settings = {}) {
		settings.type = settings.type || controlTypes.EDIT_RECTANGLE;

		super(settings);

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
			});

		applySettings(self, settings);
	}
}
