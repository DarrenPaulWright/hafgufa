import { applySettings, methodBoolean } from 'type-enforcer-ui';
import controlTypes from '../controlTypes.js';
import DragMixin from '../mixins/DragMixin.js';
import FocusMixin from '../mixins/FocusMixin.js';
import G from '../svg/G.js';
import Rect from '../svg/Rect.js';
import setDefaults from '../utility/setDefaults.js';
import './DragPoint.less';

export default class DragPoint extends FocusMixin(DragMixin(G)) {
	constructor(settings = {}) {
		super(setDefaults({
			type: controlTypes.DRAG_POINT,
			canDrag: true,
			restrictVerticalDrag: true,
			restrictHorizontalDrag: true,
			restrictDragToOrigin: true,
			fade: true
		}, settings));

		const self = this;
		self.addClass('drag-point');

		new Rect({
			container: self,
			classes: 'point'
		});

		new Rect({
			container: self,
			classes: 'hit-area'
		});

		applySettings(self, settings, ['restrictDragToOrigin']);
	}
}

Object.assign(DragPoint.prototype, {
	isCircle: methodBoolean({
		set(isCircle) {
			this.classes('circle', isCircle);
		}
	})
});
