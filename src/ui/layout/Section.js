import { applySettings, enforce, HUNDRED_PERCENT, method, Thickness } from 'type-enforcer';
import { PADDING } from '../../utility/domConstants';
import Control from '../Control';
import controlTypes from '../controlTypes';
import { HEADING_LEVELS } from '../elements/Heading';
import ControlHeadingMixin from '../mixins/ControlHeadingMixin';
import MergeContentContainerMixin from '../mixins/MergeContentContainerMixin';
import './Section.less';

/**
 * Display a visual section (collapsible or not) with children controls.
 *
 * @class Section
 * @extends Container
 * @constructor
 *
 * @param {Object} settings
 */
export default class Section extends MergeContentContainerMixin(ControlHeadingMixin(Control)) {
	constructor(settings = {}) {
		settings.type = settings.type || controlTypes.SECTION;
		settings.element = 'section';
		settings.headingLevel = enforce.enum(settings.headingLevel, HEADING_LEVELS, HEADING_LEVELS.TWO);
		settings.width = enforce.cssSize(settings.width, HUNDRED_PERCENT, true);
		settings.canCollapse = enforce.boolean(settings.canCollapse, true);

		super(settings);

		this
			.addClass('section')
			.removeClass('container');

		applySettings(this, settings, ['canCollapse']);
	}
}

Object.assign(Section.prototype, {
	/**
	 * Get or set the padding of the content container.
	 *
	 * @method padding
	 * @member module:Section
	 * @instance
	 *
	 * @param {String} [newPadding]
	 *
	 * @returns {String|this}
	 */
	padding: method.thickness({
		init: new Thickness('1.25rem'),
		set(padding) {
			this.contentContainer.css(PADDING, padding.toString());
		}
	})
});
