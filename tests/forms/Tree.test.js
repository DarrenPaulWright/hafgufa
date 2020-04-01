import { assert } from 'type-enforcer';
import { PIXELS } from 'type-enforcer-ui';
import { Tree } from '../..';
import TestUtil from '../TestUtil';
import FormControlTests from './FormControlTests';

describe('Tree', () => {
	const testUtil = new TestUtil(Tree);
	const formControlTests = new FormControlTests(Tree, testUtil, {
		mainCssClass: 'tree',
		extraSettings: {
			branches: [{
				id: '1',
				title: 'test',
				isMultiSelect: false
			}]
		}
	});

	formControlTests.run(['stopPropagation'], ['focus']);

	describe('Branches', () => {
		const flatBranches = [{
			id: '1',
			title: 'Item 1',
			isMultiSelect: false
		}, {
			id: '2',
			title: 'Item 2',
			isMultiSelect: false
		}, {
			id: '3',
			title: 'Item 3',
			isMultiSelect: false
		}];
		const nestedBranches = [{
			id: '1',
			title: 'Item 1'
		}, {
			id: '2',
			title: 'Item 2'
		}, {
			id: '3',
			title: 'Item 3',
			children: [{
				id: '4',
				title: 'Item 4'
			}, {
				id: '5',
				title: 'Item 5'
			}, {
				id: '6',
				title: 'Item 6'
			}]
		}];

		testUtil.testMethod({
			methodName: 'branches',
			defaultSettings: {
				container: testUtil.container
			},
			defaultValue: [],
			testValue: [{
				id: '1',
				title: 'test 1'
			}]
		});

		it('should have an "expander" div if there are nested branches', () => {
			testUtil.control = new Tree({
				container: testUtil.container,
				branches: nestedBranches
			});

			assert.is(testUtil.count('.heading button'), 1);
		});

		it('should display child branches when an expandable branch is expanded', () => {
			testUtil.control = new Tree({
				container: testUtil.container,
				branches: nestedBranches
			});

			testUtil.simulateClick(testUtil.first('.heading button'));

			assert.is(testUtil.count('.heading'), 6);
		});

		it('should NOT display child branches when an expandable branch is expanded and contracted', () => {
			testUtil.control = new Tree({
				container: testUtil.container,
				branches: nestedBranches
			});

			testUtil.simulateClick(testUtil.first('.heading #expander'));
			testUtil.simulateClick(testUtil.first('.heading #expander'));

			assert.is(testUtil.count('.heading'), 3);
		});

		it('should hide all expanders if none of the branches have children', () => {
			testUtil.control = new Tree({
				container: testUtil.container,
				branches: flatBranches
			});

			assert.is(testUtil.count('.heading #expander'), 0);
		});

		it('should hide all checkboxes if none of the branches are multi select', () => {
			testUtil.control = new Tree({
				container: testUtil.container,
				branches: flatBranches
			});

			assert.is(testUtil.count('.heading .checkboxes'), 0);
		});

		it('should only have one heading if branches are updated to one branch after more', () => {
			testUtil.control = new Tree({
				container: testUtil.container,
				branches: flatBranches
			});

			testUtil.control.branches([{
				id: '1',
				title: 'Item 1',
				isMultiSelect: false
			}]);

			assert.is(testUtil.count('.heading'), 1);
		});
	});

	describe('Selection', () => {
		const flatBranches = [{
			id: '1',
			title: 'Item 1',
			isMultiSelect: false
		}, {
			id: '2',
			title: 'Item 2',
			isMultiSelect: false
		}, {
			id: '3',
			title: 'Item 3',
			isMultiSelect: false
		}];
		const branches = [{
			id: '1',
			title: 'Item 1'
		}, {
			id: '2',
			title: 'Item 2'
		}, {
			id: '3',
			title: 'Item 3'
		}];

		it('should have a value of "1" if the branch with id of 1 is clicked', () => {
			testUtil.control = new Tree({
				container: testUtil.container,
				branches: branches
			});

			testUtil.simulateClick(testUtil.first('.heading'));

			assert.is(testUtil.control.value()[0], '1');
		});

		it('should have a value of "1" if the branch with id of 1 is clicked and the branch doesn\'t have a checkbox', () => {
			testUtil.control = new Tree({
				container: testUtil.container,
				branches: flatBranches
			});

			testUtil.simulateClick(testUtil.first('.heading'));

			assert.is(testUtil.control.value()[0], '1');
		});

		it('should NOT have a value if a branch is clicked twice', () => {
			testUtil.control = new Tree({
				container: testUtil.container,
				isMultiSelect: true,
				branches: branches
			});

			testUtil.simulateClick(testUtil.first('.heading'));
			testUtil.simulateClick(testUtil.first('.heading'));

			assert.is(testUtil.control.value().length, 0);
		});

		it('should have a value of [1] if the value is set to [1]', () => {
			testUtil.control = new Tree({
				container: testUtil.container,
				branches: branches
			});

			testUtil.control.value([1]);

			assert.is(testUtil.control.value()[0], 1);
		});

		it('should have a value of [1] if the value is set to the number 1', () => {
			testUtil.control = new Tree({
				container: testUtil.container,
				branches: branches
			});

			testUtil.control.value(1);

			assert.is(testUtil.control.value()[0], 1);
		});

		it('should have a value of [1,2] if the value is set to a string "1,2"', () => {
			testUtil.control = new Tree({
				container: testUtil.container,
				branches: branches
			});

			testUtil.control.value('1,2');

			assert.is(testUtil.control.value()[0] === '1' && testUtil.control.value()[1] === '2', true);
		});

		it('should have a value of [] if the value is set to the number 1 and then an empty string', () => {
			testUtil.control = new Tree({
				container: testUtil.container,
				branches: branches
			});

			testUtil.control.value(1);
			testUtil.control.value('');

			assert.equal(testUtil.control.value(), []);
		});
	});

	describe('Height', () => {
		const branches = [{
			id: '1',
			title: 'Item 1'
		}, {
			id: '2',
			title: 'Item 2'
		}, {
			id: '3',
			title: 'Item 3'
		}];
		const longSetOfBranches = [];
		for (let index = 0; index < 10; index++) {
			longSetOfBranches.push({
				id: index + '',
				title: 'Item ' + index
			});
		}

		it('should have a height three times that of a branch if there are three branches', () => {
			let rowHeight;

			testUtil.control = new Tree({
				container: testUtil.container,
				branches: branches
			});

			rowHeight = parseFloat(testUtil.first('.heading').style.height, 10);

			assert.is(Math.round(parseFloat(getComputedStyle(testUtil.first('.virtual-list')).height)), Math.round(rowHeight *
				3));
		});

		it('should have a height 50px if the height is set to 50px even if there are more rows than fit', () => {
			testUtil.control = new Tree({
				container: testUtil.container,
				branches: branches,
				height: '50px'
			});

			testUtil.control.resize();

			assert.is(getComputedStyle(testUtil.first('.virtual-list')).height, '50px');
		});

		it('should have a height three times that of a branch if the height is set to 50px and then fitHeightToContents is called', () => {
			let rowHeight;

			testUtil.control = new Tree({
				container: testUtil.container,
				branches: branches,
				height: '50px'
			});

			testUtil.control.fitHeightToContents();
			rowHeight = parseFloat(testUtil.first('.heading').style.height);

			assert.is(getComputedStyle(testUtil.first('.virtual-list')).height, Math.round(rowHeight * 3) + PIXELS);
		});

		it('should set the height of the virtual list control to the same as itself if there are more rows than fit in the height provided', () => {
			testUtil.control = new Tree({
				container: testUtil.container,
				branches: longSetOfBranches,
				height: '50px'
			});

			assert.is(getComputedStyle(testUtil.first('.virtual-list')).height, '50px');
		});
	});
});
