import { applySettings } from 'type-enforcer';
import dom from '../../utility/dom';
import Control from '../Control';
import controlTypes from '../controlTypes';

export default class Source extends Control {
	constructor(settings = {}) {
		settings.type = settings.type || controlTypes.SOURCE;
		settings.element = dom.buildNew(null, 'source');

		super(settings);

		applySettings(this, settings);
	}
}
