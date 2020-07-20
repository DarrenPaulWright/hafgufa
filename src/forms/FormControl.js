import { debounce } from 'async-agent';
import { deepEqual } from 'object-agent';
import {
	enforceBoolean,
	HUNDRED_PERCENT,
	methodBoolean,
	methodInteger,
	methodObject,
	methodQueue
} from 'type-enforcer-ui';
import Control from '../Control.js';
import ControlHeadingMixin from '../mixins/ControlHeadingMixin.js';
import FocusMixin from '../mixins/FocusMixin.js';
import locale from '../utility/locale.js';
import setDefaults from '../utility/setDefaults.js';
import './FormControl.less';
import formRelationships from './formRelationships.js';

const CURRENT_VALUE = Symbol();
const RELATIONSHIP_ID = Symbol();
const ON_CHANGE = Symbol();

/**
 * Code used by most form controls.
 *
 * @class FormControl
 * @extends Control
 * @class
 *
 * @param {object} type
 * @param {object} settings
 */
export default class FormControl extends FocusMixin(ControlHeadingMixin(Control)) {
	constructor(settings = {}) {
		super(setDefaults({
			width: HUNDRED_PERCENT,
			changeDelay: 0
		}, settings));

		const self = this;

		if (settings.element === undefined) {
			self.addClass('form-control');
		}

		self[RELATIONSHIP_ID] = formRelationships.add({
			control: self,
			controlId: self.id(),
			relationships: settings.relationships
		});

		self.onChange(() => {
				self.validate();
			})
			.onBlur(() => {
				self.validate();
			})
			.onRemove(() => {
				if (self[ON_CHANGE]) {
					self[ON_CHANGE].clear();
				}
				formRelationships.remove(self[RELATIONSHIP_ID]);
			});
	}

	/**
	 * Trigger an onChange event.
	 *
	 * @method triggerChange
	 * @member module:FormControlBase
	 * @instance
	 *
	 * @param {boolean} [ignoreDelay=false] - trigger the change immediately
	 * @param {boolean} [skipCallback=false] - don't trigger an onChange event
	 * @param {boolean} [isHardTrigger=true] - force a change event even if the value hasn't changed
	 *
	 * @returns {object} this
	 */
	triggerChange(ignoreDelay = false, skipCallback = false, isHardTrigger = true) {
		const self = this;

		if (!self.isRemoved) {
			isHardTrigger = enforceBoolean(isHardTrigger, true);

			if (
				(isHardTrigger || (
					self.value &&
					!deepEqual(self[CURRENT_VALUE], self.value())
				)) && self.onChange().length
			) {
				self[ON_CHANGE](skipCallback);

				if (ignoreDelay || !self.changeDelay()) {
					self[ON_CHANGE].flush();
				}
			}

			formRelationships.trigger();
		}

		return self;
	}

	/**
	 * Updates a previously set relationship. See {@link module:formRelationships#update}.
	 *
	 * @method updateRelationship
	 * @member module:FormControlBase
	 * @instance
	 *
	 * @param {object} updateObject
	 */
	updateRelationship(updateObject) {
		if (arguments.length !== 0) {
			formRelationships.update(self[RELATIONSHIP_ID], updateObject);
		}
	}

	/**
	 * Execute validation queue on this control
	 *
	 * @method validate
	 * @member module:FormControlBase
	 * @instance
	 *
	 * @returns {this}
	 */
	validate() {
		const self = this;

		if (self.onValidate()) {
			self.onValidate().trigger(null, [self.value(), self.isFocused()]);
		}

		return self;
	}
}

Object.assign(FormControl.prototype, {
	/**
	 * Changes the view of the title to express whether this control is required or not.
	 *
	 * @method isRequired
	 * @member module:FormControlBase
	 * @instance
	 *
	 * @param {boolean} [isRequired]
	 *
	 * @returns {boolean|this}
	 */
	isRequired: methodBoolean({
		set(isRequired) {
			this.classes('required', isRequired)
				.onValidate((value, isFocused) => {
					if (
						isFocused === false &&
						this.isRequired() &&
						(value === undefined || value.length === 0)
					) {
						this.error(locale.get('requiredField'));

						return true;
					}

					this.error('');

					return isFocused;
				});
		}
	}),

	data: methodObject({
		init: {}
	}),

	/**
	 * Change the delay for the onChange callback.
	 *
	 * @method changeDelay
	 * @member module:FormControlBase
	 * @instance
	 *
	 * @param {number.int} newDelay - Milliseconds
	 *
	 * @returns {number.int|this}
	 */
	changeDelay: methodInteger({
		min: 0,
		set(changeDelay) {
			this[ON_CHANGE] = debounce(function(skipCallback) {
				const self = this;

				self[CURRENT_VALUE] = self.value();

				if (!skipCallback) {
					self.onChange()
						.trigger(null, [self[CURRENT_VALUE]]);
				}
			}, changeDelay, {
				maxWait: 15000
			});
		}
	}),

	newline: methodBoolean({
		set(newline) {
			this.classes('newline', newline);
		}
	}),

	/**
	 * Determines when to fire the settings.onChange callback. Parent should call this whenever content changes. There
	 * is a 200ms delay so that fast typers don't fire of an excessive amount of callbacks. Also, if a fast typer keeps
	 * going for a long period of time, then onChange will be triggered every 15 seconds.
	 *
	 * @method onChange
	 * @member module:FormControlBase
	 * @instance
	 *
	 * @param {Function} [callback]
	 *
	 * @returns {queue}
	 */
	onChange: methodQueue(),

	onValidate: methodQueue()
});
