import { assert } from 'chai';
import { Drawer } from '../../../src';
import TestUtil from '../../TestUtil';
import ControlTests from '../ControlTests';

describe('Drawer', () => {
	const testUtil = new TestUtil(Drawer);
	const controlBaseTests = new ControlTests(Drawer, testUtil, {
		mainCssClass: 'drawer'
	});

	controlBaseTests.run();

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

			assert.equal(document.querySelectorAll('.drawer.top').length, 1);
		});

		it('should have a class "right" if set to right', () => {
			testUtil.control = new Drawer({
				container: testUtil.container,
				dock: 'right'
			});

			assert.equal(document.querySelectorAll('.drawer.right').length, 1);
		});

		it('should have a class "bottom" if set to bottom', () => {
			testUtil.control = new Drawer({
				container: testUtil.container,
				dock: 'bottom'
			});

			assert.equal(document.querySelectorAll('.drawer.bottom').length, 1);
		});

		it('should have a class "left" if set to left', () => {
			testUtil.control = new Drawer({
				container: testUtil.container,
				dock: 'left'
			});

			assert.equal(document.querySelectorAll('.drawer.left').length, 1);
		});
	});

	describe('.canResize', () => {
		it('should NOT have a resizer if canResize is false', () => {
			testUtil.control = new Drawer({
				container: testUtil.container,
				dock: 'top',
				canResize: false
			});

			assert.equal(document.querySelectorAll('.resizer').length, 0);
		});

		it('should have a resizer with class "horizontal" if canResize is true and dock is "top"', () => {
			testUtil.control = new Drawer({
				container: testUtil.container,
				dock: 'top',
				height: '4rem',
				canResize: true
			});

			assert.equal(document.querySelectorAll('.resizer.horizontal').length, 1);
			assert.deepEqual(testUtil.getComputedTranslateXY('.resizer'), [0, 64]);
		});

		it('should have a resizer with class "vertical" if canResize is true and dock is "right"', () => {
			testUtil.control = new Drawer({
				container: testUtil.container,
				dock: 'right',
				width: '4rem',
				canResize: true
			});

			assert.equal(document.querySelectorAll('.resizer.vertical').length, 1);
			assert.deepEqual(testUtil.getComputedTranslateXY('.resizer'), [936, 0]);
		});

		it('should have a resizer with class "horizontal" if canResize is true and dock is "bottom"', () => {
			testUtil.control = new Drawer({
				container: testUtil.container,
				dock: 'bottom',
				height: '4rem',
				canResize: true
			});

			assert.equal(document.querySelectorAll('.resizer.horizontal').length, 1);
			assert.deepEqual(testUtil.getComputedTranslateXY('.resizer'), [0, 936]);
		});

		it('should have a resizer with class "vertical" if canResize is true and dock is "left"', () => {
			testUtil.control = new Drawer({
				container: testUtil.container,
				dock: 'left',
				width: '4rem',
				canResize: true
			});

			assert.equal(document.querySelectorAll('.resizer.vertical').length, 1);
			assert.deepEqual(testUtil.getComputedTranslateXY('.resizer'), [64, 0]);
		});
	});
});
