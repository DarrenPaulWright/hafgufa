import { applySettings } from 'type-enforcer';
import controlTypes from '../controlTypes';
import Container from './Container';
import './Header.less';

/**
 * Display a Header
 *
 * @class Header
 * @extends Container
 * @constructor
 *
 * @param {Object} settings
 */
export default class Header extends Container {
	constructor(settings = {}) {
		settings.type = settings.type || controlTypes.HEADER;
		settings.element = 'header';

		super(settings);

		this.removeClass('container');
		this.addClass('clearfix');

		if (settings.type === controlTypes.HEADER) {
			applySettings(this, settings);
		}
	}
}
