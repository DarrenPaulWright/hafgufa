import { defer } from 'async-agent';
import { HUNDRED_PERCENT, method } from 'type-enforcer';
import { ABSOLUTE, ICON_SIZES } from '../..';
import ControlManager from '../ControlManager';
import Button from '../elements/Button';
import { NEXT_ICON, PREVIOUS_ICON } from '../icons';

const PREV_BUTTON_ID = 'carouselPrevButton';
const NEXT_BUTTON_ID = 'carouselNextButton';
const BUTTON_CLASS = 'icon-button';

const CONTROLS = Symbol();
const ON_SHOW_BUTTONS = Symbol();
const ON_HIDE_BUTTONS = Symbol();
const IS_AT_START = Symbol();
const IS_AT_END = Symbol();
const ON_PREV = Symbol();
const ON_NEXT = Symbol();

const updateButtons = Symbol();
const onShowButtons = Symbol();

/**
 * Adds next and prev buttons to a control.
 *
 * @mixin NextPrevMixin
 * @constructor
 *
 * @arg {class} [Base]
 */
export default (Base) => {
	class NextPrevMixin extends Base {
		constructor(settings = {}) {
			super(settings);

			settings = settings.NextPrevMixin || {};

			const self = this;
			self[ON_SHOW_BUTTONS] = settings.onShowButtons;
			self[ON_HIDE_BUTTONS] = settings.onHideButtons;
			self[IS_AT_START] = settings.isAtStart;
			self[IS_AT_END] = settings.isAtEnd;
			self[ON_PREV] = settings.onPrev;
			self[ON_NEXT] = settings.onNext;

			self[CONTROLS] = new ControlManager();

			self.onResize(() => self[updateButtons]())
				.onRemove(() => self[CONTROLS].remove());
		}

		/**
		 * Update the isVisible value of the buttons
		 * @function updateButtons
		 */
		[updateButtons]() {
			const self = this;

			if (self.showButtons()) {
				self[CONTROLS].get(PREV_BUTTON_ID).isVisible(!self[IS_AT_START]());
				self[CONTROLS].get(NEXT_BUTTON_ID).isVisible(!self[IS_AT_END]());
			}
		}

		[onShowButtons]() {
			const self = this;
			const update = () => self[updateButtons]();

			self[ON_SHOW_BUTTONS](update, self[CONTROLS].get(PREV_BUTTON_ID).borderWidth());
		}

		/**
		 * Go to previous
		 *
		 * @method prev
		 * @memberOf NextPrevMixin
		 * @instance
		 */
		prev() {
			this[ON_PREV]();
		}

		/**
		 * Go to next
		 *
		 * @method next
		 * @memberOf NextPrevMixin
		 * @instance
		 */
		next() {
			this[ON_NEXT]();
		}
	}

	Object.assign(NextPrevMixin.prototype, {
		/**
		 * Get or set whether the buttons should be viewed
		 *
		 * @method showButtons
		 * @memberOf NextPrevMixin
		 * @instance
		 *
		 * @arg {boolean}
		 *
		 * @returns {boolean|this}
		 */
		showButtons: method.boolean({
			set: function(newValue) {
				const self = this;

				if (newValue) {
					if (!self[CONTROLS].get(PREV_BUTTON_ID)) {
						self[CONTROLS].add(new Button({
							ID: PREV_BUTTON_ID,
							container: self.element(),
							classes: BUTTON_CLASS,
							icon: PREVIOUS_ICON,
							iconSize: self.buttonIconSize(),
							onClick: () => self.prev(),
							height: HUNDRED_PERCENT,
							css: {
								position: ABSOLUTE,
								top: '0',
								left: '0'
							}
						}));
						self[CONTROLS].add(new Button({
							ID: NEXT_BUTTON_ID,
							container: self.element(),
							classes: BUTTON_CLASS,
							icon: NEXT_ICON,
							iconSize: self.buttonIconSize(),
							onClick: () => self.next(),
							height: HUNDRED_PERCENT,
							css: {
								position: ABSOLUTE,
								top: '0',
								right: '0'
							}
						}));

						self[onShowButtons]();

						defer(() => self[updateButtons]());
					}
				}
				else {
					self[CONTROLS].remove(PREV_BUTTON_ID);
					self[CONTROLS].remove(NEXT_BUTTON_ID);

					self[ON_HIDE_BUTTONS]();
				}
			}
		}),

		/**
		 * Get or set the size of the icons on the buttons
		 *
		 * @method buttonIconSize
		 * @memberOf NextPrevMixin
		 * @instance
		 *
		 * @arg {string} - see Icon ICON_SIZES
		 *
		 * @returns {string|this}
		 */
		buttonIconSize: method.enum({
			init: ICON_SIZES.TWO_TIMES,
			enum: ICON_SIZES,
			set: function(buttonIconSize) {
				const self = this;

				if (self.showButtons()) {
					self[CONTROLS].get(PREV_BUTTON_ID).iconSize(buttonIconSize);
					self[CONTROLS].get(NEXT_BUTTON_ID).iconSize(buttonIconSize);

					self[onShowButtons]();
				}
			}
		})
	});

	return NextPrevMixin;
};
