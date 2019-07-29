import { applySettings, CssSize, enforce, HUNDRED_PERCENT, method } from 'type-enforcer';
import { ABSOLUTE_CLASS } from '../../utility/domConstants';
import Control from '../Control';
import controlTypes from '../controlTypes';
import Div from '../elements/Div';
import Label from '../elements/Label';
import DelayedRenderMixin from '../mixins/DelayedRenderMixin';
import './IsWorking.less';

const IS_WORKING_CLASS = ABSOLUTE_CLASS + 'is-working';
const MEDIUM_CLASS = 'medium';
const SMALL_CLASS = 'small';

const SMALL_CIRCLE_THRESHOLD = new CssSize('8rem');
const MEDIUM_CIRCLE_THRESHOLD = new CssSize('16rem');

const setSize = function() {
	const self = this;
	const height = self.borderHeight();
	const minSize = Math.min(height, self.borderWidth());
	let newSize = 3;

	if (minSize < SMALL_CIRCLE_THRESHOLD.toPixels(true)) {
		newSize = 1;
	}
	else if (minSize < MEDIUM_CIRCLE_THRESHOLD.toPixels(true)) {
		newSize = 2;
	}
	if (newSize !== self[CURRENT_SIZE]) {
		self[CURRENT_SIZE] = newSize;
		self
			.classes(SMALL_CLASS, newSize === 1)
			.classes(MEDIUM_CLASS, newSize === 2);
	}
};

const ANIMATION_DIV = Symbol();
const LABEL = Symbol();
const CURRENT_SIZE = Symbol();

/**
 * Displays an animation while isWorking is true.
 * @class IsWorking
 * @extends Control
 * @constructor
 *
 * @arg {Object}        settings            - Accepts all controlBase settings plus:
 * @arg {String}        settings.label
 * @arg {Boolean}       settings.isWorking
 */
export default class IsWorking extends DelayedRenderMixin(Control) {
	constructor(settings = {}) {
		settings.type = settings.type || controlTypes.IS_WORKING;
		settings.width = enforce.cssSize(settings.width, HUNDRED_PERCENT, true);
		settings.height = enforce.cssSize(settings.height, HUNDRED_PERCENT, true);
		settings.fade = enforce.boolean(settings.fade, true);
		settings.onRender = () => {
			self[ANIMATION_DIV] = new Div({
				container: self
			});

			self.onResize(setSize);
			self.resize(true)
				.onRemove(() => {
					self[ANIMATION_DIV].remove();
				});
		};

		super(settings);

		const self = this;
		self[CURRENT_SIZE] = 3;

		applySettings(self, settings, ['height', 'width']);

		self
			.addClass(IS_WORKING_CLASS)
			.onRemove(() => {
				self.label('');
			});
	}
}

Object.assign(IsWorking.prototype, {
	/**
	 * Set or Get the label of this control.
	 * @method label
	 * @member module:IsWorking
	 * @instance
	 * @arg {String} newLabel
	 * @returns {String|this}
	 */
	label: method.string({
		set: function(label) {
			if (label) {
				if (!this[LABEL]) {
					this[LABEL] = new Label({
						container: this.element()
					});
				}
				this[LABEL].content(label);
			}
			else {
				if (this[LABEL]) {
					this[LABEL].remove();
					this[LABEL] = null;
				}
			}
		}
	})
});
