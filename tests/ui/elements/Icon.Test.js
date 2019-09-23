import { assert } from 'chai';
import { Icon, ICON_SIZES } from '../../../src';
import TestUtil from '../../TestUtil';
import ControlTests from '../ControlTests';

describe('Icon', () => {
	const testUtil = new TestUtil(Icon);
	const controlTests = new ControlTests(Icon, testUtil);

	controlTests.run(['width', 'height']);

	describe('.icon', () => {
		it('should have a span with classes "fa" and "fa-fw" if no icon is set', () => {
			testUtil.control = new Icon({
				container: testUtil.container
			});

			assert.equal(document.querySelectorAll('.icon').length, 1);
		});

		it('should have a span with class "fa-cog" if icon is set to "cog"', () => {
			testUtil.control = new Icon({
				container: testUtil.container,
				icon: 'cog'
			});

			assert.equal(document.querySelectorAll('.fa-cog').length, 1);
		});

		it('should have a span with class "fa-stack" and two inner spans with respective classes "fa-circle" and "fa-plus" if icon is set to "circle;plus"', () => {
			testUtil.control = new Icon({
				container: testUtil.container,
				icon: 'circle;plus'
			});

			const mainIcon = document.querySelector('.icon');

			assert.equal(mainIcon.children.length, 2);
			assert.equal(mainIcon.children[0], document.querySelector('.icon.fa-circle'));
			assert.equal(mainIcon.children[1], document.querySelector('.icon.fa-plus'));
		});

		it('should have appropriate spans if icon is set to "cog;[plus-circle]"', () => {
			testUtil.control = new Icon({
				container: testUtil.container,
				icon: 'cog;[plus-circle]'
			});

			const mainIcon = document.querySelector('.icon');

			assert.equal(mainIcon.children.length, 2);
			assert.equal(mainIcon.children[0], document.querySelector('.icon.fa-cog'));
			assert.equal(mainIcon.children[1], document.querySelector('.icon.sub-icon.fa-plus-circle'));
		});

		it('should have appropriate spans if icon is set to "cog;[circle:plus-circle]"', () => {
			testUtil.control = new Icon({
				container: testUtil.container,
				icon: 'cog;[circle:plus-circle]'
			});

			const mainIcon = document.querySelector('.icon');
			const subIcon = document.querySelector('.sub-icon');

			assert.equal(mainIcon.children.length, 2);
			assert.equal(mainIcon.children[0], document.querySelector('.icon.fa-cog'));
			assert.equal(mainIcon.children[1], document.querySelector('.icon.sub-icon'));
			assert.equal(subIcon.children.length, 2);
			assert.equal(subIcon.children[0], document.querySelector('.icon.fa-circle'));
			assert.equal(subIcon.children[1], document.querySelector('.icon.fa-plus-circle'));
		});
	});

	describe('.icon unicode', () => {
		it('should have a span with the proper unicode char if icon is set to ""', () => {
			testUtil.control = new Icon({
				container: testUtil.container,
				icon: ''
			});

			assert.equal(document.querySelector('.icon').textContent, '');
		});

		it('should have a span with class "fa-stack" and two inner spans with respective text "" and "" if icon is set to ";"', () => {
			testUtil.control = new Icon({
				container: testUtil.container,
				icon: ';'
			});

			const mainIcon = document.querySelector('.icon');

			assert.equal(mainIcon.children.length, 2);
			assert.equal(mainIcon.children[0].textContent, '');
			assert.equal(mainIcon.children[1].textContent, '');
		});

		it('should have appropriate spans if icon is set to ";[]"', () => {
			testUtil.control = new Icon({
				container: testUtil.container,
				icon: ';[]'
			});

			const mainIcon = document.querySelector('.icon');

			assert.equal(mainIcon.children.length, 2);
			assert.equal(mainIcon.children[0].textContent, '');
			assert.equal(mainIcon.children[1].textContent, '');
		});

		it('should have appropriate spans if icon is set to ";[:]"', () => {
			testUtil.control = new Icon({
				container: testUtil.container,
				icon: ';[:]'
			});

			const mainIcon = document.querySelector('.icon');
			const subIcon = document.querySelector('.sub-icon');

			assert.equal(mainIcon.children.length, 2);
			assert.equal(mainIcon.children[0].textContent, '');
			assert.equal(mainIcon.children[1], document.querySelector('.icon.sub-icon'));
			assert.equal(subIcon.children.length, 2);
			assert.equal(subIcon.children[0].textContent, '');
			assert.equal(subIcon.children[1].textContent, '');
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
