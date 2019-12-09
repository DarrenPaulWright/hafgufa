import { defer } from 'async-agent';
import { HUNDRED_PERCENT, methodBoolean, methodEnum, PrivateVars } from 'type-enforcer-ui';
import ControlManager from '../ControlManager';
import Button from '../elements/Button';
import { ICON_SIZES } from '../elements/Icon';
import { NEXT_ICON, PREVIOUS_ICON } from '../icons';
import { ABSOLUTE } from '../utility/domConstants';

const PREV_BUTTON_ID = 'carouselPrevButton';
const NEXT_BUTTON_ID = 'carouselNextButton';
const BUTTON_CLASS = 'icon-button';

const _ = new PrivateVars();

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
			_.set(self, {
				onShowButtons: settings.onShowButtons,
				onHideButtons: settings.onHideButtons,
				isAtStart: settings.isAtStart,
				isAtEnd: settings.isAtEnd,
				onPrev: settings.onPrev,
				onNext: settings.onNext,
				controls: new ControlManager()
			});

			self.onResize(() => self[updateButtons]())
				.onRemove(() => _(self).controls.remove());
		}

		/**
		 * Update the isVisible value of the buttons
		 * @function updateButtons
		 */
		[updateButtons]() {
			const self = this;
			const _self = _(self);

			if (self.showButtons()) {
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
		 * @memberOf NextPrevMixin
		 * @instance
		 */
		prev() {
			_(this).onPrev();
		}

		/**
		 * Go to next
		 *
		 * @method next
		 * @memberOf NextPrevMixin
		 * @instance
		 */
		next() {
			_(this).onNext();
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

	return NextPrevMixin;
};
