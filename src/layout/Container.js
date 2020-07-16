import { applySettings, methodBoolean } from 'type-enforcer-ui';
import controlTypes from '../controlTypes';
import Div from '../elements/Div';
import FocusMixin from '../mixins/FocusMixin';
import IsWorkingMixin from '../mixins/IsWorkingMixin';
import assign from '../utility/assign.js';
import { TAB_INDEX, TAB_INDEX_DISABLED, TAB_INDEX_ENABLED } from '../utility/domConstants';
import setDefaults from '../utility/setDefaults.js';
import './Container.less';

/**
 * @class Container
 * @extends Control
 * @constructor
 *
 * @param {Object} settings
 */
export default class Container extends IsWorkingMixin(FocusMixin(Div)) {
	constructor(settings = {}) {
		super(setDefaults({
			type: controlTypes.CONTAINER
		}, settings, {
			FocusMixin: assign(settings.FocusMixin, {
				hasChildren: true
			})
		}));

		const self = this;
		self.addClass('container');

		if (self.type === controlTypes.CONTAINER) {
			applySettings(self, settings);
		}
	}
}

Object.assign(Container.prototype, {
	isFocusable: methodBoolean({
		set(newValue) {
			this.attr(TAB_INDEX, newValue ? TAB_INDEX_ENABLED : TAB_INDEX_DISABLED);
		}
	})
});
