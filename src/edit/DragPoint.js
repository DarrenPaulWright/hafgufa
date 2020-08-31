import { set } from 'object-agent';
import { applySettings, methodBoolean } from 'type-enforcer-ui';
import controlTypes from '../controlTypes.js';
import DragMixin from '../mixins/DragMixin.js';
import FocusMixin from '../mixins/FocusMixin.js';
import G from '../svg/G.js';
import Rect from '../svg/Rect.js';
import assign from '../utility/assign.js';
import { TAB_INDEX, TAB_INDEX_ENABLED } from '../utility/domConstants.js';
import setDefaults from '../utility/setDefaults.js';
import './DragPoint.less';

/**
 * @class DragPoint
 * @mixes FocusMixin
 * @mixes DragMixin
 * @extends G
 *
 * @param {object} [settings]
 */
export default class DragPoint extends FocusMixin(DragMixin(G)) {
	constructor(settings = {}) {
		super(setDefaults({
			type: controlTypes.DRAG_POINT,
			canDrag: true,
			restrictVerticalDrag: true,
			restrictHorizontalDrag: true,
			restrictDragToOrigin: true,
			fade: true
		}, settings, {
			FocusMixin: assign(settings.FocusMixin, {
				mainControl: new Rect({
					classes: 'hit-area',
					attr: set({}, TAB_INDEX, TAB_INDEX_ENABLED)
				})
			})
		}));

		const self = this;
		self.addClass('drag-point');

		new Rect({
			container: self,
			classes: 'point'
		});

		settings.FocusMixin.mainControl.container(self);

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
