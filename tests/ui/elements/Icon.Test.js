import { assert } from 'chai';
import { Icon, ICON_SIZES } from '../../../src';
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

			assert.equal(testUtil.count('.icon'), 1);
			assert.equal(testUtil.first('.icon').textContent, '');
		});

		it('should render "cog"', () => {
			testUtil.control = new Icon({
				container: testUtil.container,
				icon: 'cog'
			});

			assert.equal(testUtil.count('.fa-cog'), 1);
		});

		it('should render "circle;plus"', () => {
			testUtil.control = new Icon({
				container: testUtil.container,
				icon: 'circle:plus'
			});

			const mainIcon = testUtil.first('.icon');

			assert.equal(mainIcon.children.length, 1);
			assert.equal(mainIcon, testUtil.first('.icon.fa-circle'));
			assert.equal(mainIcon.children[0], testUtil.first('.icon.fa-plus'));
		});

		it('should render "cog[plus-circle]"', () => {
			testUtil.control = new Icon({
				container: testUtil.container,
				icon: 'cog[plus-circle]'
			});

			const mainIcon = testUtil.first('.icon');

			assert.equal(mainIcon.children.length, 1);
			assert.equal(mainIcon, testUtil.first('.icon.fa-cog'));
			assert.equal(mainIcon.children[0], testUtil.first('.icon.sub-icon.fa-plus-circle'));
		});

		it('should render "cog[circle:plus-circle]"', () => {
			testUtil.control = new Icon({
				container: testUtil.container,
				icon: 'cog[circle:plus-circle]'
			});

			const mainIcon = testUtil.first('.icon');
			const subIcon = testUtil.first('.sub-icon');

			assert.equal(mainIcon.children.length, 1);
			assert.equal(mainIcon, testUtil.first('.icon.fa-cog'));
			assert.equal(mainIcon.children[0], testUtil.first('.icon.sub-icon'));
			assert.equal(subIcon.children.length, 1);
			assert.equal(subIcon, testUtil.first('.icon.fa-circle'));
			assert.equal(subIcon.children[0], testUtil.first('.icon.fa-plus-circle'));
		});
	});

	describe('.icon unicode', () => {
		it('should render ""', () => {
			testUtil.control = new Icon({
				container: testUtil.container,
				icon: ''
			});

			assert.equal(testUtil.first('.icon').textContent, '');
		});

		it('should render ":"', () => {
			testUtil.control = new Icon({
				container: testUtil.container,
				icon: ':'
			});

			const mainIcon = testUtil.first('.icon');

			assert.equal(mainIcon.children.length, 1);
			assert.equal(mainIcon.textContent, '');
			assert.equal(mainIcon.children[0].textContent, '');
		});

		it('should render ":" and then ""', () => {
			testUtil.control = new Icon({
				container: testUtil.container,
				icon: ':'
			});

			const mainIcon = testUtil.first('.icon');

			assert.equal(mainIcon.children.length, 1);
			assert.equal(mainIcon.textContent, '');
			assert.equal(mainIcon.children[0].textContent, '');

			testUtil.control.icon('');

			assert.equal(mainIcon.textContent, '');
			assert.isNotTrue(testUtil.hasClass(mainIcon, 'has-stack'));
		});

		it('should render "[]"', () => {
			testUtil.control = new Icon({
				container: testUtil.container,
				icon: '[]'
			});

			const mainIcon = testUtil.first('.icon');

			assert.equal(mainIcon.children.length, 1);
			assert.equal(mainIcon.textContent, '');
			assert.equal(mainIcon.children[0].textContent, '');
		});

		it('should render "[:]"', () => {
			testUtil.control = new Icon({
				container: testUtil.container,
				icon: '[:]'
			});

			const mainIcon = testUtil.first('.icon');
			const subIcon = testUtil.first('.sub-icon');

			assert.equal(mainIcon.children.length, 1);
			assert.equal(mainIcon.textContent, '');
			assert.equal(mainIcon.children[0], testUtil.first('.icon.sub-icon'));
			assert.equal(subIcon.children.length, 1);
			assert.equal(subIcon.textContent, '');
			assert.equal(subIcon.children[0].textContent, '');
		});

		it('should render ":[:]"', () => {
			testUtil.control = new Icon({
				container: testUtil.container,
				icon: ':[:]'
			});

			const mainIcon = testUtil.first('.icon');
			const subIcon = testUtil.first('.sub-icon');

			assert.equal(mainIcon.children.length, 2);
			assert.equal(mainIcon.textContent, '');
			assert.equal(mainIcon.children[0], testUtil.first('.icon .icon'));
			assert.equal(mainIcon.children[1], testUtil.first('.icon.sub-icon'));
			assert.equal(subIcon.children.length, 1);
			assert.equal(subIcon.textContent, '');
			assert.equal(subIcon.children[0].textContent, '');
		});

		it('should render "::[:]"', () => {
			testUtil.control = new Icon({
				container: testUtil.container,
				icon: '::[:]'
			});

			const mainIcon = testUtil.first('.icon');
			const subIcon = testUtil.first('.sub-icon');

			assert.equal(mainIcon.children.length, 2);
			assert.equal(mainIcon.textContent, '');
			assert.equal(mainIcon.children[0], testUtil.first('.icon .icon'));
			assert.equal(mainIcon.children[1], testUtil.first('.icon.sub-icon'));
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

			assert.equal(testUtil.count('.icon-lg'), 1);
		});

		it('should have a span with class "fa-4x" if size is set to ICON_SIZES.FOUR_TIMES', () => {
			testUtil.control = new Icon({
				container: testUtil.container,
				size: ICON_SIZES.FOUR_TIMES
			});

			assert.equal(testUtil.count('.icon-4x'), 1);
		});
	});
});
