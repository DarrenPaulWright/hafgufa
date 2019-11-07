import { wait } from 'async-agent';
import { assert } from 'chai';
import { HUNDRED_PERCENT } from 'type-enforcer-ui';
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

			testUtil.simulateClick(testUtil.first('.add-new-button'));

			assert.equal(testUtil.count('.dialog', true), 1);
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
					testUtil.simulateClick(testUtil.first('.clickable'));

					assert.equal(testUtil.count('.dialog', true), 1);
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
					testUtil.simulateClick(testUtil.nth('.grid-row', 2));

					assert.equal(testUtil.count('.dialog', true), 1);
					assert.equal(testUtil.first('input[type=text]', true).value, 'text 3');
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
			testUtil.first('.add-new-button').click();

			return wait(100)
				.then(() => {
					//select the preferred item from the picker
					testUtil.nth('.grouped-buttons .form-button', 0, true).click();
					testUtil.nth('.grouped-buttons .form-button', 1, true).click();
					//close the dialog
					testUtil.first('.action-button', true).click();

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
			testUtil.first('.add-new-button').click();

			return wait(100)
				.then(() => {
					//select the preferred item from the picker
					testUtil.nth('.grouped-buttons .form-button', 0, true).click();
					testUtil.nth('.grouped-buttons .form-button', 1, true).click();
					//close the dialog
					testUtil.first('.action-button', true).click();

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
			testUtil.first('.add-new-button').click();

			return wait(100)
				.then(() => {
					//select the preferred item from the picker
					testUtil.nth('.grouped-buttons .form-button', 0, true).click();
					testUtil.nth('.grouped-buttons .form-button', 1, true).click();
					//close the dialog
					testUtil.first('.action-button', true).click();

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
			testUtil.first('.add-new-button').click();

			return wait(100)
				.then(() => {
					//select the preferred item from the picker
					testUtil.nth('.grouped-buttons button', 2, true).click();
					testUtil.nth('.grouped-buttons button', 3, true).click();
					//close the dialog
					testUtil.first('.action-button', true).click();

					assert.equal(testUtil.control.value()[0].values[1].text, 'test option, test option 2');
				});
		});
	});
});
