import { applySettings, DockPoint } from 'type-enforcer-ui';
import Popup from '../layout/Popup.js';
import DelayedRenderMixin from '../mixins/DelayedRenderMixin.js';
import Removable from '../mixins/Removable.js';
import assign from '../utility/assign.js';
import { EMPTY_STRING, MOUSE_WHEEL_EVENT, SPACE, WINDOW } from '../utility/domConstants.js';
import './Tooltip.less';

const TOOLTIP_CLASS = 'tooltip';

const POPUP = Symbol();

/**
 * Displays a tooltip anchored to an object or the mouse.
 *
 * @module Tooltip
 * @class
 *
 * @param {object}    settings
 * @param {string}    settings.anchor
 * @param {DockPoint} settings.anchorDockPoint
 * @param {DockPoint} settings.tooltipDockPoint
 * @param {string}    settings.content
 * @param {string}    [settings.title]
 * @param {string}    [settings.classes]
 * @param {string}    [settings.maxWidth]
 * @param {number}    [settings.delay=0.2] - Number of seconds before showing the tooltip. If remove is called before
 *    the delay is done then the popup will never be built.
 */
export default class Tooltip extends DelayedRenderMixin(Removable) {
	constructor(settings = {}) {
		const windowScrollEvent = () => self.remove();

		super(assign(settings, {
			onRender() {
				WINDOW.addEventListener(MOUSE_WHEEL_EVENT, windowScrollEvent);

				self[POPUP] = new Popup({
					anchor: Popup.MOUSE,
					anchorDockPoint: DockPoint.POINTS.TOP_CENTER,
					popupDockPoint: DockPoint.POINTS.BOTTOM_CENTER,
					fade: true,
					showArrow: true,
					...settings,
					classes: TOOLTIP_CLASS + SPACE + (settings.classes || EMPTY_STRING)
				});

				self[POPUP]
					.onRemove(() => {
						WINDOW.removeEventListener(MOUSE_WHEEL_EVENT, windowScrollEvent);
					})
					.resize(true);
			}
		}));

		const self = this;

		applySettings(self, settings);

		self.onRemove(() => {
			if (self[POPUP]) {
				self[POPUP].remove();
				self[POPUP] = null;
			}
		});
	}

	content(content) {
		if (this[POPUP]) {
			return this[POPUP].content(content);
		}
	}

	resize(forceResize) {
		if (this[POPUP]) {
			this[POPUP].resize(forceResize);
		}
	}
}
