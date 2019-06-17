import { debounce } from 'async-agent';
import { AUTO, enforce, method } from 'type-enforcer';
import dom from '../../utility/dom';
import { WIDTH } from '../../utility/domConstants';
import objectHelper from '../../utility/objectHelper';
import controlTypes from '../controlTypes';
import FormControl from './FormControl';
import './Score.less';

const DEFAULT_NULL_TEXT = '-';

/**
 * Debounced display of current value.
 * @function setDisplayText
 */
const setDisplayText = debounce(function() {
	this[TEXT_DISPLAY].textContent = this.value() || DEFAULT_NULL_TEXT;
});

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
		settings.width = enforce.cssSize(settings.width, AUTO, true);

		super(settings);

		const self = this;
		self.addClass('score');

		self[TEXT_DISPLAY] = dom.appendNewTo(self, 'score-text');
		dom.css(self[TEXT_DISPLAY], WIDTH, settings.textWidth || AUTO);

		objectHelper.applySettings(self, settings);

		setDisplayText.call(self);
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
	value: method.number({
		init: null,
		set: setDisplayText
	}),

	label: method.string({
		set: function(newValue) {
			if (newValue === '') {
				dom.remove(this[LABEL]);
				this[LABEL] = null;
			}
			else {
				if (!this[LABEL]) {
					this[LABEL] = dom.appendNewAfter(this[TEXT_DISPLAY], 'score-label');
				}

				dom.content(this[LABEL], newValue);
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
	isFocused: () => false
});
