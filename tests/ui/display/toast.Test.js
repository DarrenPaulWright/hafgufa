import { assert } from 'chai';
import { toast } from '../../../src';
import TestUtil from '../../TestUtil';

new TestUtil(toast);

describe('toast', () => {
	afterEach(() => toast.clear());

	it('should add a div with class "toast-info" when toast.info is called', () => {
		toast.info({
			title: 'test',
			duration: 0
		});

		assert.equal(document.querySelectorAll('.toast-wrapper .toast.toast-info').length, 1);
		assert.equal(document.querySelectorAll('span').length, 1);
		assert.equal(document.querySelectorAll('.subtitle').length, 0);
	});

	it('should add a div with class "toast-success" when toast.success is called', () => {
		toast.success({
			title: 'test',
			subTitle: 'sub title'
		});

		assert.equal(document.querySelectorAll('.toast-wrapper .toast.toast-success').length, 1);
	});

	it('should add a div with class "toast-warning" when toast.warning is called', () => {
		toast.warning({
			title: 'test',
			subTitle: 'sub title'
		});

		assert.equal(document.querySelectorAll('.toast-wrapper .toast.toast-warning').length, 1);
	});

	it('should add a div with class "toast-error" when toast.error is called', () => {
		toast.error({
			title: 'test',
			subTitle: 'sub title'
		});

		assert.equal(document.querySelectorAll('.toast-wrapper .toast.toast-error').length, 1);
	});

	it('should add two divs with class "toast-error" when toast.error is called twice', () => {
		toast.error({
			title: 'test',
			subTitle: 'sub title'
		});

		toast.error({
			title: 'test',
			subTitle: 'sub title'
		});

		assert.equal(document.querySelectorAll('.toast-wrapper .toast.toast-error').length, 2);
	});
});
