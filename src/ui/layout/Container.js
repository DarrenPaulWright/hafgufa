import { applySettings, method } from 'type-enforcer';
import { TAB_INDEX, TAB_INDEX_DISABLED, TAB_INDEX_ENABLED } from '../../utility/domConstants';
import controlTypes from '../controlTypes';
import Div from '../elements/Div';
import FocusMixin from '../mixins/FocusMixin';
import IsWorkingMixin from '../mixins/IsWorkingMixin';
import './Container.less';

/**
 * @class Container
 * @extends Control
 * @constructor
 *
 * @arg {Object} settings
 */
export default class Container extends IsWorkingMixin(FocusMixin(Div)) {
	constructor(settings = {}) {
		settings.type = settings.type || controlTypes.CONTAINER;
		settings.FocusMixin = settings.FocusMixin || {};
		settings.FocusMixin.hasChildren = true;

		super(settings);

		const self = this;
		self.addClass('container');

		if (self.type === controlTypes.CONTAINER) {
			applySettings(self, settings);
		}
	}
}

Object.assign(Container.prototype, {
	isFocusable: method.boolean({
		set(newValue) {
			this.attr(TAB_INDEX, newValue ? TAB_INDEX_ENABLED : TAB_INDEX_DISABLED);
		}
	})
});
