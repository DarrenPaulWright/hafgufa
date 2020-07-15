import { applySettings, HUNDRED_PERCENT, methodThickness, Thickness } from 'type-enforcer-ui';
import Control from '../Control';
import controlTypes from '../controlTypes';
import { HEADING_LEVELS } from '../elements/Heading';
import ControlHeadingMixin from '../mixins/ControlHeadingMixin';
import MergeContentContainerMixin from '../mixins/MergeContentContainerMixin';
import { PADDING } from '../utility/domConstants';
import setDefaults from '../utility/setDefaults.js';
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
export default class Section extends MergeContentContainerMixin(ControlHeadingMixin(Control)) {
	constructor(settings = {}) {
		super(setDefaults({
			type: controlTypes.SECTION,
			element: 'section',
			headingLevel: HEADING_LEVELS.TWO,
			width: HUNDRED_PERCENT,
			canCollapse: true
		}, settings, {
			contentContainer: new Container()
		}));

		this.addClass('section');

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
	padding: methodThickness({
		init: new Thickness('1.25rem'),
		set(padding) {
			this.contentContainer.css(PADDING, padding.toString());
		}
	})
});
