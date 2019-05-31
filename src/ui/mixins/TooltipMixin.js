import { DockPoint, method } from 'type-enforcer';
import { MOUSE_ENTER_EVENT, MOUSE_LEAVE_EVENT } from '../../utility/domConstants';
import Tooltip from '../layout/Tooltip';

const TOOLTIP = Symbol();

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
	}

	Object.assign(TooltipMixin.prototype, {
		tooltip: method.string({
			set: function(tooltip) {
				const self = this;

				const showTooltip = () => {
					self[TOOLTIP] = new Tooltip({
						content: tooltip,
						anchor: self.element(),
						anchorDockPoint: self.tooltipDockPoint().opposite,
						tooltipDockPoint: self.tooltipDockPoint(),
						onRemove: () => {
							self[TOOLTIP] = null;
						}
					});
				};

				const removeTooltip = () => {
					if (self[TOOLTIP]) {
						self[TOOLTIP].remove();
					}
				};

				self
					.on(MOUSE_ENTER_EVENT + '.tooltip', tooltip ? showTooltip : null)
					.on(MOUSE_LEAVE_EVENT + '.tooltip', tooltip ? removeTooltip : null);
			}
		}),

		tooltipDockPoint: method.enum({
			enum: DockPoint.POINTS,
			init: DockPoint.POINTS.LEFT_CENTER
		})
	});

	return TooltipMixin;
};
