import { applySettings } from 'type-enforcer';
import dom from '../../utility/dom';
import controlTypes from '../controlTypes';
import Element from '../Element';

export default class Source extends Element {
	constructor(settings = {}) {
		settings.type = settings.type || controlTypes.SOURCE;
		settings.element = dom.buildNew(null, 'source');

		super(settings);

		applySettings(this, settings);
	}
}
