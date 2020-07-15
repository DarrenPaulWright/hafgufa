import { applySettings } from 'type-enforcer-ui';
import controlTypes from '../controlTypes';
import setDefaults from '../utility/setDefaults.js';
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
		super(setDefaults({
			type: controlTypes.HEADER,
			element: 'header'
		}, settings));

		this.removeClass('container')
			.addClass('clearfix');

		if (this.type === controlTypes.HEADER) {
			applySettings(this, settings);
		}
	}
}
