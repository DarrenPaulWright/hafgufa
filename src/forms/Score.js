import { applySettings, AUTO, enforceCssSize, methodNumber, methodString } from 'type-enforcer-ui';
import controlTypes from '../controlTypes';
import Div from '../elements/Div';
import Label from '../elements/Label';
import FormControl from './FormControl';
import './Score.less';

const TEXT_DISPLAY = Symbol();
const LABEL = Symbol();

/**
 * Display a styled score. This control doesn't accept user input.
 *
 * @class Score
 * @extends FormControl
 * @constructor
 *
 * @arg {Object} settings
 */
export default class Score extends FormControl {
	constructor(settings = {}) {
		settings.type = settings.type || controlTypes.SCORE;
		settings.width = enforceCssSize(settings.width, AUTO, true);

		super(settings);

		const self = this;
		self.addClass('score');

		self[TEXT_DISPLAY] = new Div({
			container: self,
			classes: 'score-text',
			removeClass: 'container',
			width: settings.textWidth || AUTO,
			content: '-'
		});

		applySettings(self, settings);
	}
}

Object.assign(Score.prototype, {
	/**
	 * @method value
	 * @member module:Score
	 * @instance
	 * @arg {Number} [value]
	 * @returns {Number|this}
	 */
	value: methodNumber({
		init: null,
		set() {
			this[TEXT_DISPLAY].content(this.value() + '');
		}
	}),

	label: methodString({
		set(label) {
			const self = this;

			if (label === '') {
				self[LABEL].remove();
				self[LABEL] = null;
			}
			else {
				if (!self[LABEL]) {
					self[LABEL] = new Label({
						container: self
					});
				}

				self[LABEL].content(label);
			}
		}
	}),

	/**
	 * Determines if this control has focus
	 * @method isFocused
	 * @member module:Score
	 * @instance
	 * @returns {Boolean}
	 */
	isFocused() {
		return false;
	}
});
