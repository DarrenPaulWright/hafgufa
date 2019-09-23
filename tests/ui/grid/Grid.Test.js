import { assert } from 'chai';
import { HUNDRED_PERCENT } from 'type-enforcer';
import { Grid } from '../../../src';
import TestUtil from '../../TestUtil';
import ControlTests from '../ControlTests';

describe('Grid', () => {
	const testUtil = new TestUtil(Grid);
	const controlBaseTests = new ControlTests(Grid, testUtil);

	controlBaseTests.run();

	describe('AddRow', () => {
		it('should be able to add a simple row without column definitions', () => {
			const options = {
				container: testUtil.container
			};
			const rows = [];
			const rowData = {
				cells: []
			};

			rowData.cells.push({
				text: 'test'
			});
			rows.push(rowData);

			testUtil.control = new Grid(options);

			testUtil.control.addRow(rowData);
			assert.equal(testUtil.control.rows().length, rows.length);
		});

		it('should ', () => {
			const options = {
				container: testUtil.container,
				columns: [{
					title: 'test',
					type: 'text',
					size: HUNDRED_PERCENT,
					canSort: true,
					defaultSort: 'Asc'
				}]
			};

			const rowData = {
				cells: [{
					text: 'test'
				}]
			};

			testUtil.control = new Grid(options);

			testUtil.control.addRow(rowData);
			const row = testUtil.control.rows();

			assert.equal(row[0].cells[0].text, 'test');
		});

		it('runAddRow_DateColumn_FormattedDate', () => {
			const options = {
				container: testUtil.container,
				columns: [{
					type: 'date'
				}]
			};

			const rowData = {
				cells: []
			};

			rowData.cells.push({
				text: '2013-02-08'
			});

			testUtil.control = new Grid(options);

			testUtil.control.addRow(rowData);
			const row = testUtil.control.rows();
			assert.equal(row[0].cells[0].text, '02/08/2013');
		});

		it('runAddRow_DateColumn_FormattedDateTime', () => {
			const options = {
				container: testUtil.container,
				columns: [{
					type: 'datetime'
				}]
			};
			const rowData = {
				cells: []
			};

			rowData.cells.push({
				text: '2013-02-08'
			});

			testUtil.control = new Grid(options);

			testUtil.control.addRow(rowData);
			const row = testUtil.control.rows();
			assert.equal(row[0].cells[0].text, '02/08/2013');
		});
	});

	describe('AddRows', () => {
		it('runAddRows', () => {
			const options = {
				container: testUtil.container
			};

			const rows = [];

			for (let i = 0; i < 5; i++) {
				const rowData = {
					cells: []
				};

				rowData.cells.push({
					text: 'test'
				});
				rows.push(rowData);
			}

			testUtil.control = new Grid(options);
			testUtil.control.addRows(rows);

			assert.equal(testUtil.control.rows().length, rows.length);
		});
	});
});
