import { applySettings } from 'type-enforcer';
import dom from '../../utility/dom';
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
		settings.element = dom.buildNew('', 'header');

		super(settings);

		this.removeClass('container');

		if (settings.type === controlTypes.HEADER) {
			applySettings(this, settings);
		}
	}
}
