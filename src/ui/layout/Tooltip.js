import { select } from 'd3';
import { applySettings, DockPoint } from 'type-enforcer';
import { EMPTY_STRING, MOUSE_WHEEL_EVENT, SPACE, WINDOW } from '../../utility/domConstants';
import Container from '../layout/Container';
import Popup from '../layout/Popup';
import DelayedRenderMixin from '../mixins/DelayedRenderMixin';
import Removable from '../mixins/Removable';
import './Tooltip.less';

const TOOLTIP_CLASS = 'tooltip';
const CONTENT_CLASS = 'tooltip-content';

const POPUP = Symbol();
const CONTENT_CONTAINER = Symbol();

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
		settings.onRender = () => {
			const initialContent = settings.content;
			delete settings.content;

			select(WINDOW).on(MOUSE_WHEEL_EVENT, () => self.remove());

			self[POPUP] = new Popup({
				anchor: Popup.MOUSE,
				anchorDockPoint: settings.anchorDockPoint || DockPoint.POINTS.TOP_CENTER,
				popupDockPoint: settings.tooltipDockPoint || DockPoint.POINTS.BOTTOM_CENTER,
				fade: true,
				showArrow: true,
				...settings,
				classes: TOOLTIP_CLASS + SPACE + (settings.classes || EMPTY_STRING)
			});

			self.content(initialContent);

			self[POPUP]
				.onRemove(() => {
					select(WINDOW).on(MOUSE_WHEEL_EVENT, null);
				})
				.resize();
		};

		super(settings);

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
		const self = this;

		if (!self.isRemoved && this[POPUP]) {
			if (!self[CONTENT_CONTAINER]) {
				self[CONTENT_CONTAINER] = new Container({
					classes: CONTENT_CLASS
				});
				self[POPUP].append(self[CONTENT_CONTAINER]);
			}

			self[CONTENT_CONTAINER].content(content);
		}
	}

	resize() {
		if (this[POPUP]) {
			this[POPUP].resize();
		}
	}
}
