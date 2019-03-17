import { assert } from 'chai';
import TestUtil from '../TestUtil';
import ControlRecycler from '../../src/ui/ControlRecycler';
import Button from '../../src/ui/elements/Button';
import Icon from '../../src/ui/elements/Icon';

const testUtil = new TestUtil(ControlRecycler);

describe('ControlRecycler', () => {
	describe('Initial', () => {
		it('should not break if a setting is provided that doesn\'t correlate to a method', () => {
			window.control = new ControlRecycler({
				testSetting: 'test'
			});

			assert.equal(window.control.control(), undefined);
		});
	});

	describe('Control', () => {
		testUtil.testMethod({
			methodName: 'control',
			defaultValue: undefined,
			testValue: Button,
			secondTestValue: Icon
		});
	});

	describe('defaultSettings', () => {
		testUtil.testMethod({
			methodName: 'defaultSettings',
			defaultValue: undefined,
			testValue: {
				container: 'testContainer'
			},
			secondTestValue: {
				container: 'testContainer2'
			}
		});
	});

	describe('GetControls', () => {
		it('should NOT return an instance of a control when getRecycledControl is called if no control has been defined', () => {
			window.control = new ControlRecycler();

			assert.isNotTrue(!!window.control.getRecycledControl());
		});

		it('should return an instance of a control when getRecycledControl is called', () => {
			window.control = new ControlRecycler({
				control: Button,
				defaultSettings: {
					container: 'body'
				}
			});

			assert.isTrue(!!window.control.getRecycledControl());
		});

		it('should not discard a control if no ID is provided', () => {
			window.control = new ControlRecycler({
				control: Button,
				defaultSettings: {
					container: 'body'
				}
			});

			window.control.getRecycledControl();

			window.control.discardControl();

			window.control.getRecycledControl();

			assert.equal(window.control.totalVisibleControls(), 2);
		});

		it('should return an instance of a recycled control when getRecycledControl is called after the control is discarded', () => {
			let initialControl;
			let secondControl;

			window.control = new ControlRecycler({
				control: Button,
				defaultSettings: {
					container: 'body'
				}
			});

			initialControl = window.control.getRecycledControl();

			window.control.discardAllControls();

			secondControl = window.control.getRecycledControl();

			assert.equal(initialControl, secondControl);
		});

		it('should return the instance of a specific control when getControl is called', () => {
			let secondControl;
			let thirdControl;

			window.control = new ControlRecycler({
				control: Button,
				defaultSettings: {
					container: 'body'
				}
			});

			window.control.getRecycledControl();
			secondControl = window.control.getRecycledControl();

			secondControl.ID('test');

			thirdControl = window.control.getControl('test');

			assert.equal(secondControl, thirdControl);
		});

		it('should return an array with two controls when getRenderedControls is called after three conrols have been instantiated and one discarded', () => {
			let secondControl;

			window.control = new ControlRecycler({
				control: Button,
				defaultSettings: {
					container: 'body'
				}
			});

			window.control.getRecycledControl();
			secondControl = window.control.getRecycledControl();
			window.control.getRecycledControl();

			secondControl.ID('test');

			window.control.discardControl('test');

			assert.equal(window.control.getRenderedControls().length, 2);
		});

		it('should 2 when totalVisibleControls is called ther are two visible controls', () => {
			let secondControl;

			window.control = new ControlRecycler({
				control: Button,
				defaultSettings: {
					container: 'body'
				}
			});

			window.control.getRecycledControl();
			secondControl = window.control.getRecycledControl();
			window.control.getRecycledControl();

			secondControl.ID('test');

			window.control.discardControl('test');

			assert.equal(window.control.totalVisibleControls(), 2);
		});

		it('should get the appropriate control when getControlAtOffset is called', () => {
			let initialControl;
			let secondControl;
			let thirdControl;
			let fourthControl;

			window.control = new ControlRecycler({
				control: Button,
				defaultSettings: {
					container: 'body'
				}
			});

			initialControl = window.control.getRecycledControl();
			secondControl = window.control.getRecycledControl();
			thirdControl = window.control.getRecycledControl();

			fourthControl = window.control.getControlAtOffset(1);

			assert.notEqual(initialControl, fourthControl);
			assert.equal(secondControl, fourthControl);
			assert.notEqual(thirdControl, fourthControl);
		});
	});
});
