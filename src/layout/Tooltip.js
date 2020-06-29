import { applySettings, DockPoint } from 'type-enforcer-ui';
import Popup from '../layout/Popup';
import DelayedRenderMixin from '../mixins/DelayedRenderMixin';
import Removable from '../mixins/Removable';
import { EMPTY_STRING, MOUSE_WHEEL_EVENT, SPACE, WINDOW } from '../utility/domConstants';
import './Tooltip.less';

const TOOLTIP_CLASS = 'tooltip';

const POPUP = Symbol();

/**
 * Displays a tooltip anchored to an object or the mouse.
 * @module Tooltip
 * @constructor
 *
 * @arg {Object}    settings
 * @arg {String}    settings.anchor
 * @arg {DockPoint} settings.anchorDockPoint
 * @arg {DockPoint} settings.tooltipDockPoint
 * @arg {String}    settings.content
 * @arg {String}    [settings.title]
 * @arg {String}    [settings.classes]
 * @arg {String}    [settings.maxWidth]
 * @arg {Number}    [settings.delay=0.2] - Number of seconds before showing the tooltip. If remove is called before
 *    the delay is done then the popup will never be built.
 */
export default class Tooltip extends DelayedRenderMixin(Removable) {
	constructor(settings = {}) {
		const windowScrollEvent = () => self.remove();

		super({
			...settings,
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
		});

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
