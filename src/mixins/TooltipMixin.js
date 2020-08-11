import { throttle } from 'async-agent';
import { DockPoint, methodAny, methodDockPoint } from 'type-enforcer-ui';
import Tooltip from '../layout/Tooltip.js';
import { MOUSE_ENTER_EVENT, MOUSE_LEAVE_EVENT } from '../utility/domConstants.js';

const EVENT_SUFFIX = '.tooltip';

const TOOLTIP = Symbol();
const ON_DRAG_ID = Symbol();
const ON_DRAG_END_ID = Symbol();

const showTooltip = Symbol();
const removeTooltip = Symbol();

/**
 * Adds a tooltip method to a control.
 *
 * @mixin TooltipMixin
 *
 * @param {Function} Base - The class to extend
 */
export default (Base) => {
	class TooltipMixin extends Base {
		constructor(settings = {}) {
			super(settings);

			const self = this;

			self[showTooltip] = throttle(() => {
				if (!self[TOOLTIP]) {
					self[TOOLTIP] = new Tooltip({
						content: self.tooltip(),
						anchor: self,
						anchorDockPoint: self.tooltipDockPoint().opposite,
						tooltipDockPoint: self.tooltipDockPoint(),
						onRemove() {
							self[TOOLTIP] = null;
						}
					});
				}
				else {
					self[TOOLTIP].resize(true);
				}
			}, 50);
			self[removeTooltip] = () => {
				if (self[TOOLTIP] && !self.isDragging) {
					self[TOOLTIP].remove();
				}
			};
		}
	}

	Object.assign(TooltipMixin.prototype, {
		tooltip: methodAny({
			set(tooltip) {
				const self = this;

				if (tooltip) {
					self.on(MOUSE_ENTER_EVENT + EVENT_SUFFIX, self[showTooltip])
						.on(MOUSE_LEAVE_EVENT + EVENT_SUFFIX, self[removeTooltip]);

					if (self.onDrag !== undefined) {
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

					if (self.onDrag !== undefined) {
						self.onDrag().discard(self[ON_DRAG_ID]);
						self.onDragEnd().discard(self[ON_DRAG_END_ID]);
					}

					self[removeTooltip]();
				}
			}
		}),

		tooltipDockPoint: methodDockPoint({
			init: new DockPoint(DockPoint.POINTS.LEFT_CENTER)
		})
	});

	return TooltipMixin;
};
