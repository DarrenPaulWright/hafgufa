import { defer } from 'async-agent';
import { HUNDRED_PERCENT, methodBoolean, methodEnum, PrivateVars } from 'type-enforcer-ui';
import ControlManager from '../ControlManager.js';
import Button from '../elements/Button.js';
import { ICON_SIZES } from '../elements/Icon.js';
import { NEXT_ICON, PREVIOUS_ICON } from '../icons.js';
import { ABSOLUTE } from '../utility/domConstants.js';

const PREV_BUTTON_ID = 'carouselPrevButton';
const NEXT_BUTTON_ID = 'carouselNextButton';
const BUTTON_CLASS = 'icon-button';

const _ = new PrivateVars();

const updateButtons = Symbol();
const onShowButtons = Symbol();

/**
 * Adds next and prev buttons to a control.
 *
 * @mixin NextPreviousMixin
 *
 * @param {Function} Base - The class to extend
 */
export default (Base) => {
	class NextPreviousMixin extends Base {
		constructor(settings = {}) {
			super(settings);

			const self = this;

			_.set(self, {
				...settings.NextPreviousMixin,
				controls: new ControlManager()
			});

			self.onResize(() => {
					self[updateButtons]();
				})
				.onRemove(() => {
					_(self).controls.remove();
				});
		}

		/**
		 * Update the isVisible value of the buttons
		 *
		 * @function updateButtons
		 */
		[updateButtons]() {
			const self = this;
			const _self = _(self);

			if (!self.isRemoved && self.showButtons()) {
				_self.controls.get(PREV_BUTTON_ID).isVisible(!_self.isAtStart());
				_self.controls.get(NEXT_BUTTON_ID).isVisible(!_self.isAtEnd());
			}
		}

		[onShowButtons]() {
			const self = this;
			const _self = _(self);
			const update = () => self[updateButtons]();

			_self.onShowButtons(update, _self.controls.get(PREV_BUTTON_ID).borderWidth());
		}

		/**
		 * Go to previous
		 *
		 * @method prev
		 * @memberOf NextPreviousMixin
		 * @instance
		 */
		prev() {
			_(this).onPrev();
		}

		/**
		 * Go to next
		 *
		 * @method next
		 * @memberOf NextPreviousMixin
		 * @instance
		 */
		next() {
			_(this).onNext();
		}
	}

	Object.assign(NextPreviousMixin.prototype, {
		/**
		 * Get or set whether the buttons should be viewed
		 *
		 * @method showButtons
		 * @memberOf NextPreviousMixin
		 * @instance
		 *
		 * @param {boolean}
		 *
		 * @returns {boolean|this}
		 */
		showButtons: methodBoolean({
			set(newValue) {
				const self = this;
				const _self = _(self);

				if (newValue) {
					if (!_self.controls.get(PREV_BUTTON_ID)) {
						_self.controls.add(new Button({
							id: PREV_BUTTON_ID,
							container: self.element,
							classes: BUTTON_CLASS,
							icon: PREVIOUS_ICON,
							iconSize: self.buttonIconSize(),
							onClick() {
								self.prev();
							},
							height: HUNDRED_PERCENT,
							css: {
								position: ABSOLUTE,
								top: '0',
								left: '0'
							}
						}));
						_self.controls.add(new Button({
							id: NEXT_BUTTON_ID,
							container: self.element,
							classes: BUTTON_CLASS,
							icon: NEXT_ICON,
							iconSize: self.buttonIconSize(),
							onClick() {
								self.next();
							},
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
					_self.controls.remove(PREV_BUTTON_ID);
					_self.controls.remove(NEXT_BUTTON_ID);

					_self.onHideButtons();
				}
			}
		}),

		/**
		 * Get or set the size of the icons on the buttons.
		 *
		 * @method buttonIconSize
		 * @memberOf NextPreviousMixin
		 * @instance
		 *
		 * @param {string} iconSize - see Icon ICON_SIZES
		 *
		 * @returns {string|this}
		 */
		buttonIconSize: methodEnum({
			init: ICON_SIZES.TWO_TIMES,
			enum: ICON_SIZES,
			set(buttonIconSize) {
				const self = this;
				const _self = _(self);

				if (self.showButtons()) {
					_self.controls.get(PREV_BUTTON_ID).iconSize(buttonIconSize);
					_self.controls.get(NEXT_BUTTON_ID).iconSize(buttonIconSize);

					self[onShowButtons]();
				}
			}
		})
	});

	return NextPreviousMixin;
};
