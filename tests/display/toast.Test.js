import { assert } from 'chai';
import { toast } from '../..';
import TestUtil from '../TestUtil';

describe('toast', () => {
	afterEach(() => toast.clear());

	const testUtil = new TestUtil(toast);

	it('should add a div with class "toast-info" when toast.info is called', () => {
		toast.info({
			title: 'test',
			duration: 0
		});

		assert.equal(testUtil.count('.toast-wrapper .toast.toast-info', true), 1);
		assert.equal(testUtil.count('span', true), 1);
		assert.equal(testUtil.count('.subtitle', true), 0);
	});

	it('should add a div with class "toast-success" when toast.success is called', () => {
		toast.success({
			title: 'test',
			subTitle: 'sub title'
		});

		assert.equal(testUtil.count('.toast-wrapper .toast.toast-success', true), 1);
	});

	it('should add a div with class "toast-warning" when toast.warning is called', () => {
		toast.warning({
			title: 'test',
			subTitle: 'sub title'
		});

		assert.equal(testUtil.count('.toast-wrapper .toast.toast-warning', true), 1);
	});

	it('should add a div with class "toast-error" when toast.error is called', () => {
		toast.error({
			title: 'test',
			subTitle: 'sub title'
		});

		assert.equal(testUtil.count('.toast-wrapper .toast.toast-error', true), 1);
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

		assert.equal(testUtil.count('.toast-wrapper .toast.toast-error', true), 2);
	});
});
