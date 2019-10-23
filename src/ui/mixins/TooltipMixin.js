import { DockPoint, method } from 'type-enforcer';
import { MOUSE_ENTER_EVENT, MOUSE_LEAVE_EVENT } from '../../utility/domConstants';
import Tooltip from '../layout/Tooltip';

const EVENT_SUFFIX = '.tooltip';

const TOOLTIP = Symbol();
const ON_DRAG_ID = Symbol();
const ON_DRAG_END_ID = Symbol();

const showTooltip = Symbol();
const removeTooltip = Symbol();

/**
 * Adds a tooltip method to a control
 *
 * @mixin TooltipMixin
 * @constructor
 */
export default (Base) => {
	class TooltipMixin extends Base {
		constructor(settings = {}) {
			super(settings);

			const self = this;
			self.onRemove(() => {
				self.tooltip('');
			});
		}

		[showTooltip]() {
			const self = this;

			if (!self[TOOLTIP]) {
				self[TOOLTIP] = new Tooltip({
					content: self.tooltip(),
					anchor: self.element(),
					anchorDockPoint: self.tooltipDockPoint().opposite,
					tooltipDockPoint: self.tooltipDockPoint(),
					onRemove() {
						self[TOOLTIP] = null;
					}
				});
			}
			else {
				self[TOOLTIP].resize();
			}
		}

		[removeTooltip]() {
			const self = this;

			if (self[TOOLTIP] && !self.isDragging) {
				self[TOOLTIP].remove();
			}
		}
	}

	Object.assign(TooltipMixin.prototype, {
		tooltip: method.any({
			set(tooltip) {
				const self = this;

				const show = () => {
					self[showTooltip]();
				};

				const remove = () => {
					self[removeTooltip]();
				};

				if (tooltip) {
					self.on(MOUSE_ENTER_EVENT + EVENT_SUFFIX, show)
						.on(MOUSE_LEAVE_EVENT + EVENT_SUFFIX, remove);

					if (self.onDrag) {
						self[ON_DRAG_ID] = self.onDrag(self[showTooltip]);
						self[ON_DRAG_END_ID] = self.onDragEnd(self[removeTooltip]);
					}

					if (self[TOOLTIP]) {
						self[TOOLTIP].content(tooltip);
					}
				}
				else {
					self.off(MOUSE_ENTER_EVENT + EVENT_SUFFIX)
						.off(MOUSE_LEAVE_EVENT + EVENT_SUFFIX);

					if (self.onDrag) {
						self.onDrag().discard(self[ON_DRAG_ID]);
						self.onDragEnd().discard(self[ON_DRAG_END_ID]);
					}

					remove();
				}
			}
		}),

		tooltipDockPoint: method.dockPoint({
			init: new DockPoint(DockPoint.POINTS.LEFT_CENTER)
		})
	});

	return TooltipMixin;
};
