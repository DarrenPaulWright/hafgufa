import { applySettings } from 'type-enforcer-ui';
import controlTypes from '../controlTypes';
import { ABSOLUTE_CLASS, BODY, CLICK_EVENT } from '../utility/domConstants';
import Control from './../Control';
import './BackDrop.less';

const BACKDROP_CLASS = ABSOLUTE_CLASS + 'backdrop';

/**
 * Display a backdrop that removes itself when clicked.
 *
 * @class BackDrop
 * @extends Control
 * @constructor
 *
 * @arg {Object} settings
 */
export default class BackDrop extends Control {
	constructor(settings = {}) {
		settings.type = settings.type || controlTypes.BACK_DROP;
		settings.container = settings.container || BODY;
		settings.fade = true;

		super(settings);

		const self = this;
		self.addClass(BACKDROP_CLASS);

		applySettings(self, settings);

		self.on(CLICK_EVENT, () => {
			self.remove();
		});
	}
}
