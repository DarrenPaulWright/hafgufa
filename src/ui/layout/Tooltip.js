import { select } from 'd3';
import { DockPoint } from 'type-enforcer';
import dom from '../../utility/dom';
import { EMPTY_STRING, MOUSE_WHEEL_EVENT, SPACE, WINDOW } from '../../utility/domConstants';
import objectHelper from '../../utility/objectHelper';
import Popup from '../layout/Popup';
import DelayedRenderMixin from '../mixins/DelayedRenderMixin';
import Removable from '../mixins/Removable';
import './Tooltip.less';

const TOOLTIP_CLASS = 'tooltip';
const CONTENT_CLASS = 'tooltip-content';

const POPUP = Symbol();

/**
 * <p>Displays a tooltip anchored to an object or the mouse.</p>
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

			select(WINDOW).on(MOUSE_WHEEL_EVENT, self.remove);

			self[POPUP] = new Popup(Object.assign({}, {
				anchor: Popup.MOUSE,
				anchorDockPoint: DockPoint.POINTS.TOP_CENTER,
				popupDockPoint: DockPoint.POINTS.BOTTOM_CENTER,
				fade: true,
				showArrow: true
			}, settings, {
				classes: TOOLTIP_CLASS + SPACE + (settings.classes || EMPTY_STRING)
			}));

			self.content(initialContent);

			self[POPUP].onRemove(() => {
				select(WINDOW).on(MOUSE_WHEEL_EVENT, null);
			});
		};

		super(settings);

		const self = this;

		objectHelper.applySettings(self, settings);

		self.onRemove(() => {
			if (self[POPUP]) {
				self[POPUP].remove();
				self[POPUP] = null;
			}
		});
	}

	content(content) {
		if (this[POPUP] && content) {
			const element = dom.buildNew(CONTENT_CLASS);
			dom.content(element, content);
			this[POPUP].content(element);
			this[POPUP].resize(true);
		}
	}
}
