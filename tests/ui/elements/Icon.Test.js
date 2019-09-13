import { assert } from 'chai';
import { Icon, ICON_SIZES } from '../../../src';
import query from '../../query';
import TestUtil from '../../TestUtil';
import ControlTests from '../ControlTests';

describe('Icon', () => {
	const testUtil = new TestUtil(Icon);
	const controlTests = new ControlTests(Icon, testUtil);

	controlTests.run(['width', 'height']);

	describe('.icon', () => {
		it('should render an empty control if no icon is set', () => {
			testUtil.control = new Icon({
				container: testUtil.container
			});

			assert.equal(document.querySelectorAll('.icon').length, 1);
			assert.equal(document.querySelector('.icon').textContent, '');
		});

		it('should render "cog"', () => {
			testUtil.control = new Icon({
				container: testUtil.container,
				icon: 'cog'
			});

			assert.equal(document.querySelectorAll('.fa-cog').length, 1);
		});

		it('should render "circle;plus"', () => {
			testUtil.control = new Icon({
				container: testUtil.container,
				icon: 'circle:plus'
			});

			const mainIcon = document.querySelector('.icon');

			assert.equal(mainIcon.children.length, 1);
			assert.equal(mainIcon, document.querySelector('.icon.fa-circle'));
			assert.equal(mainIcon.children[0], document.querySelector('.icon.fa-plus'));
		});

		it('should render "cog[plus-circle]"', () => {
			testUtil.control = new Icon({
				container: testUtil.container,
				icon: 'cog[plus-circle]'
			});

			const mainIcon = document.querySelector('.icon');

			assert.equal(mainIcon.children.length, 1);
			assert.equal(mainIcon, document.querySelector('.icon.fa-cog'));
			assert.equal(mainIcon.children[0], document.querySelector('.icon.sub-icon.fa-plus-circle'));
		});

		it('should render "cog[circle:plus-circle]"', () => {
			testUtil.control = new Icon({
				container: testUtil.container,
				icon: 'cog[circle:plus-circle]'
			});

			const mainIcon = document.querySelector('.icon');
			const subIcon = document.querySelector('.sub-icon');

			assert.equal(mainIcon.children.length, 1);
			assert.equal(mainIcon, document.querySelector('.icon.fa-cog'));
			assert.equal(mainIcon.children[0], document.querySelector('.icon.sub-icon'));
			assert.equal(subIcon.children.length, 1);
			assert.equal(subIcon, document.querySelector('.icon.fa-circle'));
			assert.equal(subIcon.children[0], document.querySelector('.icon.fa-plus-circle'));
		});
	});

	describe('.icon unicode', () => {
		it('should render ""', () => {
			testUtil.control = new Icon({
				container: testUtil.container,
				icon: ''
			});

			assert.equal(document.querySelector('.icon').textContent, '');
		});

		it('should render ":"', () => {
			testUtil.control = new Icon({
				container: testUtil.container,
				icon: ':'
			});

			const mainIcon = document.querySelector('.icon');

			assert.equal(mainIcon.children.length, 1);
			assert.equal(mainIcon.textContent, '');
			assert.equal(mainIcon.children[0].textContent, '');
		});

		it('should render ":" and then ""', () => {
			testUtil.control = new Icon({
				container: testUtil.container,
				icon: ':'
			});

			const mainIcon = document.querySelector('.icon');

			assert.equal(mainIcon.children.length, 1);
			assert.equal(mainIcon.textContent, '');
			assert.equal(mainIcon.children[0].textContent, '');

			window.control.icon('');

			assert.equal(mainIcon.textContent, '');
			assert.isNotTrue(query.hasClass(mainIcon, 'has-stack'));
		});

		it('should render "[]"', () => {
			window.control = new Icon({
				container: window.testContainer,
				icon: '[]'
			});

			const mainIcon = document.querySelector('.icon');

			assert.equal(mainIcon.children.length, 1);
			assert.equal(mainIcon.textContent, '');
			assert.equal(mainIcon.children[0].textContent, '');
		});

		it('should render "[:]"', () => {
			window.control = new Icon({
				container: window.testContainer,
				icon: '[:]'
			});

			const mainIcon = document.querySelector('.icon');
			const subIcon = document.querySelector('.sub-icon');

			assert.equal(mainIcon.children.length, 1);
			assert.equal(mainIcon.textContent, '');
			assert.equal(mainIcon.children[0], document.querySelector('.icon.sub-icon'));
			assert.equal(subIcon.children.length, 1);
			assert.equal(subIcon.textContent, '');
			assert.equal(subIcon.children[0].textContent, '');
		});

		it('should render ":[:]"', () => {
			window.control = new Icon({
				container: window.testContainer,
				icon: ':[:]'
			});

			const mainIcon = document.querySelector('.icon');
			const subIcon = document.querySelector('.sub-icon');

			assert.equal(mainIcon.children.length, 2);
			assert.equal(mainIcon.textContent, '');
			assert.equal(mainIcon.children[0], document.querySelector('.icon .icon'));
			assert.equal(mainIcon.children[1], document.querySelector('.icon.sub-icon'));
			assert.equal(subIcon.children.length, 1);
			assert.equal(subIcon.textContent, '');
			assert.equal(subIcon.children[0].textContent, '');
		});

		it('should render "::[:]"', () => {
			testUtil.control = new Icon({
				container: testUtil.container,
				icon: '::[:]'
			});

			const mainIcon = document.querySelector('.icon');
			const subIcon = document.querySelector('.sub-icon');

			assert.equal(mainIcon.children.length, 2);
			assert.equal(mainIcon.textContent, '');
			assert.equal(mainIcon.children[0], document.querySelector('.icon .icon'));
			assert.equal(mainIcon.children[1], document.querySelector('.icon.sub-icon'));
			assert.equal(subIcon.children.length, 1);
			assert.equal(subIcon.textContent, '');
			assert.equal(subIcon.children[0].textContent, '');
		});
	});

	describe('.size', () => {
		it('should have a span with class "fa-lg"', () => {
			testUtil.control = new Icon({
				container: testUtil.container
			});

			assert.equal(document.querySelectorAll('.icon-lg').length, 1);
		});

		it('should have a span with class "fa-4x" if size is set to ICON_SIZES.FOUR_TIMES', () => {
			testUtil.control = new Icon({
				container: testUtil.container,
				size: ICON_SIZES.FOUR_TIMES
			});

			assert.equal(document.querySelectorAll('.icon-4x').length, 1);
		});
	});
});
