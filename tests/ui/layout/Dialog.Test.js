import { assert } from 'chai';
import { Dialog } from '../../../src';
import TestUtil from '../../TestUtil';

describe('Dialog', () => {
	const testUtil = new TestUtil(Dialog);

	describe('Init', () => {
		it('should instantiate without options', () => {
			testUtil.control = new Dialog();

			assert.equal(testUtil.count('.dialog', true), 1);
		});

		it('should have a class "dialog" when instantiated', () => {
			testUtil.control = new Dialog({
				title: 'test'
			});

			assert.equal(testUtil.count('.dialog', true), 1);
		});

		it('should have a div with class "dialog-header" when title is set', () => {
			testUtil.control = new Dialog({
				title: 'test'
			});

			assert.equal(testUtil.count('.dialog-header', true), 1);
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

			assert.equal(testUtil.count('.dialog-footer', true), 1);
		});
	});
});
