import { wait } from 'async-agent';
import { assert } from 'type-enforcer';
import extendsTestRegister from '../extendsTestRegister.js';
import ExtendsTestRunner, { CONTROL, SETTINGS, TEST_UTIL } from '../ExtendsTestRunner.js';

const isElementFocused = (element) => {
	return element === document.activeElement ||
		element.contains(document.activeElement);
};

export default class FocusMixinTests extends ExtendsTestRunner {
	isFocused() {
		const self = this;

		it('should focus the control when isFocused(true) is called', () => {
			self[TEST_UTIL].control = new self[CONTROL](self.buildSettings({
				isFocusable: true
			}));

			self[TEST_UTIL].control.isFocused(true);

			assert.is(
				isElementFocused(self[TEST_UTIL].control.element),
				true
			);
		});

		it('should return true when isFocused is called after focused', () => {
			self[TEST_UTIL].control = new self[CONTROL](self.buildSettings({
				isFocusable: true
			}));

			self[TEST_UTIL].control.isFocused(true);

			assert.is(self[TEST_UTIL].control.isFocused(), true);
		});

		it('should blur the control when isFocused(false) is called', () => {
			self[TEST_UTIL].control = new self[CONTROL](self.buildSettings({
				isFocusable: true
			}));

			self[TEST_UTIL].control.isFocused(true);
			self[TEST_UTIL].control.isFocused(false);

			assert.is(
				isElementFocused(self[TEST_UTIL].control.element),
				false
			);
		});

		it('should return false when isFocused is called after focused and blurred', () => {
			self[TEST_UTIL].control = new self[CONTROL](self.buildSettings({
				isFocusable: true
			}));

			self[TEST_UTIL].control.isFocused(true).isFocused(false);

			assert.is(self[TEST_UTIL].control.isFocused(), false);
		});

		it('should return false after the active element is blurred', () => {
			self[TEST_UTIL].control = new self[CONTROL](self.buildSettings({
				isFocusable: true
			}));

			self[TEST_UTIL].control.isFocused(true);
			document.activeElement.blur();

			assert.is(self[TEST_UTIL].control.isFocused(), false);
		});
	}

	onFocus() {
		const self = this;

		if (!self[SETTINGS].autoFocus) {
			it('should not call the onFocus callback if the control is not focused', () => {
				let testItem = 0;

				self[TEST_UTIL].control = new self[CONTROL](self.buildSettings({
					isFocusable: true,
					onFocus() {
						testItem += 1;
					}
				}));

				assert.is(testItem, 0);
			});
		}

		it('should call the callback when isFocused(true) is called', () => {
			let testValue = 0;

			self[TEST_UTIL].control = new self[CONTROL](self.buildSettings({
				isFocusable: true,
				onFocus() {
					testValue++;
				}
			}));

			self[TEST_UTIL].control.isFocused(true);

			assert.is(testValue, 1);
		});

		if (self[SETTINGS].focusableElement) {
			it('should call the callback when focused', () => {
				let testItem = 0;

				self[TEST_UTIL].control = new self[CONTROL](self.buildSettings({
					isFocusable: true,
					onFocus() {
						testItem += 1;
					}
				}));

				self[TEST_UTIL].first(self[SETTINGS].focusableElement).focus();

				assert.is(testItem, 1);
			});
		}

		if (self[SETTINGS].focusableSubElement) {
			it('should call the callback when a second focusable element is focused', () => {
				let testItem = 0;

				self[TEST_UTIL].control = new self[CONTROL](self.buildSettings({
					isFocusable: true,
					onFocus() {
						testItem += 1;
					}
				}));

				self[TEST_UTIL].nth(self[SETTINGS].focusableSubElement, 1).focus();

				return wait(1)
					.then(() => {
						assert.is(testItem, 1);
					});
			});
		}

		if (!self[SETTINGS].autoFocus) {
			it(
				'should not call the onBlur callback if .isFocused(false) is called when the control doesn\'t have focus',
				() => {
					let testItem = 0;

					self[TEST_UTIL].control = new self[CONTROL](self.buildSettings({
						isFocusable: true,
						onBlur() {
							testItem += 1;
						}
					}));

					self[TEST_UTIL].control.isFocused(false);

					assert.is(testItem, 0);
				}
			);
		}
	}

	onBlur() {
		const self = this;

		it('should not call the callback if the control is not focused', () => {
			let testItem = 0;

			self[TEST_UTIL].control = new self[CONTROL](self.buildSettings({
				isFocusable: true,
				onBlur() {
					testItem += 1;
				}
			}));

			assert.is(testItem, 0);
		});

		it('should call the callback when isFocused(false) is called', () => {
			let testValue = 0;

			self[TEST_UTIL].control = new self[CONTROL](self.buildSettings({
				isFocusable: true,
				onBlur() {
					testValue++;
				}
			}));

			self[TEST_UTIL].control.isFocused(true);
			self[TEST_UTIL].control.isFocused(false);

			return wait(1)
				.then(() => {
					assert.is(testValue, 1);
					assert.is(self[TEST_UTIL].control.isFocused(), false);
				});
		});

		if (self[SETTINGS].focusableSubElement) {
			it('should call the callback when a second focusable element is blurred', () => {
				let testItem = 0;

				self[TEST_UTIL].control = new self[CONTROL](self.buildSettings({
					isFocusable: true,
					onFocus() {
						testItem += 1;
					}
				}));

				self[TEST_UTIL].nth(self[SETTINGS].focusableSubElement, 1).focus();

				return wait(1)
					.then(() => {
						assert.is(testItem, 1);
					});
			});

			if (self[SETTINGS].focusableElement) {
				it(
					'should NOT call the callback if the main element is focused and then the subControl is focused',
					() => {
						let testItem = 0;

						self[TEST_UTIL].control = new self[CONTROL](self.buildSettings({
							isFocusable: true,
							onBlur() {
								testItem += 1;
							}
						}));

						self[TEST_UTIL].first(self[SETTINGS].focusableElement).focus();
						self[TEST_UTIL].nth(self[SETTINGS].focusableSubElement, 1).focus();

						assert.is(testItem, 0);
					}
				);

				it(
					'should NOT call the callback if the subControl is focused and then the main element is focused',
					() => {
						let testItem = 0;

						self[TEST_UTIL].control = new self[CONTROL](self.buildSettings({
							isFocusable: true,
							onBlur() {
								testItem += 1;
							}
						}));

						self[TEST_UTIL].nth(self[SETTINGS].focusableSubElement, 1).focus();
						self[TEST_UTIL].first(self[SETTINGS].focusableElement).focus();

						assert.is(testItem, 0);
					}
				);
			}
		}

		if (self[SETTINGS].focusableElement) {
			it('should call the callback when blurred', () => {
				let testItem = 0;

				self[TEST_UTIL].control = new self[CONTROL](self.buildSettings({
					isFocusable: true,
					onBlur() {
						testItem += 1;
					}
				}));

				const element = self[TEST_UTIL].first(self[SETTINGS].focusableElement);
				element.focus();
				element.blur();

				return wait(1)
					.then(() => {
						assert.is(testItem, 1);
					});
			});
		}
	}
}

extendsTestRegister.register('FocusMixin', FocusMixinTests);
