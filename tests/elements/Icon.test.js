import { assert } from 'type-enforcer';
import { Icon, ICON_SIZES } from '../../index.js';
import TestUtil from '../TestUtil.js';

describe('Icon', () => {
	const testUtil = new TestUtil(Icon);
	testUtil.run({ skipTests: ['width', 'height'] });

	describe('.icon', () => {
		it('should render an empty control if no icon is set', () => {
			testUtil.control = new Icon({
				container: testUtil.container
			});

			assert.is(testUtil.count('.icon'), 1);
			assert.is(testUtil.first('.icon').textContent, '');
		});

		it('should render "cog"', () => {
			testUtil.control = new Icon({
				container: testUtil.container,
				icon: 'cog'
			});

			assert.is(testUtil.count('.fa-cog'), 1);
		});

		it('should render "circle;plus"', () => {
			testUtil.control = new Icon({
				container: testUtil.container,
				icon: 'circle:plus'
			});

			const mainIcon = testUtil.first('.icon');

			assert.is(mainIcon.children.length, 1);
			assert.is(mainIcon, testUtil.first('.icon.fa-circle'));
			assert.is(mainIcon.children[0], testUtil.first('.icon.fa-plus'));
		});

		it('should render "cog[plus-circle]"', () => {
			testUtil.control = new Icon({
				container: testUtil.container,
				icon: 'cog[plus-circle]'
			});

			const mainIcon = testUtil.first('.icon');

			assert.is(mainIcon.children.length, 1);
			assert.is(mainIcon, testUtil.first('.icon.fa-cog'));
			assert.is(mainIcon.children[0], testUtil.first('.icon.sub-icon.fa-plus-circle'));
		});

		it('should render "cog[circle:plus-circle]"', () => {
			testUtil.control = new Icon({
				container: testUtil.container,
				icon: 'cog[circle:plus-circle]'
			});

			const mainIcon = testUtil.first('.icon');
			const subIcon = testUtil.first('.sub-icon');

			assert.is(mainIcon.children.length, 1);
			assert.is(mainIcon, testUtil.first('.icon.fa-cog'));
			assert.is(mainIcon.children[0], testUtil.first('.icon.sub-icon'));
			assert.is(subIcon.children.length, 1);
			assert.is(subIcon, testUtil.first('.icon.fa-circle'));
			assert.is(subIcon.children[0], testUtil.first('.icon.fa-plus-circle'));
		});
	});

	describe('.icon unicode', () => {
		it('should render ""', () => {
			testUtil.control = new Icon({
				container: testUtil.container,
				icon: ''
			});

			assert.is(testUtil.first('.icon').textContent, '');
		});

		it('should render ":"', () => {
			testUtil.control = new Icon({
				container: testUtil.container,
				icon: ':'
			});

			const mainIcon = testUtil.first('.icon');

			assert.is(mainIcon.children.length, 1);
			assert.is(mainIcon.textContent, '');
			assert.is(mainIcon.children[0].textContent, '');
		});

		it('should render ":" and then ""', () => {
			testUtil.control = new Icon({
				container: testUtil.container,
				icon: ':'
			});

			const mainIcon = testUtil.first('.icon');

			assert.is(mainIcon.children.length, 1);
			assert.is(mainIcon.textContent, '');
			assert.is(mainIcon.children[0].textContent, '');

			testUtil.control.icon('');

			assert.is(mainIcon.textContent, '');
			assert.is(testUtil.hasClass(mainIcon, 'has-stack'), false);
		});

		it('should render "[]"', () => {
			testUtil.control = new Icon({
				container: testUtil.container,
				icon: '[]'
			});

			const mainIcon = testUtil.first('.icon');

			assert.is(mainIcon.children.length, 1);
			assert.is(mainIcon.textContent, '');
			assert.is(mainIcon.children[0].textContent, '');
		});

		it('should render "[:]"', () => {
			testUtil.control = new Icon({
				container: testUtil.container,
				icon: '[:]'
			});

			const mainIcon = testUtil.first('.icon');
			const subIcon = testUtil.first('.sub-icon');

			assert.is(mainIcon.children.length, 1);
			assert.is(mainIcon.textContent, '');
			assert.is(mainIcon.children[0], testUtil.first('.icon.sub-icon'));
			assert.is(subIcon.children.length, 1);
			assert.is(subIcon.textContent, '');
			assert.is(subIcon.children[0].textContent, '');
		});

		it('should render ":[:]"', () => {
			testUtil.control = new Icon({
				container: testUtil.container,
				icon: ':[:]'
			});

			const mainIcon = testUtil.first('.icon');
			const subIcon = testUtil.first('.sub-icon');

			assert.is(mainIcon.children.length, 2);
			assert.is(mainIcon.textContent, '');
			assert.is(mainIcon.children[0], testUtil.first('.icon .icon'));
			assert.is(mainIcon.children[1], testUtil.first('.icon.sub-icon'));
			assert.is(subIcon.children.length, 1);
			assert.is(subIcon.textContent, '');
			assert.is(subIcon.children[0].textContent, '');
		});

		it('should render "::[:]"', () => {
			testUtil.control = new Icon({
				container: testUtil.container,
				icon: '::[:]'
			});

			const mainIcon = testUtil.first('.icon');
			const subIcon = testUtil.first('.sub-icon');

			assert.is(mainIcon.children.length, 2);
			assert.is(mainIcon.textContent, '');
			assert.is(mainIcon.children[0], testUtil.first('.icon .icon'));
			assert.is(mainIcon.children[1], testUtil.first('.icon.sub-icon'));
			assert.is(subIcon.children.length, 1);
			assert.is(subIcon.textContent, '');
			assert.is(subIcon.children[0].textContent, '');
		});
	});

	describe('.size', () => {
		it('should have a span with class "fa-lg"', () => {
			testUtil.control = new Icon({
				container: testUtil.container
			});

			assert.is(testUtil.count('.icon-lg'), 1);
		});

		it('should have a span with class "fa-4x" if size is set to ICON_SIZES.FOUR_TIMES', () => {
			testUtil.control = new Icon({
				container: testUtil.container,
				size: ICON_SIZES.FOUR_TIMES
			});

			assert.is(testUtil.count('.icon-4x'), 1);
		});
	});
});
