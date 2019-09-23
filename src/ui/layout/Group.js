import { applySettings, AUTO, method, Thickness } from 'type-enforcer';
import { MIN_WIDTH, PADDING } from '../../utility/domConstants';
import Control from '../Control';
import controlTypes from '../controlTypes';
import { HEADING_LEVELS } from '../elements/Heading';
import ControlHeadingMixin from '../mixins/ControlHeadingMixin';
import MergeContentContainerMixin from '../mixins/MergeContentContainerMixin';
import './Group.less';

/**
 * Display a visual group with children form controls.
 *
 * @class Group
 * @extends Container
 * @constructor
 *
 * @param {Object} settings
 */
export default class Group extends MergeContentContainerMixin(ControlHeadingMixin(Control)) {
	constructor(settings = {}) {
		settings.type = settings.type || controlTypes.GROUP;
		settings.element = 'fieldset';
		settings.headingLevel = HEADING_LEVELS.FOUR;

		super(settings);

		this
			.addClass('group clearfix')
			.css(MIN_WIDTH, AUTO);

		applySettings(this, settings);
	}
}

Object.assign(Group.prototype, {
	/**
	 * Get or set the padding of the content container.
	 *
	 * @method padding
	 * @member module:Group
	 * @instance
	 *
	 * @param {String} [newPadding]
	 *
	 * @returns {String|this}
	 */
	padding: method.thickness({
		init: new Thickness('0.25rem 0.6rem 0.5rem'),
		set(padding) {
			this.contentContainer.css(PADDING, padding.toString());
		}
	})
});
