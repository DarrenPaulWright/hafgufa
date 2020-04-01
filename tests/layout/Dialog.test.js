import { assert } from 'type-enforcer';
import { Dialog } from '../..';
import TestUtil from '../TestUtil';

describe('Dialog', () => {
	const testUtil = new TestUtil(Dialog);

	describe('Init', () => {
		it('should instantiate without options', () => {
			testUtil.control = new Dialog();

			assert.is(testUtil.count('.dialog', true), 1);
		});

		it('should have a class "dialog" when instantiated', () => {
			testUtil.control = new Dialog({
				title: 'test'
			});

			assert.is(testUtil.count('.dialog', true), 1);
		});

		it('should have a div with class "dialog-header" when title is set', () => {
			testUtil.control = new Dialog({
				title: 'test'
			});

			assert.is(testUtil.count('.dialog-header', true), 1);
		});

		it('should have a div with class "toolbar" when footer is set', () => {
			testUtil.control = new Dialog({
				title: 'test',
				footer: {
					buttons: [{
						label: 'close'
					}]
				}
			});

			assert.is(testUtil.count('.dialog-footer', true), 1);
		});
	});
});
