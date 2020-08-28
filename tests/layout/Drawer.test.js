import { assert } from 'type-enforcer';
import { Drawer } from '../../index.js';
import TestUtil from '../TestUtil.js';

describe('Drawer', () => {
	const testUtil = new TestUtil(Drawer);
	testUtil.run({
		mainCssClass: 'drawer'
	});

	beforeEach(() => {
		testUtil.container.style.width = '1000px';
		testUtil.container.style.height = '1000px';
	});

	describe('.dock', () => {
		it('should have a class "top" if set to top', () => {
			testUtil.control = new Drawer({
				container: testUtil.container,
				dock: 'top'
			});

			assert.is(testUtil.count('.drawer.top'), 1);
		});

		it('should have a class "right" if set to right', () => {
			testUtil.control = new Drawer({
				container: testUtil.container,
				dock: 'right'
			});

			assert.is(testUtil.count('.drawer.right'), 1);
		});

		it('should have a class "bottom" if set to bottom', () => {
			testUtil.control = new Drawer({
				container: testUtil.container,
				dock: 'bottom'
			});

			assert.is(testUtil.count('.drawer.bottom'), 1);
		});

		it('should have a class "left" if set to left', () => {
			testUtil.control = new Drawer({
				container: testUtil.container,
				dock: 'left'
			});

			assert.is(testUtil.count('.drawer.left'), 1);
		});
	});

	describe('.canResize', () => {
		it('should NOT have a resizer if canResize is false', () => {
			testUtil.control = new Drawer({
				container: testUtil.container,
				dock: 'top',
				canResize: false
			});

			assert.is(testUtil.count('.resizer'), 0);
		});

		it('should have a resizer with class "horizontal" if canResize is true and dock is "top"', () => {
			testUtil.control = new Drawer({
				container: testUtil.container,
				dock: 'top',
				height: '4rem',
				canResize: true
			});

			assert.is(testUtil.count('.resizer.horizontal'), 1);
			assert.equal(testUtil.getComputedTranslateXY('.resizer'), [0, 64]);
		});

		it('should have a resizer with class "vertical" if canResize is true and dock is "right"', () => {
			testUtil.control = new Drawer({
				container: testUtil.container,
				dock: 'right',
				width: '4rem',
				canResize: true
			});

			assert.is(testUtil.count('.resizer.vertical'), 1);
			assert.equal(testUtil.getComputedTranslateXY('.resizer'), [936, 0]);
		});

		it('should have a resizer with class "horizontal" if canResize is true and dock is "bottom"', () => {
			testUtil.control = new Drawer({
				container: testUtil.container,
				dock: 'bottom',
				height: '4rem',
				canResize: true
			});

			assert.is(testUtil.count('.resizer.horizontal'), 1);
			assert.equal(testUtil.getComputedTranslateXY('.resizer'), [0, 936]);
		});

		it('should have a resizer with class "vertical" if canResize is true and dock is "left"', () => {
			testUtil.control = new Drawer({
				container: testUtil.container,
				dock: 'left',
				width: '4rem',
				canResize: true
			});

			assert.is(testUtil.count('.resizer.vertical'), 1);
			assert.equal(testUtil.getComputedTranslateXY('.resizer'), [64, 0]);
		});
	});
});
