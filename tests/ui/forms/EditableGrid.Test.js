import { wait } from 'async-agent';
import { assert } from 'chai';
import { HUNDRED_PERCENT } from 'type-enforcer';
import { EditableGrid } from '../../../src';
import * as gridConstants from '../../../src/ui/grid/gridConstants';
import TestUtil from '../../TestUtil';
import FormControlTests from './FormControlTests';

describe('EditableGrid', () => {
	const testUtil = new TestUtil(EditableGrid);
	const formControlTests = new FormControlTests(EditableGrid, testUtil);

	formControlTests.run(['width']);

	describe('Dialogs', () => {
		it('should display a dialog when the "Add New" button is clicked', () => {
			testUtil.control = new EditableGrid({
				container: testUtil.container
			});

			testUtil.simulateClick(document.querySelector('.add-new-button'));

			assert.equal(document.querySelectorAll('.dialog').length, 1);
		});

		it('should display a dialog when a row is clicked', () => {
			testUtil.control = new EditableGrid({
				container: testUtil.container,
				width: HUNDRED_PERCENT,
				columns: [{
					title: 'test',
					type: 'text',
					size: HUNDRED_PERCENT
				}]
			});

			testUtil.control.value([{
				rowId: '1',
				values: [{
					text: 'asdf'
				}]
			}]);

			return wait(1)
				.then(() => {
					testUtil.simulateClick(document.querySelector('.clickable'));

					assert.equal(document.querySelectorAll('.dialog').length, 1);
				});
		});

		it('should edit the same row that is clicked', () => {
			testUtil.control = new EditableGrid({
				container: testUtil.container,
				width: HUNDRED_PERCENT,
				columns: [{
					type: gridConstants.COLUMN_TYPES.TEXT,
					size: '*'
				}]
			});

			testUtil.control.value([{
				rowId: '1',
				values: [{
					text: 'text 1'
				}]
			}, {
				rowId: '2',
				values: [{
					text: 'text 2'
				}]
			}, {
				rowId: '3',
				values: [{
					text: 'text 3'
				}]
			}]);

			return wait(1)
				.then(() => {
					testUtil.simulateClick(document.querySelectorAll('.grid-row')[2]);

					assert.equal(document.querySelectorAll('.dialog').length, 1);
					assert.equal(document.querySelector('input[type=text]').value, 'text 3');
				});
		});
	});

	describe('SingleAndMultiOptionPickers', () => {
		it('should be able to save values from single select pickers', () => {
			testUtil.control = new EditableGrid({
				container: testUtil.container,
				columns: [{
					title: 'test',
					type: 'text',
					filterType: 'dropDown',
					size: HUNDRED_PERCENT,
					editOptions: {
						options: {
							isMultiSelect: false,
							children: [{
								id: '0',
								title: 'test option'
							}, {
								id: '1',
								title: 'test option 2'
							}]
						},
						preferred: [{
							id: '0'
						}, {
							id: '1'
						}]
					}
				}]
			});

			// open the "add new" dialog
			document.querySelector('.add-new-button').click();

			return wait(100)
				.then(() => {
					//select the preferred item from the picker
					document.querySelectorAll('.grouped-buttons .form-button')[0].click();
					document.querySelectorAll('.grouped-buttons .form-button')[1].click();
					//close the dialog
					document.querySelector('.action-button').click();

					assert.equal(testUtil.control.value()[0].values[0].text, 'test option 2');
				});
		});

		it('should be able to save values from multi select pickers', () => {
			testUtil.control = new EditableGrid({
				container: testUtil.container,
				columns: [{
					title: 'test',
					type: 'text',
					filterType: 'dropDown',
					size: HUNDRED_PERCENT,
					editOptions: {
						options: {
							isMultiSelect: true,
							children: [{
								id: '0',
								title: 'test option'
							}, {
								id: '1',
								title: 'test option 2'
							}]
						},
						preferred: [{
							id: '0'
						}, {
							id: '1'
						}]
					}
				}]
			});

			// open the "add new" dialog
			document.querySelector('.add-new-button').click();

			return wait(100)
				.then(() => {
					//select the preferred item from the picker
					document.querySelectorAll('.grouped-buttons .form-button')[0].click();
					document.querySelectorAll('.grouped-buttons .form-button')[1].click();
					//close the dialog
					document.querySelector('.action-button').click();

					assert.equal(testUtil.control.value()[0].values[0].text, 'test option, test option 2');
				});
		});

		it('should be able to save values from single select pickers when single and multi select pickers are in different columns', () => {
			testUtil.control = new EditableGrid({
				container: testUtil.container,
				columns: [{
					title: 'test',
					type: 'text',
					filterType: 'dropDown',
					size: '50%',
					editOptions: {
						options: {
							isMultiSelect: false,
							children: [{
								id: '0',
								title: 'test option'
							}, {
								id: '1',
								title: 'test option 2'
							}]
						},
						preferred: [{
							id: '0'
						}, {
							id: '1'
						}]
					}
				}, {
					title: 'test 2',
					type: 'text',
					filterType: 'dropDown',
					size: '50%',
					editOptions: {
						options: {
							isMultiSelect: true,
							children: [{
								id: '0',
								title: 'test option'
							}, {
								id: '1',
								title: 'test option 2'
							}]
						},
						preferred: [{
							id: '0'
						}, {
							id: '1'
						}]
					}
				}]
			});

			// open the "add new" dialog
			document.querySelector('.add-new-button').click();

			return wait(100)
				.then(() => {
					//select the preferred item from the picker
					document.querySelectorAll('.grouped-buttons .form-button')[0].click();
					document.querySelectorAll('.grouped-buttons .form-button')[1].click();
					//close the dialog
					document.querySelector('.action-button').click();

					assert.equal(testUtil.control.value()[0].values[0].text, 'test option 2');
				});
		});

		it('should be able to save values from multi select pickers when single and multi select pickers are in different columns', () => {
			testUtil.control = new EditableGrid({
				container: testUtil.container,
				columns: [{
					title: 'test',
					type: 'text',
					filterType: 'dropDown',
					size: '50%',
					editOptions: {
						options: {
							isMultiSelect: false,
							children: [{
								id: '0',
								title: 'test option'
							}, {
								id: '1',
								title: 'test option 2'
							}]
						},
						preferred: [{
							id: '0'
						}, {
							id: '1'
						}]
					}
				}, {
					title: 'test 2',
					type: 'text',
					filterType: 'dropDown',
					size: '50%',
					editOptions: {
						options: {
							isMultiSelect: true,
							children: [{
								id: '0',
								title: 'test option'
							}, {
								id: '1',
								title: 'test option 2'
							}]
						},
						preferred: [{
							id: '0'
						}, {
							id: '1'
						}]
					}
				}]
			});

			// open the "add new" dialog
			document.querySelector('.add-new-button').click();

			return wait(100)
				.then(() => {
					//select the preferred item from the picker
					document.querySelectorAll('.grouped-buttons button')[2].click();
					document.querySelectorAll('.grouped-buttons button')[3].click();
					//close the dialog
					document.querySelector('.action-button').click();

					assert.equal(testUtil.control.value()[0].values[1].text, 'test option, test option 2');
				});
		});
	});
});
