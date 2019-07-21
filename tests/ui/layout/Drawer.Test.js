import { assert } from 'chai';
import { BODY, Div, Drawer } from '../../../src';
import TestUtil from '../../TestUtil';
import ControlTests from '../ControlTests';

const testUtil = new TestUtil(Drawer);
const controlBaseTests = new ControlTests(Drawer, testUtil, {
	mainCssClass: 'drawer'
});

describe('Drawer', () => {
	controlBaseTests.run();

	const newContainer = () => {
		return new Div({
			container: BODY,
			width: 1000,
			height: 1000
		});
	};

	describe('.dock', () => {
		it('should have a class "top" if set to top', () => {
			window.control = new Drawer({
				container: window.testContainer,
				dock: 'top'
			});

			assert.equal(document.querySelectorAll('.drawer.top').length, 1);
		});

		it('should have a class "right" if set to right', () => {
			window.control = new Drawer({
				container: window.testContainer,
				dock: 'right'
			});

			assert.equal(document.querySelectorAll('.drawer.right').length, 1);
		});

		it('should have a class "bottom" if set to bottom', () => {
			window.control = new Drawer({
				container: window.testContainer,
				dock: 'bottom'
			});

			assert.equal(document.querySelectorAll('.drawer.bottom').length, 1);
		});

		it('should have a class "left" if set to left', () => {
			window.control = new Drawer({
				container: window.testContainer,
				dock: 'left'
			});

			assert.equal(document.querySelectorAll('.drawer.left').length, 1);
		});
	});

	describe('.canResize', () => {
		it('should NOT have a resizer if canResize is false', () => {
			window.control = new Drawer({
				container: newContainer(),
				dock: 'top',
				canResize: false
			});

			assert.equal(document.querySelectorAll('.resizer').length, 0);
		});

		it('should have a resizer with class "horizontal" if canResize is true and dock is "top"', () => {
			window.control = new Drawer({
				container: newContainer(),
				dock: 'top',
				height: '4rem',
				canResize: true
			});

			assert.equal(document.querySelectorAll('.resizer.horizontal').length, 1);
			assert.deepEqual(testUtil.getComputedTranslateXY('.resizer'), [0, 64]);
		});

		it('should have a resizer with class "vertical" if canResize is true and dock is "right"', () => {
			window.control = new Drawer({
				container: newContainer(),
				dock: 'right',
				width: '4rem',
				canResize: true
			});

			assert.equal(document.querySelectorAll('.resizer.vertical').length, 1);
			assert.deepEqual(testUtil.getComputedTranslateXY('.resizer'), [936, 0]);
		});

		it('should have a resizer with class "horizontal" if canResize is true and dock is "bottom"', () => {
			window.control = new Drawer({
				container: newContainer(),
				dock: 'bottom',
				height: '4rem',
				canResize: true
			});

			assert.equal(document.querySelectorAll('.resizer.horizontal').length, 1);
			assert.deepEqual(testUtil.getComputedTranslateXY('.resizer'), [0, 936]);
		});

		it('should have a resizer with class "vertical" if canResize is true and dock is "left"', () => {
			window.control = new Drawer({
				container: newContainer(),
				dock: 'left',
				width: '4rem',
				canResize: true
			});

			assert.equal(document.querySelectorAll('.resizer.vertical').length, 1);
			assert.deepEqual(testUtil.getComputedTranslateXY('.resizer'), [64, 0]);
		});
	});
});
