import { assert } from 'chai';
import { PIXELS } from 'type-enforcer';
import { Tree } from '../../../src';
import TestUtil from '../../TestUtil';
import FormControlTests from './FormControlTests';

const testUtil = new TestUtil(Tree);
const formControlTests = new FormControlTests(Tree, testUtil, {
	mainCssClass: 'tree',
	extraSettings: {
		branches: [{
			ID: '1',
			title: 'test',
			isMultiSelect: false
		}]
	}
});

describe('Tree', () => {

	formControlTests.run(['stopPropagation'], ['focus']);

	describe('Branches', () => {
		const flatBranches = [{
			ID: '1',
			title: 'Item 1',
			isMultiSelect: false
		}, {
			ID: '2',
			title: 'Item 2',
			isMultiSelect: false
		}, {
			ID: '3',
			title: 'Item 3',
			isMultiSelect: false
		}];
		const nestedBranches = [{
			ID: '1',
			title: 'Item 1'
		}, {
			ID: '2',
			title: 'Item 2'
		}, {
			ID: '3',
			title: 'Item 3',
			children: [{
				ID: '4',
				title: 'Item 4'
			}, {
				ID: '5',
				title: 'Item 5'
			}, {
				ID: '6',
				title: 'Item 6'
			}]
		}];

		testUtil.testMethod({
			methodName: 'branches',
			defaultSettings: {
				container: window.testContainer
			},
			defaultValue: [],
			testValue: [{
				ID: '1',
				title: 'test 1'
			}]
		});

		it('should have an "expander" div if there are nested branches', () => {
			window.control = new Tree({
				container: window.testContainer,
				branches: nestedBranches
			});

			return testUtil.defer()
				.then(() => {
					assert.equal(document.querySelectorAll('.heading button').length, 1);
				});
		});

		it('should display child branches when an expandable branch is expanded', () => {
			window.control = new Tree({
				container: window.testContainer,
				branches: nestedBranches
			});

			return testUtil.defer()
				.then(() => {
					testUtil.simulateClick(document.querySelector('.heading button'));

					return testUtil.defer();
				})
				.then(() => {
					assert.equal(document.querySelectorAll('.heading').length, 6);
				});
		});

		it('should NOT display child branches when an expandable branch is expanded and contracted', () => {
			window.control = new Tree({
				container: window.testContainer,
				branches: nestedBranches
			});

			testUtil.simulateClick(document.querySelector('.heading .expander.expandable'));
			testUtil.simulateClick(document.querySelector('.heading .expander.expandable'));

			return testUtil.defer()
				.then(() => {
					assert.equal(document.querySelectorAll('.heading').length, 3);
				});
		});

		it('should hide all expanders if none of the branches have children', () => {
			window.control = new Tree({
				container: window.testContainer,
				branches: flatBranches
			});

			return testUtil.defer()
				.then(() => {
					assert.equal(document.querySelectorAll('.heading .expander').length, 0);
				});
		});

		it('should hide all checkboxes if none of the branches are multi select', () => {
			window.control = new Tree({
				container: window.testContainer,
				branches: flatBranches
			});

			return testUtil.defer()
				.then(() => {
					assert.equal(document.querySelectorAll('.heading .checkboxes').length, 0);
				});
		});
	});

	describe('Selection', () => {
		const flatBranches = [{
			ID: '1',
			title: 'Item 1',
			isMultiSelect: false
		}, {
			ID: '2',
			title: 'Item 2',
			isMultiSelect: false
		}, {
			ID: '3',
			title: 'Item 3',
			isMultiSelect: false
		}];
		const branches = [{
			ID: '1',
			title: 'Item 1'
		}, {
			ID: '2',
			title: 'Item 2'
		}, {
			ID: '3',
			title: 'Item 3'
		}];

		it('should have a value of "1" if the branch with ID of 1 is clicked', () => {
			window.control = new Tree({
				container: window.testContainer,
				branches: branches
			});

			testUtil.simulateClick(document.querySelector('.heading'));

			assert.equal(window.control.value()[0], 1);
		});

		it('should have a value of "1" if the branch with ID of 1 is clicked and the branch doesn\'t have a checkbox', () => {
			window.control = new Tree({
				container: window.testContainer,
				branches: flatBranches
			});

			testUtil.simulateClick(document.querySelector('.heading'));

			assert.equal(window.control.value()[0], 1);
		});

		it('should NOT have a value if a branch is clicked twice', () => {
			window.control = new Tree({
				container: window.testContainer,
				isMultiSelect: true,
				branches: branches
			});

			testUtil.simulateClick(document.querySelector('.heading'));
			testUtil.simulateClick(document.querySelector('.heading'));

			assert.equal(window.control.value().length, 0);
		});

		it('should have a value of [1] if the value is set to [1]', () => {
			window.control = new Tree({
				container: window.testContainer,
				branches: branches
			});

			window.control.value([1]);

			assert.equal(window.control.value()[0], 1);
		});

		it('should have a value of [1] if the value is set to the number 1', () => {
			window.control = new Tree({
				container: window.testContainer,
				branches: branches
			});

			window.control.value(1);

			assert.equal(window.control.value()[0], 1);
		});

		it('should have a value of [1,2] if the value is set to a string "1,2"', () => {
			window.control = new Tree({
				container: window.testContainer,
				branches: branches
			});

			window.control.value('1,2');

			assert.isTrue(window.control.value()[0] === '1' && window.control.value()[1] === '2');
		});

		it('should have a value of [] if the value is set to the number 1 and then an empty string', () => {
			window.control = new Tree({
				container: window.testContainer,
				branches: branches
			});

			window.control.value(1);
			window.control.value('');

			assert.deepEqual(window.control.value(), []);
		});
	});

	describe('Height', () => {
		const branches = [{
			ID: '1',
			title: 'Item 1'
		}, {
			ID: '2',
			title: 'Item 2'
		}, {
			ID: '3',
			title: 'Item 3'
		}];
		const longSetOfBranches = [];
		for (let index = 0; index < 10; index++) {
			longSetOfBranches.push({
				ID: index + '',
				title: 'Item ' + index
			});
		}

		it('should have a height three times that of a branch if there are three branches', () => {
			let rowHeight;

			window.control = new Tree({
				container: window.testContainer,
				branches: branches
			});

			return testUtil.defer()
				.then(() => {
					rowHeight = parseFloat(document.querySelector('.heading').style.height, 10);

					assert.equal(getComputedStyle(document.querySelector('.virtual-list')).height, (rowHeight * 3) + PIXELS);
				});
		});

		it('should have a height 50px if the height is set to 50px even if there are more rows than fit', () => {
			window.control = new Tree({
				container: window.testContainer,
				branches: branches,
				height: '50px'
			});

			window.control.resize();

			assert.equal(getComputedStyle(document.querySelector('.virtual-list')).height, '50px');
		});

		it('should have a height three times that of a branch if the height is set to 50px and then fitHeightToContents is called', () => {
			let rowHeight;

			window.control = new Tree({
				container: window.testContainer,
				branches: branches,
				height: '50px'
			});

			window.control.fitHeightToContents();
			return testUtil.defer()
				.then(() => {
					rowHeight = parseFloat(document.querySelector('.heading').style.height, 10);

					assert.equal(getComputedStyle(document.querySelector('.virtual-list')).height, (rowHeight * 3) + PIXELS);
				});
		});

		it('should set the height of the virtual list control to the same as itself if there are more rows than fit in the height provided', () => {
			window.control = new Tree({
				container: window.testContainer,
				branches: longSetOfBranches,
				height: '50px'
			});

			assert.equal(getComputedStyle(document.querySelector('.virtual-list')).height, '50px');
		});
	});
});
