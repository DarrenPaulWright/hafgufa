import { wait } from 'async-agent';
import { assert } from 'type-enforcer';
import { DockPoint } from 'type-enforcer-ui';
import { MOUSE_ENTER_EVENT, MOUSE_LEAVE_EVENT } from '../../src/utility/domConstants.js';
import extendsTestRegister from '../extendsTestRegister.js';
import ExtendsTestRunner, { CONTROL, TEST_UTIL } from '../ExtendsTestRunner.js';

export default class TooltipMixinTests extends ExtendsTestRunner {
	tooltip() {
		const self = this;

		it('should not display a tooltip if no tooltip is set', () => {
			self[TEST_UTIL].control = new self[CONTROL](self.buildSettings({
				tooltipDelay: 0
			}));

			self[TEST_UTIL].trigger(self[TEST_UTIL].control.element, MOUSE_ENTER_EVENT);

			assert.is(self[TEST_UTIL].count('.tooltip', true), 0);
		});

		it('should display a tooltip if set', () => {
			self[TEST_UTIL].control = new self[CONTROL](self.buildSettings({
				tooltip: 'test',
				tooltipDelay: 0
			}));

			self[TEST_UTIL].trigger(self[TEST_UTIL].control.element, MOUSE_ENTER_EVENT);

			assert.is(self[TEST_UTIL].count('.tooltip', true), 1);

			self[TEST_UTIL].trigger(self[TEST_UTIL].control.element, MOUSE_LEAVE_EVENT);

			assert.is(self[TEST_UTIL].count('.tooltip', true), 0);
		});

		it('should NOT show a tooltip when the tooltip method is set and then unset', () => {
			self[TEST_UTIL].control = new self[CONTROL](self.buildSettings({
				tooltip: 'test',
				tooltipDelay: 0
			}));

			self[TEST_UTIL].control.tooltip('');

			self[TEST_UTIL].trigger(self[TEST_UTIL].control.element, MOUSE_ENTER_EVENT);

			assert.is(self[TEST_UTIL].count('.tooltip', true), 0);
		});
	}

	tooltipDockPoint() {
		const self = this;

		it('should have an arrow with class "top" if tooltipDockPoint is on top', () => {
			self[TEST_UTIL].container.style.margin = '10rem';
			self[TEST_UTIL].control = new self[CONTROL](self.buildSettings({
				tooltip: 'test',
				tooltipDockPoint: DockPoint.POINTS.TOP_CENTER,
				tooltipDelay: 0
			}));

			self[TEST_UTIL].trigger(self[TEST_UTIL].control.element, MOUSE_ENTER_EVENT);

			assert.is(self[TEST_UTIL].count('.tooltip .popup-arrow.top', true), 1);
		});

		it('should have an arrow with class "right" if tooltipDockPoint is on right', () => {
			self[TEST_UTIL].container.style.margin = '10rem';
			self[TEST_UTIL].control = new self[CONTROL](self.buildSettings({
				tooltip: 'test',
				tooltipDockPoint: DockPoint.POINTS.RIGHT_CENTER,
				tooltipDelay: 0
			}));

			self[TEST_UTIL].trigger(self[TEST_UTIL].control.element, MOUSE_ENTER_EVENT);

			assert.is(self[TEST_UTIL].count('.tooltip .popup-arrow.right', true), 1);
		});

		it('should have an arrow with class "bottom" if tooltipDockPoint is on bottom', () => {
			self[TEST_UTIL].container.style.margin = '10rem';
			self[TEST_UTIL].control = new self[CONTROL](self.buildSettings({
				tooltip: 'test',
				tooltipDockPoint: DockPoint.POINTS.BOTTOM_CENTER,
				tooltipDelay: 0
			}));

			self[TEST_UTIL].trigger(self[TEST_UTIL].control.element, MOUSE_ENTER_EVENT);

			assert.is(self[TEST_UTIL].count('.tooltip .popup-arrow.bottom', true), 1);
		});

		it('should have an arrow with class "left" if tooltipDockPoint is on left', () => {
			self[TEST_UTIL].container.style.margin = '10rem';
			self[TEST_UTIL].control = new self[CONTROL](self.buildSettings({
				tooltip: 'test',
				tooltipDockPoint: DockPoint.POINTS.LEFT_CENTER,
				tooltipDelay: 0
			}));

			self[TEST_UTIL].trigger(self[TEST_UTIL].control.element, MOUSE_ENTER_EVENT);

			assert.is(self[TEST_UTIL].count('.tooltip .popup-arrow.left', true), 1);
		});
	}

	tooltipDelay() {
		const self = this;

		it('should default to 0.5', () => {
			self[TEST_UTIL].control = new self[CONTROL](self.buildSettings({
				tooltip: 'test'
			}));

			assert.is(self[TEST_UTIL].control.tooltipDelay(), 0.5);
		});

		it('should wait to render the tooltip', () => {
			self[TEST_UTIL].control = new self[CONTROL](self.buildSettings({
				tooltip: 'test',
				tooltipDelay: 0.1
			}));

			self[TEST_UTIL].trigger(self[TEST_UTIL].control.element, MOUSE_ENTER_EVENT);

			assert.is(self[TEST_UTIL].count('.tooltip', true), 0);

			return wait(50)
				.then(() => {
					assert.is(self[TEST_UTIL].count('.tooltip', true), 0);
					return wait(50);
				})
				.then(() => {
					assert.is(self[TEST_UTIL].count('.tooltip', true), 1);
				});
		});
	}
}

extendsTestRegister.register('TooltipMixin', TooltipMixinTests);
