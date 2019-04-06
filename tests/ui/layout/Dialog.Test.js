import { assert } from 'chai';
import { Dialog } from '../../../src';
import TestUtil from '../../TestUtil';

new TestUtil(Dialog);

describe('Dialog', () => {
	describe('Init', () => {
		it('should instantiate without options', () => {
			window.control = new Dialog();

			assert.equal(document.querySelectorAll('.dialog').length, 1);
		});

		it('should have a class "dialog" when instantiated', () => {
			window.control = new Dialog({
				title: 'test'
			});

			assert.equal(document.querySelectorAll('.dialog').length, 1);
		});

		it('should have a div with class "dialog-header" when title is set', () => {
			window.control = new Dialog({
				title: 'test'
			});

			assert.equal(document.querySelectorAll('.dialog-header').length, 1);
		});

		it('should have a div with class "toolbar" when footer is set', () => {
			window.control = new Dialog({
				title: 'test',
				footer: {
					buttons: [{
						label: 'close'
					}]
				}
			});

			assert.equal(document.querySelectorAll('.dialog-footer').length, 1);
		});
	});
});
