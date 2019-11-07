import { applySettings, isFunction, isNumber } from 'type-enforcer-ui';
import Control from '../Control';
import controlTypes from '../controlTypes';
import Button from '../elements/Button';
import './Toolbar.less';

const TOOLBAR_BASE_CLASS = 'toolbar clearfix';

const BUTTONS = Symbol();

const getButton = Symbol();

/**
 * Displays a toolbar that accepts and positions content such as buttons.
 * @module Toolbar
 * @extends Control
 * @constructor
 *
 * @arg {Object} settings
 */
export default class Toolbar extends Control {
	constructor(settings = {}) {
		settings.type = settings.type || controlTypes.TOOLBAR;

		super(settings);

		this[BUTTONS] = [];
		this.addClass(TOOLBAR_BASE_CLASS);

		applySettings(this, settings);

		this.onRemove(() => {
			this[BUTTONS].length = 0;
		});
	}

	[getButton](input) {
		return isNumber(input) ? this[BUTTONS][input] : input;
	}

	content(newContent) {
		this.empty();
		newContent.forEach((button) => {
			this.addButton(button);
		});
	}

	getButtonAtIndex(index) {
		return this[getButton](index);
	}

	addButton(data) {
		const button = new Button({
			...data,
			container: this
		});
		this[BUTTONS].push(button);
		this.updateButton(button, data);

		return this;
	}

	hideButton(button) {
		this[getButton](button).isVisible(false);
	}

	showButton(button) {
		this[getButton](button).isVisible(true);
	}

	updateButton(button, data) {
		button = this[getButton](button);

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

		return this;
	}

	toggleButtons(isEnabled) {
		this[BUTTONS].forEach((button) => {
			button.isEnabled(isEnabled);
		});
	}
}
