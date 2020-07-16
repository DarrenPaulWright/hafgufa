import { applySettings, AUTO, methodThickness, Thickness } from 'type-enforcer-ui';
import Control from '../Control.js';
import controlTypes from '../controlTypes.js';
import { HEADING_LEVELS } from '../elements/Heading.js';
import ControlHeadingMixin from '../mixins/ControlHeadingMixin.js';
import MergeContentContainerMixin from '../mixins/MergeContentContainerMixin.js';
import { MIN_WIDTH, PADDING } from '../utility/domConstants.js';
import setDefaults from '../utility/setDefaults.js';
import Container from './Container.js';
import './Group.less';

/**
 * Display a visual group with children form controls.
 *
 * @class Group
 * @extends Container
 * @constructor
 *
 * @param {object} settings
 */
export default class Group extends MergeContentContainerMixin(ControlHeadingMixin(Control)) {
	constructor(settings = {}) {
		super(setDefaults({
			type: controlTypes.GROUP,
			element: 'fieldset',
			headingLevel: HEADING_LEVELS.FOUR
		}, settings, {
			contentContainer: new Container()
		}));

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
	 * @param {string} [newPadding]
	 *
	 * @returns {string|this}
	 */
	padding: methodThickness({
		init: new Thickness('0.25rem 0.6rem 0.5rem'),
		set(padding) {
			this.contentContainer.css(PADDING, padding.toString());
		}
	})
});
