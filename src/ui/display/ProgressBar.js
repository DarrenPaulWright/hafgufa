import { max } from 'lodash';
import { applySettings, AUTO, HUNDRED_PERCENT, method, PERCENT, ZERO_PIXELS } from 'type-enforcer';
import d3Helper from '../../utility/d3Helper';
import { WIDTH } from '../../utility/domConstants';
import round from '../../utility/math/round';
import Control from '../Control';
import ControlRecycler from '../ControlRecycler';
import controlTypes from '../controlTypes';
import Div from '../elements/Div';
import Heading from '../elements/Heading';
import { CIRCLE_ICON } from '../icons';
import ControlHeadingMixin from '../mixins/ControlHeadingMixin';
import './ProgressBar.less';

const BAR_CONTAINER = Symbol();
const BAR = Symbol();
const STEP_WIDTH = Symbol();
const RENDERED_WIDTHS = Symbol();
const IS_LARGE = Symbol();
const TOTAL_STEPS = Symbol();
const CONTROLS = Symbol();

const buildSteps = Symbol();
const getArrowWidth = Symbol();
const layout = Symbol();
const updateCurrentStep = Symbol();
const updateBigNumbers = Symbol();
const updateTitles = Symbol();
const updateProgress = Symbol();

/**
 * @class ProgressBar
 * @extends Control
 * @constructor
 *
 * @arg {Object} settings
 */
export default class ProgressBar extends ControlHeadingMixin(Control) {
	constructor(settings = {}) {
		settings.type = settings.type || controlTypes.PROGRESS;

		super(settings);

		const self = this;
		self.addClass('progress');

		self[RENDERED_WIDTHS] = [];
		self[IS_LARGE] = false;
		self[TOTAL_STEPS] = 0;
		self[CONTROLS] = new ControlRecycler({
			control: Heading,
			defaultSettings: {
				classes: 'step',
				isInline: false
			}
		});

		self[BAR_CONTAINER] = new Div({
			container: self,
			classes: 'bar-container'
		});

		self[BAR] = new Div({
			container: self[BAR_CONTAINER],
			classes: 'bar',
			width: ZERO_PIXELS
		});

		applySettings(self, settings);

		self.onResize(() => {
				self[layout]();
			})
			.resize();

		self.onRemove(() => {
			self[CONTROLS].remove();
		});
	}

	[buildSteps]() {
		const self = this;
		const steps = self.steps();

		self[TOTAL_STEPS] = steps.length;

		self[CONTROLS].discardAllControls();

		if (steps && steps.length) {
			steps.forEach((step) => {
				self[CONTROLS].getRecycledControl()
					.container(self[BAR_CONTAINER])
					.subTitle(step.subTitle);
			});
		}

		self.classes('steps', !!self[TOTAL_STEPS]);

		self[updateTitles]();
		self[updateBigNumbers]();
	}

	[getArrowWidth]() {
		return this[CONTROLS].totalVisibleControls() ? this[CONTROLS].getControlAtOffset(0).borderHeight() : 0;
	}

	[layout]() {
		const self = this;
		let cumulativeWidth = 0;
		const arrowWidth = self[getArrowWidth]() * 0.4;
		const maxHeight = max(self[CONTROLS].map((step) => {
			step.height(AUTO);
			const actualHeight = step.height();
			step.height(HUNDRED_PERCENT);
			return actualHeight;
		}));

		if (self[TOTAL_STEPS] > 0) {
			self[BAR_CONTAINER].height(maxHeight);

			self[STEP_WIDTH] = self.width().isAuto ? AUTO : Math.floor(self.borderWidth() / self[TOTAL_STEPS]);

			self[CONTROLS].each((step, index) => {
				if (self[STEP_WIDTH] === AUTO) {
					step.width(AUTO);
				}
				else {
					step.width(self[STEP_WIDTH] + (!index ? arrowWidth : ((index + 1 === self[TOTAL_STEPS]) ? -arrowWidth : 0)));
				}
				step.resize();
			});

			self[CONTROLS].each((step, index) => {
				cumulativeWidth += step.borderWidth();
				self[RENDERED_WIDTHS][index] = cumulativeWidth;
			});

			self[updateCurrentStep]();
		}
		else {
			self[BAR_CONTAINER].width(HUNDRED_PERCENT);
			self[updateProgress](self.progress());
		}
	}

	[updateCurrentStep]() {
		const self = this;
		const currentStep = self.currentStep();

		if (self[TOTAL_STEPS] === currentStep) {
			self[updateProgress](1);
		}
		else {
			self[updateProgress](((self[RENDERED_WIDTHS][currentStep - 1] || 0) - (self[getArrowWidth]() * 0.6)) / self[BAR_CONTAINER].borderWidth());
		}

		self[CONTROLS].each((control, index) => {
			control
				.classes('inverse', index < currentStep)
				.classes('completed', index + 1 === currentStep);
		});
	}

	[updateBigNumbers]() {
		const self = this;

		self[IS_LARGE] = self.showBigNumbers();

		self[CONTROLS].each((control) => {
			self[IS_LARGE] = self[IS_LARGE] || !!control.subTitle();
		});

		self
			.classes('large', self[IS_LARGE])
			.classes('big-numbers', self.showBigNumbers());

		self[CONTROLS].each((control, index) => {
			control
				.icon(self.showBigNumbers() ? (CIRCLE_ICON + ':' + (index + 1)) : '')
				.isInline(!self[IS_LARGE]);
		});

		self[layout]();
	}

	[updateTitles]() {
		const self = this;
		const steps = self.steps();

		if (steps && steps.length) {
			steps.forEach((step, index) => {
				const title = [];

				if (self.showInlineNumbers()) {
					title.push((index + 1) + '');
				}
				if (step.title) {
					title.push(step.title);
				}

				self[CONTROLS].getControlAtOffset(index)
					.title(title.join(': '));

				title.length = 0;
			});
		}
	}

	[updateProgress](progress) {
		d3Helper.animate(this[BAR])
			.style(WIDTH, (progress * 100) + PERCENT);
	}
}

Object.assign(ProgressBar.prototype, {
	/**
	 * @method progress
	 * @member module:ProgressBar
	 * @instance
	 * @arg {number} [progress]
	 * @returns {number|this}
	 */
	progress: method.number({
		init: 0,
		set(progress) {
			const self = this;

			self[updateProgress](progress);
			self.subTitle(round(self.progress() * 100) + PERCENT);
		},
		min: 0,
		max: 1
	}),

	/**
	 * @method steps
	 * @member module:ProgressBar
	 * @instance
	 * @arg {Array} [steps]
	 * @returns {Array|this}
	 */
	steps: method.array({
		set() {
			this[buildSteps]();
		}
	}),

	/**
	 * @method currentStep
	 * @member module:ProgressBar
	 * @instance
	 * @arg {Int} [currentStep]
	 * @returns {Int|this}
	 */
	currentStep: method.integer({
		init: 1,
		set() {
			this[updateCurrentStep]();
		},
		min: 1
	}),

	/**
	 * @method showBigNumbers
	 * @member module:ProgressBar
	 * @instance
	 * @arg {Boolean} [showBigNumbers]
	 * @returns {Boolean|this}
	 */
	showBigNumbers: method.boolean({
		set() {
			this[updateBigNumbers]();
		}
	}),

	/**
	 * @method showInlineNumbers
	 * @member module:ProgressBar
	 * @instance
	 * @arg {Boolean} [showInlineNumbers]
	 * @returns {Boolean|this}
	 */
	showInlineNumbers: method.boolean({
		set() {
			this[updateTitles]();
		}
	})
});
