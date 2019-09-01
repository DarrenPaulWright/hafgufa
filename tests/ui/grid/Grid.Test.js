import { assert } from 'chai';
import { HUNDRED_PERCENT } from 'type-enforcer';
import { Grid } from '../../../src/';
import TestUtil from '../../TestUtil';
import ControlTests from '../ControlTests';

const testUtil = new TestUtil(Grid);
const controlBaseTests = new ControlTests(Grid, testUtil);

describe('Grid', () => {

	controlBaseTests.run();

	describe('AddRow', () => {
		it('should be able to add a simple row without column definitions', () => {
			const options = {
				container: window.testContainer
			};
			const rows = [];
			const rowData = {
				cells: []
			};

			rowData.cells.push({
				text: 'test'
			});
			rows.push(rowData);

			window.control = new Grid(options);

			window.control.addRow(rowData);
			assert.equal(window.control.getRows().length, rows.length);
		});

		it('should ', () => {
			const options = {
				container: window.testContainer,
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

			window.control = new Grid(options);

			window.control.addRow(rowData);
			const row = window.control.getRows();

			assert.equal(row[0].cells[0].text, 'test');
		});

		it('runAddRow_DateColumn_FormattedDate', () => {
			const options = {
				container: window.testContainer,
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

			window.control = new Grid(options);

			window.control.addRow(rowData);
			const row = window.control.getRows();
			assert.equal(row[0].cells[0].text, '02/08/2013');
		});

		it('runAddRow_DateColumn_FormattedDateTime', () => {
			const options = {
				container: window.testContainer,
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

			window.control = new Grid(options);

			window.control.addRow(rowData);
			const row = window.control.getRows();
			assert.equal(row[0].cells[0].text, '02/08/2013');
		});
	});

	describe('AddRows', () => {
		it('runAddRows', () => {
			const options = {
				container: window.testContainer
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

			window.control = new Grid(options);
			window.control.addRows(rows);

			assert.equal(window.control.getRows().length, rows.length);
		});
	});
});
