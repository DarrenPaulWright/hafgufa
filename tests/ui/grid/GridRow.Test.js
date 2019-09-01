import { assert } from 'chai';
import * as gridConstants from '../../../src/ui/grid/gridConstants';
import GridRow from '../../../src/ui/grid/GridRow';
import { MOUSE_ENTER_EVENT, MOUSE_LEAVE_EVENT } from '../../../src/utility/domConstants';
import query from '../../query';
import TestUtil from '../../TestUtil';
import ControlTests from '../ControlTests';

const testUtil = new TestUtil(GridRow);
const controlBaseTests = new ControlTests(GridRow, testUtil, {
	mainCssClass: 'grid-row'
});

describe('GridRow', () => {

	controlBaseTests.run();

	describe('UpdateWidth', () => {
		it('should set the widths of cells based on column widths even if the width of the row is set narrower than the total of the cells', () => {
			window.control = new GridRow({
				container: window.testContainer
			})
				.columns([{
					type: gridConstants.COLUMN_TYPES.TEXT,
					currentWidth: 80,
					order: 0
				}, {
					type: gridConstants.COLUMN_TYPES.TEXT,
					currentWidth: 120,
					order: 1
				}, {
					type: gridConstants.COLUMN_TYPES.TEXT,
					currentWidth: 160,
					order: 2
				}])
				.data({
					cells: [{
						text: 'test 1'
					}, {
						text: 'test 2'
					}, {
						text: 'test 3'
					}]
				});

			window.control.updateWidth(200);

			assert.equal(getComputedStyle(document.querySelectorAll('.grid-cell')[0]).width, '80px');
			assert.equal(getComputedStyle(document.querySelectorAll('.grid-cell')[1]).width, '120px');
			assert.equal(getComputedStyle(document.querySelectorAll('.grid-cell')[2]).width, '160px');
		});

		it('should set the width of the row if updateWidth is set and the row is a header', () => {
			window.control = new GridRow({
				container: window.testContainer
			})
				.columns([{
					type: gridConstants.COLUMN_TYPES.TEXT,
					currentWidth: 80,
					order: 0
				}, {
					type: gridConstants.COLUMN_TYPES.TEXT,
					currentWidth: 120,
					order: 1
				}, {
					type: gridConstants.COLUMN_TYPES.TEXT,
					currentWidth: 160,
					order: 2
				}])
				.data({
					groupId: 1,
					cells: [{
						text: 'test 1'
					}, {
						text: 'test 2'
					}, {
						text: 'test 3'
					}]
				});

			window.control.updateWidth(200);

			assert.equal(getComputedStyle(document.querySelectorAll('.grid-row')[0]).width, '200px');
		});
	});

	describe('Data', () => {
		it('should render a heading if data.groupId is defined', () => {
			window.control = new GridRow({
				container: window.testContainer
			})
				.data({
					groupId: 0
				});

			assert.equal(document.querySelectorAll('.heading').length, 1);
		});

		it('should have one header control if the row is set to a header twice', () => {
			window.control = new GridRow({
				container: window.testContainer
			})
				.data({
					groupId: 0,
					title: 'test title 1'
				});

			window.control.data({
				groupId: 0,
				title: 'test title 1'
			});

			assert.equal(document.querySelectorAll('.heading').length, 1);
		});

		it('should render a checkbox in the header control if any of the columns are type CHECKBOX', () => {
			window.control = new GridRow({
				container: window.testContainer
			})
				.columns([{
					type: gridConstants.COLUMN_TYPES.TEXT,
					order: 0
				}, {
					type: gridConstants.COLUMN_TYPES.CHECKBOX,
					order: 1
				}])
				.data({
					groupId: 0
				});

			assert.equal(document.querySelectorAll('.heading .checkbox').length, 1);
		});

		it('should have a title text if data.title is set and the row is a header', () => {
			window.control = new GridRow({
				container: window.testContainer
			})
				.data({
					groupId: 0,
					title: 'test title'
				});

			assert.equal(document.querySelector('.heading > .title-container > span').textContent, 'test title');
		});

		it('should have a subtitle if data.childCount is set and the row is a header', () => {
			window.control = new GridRow({
				container: window.testContainer
			})
				.data({
					groupId: 0,
					title: 'test title',
					childCount: 3
				});

			assert.equal(document.querySelector('.subtitle').textContent, '3 items');
		});

		it('should have a subtitle if data.childCount and data.footerSuffix is set and the row is a header', () => {
			window.control = new GridRow({
				container: window.testContainer
			})
				.data({
					groupId: 0,
					title: 'test title',
					childCount: 3,
					footerSuffix: 'things'
				});

			assert.equal(document.querySelector('.subtitle').textContent, '3 things');
		});

		it('should have a selected checkbox if data.isSelected is set to true and the row is a header', () => {
			window.control = new GridRow({
				container: window.testContainer
			})
				.columns([{
					type: gridConstants.COLUMN_TYPES.CHECKBOX,
					order: 0
				}])
				.data({
					groupId: 0,
					title: 'test title',
					childCount: 3,
					footerSuffix: 'things',
					isSelected: true
				});

			assert.isTrue(document.querySelector('.checkbox input').checked);
		});

		it('should have an indeterminate checkbox if isIndeterminate is set to true and the row is a header', () => {
			window.control = new GridRow({
				container: window.testContainer,
				isIndeterminate: true
			})
				.columns([{
					type: gridConstants.COLUMN_TYPES.CHECKBOX,
					order: 0
				}])
				.data({
					groupId: 0,
					title: 'test title',
					childCount: 3,
					footerSuffix: 'things'
				});

			assert.isTrue(document.querySelector('.checkbox input').indeterminate);
		});

		it('should have an indeterminate checkbox if the row is a header and isIndeterminate is set to true after', () => {
			window.control = new GridRow({
				container: window.testContainer
			})
				.columns([{
					type: gridConstants.COLUMN_TYPES.CHECKBOX,
					order: 0
				}])
				.data({
					groupId: 0,
					title: 'test title',
					childCount: 3,
					footerSuffix: 'things'
				});

			window.control.isIndeterminate(true);

			assert.isTrue(document.querySelector('.checkbox input').indeterminate);
		});

		it('should render an image if data.image is a function that returns a string and the row is a header', () => {
			window.control = new GridRow({
				container: window.testContainer
			})
				.data({
					groupId: 0,
					title: 'test title',
					image() {
						return 'base/test.png';
					}
				});

			assert.equal(document.querySelectorAll('img').length, 1);
		});

		it('should NOT render an image if data.image is a function that returns an empty string and the row is a header', () => {
			window.control = new GridRow({
				container: window.testContainer
			})
				.data({
					groupId: 0,
					title: 'test title',
					image() {
					}
				});

			assert.equal(document.querySelectorAll('img').length, 0);
		});

		it('should call the settings.onExpandCollapseGroup callback when the row is a header and it is clicked', () => {
			let testVar = 0;

			window.control = new GridRow({
				container: window.testContainer,
				onExpandCollapseGroup() {
					testVar++;
				}
			})
				.data({
					groupId: 0,
					title: 'test title'
				});

			testUtil.simulateClick(document.querySelector('.heading'));

			assert.equal(testVar, 1);
		});

		it('should call the settings.onSelectGroup callback when the row is a header and its checkbox is clicked', () => {
			let testVar = 0;

			window.control = new GridRow({
				container: window.testContainer,
				onSelectGroup() {
					testVar++;
				}
			})
				.columns([{
					type: gridConstants.COLUMN_TYPES.CHECKBOX,
					order: 0
				}])
				.data({
					groupId: 0,
					title: 'test title',
					image() {
					}
				});

			testUtil.simulateClick(document.querySelector('.checkbox'));

			assert.equal(testVar, 1);
		});

		it('should have a hidden header control if the row is a header and then it is set to a normal row again', () => {
			window.control = new GridRow({
				container: window.testContainer
			})
				.data({
					groupId: 0,
					title: 'test title'
				});

			window.control.columns([{
					type: gridConstants.COLUMN_TYPES.TEXT,
					order: 0
				}])
				.data({
					columns: [{
						text: 'test'
					}]
				});

			assert.equal(document.querySelectorAll('.heading.display-none').length, 1);
		});

		it('should not have cells if the row is first set to a normal row with cells and then a header', () => {
			window.control = new GridRow({
				container: window.testContainer
			})
				.data({
					columns: [{
						text: 'test'
					}]
				});

			window.control.columns([{
					type: gridConstants.COLUMN_TYPES.TEXT,
					order: 0
				}])
				.data({
					groupId: 0,
					title: 'test title'
				});

			assert.equal(document.querySelectorAll('.grid-cell').length, 0);
		});
	});

	describe('Columns', () => {
		it('should render 3 cells if three columns are provided', () => {
			window.control = new GridRow({
				container: window.testContainer
			})
				.columns([{
					type: gridConstants.COLUMN_TYPES.TEXT,
					order: 0
				}, {
					type: gridConstants.COLUMN_TYPES.TEXT,
					order: 1
				}, {
					type: gridConstants.COLUMN_TYPES.TEXT,
					order: 2
				}])
				.data({
					cells: [{
						text: 'test 1'
					}, {
						text: 'test 2'
					}, {
						text: 'test 3'
					}]
				});

			assert.equal(document.querySelectorAll('.grid-cell').length, 3);
		});

		it('should render two cells if three columns are provided and then only two columns are provided', () => {
			window.control = new GridRow({
				container: window.testContainer
			})
				.columns([{
					type: gridConstants.COLUMN_TYPES.TEXT,
					order: 0
				}, {
					type: gridConstants.COLUMN_TYPES.TEXT,
					order: 1
				}, {
					type: gridConstants.COLUMN_TYPES.TEXT,
					order: 2
				}])
				.data({
					cells: [{
						text: 'test 1'
					}, {
						text: 'test 2'
					}, {
						text: 'test 3'
					}]
				});

			window.control.columns([{
					type: gridConstants.COLUMN_TYPES.TEXT,
					order: 0
				}, {
					type: gridConstants.COLUMN_TYPES.TEXT,
					order: 1
				}])
				.data({
					cells: [{
						text: 'test 1'
					}, {
						text: 'test 2'
					}]
				});

			window.control.updateWidth('200px');

			assert.equal(document.querySelectorAll('.grid-cell').length, 2);
		});
	});

	describe('IsSelectable', () => {
		testUtil.testMethod({
			methodName: 'isSelectable',
			defaultSettings: {
				container: window.testContainer
			},
			defaultValue: false,
			testValue: true,
			testValueClass: 'clickable'
		});
	});

	describe('IsSelected', () => {
		testUtil.testMethod({
			methodName: 'isSelected',
			defaultSettings: {
				container: window.testContainer
			},
			defaultValue: false,
			testValue: true,
			testValueClass: 'selected'
		});

		it('should check a checkbox if isSelected is true and it has a checkbox cell', () => {
			window.control = new GridRow({
				container: window.testContainer
			})
				.columns([{
					type: gridConstants.COLUMN_TYPES.CHECKBOX,
					ID: 0,
					order: 0
				}])
				.data({
					cells: [{}]
				})
				.isSelected(true);

			assert.equal(document.querySelector('input').checked, true);
		});

		it('should NOT check a checkbox if isSelected is true and it has a checkbox cell', () => {
			window.control = new GridRow({
				container: window.testContainer
			})
				.columns([{
					type: gridConstants.COLUMN_TYPES.CHECKBOX,
					order: 0
				}])
				.data({
					cells: [{}]
				})
				.isSelected(false);

			assert.equal(document.querySelector('input').checked, false);
		});

		it('should check a checkbox if it has a checkbox cell and the row is clicked', () => {
			window.control = new GridRow({
				container: window.testContainer,
				onSelectRow() {
				},
				isSelectable: true
			})
				.columns([{
					type: gridConstants.COLUMN_TYPES.CHECKBOX,
					order: 0
				}])
				.data({
					cells: [{}]
				});

			testUtil.simulateClick(document.querySelector('.grid-row'));

			assert.equal(document.querySelector('input').checked, true);
		});

		it('should NOT check a checkbox if it has a checkbox cell and the row is clicked twice', () => {
			window.control = new GridRow({
				container: window.testContainer,
				onSelectRow() {
				},
				isSelectable: true
			})
				.columns([{
					type: gridConstants.COLUMN_TYPES.CHECKBOX,
					order: 0
				}])
				.data({
					cells: [{}]
				});

			testUtil.simulateClick(document.querySelector('.grid-row'));
			testUtil.simulateClick(document.querySelector('.grid-row'));

			assert.equal(document.querySelector('input').checked, false);
		});

		it('should NOT check a checkbox if it has a checkbox cell and the row is clicked and then isSelected is set to false', () => {
			window.control = new GridRow({
				container: window.testContainer,
				onSelectRow() {
				},
				isSelectable: true
			})
				.columns([{
					type: gridConstants.COLUMN_TYPES.CHECKBOX,
					order: 0
				}])
				.data({
					cells: [{}]
				});

			testUtil.simulateClick(document.querySelector('.grid-row'));
			window.control.isSelected(false);

			assert.equal(document.querySelector('input').checked, false);
		});

		it('should check a checkbox if it has a checkbox cell and the row is clicked and then isSelected is set to true', () => {
			window.control = new GridRow({
				container: window.testContainer,
				onSelectRow() {
				},
				isSelectable: true
			})
				.columns([{
					type: gridConstants.COLUMN_TYPES.CHECKBOX,
					order: 0
				}])
				.data({
					cells: [{}]
				});

			testUtil.simulateClick(document.querySelector('.grid-row'));
			window.control.isSelected(true);

			assert.equal(document.querySelector('input').checked, true);
		});

		it('should check a checkbox if it has a checkbox cell and the checkbox is clicked', () => {
			window.control = new GridRow({
				container: window.testContainer,
				onSelectRow() {
				},
				isSelectable: true
			})
				.columns([{
					type: gridConstants.COLUMN_TYPES.CHECKBOX,
					order: 0
				}])
				.data({
					cells: [{}]
				});

			testUtil.simulateClick(document.querySelector('.checkbox'));

			assert.equal(document.querySelector('input').checked, true);
		});

		it('should NOT check a checkbox if it has a checkbox cell and the checkbox is clicked twice', () => {
			window.control = new GridRow({
				container: window.testContainer,
				onSelectRow() {
				},
				isSelectable: true
			})
				.columns([{
					type: gridConstants.COLUMN_TYPES.CHECKBOX,
					order: 0
				}])
				.data({
					cells: [{}]
				});

			testUtil.simulateClick(document.querySelector('.checkbox'));
			testUtil.simulateClick(document.querySelector('.checkbox'));

			assert.equal(document.querySelector('input').checked, false);
		});

		it('should NOT check a checkbox if it has a checkbox cell and the checkbox is clicked and then isSelected is set to false', () => {
			window.control = new GridRow({
				container: window.testContainer,
				onSelectRow() {
				},
				isSelectable: true
			})
				.columns([{
					type: gridConstants.COLUMN_TYPES.CHECKBOX,
					order: 0
				}])
				.data({
					cells: [{}]
				});

			testUtil.simulateClick(document.querySelector('.checkbox'));
			window.control.isSelected(false);

			assert.equal(document.querySelector('input').checked, false);
		});

		it('should check a checkbox if it has a checkbox cell and the checkbox is clicked and then isSelected is set to true', () => {
			window.control = new GridRow({
				container: window.testContainer,
				onSelectRow() {
				},
				isSelectable: true
			})
				.columns([{
					type: gridConstants.COLUMN_TYPES.CHECKBOX,
					order: 0
				}])
				.data({
					cells: [{}]
				});

			testUtil.simulateClick(document.querySelector('.checkbox'));
			window.control.isSelected(true);

			assert.equal(document.querySelector('input').checked, true);
		});

		it('should check a checkbox if it has a checkbox cell and the checkbox is clicked and then the row data is reset', () => {
			window.control = new GridRow({
				container: window.testContainer,
				onSelectRow() {
				},
				isSelectable: true
			})
				.columns([{
					type: gridConstants.COLUMN_TYPES.CHECKBOX,
					order: 0
				}])
				.data({
					cells: [{}]
				});

			testUtil.simulateClick(document.querySelector('.checkbox'));

			window.control.data({
				cells: [{}]
			});

			assert.equal(document.querySelector('input').checked, true);
		});
	});

	describe('IsIndeterminate', () => {
		testUtil.testMethod({
			methodName: 'isIndeterminate',
			defaultSettings: {
				container: window.testContainer
			},
			defaultValue: false,
			testValue: true
		});
	});

	describe('OnMouseEnter', () => {
		testUtil.testMethod({
			methodName: 'onMouseEnter',
			defaultSettings: {
				container: window.testContainer
			},
			defaultValue: undefined,
			testValue() {
				return 1;
			}
		});

		it('should call the onMouseEnter callback when the mouseEnter event is triggered', () => {
			let testVar = 0;
			const onMouseEnter = (rowData, rowControl) => {
				if (rowData && rowControl === window.control) {
					testVar++;
				}
			};

			window.control = new GridRow({
				container: window.testContainer,
				onSelectRow() {
				},
				onMouseEnter: onMouseEnter
			});

			testUtil.trigger(window.control.element(), MOUSE_ENTER_EVENT);

			assert.equal(testVar, 1);
		});

		it('should NOT call the onMouseEnter callback when onMouseEnter is set back to undefined and the mouseEnter event is triggered', () => {
			let testVar = 0;
			const onMouseEnter = (rowData, event, rowControl) => {
				if (rowData && event && rowControl === window.control) {
					testVar++;
				}
			};

			window.control = new GridRow({
				container: window.testContainer,
				onSelectRow() {
				},
				onMouseEnter: onMouseEnter
			});

			window.control.onMouseEnter(undefined);

			testUtil.trigger(window.control.element(), MOUSE_ENTER_EVENT);

			assert.equal(testVar, 0);
		});
	});

	describe('OnMouseLeave', () => {
		testUtil.testMethod({
			methodName: 'onMouseLeave',
			defaultSettings: {
				container: window.testContainer
			},
			defaultValue: undefined,
			testValue() {
				return 1;
			}
		});

		it('should call the onMouseLeave callback when the mouseLeave event is triggered', () => {
			let testVar = 0;
			const onMouseLeave = (rowData, rowControl) => {
				if (rowData && rowControl === window.control) {
					testVar++;
				}
			};

			window.control = new GridRow({
				container: window.testContainer,
				onSelectRow() {
				},
				onMouseLeave: onMouseLeave
			});

			testUtil.trigger(window.control.element(), MOUSE_ENTER_EVENT);
			testUtil.trigger(window.control.element(), MOUSE_LEAVE_EVENT);

			assert.equal(testVar, 1);
		});

		it('should call the onMouseLeave callback when onMouseLeave is set back to undefined and the mouseLeave event is triggered', () => {
			let testVar = 0;
			const onMouseLeave = (rowData, event, rowControl) => {
				if (rowData && event && rowControl === window.control) {
					testVar++;
				}
			};

			window.control = new GridRow({
				container: window.testContainer,
				onSelectRow() {
				},
				onMouseLeave: onMouseLeave
			});

			window.control.onMouseLeave(undefined);

			testUtil.trigger(window.control.element(), MOUSE_ENTER_EVENT);
			testUtil.trigger(window.control.element(), MOUSE_LEAVE_EVENT);

			assert.equal(testVar, 0);
		});
	});

	describe('OnClick', () => {
		testUtil.testMethod({
			methodName: 'onClick',
			defaultSettings: {
				container: window.testContainer
			},
			defaultValue: undefined,
			testValue() {
				return 1;
			},
			testValueClass: 'clickable'
		});

		it('should call the onClick callback when clicked', () => {
			let testVar = 0;
			const onRowClick = () => {
				testVar++;
			};

			window.control = new GridRow({
				container: window.testContainer,
				onSelectRow() {
				},
				onClick: onRowClick
			});

			testUtil.simulateClick(window.control.element());

			assert.equal(testVar, 1);
		});

		it('should NOT call the onClick callback if an "a" element is clicked', () => {
			let testVar = 0;
			const onRowClick = () => {
				testVar++;
			};

			window.control = new GridRow({
				container: window.testContainer,
				onSelectRow() {
				},
				onClick: onRowClick
			})
				.columns([{
					type: gridConstants.COLUMN_TYPES.TEXT,
					ID: 0
				}])
				.data({
					cells: [{
						text: '<a>test</a>'
					}]
				});

			testUtil.simulateClick(document.querySelector('a'));

			assert.equal(testVar, 1);
		});

		it('should NOT call the onClick callback when a button is clicked', () => {
			let testVar = 0;
			const onRowClick = () => {
				testVar++;
			};

			window.control = new GridRow({
				container: window.testContainer,
				onSelectRow() {
				},
				isSelectable: true,
				onClick: onRowClick
			})
				.columns([{
					type: gridConstants.COLUMN_TYPES.ACTIONS,
					ID: 0,
					buttons: [{
						icon: 'circle',
						onClick: onRowClick
					}, {
						icon: 'trash',
						onClick() {
						}
					}]
				}])
				.data({
					cells: [{}]
				});

			testUtil.simulateClick(document.querySelectorAll('button')[1]);

			assert.equal(testVar, 0);
		});

		it('should have class "clickable" if onClick is set and IsSelectable is true', () => {
			const onRowClick = () => {
			};

			window.control = new GridRow({
				container: window.testContainer,
				onSelectRow() {
				},
				isSelectable: true,
				onClick: onRowClick
			});

			assert.isTrue(query.hasClass(window.control.element(), 'clickable'));
		});

		it('should have class "clickable" if onClick is not set and IsSelectable is true', () => {
			window.control = new GridRow({
				container: window.testContainer,
				onSelectRow() {
				},
				isSelectable: true
			});

			assert.isTrue(query.hasClass(window.control.element(), 'clickable'));
		});

		it('should NOT have class "clickable" if onClick is set and the row is a header', () => {
			window.control = new GridRow({
				container: window.testContainer,
				onSelectRow() {
				},
				isSelectable: true
			})
				.data({
					groupId: 1
				});

			assert.isNotTrue(query.hasClass(window.control.element(), 'clickable'));
		});

		it('should return the row data when a button is clicked after setting data twice', () => {
			let testVar = '';
			const onRowClick = (rowData) => {
				testVar = rowData.something;
			};

			window.control = new GridRow({
				container: window.testContainer,
				onSelectRow() {
				},
				isSelectable: true
			})
				.columns([{
					type: gridConstants.COLUMN_TYPES.ACTIONS,
					currentWidth: 120,
					ID: 0,
					buttons: [{
						icon: 'circle',
						onClick: onRowClick
					}, {
						icon: 'trash'
					}]
				}])
				.data({
					cells: [{}],
					something: 'interesting'
				});

			window.control.data({
				cells: [{}],
				something: 'else'
			});

			testUtil.simulateClick(document.querySelectorAll('button')[0]);

			assert.equal(testVar, 'else');
		});
	});
});
