import { AUTO, method, Thickness } from 'type-enforcer';
import dom from '../../utility/dom';
import { MIN_WIDTH, PADDING } from '../../utility/domConstants';
import objectHelper from '../../utility/objectHelper';
import controlTypes from '../controlTypes';
import { HEADING_LEVELS } from '../elements/Heading';
import ControlHeadingMixin from '../mixins/ControlHeadingMixin';
import Container from './Container';
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
export default class Group extends ControlHeadingMixin(Container) {
	constructor(settings = {}) {
		settings.type = settings.type || controlTypes.GROUP;
		settings.element = dom.buildNew('', 'fieldset');
		settings.headingLevel = HEADING_LEVELS.FOUR;

		super(settings);

		this.addClass('group clearfix')
			.css(MIN_WIDTH, AUTO);

		objectHelper.applySettings(this, settings);
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
		set: function(newValue) {
			this.contentContainer().css(PADDING, newValue.toString());
		}
	})
});
