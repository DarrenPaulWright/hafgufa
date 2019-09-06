import { applySettings } from 'type-enforcer';
import Control from '../Control';
import controlTypes from '../controlTypes';

export default class Source extends Control {
	constructor(settings = {}) {
		settings.type = settings.type || controlTypes.SOURCE;
		settings.element = 'source';

		super(settings);

		applySettings(this, settings);
	}
}
