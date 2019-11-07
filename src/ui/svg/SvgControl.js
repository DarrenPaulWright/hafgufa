import { CssSize, method } from 'type-enforcer-ui';
import { HEIGHT, WIDTH } from '../..';
import Control from '../Control';

export default class SvgControl extends Control {
	constructor(settings = {}) {
		super(settings);
	}
}

Object.assign(SvgControl.prototype, {
	width: method.cssSize({
		init: new CssSize(),
		set(width) {
			this.attr(WIDTH, width.toPixels());
		}
	}),

	borderWidth() {
		return this.element().getBoundingClientRect().width;
	},

	height: method.cssSize({
		init: new CssSize(),
		set(height) {
			this.attr(HEIGHT, height.toPixels());
		}
	}),

	borderHeight() {
		return this.element().getBoundingClientRect().height;
	}
});
