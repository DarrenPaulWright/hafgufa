import { CssSize, methodCssSize } from 'type-enforcer-ui';
import Control from '../Control.js';
import { HEIGHT, WIDTH } from '../utility/domConstants.js';

export default class SvgControl extends Control {}

Object.assign(SvgControl.prototype, {
	width: methodCssSize({
		init: new CssSize(),
		set(width) {
			this.attr(WIDTH, width.toPixels());
		}
	}),

	borderWidth() {
		return this.element.getBoundingClientRect().width;
	},

	height: methodCssSize({
		init: new CssSize(),
		set(height) {
			this.attr(HEIGHT, height.toPixels());
		}
	}),

	borderHeight() {
		return this.element.getBoundingClientRect().height;
	}
});
