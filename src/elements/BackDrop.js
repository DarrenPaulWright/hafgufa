import { applySettings } from 'type-enforcer-ui';
import controlTypes from '../controlTypes.js';
import { ABSOLUTE_CLASS, BODY, CLICK_EVENT } from '../utility/domConstants.js';
import setDefaults from '../utility/setDefaults.js';
import Control from './../Control.js';
import './BackDrop.less';

const BACKDROP_CLASS = ABSOLUTE_CLASS + 'backdrop';

/**
 * Display a backdrop that removes itself when clicked.
 *
 * @class BackDrop
 * @extends Control
 * @class
 *
 * @param {object} settings
 */
export default class BackDrop extends Control {
	constructor(settings = {}) {
		super(setDefaults({
			type: controlTypes.BACK_DROP,
			container: BODY,
			fade: true
		}, settings));

		const self = this;
		self.addClass(BACKDROP_CLASS);

		applySettings(self, settings);

		self.on(CLICK_EVENT, () => {
			self.remove();
		});
	}
}
