import dom from '../../utility/dom';
import objectHelper from '../../utility/objectHelper';
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
			objectHelper.applySettings(this, settings);
		}
	}
}
