import { assert } from 'type-enforcer';
import { HUNDRED_PERCENT } from 'type-enforcer-ui';
import { Grid } from '../../index.js';
import TestUtil from '../TestUtil.js';

describe('Grid', () => {
	const testUtil = new TestUtil(Grid);
	testUtil.run({
		settings: {
			columns: [{
				type: Grid.COLUMN_TYPES.TEXT,
				title: 'test',
				path: 'value'
			}],
			rows: [{
				id: '1',
				value: 'test'
			}],
			height: '30rem'
		}
	});

	describe('.addRow', () => {
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
			assert.is(testUtil.control.rows().length, rows.length);
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

			assert.is(row[0].cells[0].text, 'test');
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
			assert.is(row[0].cells[0].text, '02/08/2013');
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
			assert.is(row[0].cells[0].text, '02/08/2013');
		});
	});

	describe('.addRows', () => {
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

			assert.is(testUtil.control.rows().length, rows.length);
		});
	});
});
