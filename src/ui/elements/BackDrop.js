import { ABSOLUTE_CLASS, BODY, CLICK_EVENT } from '../../utility/domConstants';
import objectHelper from '../../utility/objectHelper';
import controlTypes from '../controlTypes';
import Control from './../Control';
import './BackDrop.less';

const BACKDROP_CLASS = ABSOLUTE_CLASS + 'backdrop';

/**
 * <p>Display a backdrop that removes itself when clicked.</p>
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

		objectHelper.applySettings(self, settings);

		self.on(CLICK_EVENT, () => {
			self.remove();
		});
	}
}
