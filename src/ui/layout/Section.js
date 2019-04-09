import { enforce, HUNDRED_PERCENT, method, Thickness } from 'type-enforcer';
import dom from '../../utility/dom';
import { PADDING } from '../../utility/domConstants';
import objectHelper from '../../utility/objectHelper';
import controlTypes from '../controlTypes';
import { HEADING_LEVELS } from '../elements/Heading';
import ControlHeadingMixin from '../mixins/ControlHeadingMixin';
import Container from './Container';
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
export default class Section extends ControlHeadingMixin(Container) {
	constructor(settings = {}) {
		settings.type = settings.type || controlTypes.SECTION;
		settings.headingLevel = enforce.enum(settings.headingLevel, HEADING_LEVELS, HEADING_LEVELS.TWO);
		settings.width = enforce.cssSize(settings.width, HUNDRED_PERCENT, true);
		settings.canCollapse = enforce.boolean(settings.canCollapse, true);

		super(settings);

		this
			.element(dom.buildNew('', 'section'))
			.addClass('section clearfix')
			.removeClass('container');

		objectHelper.applySettings(this, settings, null, ['canCollapse']);
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
		set: function(padding) {
			dom.css(this.contentContainer(), PADDING, padding.toString());
		}
	})
});
