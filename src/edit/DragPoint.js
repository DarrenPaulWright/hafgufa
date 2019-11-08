import { applySettings, methodBoolean } from 'type-enforcer-ui';
import controlTypes from '../controlTypes';
import DragMixin from '../mixins/DragMixin';
import FocusMixin from '../mixins/FocusMixin';
import G from '../svg/G';
import Rect from '../svg/Rect';
import './DragPoint.less';

export default class DragPoint extends FocusMixin(DragMixin(G)) {
	constructor(settings = {}) {
		settings.type = settings.type = controlTypes.DRAG_POINT;
		settings.canDrag = true;
		settings.restrictVerticalDrag = true;
		settings.restrictHorizontalDrag = true;
		settings.fade = true;

		super(settings);

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

		applySettings(self, settings);
	}
}

Object.assign(DragPoint.prototype, {
	isCircle: methodBoolean({
		set(isCircle) {
			this.classes('circle', isCircle);
		}
	})
});
