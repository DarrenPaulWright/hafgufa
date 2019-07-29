import { applySettings, isFunction, isNumber } from 'type-enforcer';
import dom from '../../utility/dom';
import Control from '../Control';
import controlTypes from '../controlTypes';
import Button from '../elements/Button';
import './Toolbar.less';

const TOOLBAR_BASE_CLASS = 'toolbar clearfix';

const getButton = function(input) {
	return isNumber(input) ? this[BUTTONS][input] : input;
};

const BUTTONS = Symbol();

/**
 * Displays a toolbar that accepts and positions content such as buttons.
 * @module Toolbar
 * @extends ControlBase
 * @constructor
 *
 * @arg {Object} settings - Accepts all controlBase settings plus:
 */
export default class Toolbar extends Control {
	constructor(settings = {}) {
		settings.type = settings.type || controlTypes.TOOLBAR;

		super(settings);

		this[BUTTONS] = [];
		this.addClass(TOOLBAR_BASE_CLASS);

		applySettings(this, settings);

		this.onRemove(() => {
			this.empty();
		});
	}

	content(newContent) {
		this.empty();
		newContent.forEach((button) => {
			this.addButton(button);
		});
	}

	getButtonAtIndex(index) {
		getButton.call(this, index);
	}

	addButton(data) {
		const button = new Button(Object.assign({}, data, {
			container: this.element()
		}));
		this[BUTTONS].push(button);
		this.updateButton(button, data);

		return this;
	}

	hideButton(button) {
		getButton.call(this, button).isVisible(false);
	}

	showButton(button) {
		getButton.call(this, button).isVisible(true);
	}

	updateButton(button, data) {
		button = getButton.call(this, button);

		if (isFunction(data.isEnabled)) {
			data.isEnabled = data.isEnabled();
		}

		applySettings(button, data);

		if (data.align === 'right') {
			button.addClass('align-right');
		}
	}

	empty() {
		this[BUTTONS].forEach((button) => {
			button.remove();
		});
		this[BUTTONS].length = 0;
		dom.empty(this);

		return this;
	}

	toggleButtons(isEnabled) {
		this[BUTTONS].forEach((button) => {
			button.isEnabled(isEnabled);
		});
	}
}
