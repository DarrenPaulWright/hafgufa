import { applySettings } from 'type-enforcer-ui';
import controlTypes from '../controlTypes.js';
import DragMixin from '../mixins/DragMixin.js';
import setDefaults from '../utility/setDefaults.js';
import Container from './Container.js';

/**
 * @class DragContainer
 * @mixes DragMixin
 * @extends Container
 *
 * @param {object} [settings]
 */
export default class DragContainer extends DragMixin(Container) {
	constructor(settings = {}) {
		super(setDefaults({
			type: controlTypes.DRAG_CONTAINER
		}, settings));

		if (this.type === controlTypes.DRAG_CONTAINER) {
			applySettings(this, settings);
		}
	}
}
